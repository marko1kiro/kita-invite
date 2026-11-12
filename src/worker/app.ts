import { Hono, type Context } from "hono";
import type { Env } from "./env";

export function createApp() {
  const app = new Hono<{ Bindings: Env }>();

  app.use("*", async (context, next) => {
    const startedAt = Date.now();
    await next();

    console.info(
      JSON.stringify({
        level: "info",
        event: "http.request",
        timestamp: new Date().toISOString(),
        environment: context.env.APP_ENV ?? "unknown",
        method: context.req.method,
        status: context.res.status,
        duration_ms: Date.now() - startedAt,
        request_id: context.req.header("cf-ray"),
      }),
    );
  });

  const health = (context: Context<{ Bindings: Env }>) =>
    context.json({
      status: "ok" as const,
      environment: context.env.APP_ENV ?? "unknown",
    });

  app.get("/health", health);
  app.get("/api/v1/health", health);

  app.notFound(async (context) => {
    if (context.req.path === "/api" || context.req.path.startsWith("/api/")) {
      return context.json({ error: "not_found" }, 404);
    }

    if (!context.env.ASSETS) {
      return context.text("assets_not_configured", 503);
    }

    return context.env.ASSETS.fetch(context.req.raw);
  });

  app.onError((error, context) => {
    console.error(
      JSON.stringify({
        level: "error",
        event: "http.error",
        environment: context.env.APP_ENV ?? "unknown",
        error_type: error instanceof Error ? error.name : "UnknownError",
      }),
    );

    return context.json({ error: "internal_error" }, 500);
  });

  return app;
}

export const app = createApp();
