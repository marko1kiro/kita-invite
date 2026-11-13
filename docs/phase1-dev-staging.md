# Fase 1: fondasi dev/staging

## Hasil

Branch ini menambahkan fondasi React + TypeScript + Vite di `web/`, API Hono minimal di `src/worker/`, migrasi metadata operasional, dan workflow CI. Prototype yang ada di root `index.html` tidak diubah. Belum ada alur undangan, daftar tamu, RSVP, pembayaran, autentikasi, atau data pengguna.

Cloudflare memiliki D1 dan bucket R2 dev/staging yang terpisah. Berdasarkan pemeriksaan Lora yang disertakan dalam tugas ini, tabel `foundation_metadata` ada dan kosong pada kedua D1; belum ada tabel ledger migrasi Wrangler. Binding untuk `kita-invite-phase1-dev-db` / `kita-invite-phase1-dev-media` dan `kita-invite-phase1-staging-db` / `kita-invite-phase1-staging-media` tetap didefinisikan di `wrangler.jsonc`. Pemeriksaan lokal pada perbaikan ini tidak mengakses Cloudflare dan tidak mengubah resource remote.

## Batas deployment dan target Wrangler

Worker belum dibuat atau di-deploy. Custom domain dan DNS belum diaktifkan. Status Workers plan dan aggregate usage akun tidak dapat dipastikan, sehingga CI tidak memiliki langkah deployment atau secret Cloudflare. `workers_dev` tetap dimatikan pada target.

Gunakan hanya `npm run deploy:dev` atau `npm run deploy:staging` setelah ada otorisasi deployment tersendiri. `npm run deploy` tanpa argumen, dengan environment tidak valid, atau dengan argumen tambahan berhenti sebelum Wrangler dijalankan. Target dasar `wrangler.jsonc` bernama `kita-invite-phase1-unconfigured`, tidak memiliki `APP_ENV` atau binding D1/R2, dan Worker mengembalikan `503 environment_not_configured` bila environment bukan `dev` atau `staging`.

Batas ini tidak mencegah pemanggilan langsung `wrangler deploy` dari shell. Pemanggilan raw Wrangler yang tidak memakai wrapper npm tetap tidak diblokir oleh guard npm; jangan menyebutnya sebagai pencegahan teknis. Perintah deployment tidak dipanggil selama tugas perbaikan ini.

Worker mengeluarkan structured console logs tanpa path, query, body, atau PII; Cloudflare Workers Observability/log persistence tidak diaktifkan.

## Pengembangan lokal dan CI

Jalankan `npm ci`. Untuk alur interaktif, mulai `npm run worker:local:dev` di satu terminal lalu `npm run dev` di terminal lain. Vite meneruskan `/api/*` ke Worker lokal di `127.0.0.1:8787`; `/api/v1/health` seharusnya mengembalikan JSON `{"status":"ok","environment":"dev"}`.

`npm run smoke:dev-api` menguji Worker lokal dan alur Vite-proxy secara integrasi, lalu menghentikan kedua server dan menghapus state lokal sementara. `npm run smoke:r2:local` menjalankan upload, download byte-for-byte, delete, dan pemeriksaan object sudah tidak ada pada emulator R2 Wrangler; smoke memakai bucket tiruan, payload sintetis, storage sementara, `--local`, dan subprocess tanpa kredensial Cloudflare. `npm run backup:restore:local` tetap menguji backup/restore SQLite lokal sintetis.

`npm run ci` menjalankan typecheck, test Vitest, build Vite, dry-run Wrangler eksplisit untuk dev dan staging, API smoke Vite/Worker lokal, backup/restore SQLite lokal, dan R2 emulator smoke. GitHub Actions menjalankan `npm ci`, `npm run ci`, lalu `npm audit --audit-level=high`. Tidak ada langkah deploy pada workflow. Dry-run hanya melakukan build/validasi konfigurasi; bukan deployment.

## Rekonsiliasi migrasi D1

`migrations/0001_foundation_metadata.sql` adalah DDL awal yang sebelumnya diterapkan langsung melalui D1 API. Catatan Lora untuk kedua D1 menyatakan tabel aplikasi sudah ada dan kosong, sementara ledger migrasi Wrangler belum ada. File migrasi tetap berada di repository, tetapi keberadaan tabel tidak berarti Wrangler telah mencatat migrasi tersebut.

Perbaikan ini tidak menjalankan pemeriksaan langsung terhadap D1 dan tidak membuat, menerapkan, memutar ulang, mengubah, atau menghapus migrasi maupun data remote. Jangan menjalankan remote migration sebagai bagian dari CI atau smoke test lokal. Sebelum langkah migrasi remote berikutnya, diperlukan persetujuan terpisah serta pemeriksaan ulang schema, isi tabel, dan status ledger per database; setelah itu, tentukan langkah baseline/reconciliation yang aman dan verifikasi hasil ledger. DDL `CREATE TABLE IF NOT EXISTS` bersifat idempotent, tetapi hal itu sendiri bukan bukti bahwa remote migration sudah direkonsiliasi dan bukan izin untuk menerapkannya.

## Rollback dan batas yang belum diverifikasi

Rollback perubahan kode dilakukan dengan revert commit perbaikan baru; jangan mengubah atau mengamend commit fondasi sebelumnya. Resource D1/R2 remote, Pages, Worker POC, DNS, domain, dan production tidak disentuh. Smoke lokal membuktikan alur emulator saja, bukan upload/download remote, pemulihan D1 remote, deployment Worker, DNS, billing/usage, atau perilaku webhook/provider.
