import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import sharedCss from "../../shared/shared.css?raw";
import { routes } from "./routes";
import type { Invitation } from "./data";

// Server SSR: createStaticHandler + createStaticRouter + StaticRouterProvider
// + renderToString (pola React Router v7 framework-less SSR).
// HTML lengkap: OG meta + konten undangan hasil SSR + CSS bersama (inline
// <style>) + <script src="/assets/client.js"> + state router untuk hydration
// (disisipkan otomatis oleh StaticRouterProvider sebagai
// window.__staticRouterHydrationData).

const { query, dataRoutes } = createStaticHandler(routes);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NO_STORE = { "Cache-Control": "no-store" } as const;

function withNoStore(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function handleRequest(request: Request): Promise<Response> {
  const context = await query(request);
  if (context instanceof Response) {
    // Loader mengembalikan Response langsung (mis. /api/invitation/:slug).
    return withNoStore(context);
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const inv = (context.loaderData as Record<string, unknown>)[
    "invitation"
  ] as Invitation | undefined;

  let title: string;
  let metaTags: string;
  if (inv) {
    const pageUrl = `${origin}/${inv.slug}`;
    const imageUrl = `${origin}/images/${inv.ogImage}`;
    title = inv.title;
    metaTags = [
      `<link rel="canonical" href="${escapeHtml(pageUrl)}">`,
      `<meta property="og:title" content="${escapeHtml(inv.title)}">`,
      `<meta property="og:description" content="${escapeHtml(inv.description)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:url" content="${escapeHtml(pageUrl)}">`,
      `<meta property="og:image" content="${escapeHtml(imageUrl)}">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta property="og:image:type" content="image/jpeg">`,
    ].join("\n    ");
  } else {
    title = "Kita Invite — POC Open Graph (Varian B: React Router SSR)";
    metaTags = [
      `<link rel="canonical" href="${escapeHtml(origin + url.pathname)}">`,
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:description" content="Proof of concept Open Graph + Server-Side Rendering dengan React Router (tanpa Hono).">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:url" content="${escapeHtml(origin + url.pathname)}">`,
    ].join("\n    ");
  }

  const router = createStaticRouter(dataRoutes, context);
  const appHtml = renderToString(
    <StaticRouterProvider router={router} context={context} />,
  );

  const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    ${metaTags}
    <style>${sharedCss}</style>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script src="/assets/client.js" defer></script>
  </body>
</html>
`;

  return new Response(html, {
    status: context.statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...NO_STORE,
    },
  });
}
