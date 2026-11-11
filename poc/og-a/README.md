# Kita Invite — POC Open Graph, Varian A: Hono + React + Vite + TypeScript

POC perbandingan stack (dari commit V25 `68bf66ce`). Semua undangan fiktif
(`poc/shared/fixture.json`); tanpa pembayaran, login, form kontak, data nyata.
Tanpa Muse Preview, tanpa Pages/production/D1/R2.

## Perintah

```bash
npm install
npm run typecheck   # vite build client + generate + tsc --noEmit
npm run build       # client (Vite) + worker self-contained (esbuild)
node smoke.mjs      # impor dist/worker.mjs, fetch() semua route, assert
```

## Struktur

| Path | Keterangan |
| --- | --- |
| `src/worker.ts` | Aplikasi Hono, `export default { fetch }` |
| `src/client.tsx` | Aplikasi React: Buka Undangan, countdown live, detail + galeri |
| `src/types.ts` | Tipe undangan (cermin fixture) |
| `src/generated.ts` | GENERATED (di-.gitignore): fixture + CSS + client JS + gambar base64 |
| `scripts/generate.mjs` | Baca `poc/shared/*` + `dist/client/client.js` → `src/generated.ts` |
| `scripts/build-worker.mjs` | Bundle `src/worker.ts` → satu `dist/worker.mjs` (esbuild) |
| `vite.config.ts` | Vite build client → `dist/client/client.js` (satu file) |
| `smoke.mjs` | Smoke test via `worker.fetch()` langsung (tanpa server) |

## Route

- `GET /` — index, tautan kedua slug + catatan POC.
- `GET /:slug` — HTML + OG meta dinamis (title, canonical, og:title/description/type/url/image 1200×630 JPEG), CSS inline, JSON fixture tersemat, `<script src="/assets/client.js">`, `Cache-Control: no-store`.
- `GET /api/invitation/:slug` — JSON fixture.
- `GET /images/:name` — JPEG og/cover, bytes persis file shared.
- `GET /assets/client.js` — bundle React.
- Slug tak dikenal → 404 + "undangan tidak ditemukan", tanpa data pasangan lain.

## Bundle

`dist/worker.mjs` self-contained (Hono + aset ter-bundle, tanpa import eksternal
saat runtime), target < 800 KB — ukuran aktual tercetak tiap `npm run build`.
