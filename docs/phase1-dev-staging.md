# Fase 1: fondasi dev/staging

## Hasil

Branch ini menambahkan fondasi React + TypeScript + Vite di `web/`, API Hono minimal di `src/worker/`, migrasi metadata operasional, dan workflow CI. Prototype yang ada di root `index.html` tidak diubah. Belum ada alur undangan, daftar tamu, RSVP, pembayaran, autentikasi, atau data pengguna.

Cloudflare memiliki dua D1 terpisah, `kita-invite-phase1-dev-db` dan `kita-invite-phase1-staging-db`, serta dua bucket R2 terpisah, `kita-invite-phase1-dev-media` dan `kita-invite-phase1-staging-media`. Skema aplikasi di kedua D1 hanya memiliki `foundation_metadata` dengan batas environment `dev`/`staging`; Cloudflare juga menampilkan tabel sistem internal `_cf_KV`. Binding dan database IDs yang dibutuhkan Wrangler tercantum di `wrangler.jsonc`; tidak ada account ID, token, atau secret di repository. Belum ada object test yang diunggah ke bucket remote.

## Batas deployment

Worker belum dibuat atau di-deploy. Custom domain dan DNS juga belum diaktifkan. Status Workers plan dan aggregate usage akun tidak dapat dibaca dengan izin yang tersedia, sehingga biaya/risiko usage Worker tidak dapat dipastikan. Karena itu CI tidak memiliki langkah deploy atau secret Cloudflare; `workers_dev` dimatikan dan tidak ada route publik. Langkah ini sengaja dibatasi sampai status tersebut dapat diverifikasi.

Worker mengeluarkan structured console logs tanpa path, query, body, atau PII; Cloudflare Workers Observability/log persistence tidak diaktifkan.

## Migrasi dan pemulihan

`migrations/0001_foundation_metadata.sql` diterapkan langsung via D1 API ke dev dan staging. Operasinya idempotent (`CREATE TABLE IF NOT EXISTS`); tidak ada data aplikasi. Karena DDL awal diterapkan lewat API, migration ledger Wrangler belum dibuat/diisi; sebelum migrasi remote berikutnya, jalankan migrasi idempotent ini melalui Wrangler agar ledger mencatatnya.

`scripts/backup-restore-smoke.py` menguji backup/restore SQLite lokal dengan satu fixture sintetis dalam direktori sementara yang dibuang otomatis. Satu object sintetis juga berhasil melalui upload-download-delete pada emulator R2 lokal. Uji D1 remote export/restore dengan satu baris sintetis sempat dijalankan; URL unduhan export mengembalikan HTTP 403, sehingga pemulihan remote tidak selesai dan tidak dicoba ulang. Baris sintetis sumber berhasil dihapus dan D1 sementara untuk restore berhasil dihapus; verifikasi cleanup melaporkan tidak ada sisa database atau baris uji. Karena itu belum ada bukti remote D1 export/import yang berhasil.

## Pemeriksaan lokal

`npm run ci` menjalankan strict typecheck, 3 unit tests, Vite build, Wrangler dry-run untuk dev dan staging, lalu backup/restore sintetis lokal. Worker juga berjalan pada emulator lokal: `/api/v1/health` mengembalikan status `ok` dengan environment `dev`, dan root menyajikan app shell Vite. Workflow GitHub Actions menjalankan perintah yang sama dan tidak melakukan deploy.

Untuk rollback kode, gunakan parent baseline `70bb0641eb4fa1280463ce8cfe20816b0676778c` atau revert commit fondasi. Migrasi tidak dihapus otomatis; jika perlu mengubah skema, tambahkan migrasi maju. Resource dev/staging tidak menyentuh Pages, Workers POC, production, atau account Cloudflare lain.
