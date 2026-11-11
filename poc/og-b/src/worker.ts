import { handleRequest } from "./entry.server";
import { getInvitation } from "./data";
// Bundle client disimpan ter-gzip+base64 (?raw, satu baris ASCII aman) —
// dilayani di /assets/client.js setelah didekompres sekali via
// DecompressionStream (tersedia di Node 22 dan di Workers) lalu di-cache.
import clientJsGzB64 from "../dist/client/client.js.b64?raw";
// Gambar di-inline sebagai data URI (?url + assetsInlineLimit besar di
// vite.config.worker.ts) — dilayani di /images/:name dengan bytes persis.
import ogAisha from "../../shared/og-aisha.jpg?url";
import ogCitra from "../../shared/og-citra.jpg?url";
import coverAisha from "../../shared/cover-aisha.jpg?url";
import coverCitra from "../../shared/cover-citra.jpg?url";

// /images/:name ditangani di worker entry SEBELUM router (bukan route React
// Router) — gambar adalah aset statis, bukan halaman React.
const IMAGES: Record<string, string> = {
  "og-aisha.jpg": ogAisha,
  "og-citra.jpg": ogCitra,
  "cover-aisha.jpg": coverAisha,
  "cover-citra.jpg": coverCitra,
};

const NO_STORE = { "Cache-Control": "no-store" } as const;

// Dekompres client.js sekali, lalu cache string-nya di memori modul.
let clientJsCache: string | null = null;
async function getClientJs(): Promise<string> {
  if (clientJsCache !== null) return clientJsCache;
  const binary = atob(clientJsGzB64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  clientJsCache = await new Response(stream).text();
  return clientJsCache;
}

function imageResponse(name: string): Response | null {
  const dataUri = IMAGES[name];
  if (!dataUri) return null;
  const base64 = dataUri.split(",", 2)[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(bytes.length),
      ...NO_STORE,
    },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // /api/invitation/:slug dilayani di sini SEBELUM router: StaticHandler
    // .query() untuk document request tidak meneruskan Response dari loader
    // (hanya redirect / data-request ?_data= yang diteruskan), jadi route
    // loader-only di routes.tsx tidak akan pernah menghasilkan JSON lewat
    // query(). Logika slug-nya tetap satu sumber: getInvitation() dari data.ts.
    if (url.pathname.startsWith("/api/invitation/")) {
      const slug = decodeURIComponent(
        url.pathname.slice("/api/invitation/".length),
      );
      const inv = getInvitation(slug);
      if (!inv) {
        return Response.json(
          { error: "invitation not found" },
          { status: 404, headers: NO_STORE },
        );
      }
      return Response.json(inv, { headers: NO_STORE });
    }

    if (url.pathname === "/favicon.ico") {
      // Browser otomatis meminta /favicon.ico; tanpa ini request jatuh ke
      // route /:slug (loader 404 + halaman NotFound) sehingga console
      // mencatat failed request. POC tidak punya favicon — 204 bersih.
      return new Response(null, { status: 204, headers: NO_STORE });
    }

    if (url.pathname === "/assets/client.js") {
      const clientJs = await getClientJs();
      return new Response(clientJs, {
        headers: {
          "Content-Type": "text/javascript; charset=utf-8",
          ...NO_STORE,
        },
      });
    }

    if (url.pathname.startsWith("/images/")) {
      const name = decodeURIComponent(url.pathname.slice("/images/".length));
      const res = imageResponse(name);
      if (res) return res;
      return new Response("Gambar tidak ditemukan", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", ...NO_STORE },
      });
    }

    return handleRequest(request);
  },
};
