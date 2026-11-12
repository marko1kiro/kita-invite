import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "./app";
import type { Env } from "./env";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("foundation Worker", () => {
  it("returns health and environment without exposing bindings", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const env: Env = { APP_ENV: "dev" };

    const response = await app.request("/api/v1/health", {}, env);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", environment: "dev" });
  });

  it("returns a JSON 404 for an unknown API route", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchAssets = vi.fn(async (_request: Request) => new Response("asset"));
    const env: Env = { APP_ENV: "staging", ASSETS: { fetch: fetchAssets } };

    const response = await app.request("/api/v1/unknown", {}, env);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
    expect(fetchAssets).not.toHaveBeenCalled();
  });

  it("delegates non-API paths to the static asset binding", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchAssets = vi.fn(async (_request: Request) => new Response("static shell", { status: 200 }));
    const env: Env = { APP_ENV: "dev", ASSETS: { fetch: fetchAssets } };

    const response = await app.request("/", {}, env);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("static shell");
    expect(fetchAssets).toHaveBeenCalledOnce();
  });
});
