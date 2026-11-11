// Smoke test Varian B: impor dist/worker.mjs, panggil fetch() per route,
// assert status + OG meta + content-type + konten SSR di HTML awal.
// Exit 0 bila semua lolos, 1 bila ada yang gagal.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import worker from "./dist/worker.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost";

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function get(path) {
  const res = await worker.fetch(new Request(`${BASE}${path}`));
  const text = await res.text();
  return { res, text };
}

async function getBytes(path) {
  const res = await worker.fetch(new Request(`${BASE}${path}`));
  const buf = Buffer.from(await res.arrayBuffer());
  return { res, buf };
}

// --- / (index) ---
{
  const { res, text } = await get("/");
  check("GET / status 200", res.status === 200, `status=${res.status}`);
  check("GET / content-type html", (res.headers.get("content-type") ?? "").includes("text/html"));
  check("GET / cache-control no-store", res.headers.get("cache-control") === "no-store");
  check("GET / judul varian B", text.includes("Varian B: React Router SSR"));
  check("GET / tautan aisha-dan-bima", text.includes('href="/aisha-dan-bima"'));
  check("GET / tautan citra-dan-dimas", text.includes('href="/citra-dan-dimas"'));
  check("GET / script client.js", text.includes('<script src="/assets/client.js"'));
  check("GET / hydration data", text.includes("__staticRouterHydrationData"));
}

// --- /:slug (kedua undangan) ---
const slugs = [
  {
    slug: "aisha-dan-bima",
    title: "Aisha & Bima — Undangan Pernikahan",
    names: "Aisha",
    names2: "Bima",
    dateDisplay: "Sabtu, 20 Februari 2027",
    venue: "Gedung Serbaguna Melati",
    ogImage: "og-aisha.jpg",
    coverImage: "cover-aisha.jpg",
  },
  {
    slug: "citra-dan-dimas",
    title: "Citra & Dimas — Undangan Pernikahan",
    names: "Citra",
    names2: "Dimas",
    dateDisplay: "Minggu, 14 Maret 2027",
    venue: "Balai Serbaguna Kenanga",
    ogImage: "og-citra.jpg",
    coverImage: "cover-citra.jpg",
  },
];

for (const s of slugs) {
  const { res, text } = await get(`/${s.slug}`);
  const escTitle = s.title.replace(/&/g, "&amp;");
  check(`GET /${s.slug} status 200`, res.status === 200, `status=${res.status}`);
  check(`GET /${s.slug} cache-control no-store`, res.headers.get("cache-control") === "no-store");
  check(`GET /${s.slug} <title>`, text.includes(`<title>${escTitle}</title>`));
  check(`GET /${s.slug} og:title`, text.includes(`property="og:title" content="${escTitle}"`));
  check(`GET /${s.slug} og:description`, text.includes('property="og:description"'));
  check(`GET /${s.slug} og:type website`, text.includes('property="og:type" content="website"'));
  check(`GET /${s.slug} og:url absolut`, text.includes(`property="og:url" content="${BASE}/${s.slug}"`));
  check(`GET /${s.slug} og:image absolut`, text.includes(`property="og:image" content="${BASE}/images/${s.ogImage}"`));
  check(`GET /${s.slug} og:image:width 1200`, text.includes('property="og:image:width" content="1200"'));
  check(`GET /${s.slug} og:image:height 630`, text.includes('property="og:image:height" content="630"'));
  check(`GET /${s.slug} og:image:type jpeg`, text.includes('property="og:image:type" content="image/jpeg"'));
  check(`GET /${s.slug} canonical absolut`, text.includes(`rel="canonical" href="${BASE}/${s.slug}"`));
  check(`GET /${s.slug} SSR nama`, text.includes(s.names) && text.includes(s.names2));
  check(`GET /${s.slug} SSR tanggal`, text.includes(s.dateDisplay));
  check(`GET /${s.slug} SSR venue`, text.includes(s.venue));
  check(`GET /${s.slug} SSR cover img`, text.includes(`/images/${s.coverImage}`));
  check(`GET /${s.slug} tombol Buka Undangan`, text.includes("Buka Undangan"));
  check(`GET /${s.slug} hydration data`, text.includes("__staticRouterHydrationData"));
}

// --- /api/invitation/:slug ---
{
  const { res, text } = await get("/api/invitation/aisha-dan-bima");
  check("GET /api/invitation/aisha-dan-bima status 200", res.status === 200, `status=${res.status}`);
  const json = JSON.parse(text);
  check("GET /api/invitation JSON slug", json.slug === "aisha-dan-bima");
  check("GET /api/invitation JSON names", json.names === "Aisha & Bima");
  const bad = await get("/api/invitation/tidak-ada");
  check("GET /api/invitation tak dikenal 404", bad.res.status === 404, `status=${bad.res.status}`);
}

// --- /images/:name (bytes persis file shared) ---
for (const name of ["og-aisha.jpg", "og-citra.jpg", "cover-aisha.jpg", "cover-citra.jpg"]) {
  const { res, buf } = await getBytes(`/images/${name}`);
  const expected = readFileSync(join(dir, "..", "shared", name));
  check(`GET /images/${name} status 200`, res.status === 200, `status=${res.status}`);
  check(`GET /images/${name} content-type jpeg`, res.headers.get("content-type") === "image/jpeg");
  check(`GET /images/${name} bytes persis (${buf.length} B)`, buf.equals(expected));
}
{
  const { res } = await get("/images/tidak-ada.jpg");
  check("GET /images/tidak-ada.jpg 404", res.status === 404, `status=${res.status}`);
}

// --- /assets/client.js ---
{
  const { res, text } = await get("/assets/client.js");
  check("GET /assets/client.js status 200", res.status === 200, `status=${res.status}`);
  check("GET /assets/client.js content-type js", (res.headers.get("content-type") ?? "").includes("javascript"));
  check("GET /assets/client.js berisi HydratedRouter/hydrate", text.includes("HydratedRouter") || text.includes("hydrateRoot"));
}

// --- slug tak dikenal ---
{
  const { res, text } = await get("/slug-tak-ada");
  check("GET /slug-tak-ada status 404", res.status === 404, `status=${res.status}`);
  check("GET /slug-tak-ada halaman jelas", text.includes("Undangan tidak ditemukan"));
  check("GET /slug-tak-ada tanpa data Aisha", !text.includes("Aisha"));
  check("GET /slug-tak-ada tanpa data Citra", !text.includes("Citra"));
}

console.log(failures === 0 ? "\nSMOKE HIJAU: semua cek lolos." : `\nSMOKE GAGAL: ${failures} cek gagal.`);
process.exit(failures === 0 ? 0 : 1);
