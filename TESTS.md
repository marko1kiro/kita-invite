# Kita Invite V22 — TESTS.md

Ronde perbaikan sempit atas koreksi Agent Lora untuk v21.2 (3 backlog).
Baseline: branch `muse-fix-v21.2`, commit
`eef0a7ef78a1edc38e0dc2b590ccb819bfef378f`. Tree ini (`v22/`)
mempertahankan struktur modular V20/V21/V21.1/V21.2 (18 file:
`index.html` + 4 CSS + 13 JS, classic `<script src>`, bukan ES
modules) + direktori `harness/` (harness yang dapat dijalankan,
disertakan di branch — lihat § Reproduksi). Harness di branch TETAP
bernama `harness/run-v21.2.js` (JANGAN di-rename — instruksi Lora
menyebut "harness V21.2 yang ada di branch"); komentar header-nya
diperbarui supaya jelas ia kini menjalankan suite v22.

## File yang berubah vs V21.2 (4 file + TESTS.md; 17 file lain byte-identical)

| File | Perubahan | Alasan (satu baris) |
|---|---|---|
| `js/12-s2-views.js` | −7 / +21 baris | Item 1: tautan "Buat Pesanan Baru" pada kartu order DIBATALKAN (viewPay) membawa `?inv=${order.invitationId}`; item 1 (fail-closed): `viewCheckout` memperlakukan param `?inv=` yang hadir-tapi-kosong sebagai konteks eksplisit yang gagal (`ctxMissing=true`); item 2: `viewAdmin` mengalihkan alias `bantuan` → tab `layanan` + fallback JELAS untuk tab tak dikenal (pesan + kembali ke Ringkasan); label tombol uji diperbarui ke v22 |
| `css/design-system.css` | −0 / +8 baris | Item 3: di dalam `@media (max-width:1023px)` yang sudah ada — `.topbar-in{gap:16px}` + `.nav a{padding:9px 10px}` — menghemat ±66 px agar tombol header muat di 821–845 px; ≥1024 px tidak tersentuh |
| `js/09-s2-fixtures.js` | −0 / +131 baris | Grup (24) baru (10 kasus: CTA order batal, `?inv=` kosong/tidak valid, alias + semua tab Admin) + H20 (4 kasus handler penuh) |
| `harness/run-v21.2.js` | −5 / +11 baris | Komentar header diperbarui (nama dipertahankan, suite kini v22) + perbaikan robustness: tiap `fetch` memakai `Connection: close` agar undici tidak memakai ulang socket keep-alive yang server sudah tutup selama suite berjalan (idle > keepAliveTimeout 5 dtk) — penyebab 5× ECONNRESET berturut-turut; lihat REPORT-v22.md §5 |
| `TESTS.md` | ditulis ulang | Dokumen ini |

Tidak ada perubahan pada: `index.html`, 3 CSS lain (`renderer.css`,
`builder.css`, `stage2.css`), `01-core.js`, `02-catalog.js`,
`03-state.js`, `04-views.js`, `05-builder.js`, `06-s2-core.js`,
`07-s2-access.js`, `08-s2-reset.js`, `10-s2-rsvp.js`,
`11-s2-seed.js`, `13-s2-handlers.js`, `harness/package.json`,
`harness/package-lock.json`. Tidak ada perubahan seed data, harga,
durasi masa aktif, skema storage, aturan expiry V20, layout demo
Luxury Ivory (`.demo-layout` + CSS responsifnya TIDAK disentuh),
KI-2026-1008 (hold v21 + konteks v21.2 dipertahankan), atau tanggal
Nusantara Tech / Nadia–Reza / Salsa. Order batal tetap terminal
(tombol bayar tetap hilang, hasil pembayaran tetap ditolak handler).

Total tree: 7.080.353 B (v21.2: 7.061.637 B; +18.716 B).

## Reproduksi — instalasi deterministik + harness di branch (cara yang diutamakan)

Harness disertakan di branch (`v22/harness/`) supaya audit dapat
mereproduksi tanpa file luar. Dari clone bersih tree ini:

```bash
cd v22/harness
npm ci                 # instalasi deterministik dari package-lock.json
                       # (acorn 8.19.0 + jsdom 31.0.0; 29 paket)
                       # node_modules TIDAK ikut di-push
node run-v21.2.js ../../after-v22/suite-result.json
# Dengan perbandingan baseline (opsional): beri direktori baseline
# yang berisi suite-result.json + index.html + state-*.json, mis.:
node run-v21.2.js ../../after-v22/suite-result.json ../../baseline-v19
```

Perintah ini MENJALANKAN suite in-page yang sebenarnya
(`kiFixtureTests` + `kiHandlerTests`) di jsdom atas tree yang disajikan
lewat HTTP lokal, bukan sekadar memeriksa sintaks. **Harness keluar
NONZERO bila ada kasus gagal, suite melempar, atau cleanup tidak
memulihkan sessionStorage/global persis** (`process.exitCode = 1`;
lempar runner tetap keluar 2). Hasil run yang benar-benar dijalankan
dari layout branch (11 Nov 2026, ~06:05 WIB — run final; 2 run
berturut-turut hasil identik; run pertama sesudah perbaikan
172/172 + 50/50, run kedua sama):

- `kiFixtureTests`: **172/172 PASS** (baseline V21.2: 162/162; +10 kasus)
- `kiHandlerTests`: **50/50 PASS** (baseline V21.2: 46/46; +4 kasus)
- HTTP lokal 19/19 → 200 (semua file tree)
- 5 rute render (`#/`, `#/dashboard`, `#/admin`, `#/u/nadia-dan-reza`,
  `#/template`); storage keys 16
- `result.cleanup.ok: true` (sessionStorage + kunci window kembali
  identik dengan snapshot pra-suite); `result.exitCode: 0`
- Tanpa argumen baseline: `compare` berisi catatan "Baseline tidak
  diberikan/ditemukan — perbandingan dilewati." (Perbandingan rute
  v21.2-vs-v22 dilakukan terpisah dari dua file suite-result —
  lihat § Perbandingan rute.)

Setelah menjalankan, HAPUS `v22/harness/node_modules` supaya tree
yang di-push tetap bersih — yang masuk commit: `run-v21.2.js` +
`package.json` + `package-lock.json`. **`package-lock.json` WAJIB
tetap ada di branch** (bukan artefak instalasi — ini bagian dari
deliverable).

CATATAN — flake ECONNRESET (diperbaiki di v22): sebelum perbaikan
`Connection: close`, harness gagal 5× berturut-turut dengan
`HARNESS ERROR [TypeError: fetch failed]`, cause `ECONNRESET` —
fetch pertama di `loadPage` (dan/atau fetch dump rute setelah suite)
memakai ulang socket keep-alive yang server lokal sudah tutup
(keepAliveTimeout 5 dtk; suite berjalan lebih lama dari itu).
Diagnosis dibuktikan dengan harness instrumentasi di `/tmp`
(fetch mana yang gagal + kapan) dan probe server lokal identik
(10/10 OK di isolasi). Setelah perbaikan: 3/3 run salinan
instrumentasi + 2/2 run branch harness berhasil tanpa satu pun
ECONNRESET. Bila `npm ci` gagal karena CDN, pakai `NODE_PATH`
menuju node_modules luar seperti § Reproduksi — harness luar di
bawah (cara itu juga terverifikasi 172/172 + 50/50).

## Reproduksi — harness luar (cara lama, tetap berlaku)

Perintah dijalankan dari `~/workspace/kita-invite-refactor/`:

```bash
# Syntax check semua file yang diubah
for f in 09-s2-fixtures.js 12-s2-views.js; do node --check v22/js/$f; done
node --check v22/harness/run-v21.2.js
# (CSS tidak punya checker — perubahan design-system.css diperiksa
# lewat pengukuran Playwright, lihat § Header.)

# Suite lengkap pada tree v22 (NODE_PATH menunjuk node_modules luar
# supaya tidak perlu npm install di dalam tree)
cd v22/harness
NODE_PATH=/home/hatch/workspace/kita-invite-refactor/harness/node_modules \
  node run-v21.2.js ../../after-v22/suite-result.json
```

Hasil run yang benar-benar dijalankan dari layout branch (11 Nov 2026,
~06:05 WIB; 2 run, hasil identik):

- `kiFixtureTests`: **172/172 PASS**
- `kiHandlerTests`: **50/50 PASS**
- HTTP lokal 19/19 → 200; storage keys 16; cleanup ok; exit 0
- Boot errors: hanya 1 jsdomError Google Fonts (artefak harness —
  request non-localhost diblokir interceptor menjadi 404 sintetis)

## Reproduksi — tombol fixture in-page (browser, disposable)

Buka preview Pages branch `muse-fix-v22`, lalu:

1. Dashboard → Pengaturan (tab Pengaturan).
2. Klik **"Jalankan Uji Fixture Terisolasi (… v22: CTA Order Batal ·
   Alias Bantuan · Header 821px)"** — menjalankan `kiFixtureTests`
   (172 kasus, termasuk grup 24).
3. Klik **"Jalankan Uji Handler Penuh (… v22: CTA Order Batal ·
   Alias Bantuan)"** — menjalankan `kiHandlerTests` (50 kasus,
   termasuk H20).
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

## Perbandingan rute (v21.2 baseline vs v22 sesudah)

Lima rute yang dirender segar oleh harness pada kedua tree
(`after-v22-baseline/suite-result.json` vs
`after-v22/suite-result.json` — perbandingan dilakukan dari kedua
file, karena baseline run tidak membawa state-*.json terpisah):

| Rute | appHtmlSha | counts | invitations | orders | storageKeys | storageNorm |
|---|---|---|---|---|---|---|
| `#/` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/dashboard` | BEDA* | identik | identik | identik | identik | identik |
| `#/admin` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/u/nadia-dan-reza` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/template` | IDENTICAL | identik | identik | identik | identik | identik |

\* `#/dashboard` appHtmlSha beda, tetapi counts/invitations/orders/
storageKeys/storageNorm SEMUA identik — perbedaan hanya stempel
waktu aktivitas seed (`new Date(a.at).toLocaleString`, monolit
baris 3970) yang berubah tiap menit; volatilitas yang sudah diketahui
sejak v20 (BASELINE-v19.md §8: perbandingan back-to-back hash segar
= 0 baris beda). BUKAN perubahan v22.

## Header 821 px — pengukuran Playwright (browser nyata, bukan jsdom)

Skrip `~/workspace/kita-invite-refactor/browser-test/measure-header.js`
(Chromium Playwright, binary Chrome for Testing 158.0.8127.18 di
`~/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`,
`executablePath` eksplisit). Route `#/` DAN `#/demo/luxury-ivory`
(hasil identik di kedua route). Metrik per lebar:
`documentElement.scrollWidth` vs `clientWidth`, overflow px, bounding
rect tiap anak `.topbar-in` (brand, nav + tiap tautan, burger, tombol
"Buat Undangan"), tumpang tindih, clipping tombol (scrollWidth vs
clientWidth), status font web (`document.fonts`), daftar pelanggar,
screenshot tiap lebar.

| Lebar | V21.2 (baseline) | V22 |
|---|---|---|
| 768 px | OK (768), tombol disembunyikan (burger) | OK (768), sama |
| 800 px | OK (800), tombol disembunyikan | OK (800), sama |
| 820 px | OK (820), tombol disembunyikan | OK (820), sama |
| 821 px | OVERFLOW +23 px (doc 844; tombol kanan 844,4) | **OK (821), tombol kanan 801,0 — 20 px dari tepi** |
| 825 px | OVERFLOW +19 px (844) | **OK (825), tombol kanan 805,0** |
| 830 px | OVERFLOW +14 px (844) | **OK (830), tombol kanan 810,0** |
| 840 px | OVERFLOW +4 px (844) | OK (840), tombol kanan 820,0 |
| 860 px | OK (860) | OK (860), tombol kanan 840,0 |
| 880 px | OK (880) | OK (880), tombol kanan 860,0 |
| 900 px | OK (900) | OK (900), tombol kanan 880,0 |
| 1024 px | OK (1024), tombol kanan 1004 | OK (1024), tombol kanan 1004 — **tidak berubah** |

Diagnosis (baseline): di ≤820 px media query menyembunyikan nav +
tombol (burger tampil); di 821 px nav desktop kembali tampil, tetapi
baris flex `.topbar-in` (brand + 7 tautan nav + tombol) lebar
intrinsiknya tetap 844,4 px sementara kotak konten hanya 781 px
(821 − padding 40 px) — overflow 821–~845 px. Perbaikan MINIMAL:
di dalam `@media (max-width:1023px)` yang sudah ada,
`.topbar-in{gap:16px}` (dari 28 px) + `.nav a{padding:9px 10px}`
(dari 9px 13px) — hemat ±66 px (2 gap × 12 px + 7 tautan × 6 px)
terhadap overflow 23 px. Semua tombol header tetap TERBACA dan BISA
DIPAKAI: tidak ada `overflow:hidden`, tidak ada tombol yang dipindah
ke burger, tidak ada teks yang dipotong — nav 139,7–661,1 px,
tombol 685,1–801,0 px, tanpa tumpang tindih (`overlaps: []`), tanpa
pelanggar (`offenders: []`), tombol tidak ter-clipping
(scrollW == clientW). Font web: `document.fonts.status = 'loaded'`,
kelima keluarga ter-check true (Playfair Display, Cormorant
Garamond, Marcellus, Jost, Manrope) di semua lebar — pengukuran
memakai font web asli, bukan fallback. File:
`after-v22/header-measure.json` +
`after-v22/header-measure-demo.json` + screenshot
`after-v22/shots-header/*.png` +
`after-v22/shots-header-demo/*.png` (11 lebar × 2 route).
Baseline: `after-v22/header-measure-baseline.json` +
`after-v22/header-measure-demo-baseline.json`.

Catatan: rect brand di 821+ px memanjang vertikal melewati bar
64 px (top −20,1 / bottom 84,1) — SUDAH ADA di baseline, tidak
berubah oleh perbaikan (perbaikan hanya mengubah gap + padding),
bukan overflow horizontal dan tidak masuk daftar pelanggar.
Di ≤820 px dan 1024 px rect brand normal (top 6,7).

## Demo Luxury Ivory — regresi Playwright (browser nyata)

Skrip `browser-test/measure-demo.js` yang sama seperti v21.2.
Route `#/demo/luxury-ivory`, data seed lengkap. Hasil v22
(`after-v22/demo-measure.json` + `after-v22/shots-demo/demo-<lebar>.png`):

| Lebar | Hasil v22 |
|---|---|
| 320 px | OK (320), 1 kolom (`280px`), preview → detail → buybox |
| 360 px | OK (360), 1 kolom (`320px`) |
| 375 px | OK (375), 1 kolom (`335px`) |
| 390 px | OK (390), 1 kolom (`350px`) |
| 430 px | OK (430), 1 kolom (`390px`) |
| 820 px | OK (820), 1 kolom (`780px`) |
| 821 px | OK (821), 2 kolom (`400px 345px`) — breakpoint demo sendiri (≤820 = 1 kolom) |
| 1024 px | OK (1024), 2 kolom (`400px 548px`) — sama seperti v21.2 |

Urutan mobile dibuktikan bounding rect: preview (top 89) →
detail (top 788,4) → buybox di dalam detail. Class tetap
`detail-grid demo-layout`, tanpa inline style — layout demo
TIDAK disentuh di v22.

## Cakupan kasus baru

- **Grup (24) `kiFixtureTests` (10 kasus):** 24a CTA order batal
  (4): tautan halaman bayar KI-2026-1004 memuat
  `#/checkout?inv=seed-inv-4` dan TIDAK ada lagi tautan checkout
  polos; kartu batal tetap terminal (tanpa tombol simulasi, VA
  dicoret); navigasi ujung-ke-ujung lewat UI nyata dengan order +
  undangan fixture milik pelanggan aktif (champagne-vow) → checkout
  memilih undangan fixture + kunci PREMIUM Rp59.000, tombol
  konfirmasi aktif, 0 order baru; regresi v21.2 — Builder Kirana +
  order tertahan KI-2026-1008 tetap membawa `?inv=seed-inv-2`.
  24b `?inv=` fail-closed (3): `#/checkout?inv=` (kosong) →
  `ctxMissing=true` + "Checkout Ditahan — Undangan Tidak
  Ditemukan" + placeholder + tombol disabled, TANPA default
  diam-diam, 0 order baru; `#/checkout?inv=seed-inv-3` (milik
  cust-2, sebagai Nadia) → ditahan, 0 order baru; `#/checkout`
  polos → default lama (undangan pertama), tidak ditahan
  (regression guard perubahan `hasInvParam`). 24c tab Admin (3):
  alias `#/admin?tab=bantuan` → konten "Antrean Layanan Bantuan"
  + nav layanan tersorot; SEMUA 14 tab dikenal menampilkan
  kontennya + nav tersorot + tanpa pesan "Tab tidak dikenal"
  (ringkasan, template, kategori, gaya, pelanggan, undangan,
  pesanan, pembayaran, layanan, media, paket, kupon, notifikasi,
  pengaturan); tab tak dikenal `#/admin?tab=ngawur` → pesan
  "Tab tidak dikenal" + konten Ringkasan + nav ringkasan tersorot.
- **H20 `kiHandlerTests` (4 kasus, handler produksi asli + event
  DOM nyata):** (a) klik ASLI tautan "Buat Pesanan Baru" di halaman
  bayar order batal fixture → checkout memilih undangan fixture +
  PREMIUM Rp59.000, 0 order baru; (b) klik Konfirmasi ASLI pada
  checkout itu → pesanan BARU tercipta (undangan fixture, Premium
  Rp59.000, payment tertaut), lalu dibersihkan; (c) navigasi hash
  NYATA sebagai Admin: `#/admin?tab=bantuan` → Layanan Bantuan,
  `#/admin?tab=ngawur` → pesan jelas + Ringkasan; (d) pay-result
  Success (handler ASLI) pada KI-2026-1004 → DITOLAK, status
  tetap Dibatalkan/Failed, 0 payment baru.
- **Batasan pengujian item 1 (didokumentasikan, bukan ditutup-tutupi):**
  `CURRENT_USER` hard-coded `'cust-1'` (js/06-s2-core.js:9, `const`,
  tidak ada pengalih pengguna demo — persona hanya ganti peran).
  Alur SEED "Salsa mengklik CTA order batalnya sendiri" TIDAK DAPAT
  dijalankan di prototipe ini karena tidak ada cara menjadi Salsa.
  Yang dibuktikan: (1) tautan seed KI-2026-1004 membawa ID yang
  benar (render-level, 24a-a1); (2) jalur kode yang sama bekerja
  ujung-ke-ujung untuk order batal milik pelanggan aktif (24a-a3 +
  H20-a/b); (3) sebagai Nadia, mengikuti tautan seed itu DITAHAN
  dengan benar (ctxMissing — undangan bukan miliknya; 24b-b2
  membuktikan pola yang sama untuk seed-inv-3). Lihat
  REPORT-v22.md §2 + §8.
- **Satu kegagalan tes saat pengembangan (bukan bug aplikasi):** run
  pertama 171/172 — kasus "Tab Admin dikenal (14 tab)" gagal untuk
  tab `pelanggan` + `paket` karena marker ekspektasi memakai `&`
  mentah, sementara `innerHTML` menyerialisasinya sebagai `&amp;`.
  Marker diperbaiki ke bentuk `&amp;`; run berikutnya 172/172.
  (Pola yang sama seperti v21.1 run 1: kesalahan ekspektasi tes,
  bukan bug aplikasi.)
