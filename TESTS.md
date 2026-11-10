# Kita Invite V21.2 — TESTS.md

Ronde perbaikan sempit atas koreksi Agent Lora untuk v21.1. Baseline:
branch `muse-fix-v21.1`, commit
`55203bee2bf625a38c026fce8e5240a62499d6ad`. Tree ini (`v21.2/`)
mempertahankan struktur modular V20/V21/V21.1 (18 file: `index.html` +
4 CSS + 13 JS, classic `<script src>`, bukan ES modules) + direktori
`harness/` (harness yang dapat dijalankan, disertakan di branch — lihat
§ Reproduksi).

## File yang berubah vs V21.1 (7 file + harness + TESTS.md; 11 file lain byte-identical)

| File | Perubahan | Alasan (satu baris) |
|---|---|---|
| `js/05-builder.js` | −1 / +1 baris | Tombol "Pesan Paket Ini (Simulasi)" membawa konteks `?inv=${inv.id}` |
| `js/12-s2-views.js` | −12 / +33 baris | `viewCheckout(params)` membaca konteks `?inv=` (memo hash, `ctxMissing` bila ID tak ditemukan); `s2Render` meneruskan `params`; tautan "Buat Pesanan Baru" (orderCard + viewPay) membawa `?inv=<invitationId>`; label tombol uji diperbarui |
| `js/13-s2-handlers.js` | −3 / +4 baris | Handler `co-inv` membersihkan `ctxMissing` saat pilih manual; toast reset menambah cabang `backup-cleanup` + catatan tmp-cleanup |
| `js/08-s2-reset.js` | −7 / +22 baris | `cleanTmp()` terverifikasi baca-balik menggantikan `dropTmp`; hasil jujur `tmpCleanup` / `backupValid`; stage baru `backup-cleanup` (berhenti sebelum hapus data bila kunci sementara tertinggal) |
| `js/04-views.js` | −1 / +1 baris | `viewDemo` memakai class `detail-grid demo-layout`, inline grid dihapus |
| `css/design-system.css` | −0 / +9 baris | `.demo-layout`: dua kolom `400px 1fr` di desktop/tablet, satu kolom ≤820 px (tanpa `overflow:hidden`) |
| `js/09-s2-fixtures.js` | −10 / +223 baris | Grup (23) baru (16 kasus: konteks checkout, reset kunci sementara, probe cleanup, penanda demo) + H18–H19 (6 kasus) + `mk()` mode gabungan Set + tmp-throw/tmp-silent + kedua suite di-restructure try/finally dengan pemulihan sessionStorage + penghapusan SEMUA kunci window baru |
| `harness/run-v21.2.js` | baru (249 baris; `run-v21.1.js` DIHAPUS) | Rename + keluar NONZERO bila ada kasus gagal / suite melempar / cleanup tidak pulih + verifikasi sessionStorage & kunci window pra/pasca-suite (hasil: `result.cleanup`, `result.exitCode`) |
| `harness/package-lock.json` | baru (355 baris) | Lockfile deterministik (acorn 8.19.0, jsdom 31.0.0 — sama persis dengan `package.json`); `npm ci` terverifikasi dari clone bersih |
| `TESTS.md` | ditulis ulang | Dokumen ini |

Tidak ada perubahan pada: `index.html`, 3 CSS lain (`renderer.css`,
`builder.css`, `stage2.css`), `01-core.js`, `02-catalog.js`,
`03-state.js`, `06-s2-core.js`, `07-s2-access.js`, `10-s2-rsvp.js`,
`11-s2-seed.js`. Tidak ada perubahan seed data, harga, durasi masa
aktif, skema storage, aturan expiry V20, KI-2026-1008 (hold v21
dipertahankan apa adanya — hanya tautan "Buat Pesanan Baru"-nya kini
membawa konteks), atau tanggal Nusantara Tech / Nadia–Reza / Salsa.
Tombol "Buat Pesanan Baru" pada kartu pesanan DIBATALKAN
(`js/12-s2-views.js`, viewPay) SENGAJA tidak diubah — backlog v22.

## Reproduksi — instalasi deterministik + harness di branch (cara yang diutamakan)

Harness disertakan di branch (`v21.2/harness/`) supaya audit dapat
mereproduksi tanpa file luar. Dari clone bersih tree ini:

```bash
cd v21.2/harness
npm ci                 # instalasi deterministik dari package-lock.json
                       # (acorn 8.19.0 + jsdom 31.0.0; 29 paket)
                       # node_modules TIDAK ikut di-push
node run-v21.2.js ../../after-v21.2/suite-result.json
# Dengan perbandingan baseline (opsional): beri direktori baseline
# yang berisi suite-result.json + index.html + state-*.json, mis.:
node run-v21.2.js ../../after-v21.2/suite-result.json ../../baseline-v19
```

Perintah ini MENJALANKAN suite in-page yang sebenarnya
(`kiFixtureTests` + `kiHandlerTests`) di jsdom atas tree yang disajikan
lewat HTTP lokal, bukan sekadar memeriksa sintaks. **Harness keluar
NONZERO bila ada kasus gagal, suite melempar, atau cleanup tidak
memulihkan sessionStorage/global persis** (`process.exitCode = 1`;
lempar runner tetap keluar 2). Hasil run yang benar-benar dijalankan
dari layout branch (10 Nov 2026, ~23:00 WIB — run final; run
sebelumnya 160/162 + 45/46 karena 3 kesalahan ekspektasi tes, bukan
bug aplikasi — lihat REPORT-v21.2.md §6):

- `kiFixtureTests`: **162/162 PASS** (baseline V21.1: 146/146; +16 kasus)
- `kiHandlerTests`: **46/46 PASS** (baseline V21.1: 40/40; +6 kasus)
- HTTP lokal 19/19 → 200 (semua file tree)
- 5 rute render (`#/`, `#/dashboard`, `#/admin`, `#/u/nadia-dan-reza`,
  `#/template`); storage keys 16
- `result.cleanup.ok: true` (sessionStorage + kunci window kembali
  identik dengan snapshot pra-suite); `result.exitCode: 0`
- Tanpa argumen baseline: `compare` berisi catatan "Baseline tidak
  diberikan/ditemukan — perbandingan dilewati." (Perbandingan rute
  v21.1-vs-v21.2 dilakukan terpisah dari dua file suite-result —
  lihat § Perbandingan rute.)

Setelah menjalankan, HAPUS `v21.2/harness/node_modules` supaya tree
yang di-push tetap bersih — yang masuk commit: `run-v21.2.js` +
`package.json` + `package-lock.json`. **`package-lock.json` WAJIB
tetap ada di branch** (bukan artefak instalasi — ini bagian dari
deliverable item 3).

## Reproduksi — harness luar (cara lama, tetap berlaku)

Perintah dijalankan dari `~/workspace/kita-invite-refactor/`:

```bash
# Syntax check semua file yang diubah
for f in 04-views.js 05-builder.js 08-s2-reset.js 09-s2-fixtures.js 12-s2-views.js 13-s2-handlers.js; do
  node --check v21.2/js/$f
done
node --check v21.2/harness/run-v21.2.js
# (CSS tidak punya checker — perubahan design-system.css diperiksa
# lewat pengukuran Playwright, lihat § Demo.)

# Suite lengkap pada tree v21.2 (NODE_PATH menunjuk node_modules luar
# supaya tidak perlu npm install di dalam tree)
cd v21.2/harness
NODE_PATH=/home/hatch/workspace/kita-invite-refactor/harness/node_modules \
  node run-v21.2.js ../../after-v21.2/suite-result.json
```

Hasil run yang benar-benar dijalankan (10 Nov 2026, ~22:55 WIB):

- `kiFixtureTests`: **162/162 PASS**
- `kiHandlerTests`: **46/46 PASS**
- HTTP lokal 19/19 → 200; storage keys 16; cleanup ok; exit 0
- Boot errors: hanya 1 jsdomError Google Fonts (artefak harness)

## Reproduksi — bukti exit code harness (salinan disposable)

Dua run paksa-gagal pada salinan disposable di `/tmp` (bukan tree
branch; salinan sudah dihapus sesudah run):

```bash
# (a) Satu kasus fixture dipaksa gagal -> harness keluar 1
#     hasil: kiFixtureTests 162/163, kiHandlerTests 46/46, exit 1
# (b) Throw dilempar setelah mutasi grup 23 (probe sessionStorage +
#     global sudah ditambahkan) -> harness keluar 1 DAN cleanup ok
#     (kasus isolasi PASS, probe212 hilang — finally berjalan)
#     hasil: kiFixtureTests 162/163, kiHandlerTests 46/46, exit 1
```

File hasil run (di `~/workspace/kita-invite-refactor/after-v21.2/`):

- `suite-result-forced-fail.json` — run (a), `exitCode: 1`
- `suite-result-forced-throw.json` — run (b), `exitCode: 1`,
  `cleanup.ok: true`

## Reproduksi — tombol fixture in-page (browser, disposable)

Buka preview Pages branch `muse-fix-v21.2`, lalu:

1. Dashboard → Pengaturan (tab Pengaturan).
2. Klik **"Jalankan Uji Fixture Terisolasi (… v21.2: Konteks Checkout ·
   Reset Kunci Sementara · Demo Layout)"** — menjalankan
   `kiFixtureTests` (162 kasus, termasuk grup 23).
3. Klik **"Jalankan Uji Handler Penuh (… v21.2: Konteks Checkout ·
   Reset Kunci Sementara)"** — menjalankan `kiHandlerTests` (46 kasus,
   termasuk H18–H19).
4. Hasil tampil di bawah tombol (`#fixture-results` / `#handler-results`).

PENTING — aturan audit yang berlaku (dari Lora): tombol fixture/grant
hanya ditekan pada clone/fixture lokal disposable, BUKAN pada preview
publik. Suite ini terisolasi penuh: sebelum berjalan, seluruh state sesi
(peran, desainer aktif, flag + generasi grant, referensi koleksi, daftar
ID undangan, dump storage, kunci window, sessionStorage, timer autosave)
di-snapshot; sesudah berjalan semuanya dipulihkan — termasuk MENGHAPUS
property global yang sebelumnya tidak ada (bukan mengubahnya menjadi
`false`/`0`) dan MEMULIHKAN sessionStorage persis (hapus yang
ditambahkan, kembalikan yang diubah/dihapus) — dan pemulihan kini
berjalan di `finally`, jadi TETAP BERJALAN walau ada kasus yang
melempar; kasus isolasi terakhir MEMVERIFIKASI pemulihan itu (storage
byte-per-byte, set kunci window identik, sessionStorage identik, timer
identik, tidak ada record fixture tertinggal).

## Perbandingan rute (v21.1 baseline vs v21.2 sesudah)

Lima rute yang dirender segar oleh harness pada kedua tree
(`after-v21.2-baseline/suite-result.json` vs
`after-v21.2/suite-result.json`):

| Rute | appHtmlSha | counts | invitations | orders | storageKeys | storageNorm |
|---|---|---|---|---|---|---|
| `#/` | IDENTICAL | identik | identik | identik | identik | beda urutan 1 koleksi* |
| `#/dashboard` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/admin` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/u/nadia-dan-reza` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/template` | IDENTICAL | identik | identik | identik | identik | identik |

\* `#/` storageNorm: satu-satunya perbedaan adalah URUTAN record di
`vowora:v1:activity` (baseline: seed-act-2, seed-act-4, seed-act-1,
seed-act-3; sesudah: seed-act-2, seed-act-1, seed-act-4, seed-act-3) —
himpunan record SAMA PERSIS (4 record, isi identik). Ini volatilitas
urutan seed activity yang sudah diketahui sejak v11 (seed activity
bervariasi per boot), BUKAN perubahan v21.2. Render `#/` sendiri
byte-identik (appHtmlSha IDENTICAL).

## Demo Luxury Ivory — pengukuran Playwright (browser nyata, bukan jsdom)

Skrip `~/workspace/kita-invite-refactor/browser-test/measure-demo.js`
(Chromium Playwright, binary Chrome for Testing 158.0.8127.18 di
`~/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`,
`executablePath` eksplisit). Route `#/demo/luxury-ivory`, data seed
lengkap. Metrik: `documentElement.scrollWidth` vs `clientWidth` +
bounding rect `.phone-shell` / `.detail-info` / `.buybox` +
`grid-template-columns` terkomputasi + screenshot tiap lebar.

| Lebar | V21.1 (baseline) | V21.2 |
|---|---|---|
| 320 px | OVERFLOW +373 px (doc 693) | OK (320), 1 kolom, preview → detail → buybox |
| 360 px | OVERFLOW +333 px (693) | OK (360), 1 kolom |
| 375 px | OVERFLOW +318 px (693) | OK (375), 1 kolom |
| 390 px | OVERFLOW +303 px (693) | OK (390), 1 kolom |
| 430 px | OVERFLOW +263 px (693) | OK (430), 1 kolom |
| 820 px | OK (820) tapi tetap 2 kolom | OK (820), 1 kolom |
| 1024 px | OK (1024), 2 kolom | OK (1024), 2 kolom (400px 548px) |
| 821 px | OVERFLOW +23 px (tombol header) | OVERFLOW +23 px (tombol header — HANYA LAPORAN, tidak diperbaiki) |

Penyebab (V21.1): inline `grid-template-columns:400px 1fr` di `viewDemo`
mengalahkan aturan mobile `.detail-grid` (satu kolom ≤820 px) — grid
tetap 400 px + 1fr sehingga dokumen melebar ke 693 px di semua lebar
mobile. Perbaikan: inline dihapus, class `.demo-layout` + CSS responsif
(dua kolom `400px 1fr` di desktop/tablet, satu kolom ≤820 px). Urutan
mobile dibuktikan bounding rect: preview (top 89, bottom 752,4) →
detail (top 788,4) → buybox di dalam detail. File:
`after-v21.2/demo-measure.json` + `after-v21.2/shots/demo-<lebar>.png`.

**821 px (HANYA LAPORAN, bukan bagian perbaikan):** overflow +23 px di
V21.1 DAN V21.2 (tidak berubah) — satu-satunya pelanggar nyata
`a.btn.gold.sm.desk` "Buat Undangan" (tombol header), ujung kanan
844,4 px pada viewport 821 px. Angka yang sama terukur di halaman
beranda `#/` (+23 px, pelanggar yang sama) — jadi ini masalah header
global, bukan halaman demo. Angka 23 px adalah hasil ukur langsung di
Chromium nyata; instruksi menyebut "~6 px" — selisih itu dicatat apa
adanya, tidak dianalisis lebih lanjut karena di luar scope. Header
TIDAK diubah.

## Cakupan kasus baru

- **Grup (23) `kiFixtureTests` (16 kasus):** 23a konteks checkout (7):
  tautan entry Builder; tautan entry order tertahan (orderCard +
  viewPay); navigasi nyata `#/checkout?inv=seed-inv-2` → Kirana +
  Basic Rp29.000, 0 order baru; ID tak ditemukan → ditahan +
  tombol disabled + placeholder; tier tak terbukti → ditahan;
  tanpa konteks → default lama; pilihan manual bertahan setelah
  render ulang. 23b reset kunci sementara (6): removeItem melempar →
  `backup-cleanup` + `tmpCleanup:false` + `backupValid:true` + data
  utuh; removeItem diam-diam gagal → sama; gabungan commit-torn +
  tmp-throw → `backup-commit` + `restored:true` + `tmpCleanup:false`;
  corrupt (baca-balik tmp mengembalikan sampah) → `backup-verify` +
  `tmpCleanup:false`; kontrol positif commit-torn → `tmpCleanup:true`;
  jalur normal → sukses + tmp hilang. 23c probe cleanup-setelah-throw
  (1): throw di tengah grup tidak merusak state; probe (sessionStorage
  `__kiFx23Sess` + global `__kiProbe212` + `kiProbe212Global`) sengaja
  ditinggalkan grup dan WAJIB hilang di kasus isolasi. 23d penanda
  demo (2): viewDemo memakai `detail-grid demo-layout` tanpa inline +
  urutan DOM preview → detail → buybox; viewDetail TIDAK tersentuh.
- **H18–H19 `kiHandlerTests` (6 kasus, handler produksi asli + event
  DOM nyata):** H18 konteks checkout (4): navigasi
  `#/checkout?inv=seed-inv-2` + klik Konfirmasi ASLI → pesanan BARU
  Kirana Basic Rp29.000 (lalu dibersihkan); ID tak ditemukan → tombol
  disabled + klik paksa ditolak handler + `kiCheckoutValidate(null)`
  menolak, 0 order baru; klik tautan "Buat Pesanan Baru yang Sesuai"
  di halaman bayar KI-2026-1008 → Kirana/Basic (catatan: jsdom TIDAK
  melakukan navigasi anchor saat klik — tes mengklik tautan lalu
  mengikuti href-nya, nilai persis yang akan dinavigasi browser);
  pilihan manual di dropdown (event change nyata) bertahan setelah
  render ulang + paket mengikuti (Premium). H19 reset kunci sementara
  (2): fault injection `Storage.prototype.removeItem` untuk KI_TMP_BK
  lewat handler reset-demo + modal asli — melempar dan diam-diam gagal
  sama-sama → toast "kunci sementara … tidak dapat dibersihkan", data
  utuh, tmp key masih tertinggal, cadangan baru tersimpan.
- **Isolasi diperketat (kedua suite):** pemulihan kini di `finally`
  (tetap berjalan walau kasus melempar di luar grup); sessionStorage
  DIPULIHKAN persis (bukan hanya diperiksa); penghapusan kunci window
  diperluas ke SEMUA kunci baru (bukan hanya `__ki*` — dibuktikan
  probe `kiProbe212Global` tanpa awalan `__ki`); snapshot CO kini
  mencakup `ctxHash`/`ctxMissing` (kasus isolasi memeriksanya).
- **Stub `mk()` mode gabungan:** menerima string tunggal atau array
  (`['commit-torn','tmp-throw']`); mode baru `tmp-throw` (removeItem
  melempar untuk KI_TMP_BK) dan `tmp-silent` (removeItem diam-diam
  tidak menghapus KI_TMP_BK). Semua pemakaian lama (`mk('read')`,
  `mk('commit-torn')`, `mk('')`, dst.) berperilaku sama seperti
  sebelumnya.
