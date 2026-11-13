# Kita Invite — Baseline Snapshot (Preview Only)

**Status: Stage 2 — Needs Fixes (audit by Project Monitor Agent ongoing).**
This repository is the code source for auditing Kita Invite (formerly VOWORA),
a digital invitation platform prototype. It is NOT production.

## What this snapshot is

- `index.html` — exact snapshot of the Muse artifact `vowora` (build v6,
  content SHA-256 `fc5cd3ec1c49653b19946deef2845bef2b7ea894333378f84a6c3439cc12c9ef`),
  exported 2026-11-10 01:29 WIB. Single self-contained file (9 assets inlined).
  No functional changes were made for this snapshot.
- Branding: **Kita Invite**. All invitation IDs, slugs, and demo data are
  preserved as in the prototype. Data is mock/demo data stored in the
  browser (localStorage); there is no real backend in this snapshot.

## Branches

- `main` — baseline snapshot.
- `muse-preview` — preview branch, auto-deployed to Cloudflare Pages
  (preview deployments only; production deployments disabled).

## Preview

Cloudflare Pages project (separate preview project, not production):
preview deployments are enabled for branches/PRs. Every change is
reviewable via diff and a preview URL. Preview URLs are public unless
protected by Cloudflare Access — only dummy/demo data lives here.

## Rules for this repo

- No merges to `main` without Marko's approval.
- No production deployments, no production domain/DNS, no changes to
  Workers, D1, R2, routing, or any other Cloudflare project.
- The Cloudflare Full Stack production target remains a separate decision
  (see the plan document, not this repo).
- Do not declare the Stage 2 audit passed just because a build succeeds.

## Fase 1 — fondasi dev/staging

Fondasi menggunakan React, TypeScript, Vite, Hono, dan Wrangler. Aplikasi scaffold berada di `web/`; Worker berada di `src/worker/`. File prototype root `index.html` sengaja dibiarkan terpisah dan tidak diubah.

Jalankan `npm ci`. Untuk pengembangan lokal, mulai `npm run worker:local:dev` dan `npm run dev` di dua terminal; Vite mem-proxy `/api/*` ke Worker lokal pada `127.0.0.1:8787`. `npm run smoke:dev-api` membuktikan respons JSON health melalui alur itu. `npm run smoke:r2:local` menjalankan upload/download/delete sintetis hanya pada emulator lokal yang disposable. `npm run ci` menjalankan kedua smoke tersebut, backup/restore SQLite lokal, typecheck, tests, build, dan dry-run dev/staging. GitHub Actions juga menjalankan `npm audit --audit-level=high`.

Deployment tidak berjalan otomatis. Setelah otorisasi deployment terpisah, gunakan `npm run deploy:dev` atau `npm run deploy:staging`; default `npm run deploy` menolak environment yang hilang atau tidak valid. Target dasar Wrangler diberi nama `kita-invite-phase1-unconfigured` dan Worker menolak environment yang tidak dikonfigurasi, tetapi pemanggilan raw `wrangler deploy` tidak secara teknis diblokir oleh wrapper npm.

Cloudflare D1/R2 dev dan staging dipisahkan. Menurut pemeriksaan Lora yang dicatat di [catatan Fase 1](docs/phase1-dev-staging.md), tabel `foundation_metadata` sudah ada dan kosong pada kedua D1, tetapi ledger migrasi Wrangler belum ada. Tidak ada pemeriksaan atau perubahan Cloudflare resource, DNS, domain, atau migrasi remote dalam perbaikan kode/workflow ini.

**Klarifikasi scope:** baseline di atas tetap berlaku untuk Pages, POC, Worker/route yang sudah ada, production, dan account lain. Lihat [catatan Fase 1](docs/phase1-dev-staging.md) untuk batas deployment, migrasi, dan rollback.
