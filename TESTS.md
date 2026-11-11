# Kita Invite V23 — TESTS.md

## Struktur tree (v23, dari v22)

Perintah kerja (di `~/workspace/kita-invite-refactor/`):

```bash
# Verifikasi dasar — tidak ada perubahan yang merusak struktur
node --check v23/js/*.js          # semua PASS
diff -rq v22 v23                  # HANYA 3 file + TESTS.md ini yang berbeda
```

| File | Perubahan di v23 |
|---|---|
| `css/design-system.css` | Item 1 — wordmark 821–~1023 px: `.brand{white-space:nowrap}` + `.topbar-in{gap:12px}` + `.nav a{padding:9px 8px;font-size:14px}` + `.topbar .btn{margin-left:0}` — semua di dalam `@media (max-width:1023px)` yang sudah ada (295→309 baris). |
| `harness/package.json` | Item 2 — script `test`: dari default npm (`echo "Error: no test specified" && exit 1`) → `"test": "node run-v21.2.js ./suite-result.json"`. |
| `harness/run-v21.2.js` | Item 2 — komentar header diperbarui (suite kini v23 + cara `npm test`) + baris ringkasan `TEST SUMMARY` di akhir run (255→264 baris). Nama file DIPERTAHANKAN. |
| `TESTS.md` | Dokumen ini. |
| 18 file lainnya | Byte-identical dengan v22 (4 CSS sisanya, 13 JS, `index.html`, `harness/package-lock.json`). |

SHA `index.html` TIDAK berubah
(`77b315814854f9c940a1e3326dd75a972585f3339ab5af7bba8859036affe5b1`).
Tidak ada node_modules / suite-result.json / PNG / JSON di dalam
tree. Tidak ada file yang di-rename.

## Cara reproduksi (utama: `npm ci && npm test`)

```bash
# Dari dalam folder harness/ (node ≥18):
cd harness/
npm ci      # instalasi deterministik dari package-lock.json (acorn 8.19.0 + jsdom 31.0.0) — exit 0
npm test    # menjalankan "node run-v21.2.js ./suite-result.json" — exit 0
```

Hasil yang diharapkan (tercetak di stdout, baris terakhir):

```
TEST SUMMARY: kiFixtureTests: 172/172 PASS | kiHandlerTests: 50/50 PASS | cleanup: ok | HTTP: 19/19 | exit: 0
```

Hasil JSON lengkap ditulis ke `harness/suite-result.json` (313.418 B)
— artefak run lokal, BUKAN bagian commit. Jangan push file itu
(daftar file push eksplisit tidak memasukkannya).

Verifikasi dari clone bersih (sudah dijalankan 11 Nov 2026):
salin tree ke `/tmp/clean-clone-v23` (tanpa node_modules, tanpa
suite-result.json), lalu dari dalam `harness/`: `npm ci` → exit 0,
`npm test` → exit 0, ringkasan yang sama tercetak.
Arsip: `after-v23/suite-result-clean-clone.json`.

## Cara reproduksi (manual — tetap bekerja, tidak berubah)

```bash
# Jalankan manual dari layout branch (v23/harness), tanpa instalasi di tree:
NODE_PATH=/home/hatch/workspace/kita-invite-refactor/harness/node_modules node run-v21.2.js [out.json] [baseline-dir]
# Contoh: NODE_PATH=... node run-v21.2.js out.json
# (tanpa argumen: tidak menulis file — hasil hanya dicetak ke stdout)
# Perintah di atas bekerja dari folder mana pun; harness membaca layout
# branch relatif terhadap file run-v21.2.js itu sendiri.
```

Harness mengembalikan kode keluar 1 bila ada kasus gagal / ada
suite yang throw / cleanup gagal (tampilan lama tetap ditulis),
dan 2 bila runner itu sendiri throw. Argumen `[out.json]` dan
`[baseline-dir]` boleh diabaikan. Jalankan manual itu hanya
menguji in-page suite (172/172 + 50/50) + HTTP lokal; TIDAK
menguji `npm test` itu sendiri (buktikan dengan clone bersih di
atas). `package-lock.json` WAJIB ada di branch (`npm ci`).

Catatan: run manual dengan node_modules luar memakai `NODE_PATH`
karena di dalam branch tidak ada node_modules terinstal — JANGAN
instal di tree (node_modules tidak boleh masuk commit).

## Suite

Suite terdiri dari **222 kasus**: 172 `kiFixtureTests` (logika murni
in-page) + 50 `kiHandlerTests` (handler produksi asli + event DOM
nyata). Teks fixture disintesis (tamu, layanan, pesanan) — TIDAK
menyentuh server produksi. HTTP lokal disajikan dari `index.html`
+ semua aset branch oleh server HTTP Node bawaan di port acak
(127.0.0.1). 19/19 URL lokal → 200. Jalankan dari layout branch
mana pun (v23/harness): suite membaca file branch lewat `fs`.

### Cara memeriksa hasil

- Jalankan dengan argumen output, mis.
  `NODE_PATH=... node run-v21.2.js out.json`, lalu baca out.json
  (`suites.kiFixtureTests.total/passed`,
  `suites.kiHandlerTests.total/passed`, `cleanup.ok`,
  `exitCode`).
- Suite menulis `result.cleanup` (storage keys + kunci window
  sebelum/sesudah suite — harus identik sesudah cleanup) dan
  `result.httpStatus` (semua harus 200) ke JSON output.
- Harness mencetak ringkasan JSON + baris `TEST SUMMARY` ke stdout.

### Hasil v23 (dijalankan pada tree v23 sesudah perubahan)

| Run | kiFixtureTests | kiHandlerTests | Exit | Cleanup | HTTP | Storage keys |
|---|---|---|---|---|---|---|
| Baseline V22 (sebelum perubahan) | 172/172 | 50/50 | 0 | ok | 19/19 | 16 |
| `npm test` di branch (NODE_PATH) | **172/172** | **50/50** | 0 | ok | 19/19 | 16 |
| `npm test` clone bersih (`npm ci` dulu) | **172/172** | **50/50** | 0 | ok | 19/19 | 16 |
| Run final manual (NODE_PATH) | **172/172** | **50/50** | 0 | ok | 19/19 | 16 |

Boot errors: hanya 1 jsdomError Google Fonts (artefak harness —
request non-localhost diblokir interceptor menjadi 404 sintetis).
Tidak ada kasus yang gagal. Suite TIDAK berubah di v23 (lihat
bawah kenapa).

### Kenapa suite tidak berubah di v23

Item 1 murni CSS/layout: jsdom TIDAK PUNYA mesin layout
(`getBoundingClientRect` mengembalikan 0), jadi TIDAK ADA kasus
fixture yang bisa mengamati clipping vertikal — kasus seperti itu
akan selalu lolos palsu di jsdom. Bukti item 1 HANYA lewat
Playwright (bagian "Pengukuran header" di bawah). Item 2 (npm test)
adalah perubahan tooling harness, bukan perilaku aplikasi —
dibuktikan lewat run `npm ci && npm test` dari clone bersih,
bukan lewat kasus in-page. Tidak ada kasus yang ditambah demi angka.

## Pengukuran header — wordmark vertikal (item 1, Playwright nyata)

Skrip BARU `browser-test/measure-brand.js` (Playwright Chromium
nyata; mengukur vertikal: rect brand vs tinggi bar, jumlah garis
teks utama via Range, rect `<small>`, line-height/font-size
terkomputasi, tumpang tindih, overflow horizontal, posisi tombol,
status font). Route `#/` DAN `#/demo/luxury-ivory` (hasil identik
di kedua route). Bar header: 65 px (`.topbar-in` 64 px +
border-bottom 1 px). Brand normal: top 6,7 / bottom 57,3 /
tinggi 50,6 / lebar 148,3 (teks utama 1 baris, tagline 1 baris).

### Baseline v22 (sebelum perbaikan)

| Lebar | Brand top / bottom / tinggi | Brand lebar | Teks utama | Tagline | Clipping vertikal | Overflow horizontal | Tombol kanan |
|---|---|---|---|---|---|---|---|
| 768 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | disembunyikan (burger) |
| 800 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | disembunyikan |
| 820 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | disembunyikan |
| 821 px | **−20,1 / 84,1 / 104,2** | 103,7 | **2 baris** | **2 baris** | **YA (±20 px)** | 0 px | 801,0 |
| 825 px | **−20,1 / 84,1 / 104,2** | 106,0 | **2 baris** | **2 baris** | **YA** | 0 px | 805,0 |
| 830 px | **−20,1 / 84,1 / 104,2** | 108,9 | **2 baris** | **2 baris** | **YA** | 0 px | 810,0 |
| 840 px | **−20,1 / 84,1 / 104,2** | 114,8 | **2 baris** | **2 baris** | **YA** | 0 px | 820,0 |
| 860 px | **−20,1 / 84,1 / 104,2** | 126,5 | **2 baris** | **2 baris** | **YA** | 0 px | 840,0 |
| 880 px | **−20,1 / 84,1 / 104,2** | 138,1 | **2 baris** | **2 baris** | **YA** | 0 px | 860,0 |
| 900 px | **−12,5 / 76,5 / 89,0** | 142,2 | **2 baris** | 1 baris | **YA (±12 px)** | 0 px | 880,0 |
| 1024 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | 1004,0 |

Diagnosis (lihat REPORT-v23.md §2): di 821–~1023 px baris flex
dipenuhi nav 7 tautan + tombol, brand terjepit di bawah lebar satu
barisnya (~148,3 px) dan KEDUA barisnya membungkus (teks utama
38,4 px × 2 + tagline 15,2 px × 2 − 3 = 104,2 px — cocok persis;
di 900 px 2×38,4 + 15,2 − 3 = 89,0 px — cocok persis; normal
38,4 + 15,2 − 3 = 50,6 px). Rect text node "Kita " menyusut
68,1 → 58,8 px di 821 px (spasi akhir runtuh di ujung baris).
Zona clipping = rentang `@media (max-width:1023px)`; sudah ada
sejak baseline v21.2, BUKAN regresi v22; perubahan v22 (gap 16px +
padding nav 10px) tidak menyebabkan dan tidak memperbaikinya.
Tidak ada tumpang tindih antar anak header di lebar mana pun.

### Sesudah perbaikan (v23)

| Lebar | Brand top / bottom / tinggi | Brand lebar | Teks utama | Tagline | Clipping vertikal | Overflow horizontal | Tombol kanan |
|---|---|---|---|---|---|---|---|
| 768 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | disembunyikan |
| 800 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | disembunyikan |
| 820 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK | 0 px | disembunyikan |
| 821 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 801,0 (sama seperti v22) |
| 825 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 805,0 (sama) |
| 830 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 810,0 (sama) |
| 840 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 820,0 (sama) |
| 860 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 840,0 (sama) |
| 880 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 860,0 (sama) |
| 900 px | **6,7 / 57,3 / 50,6** | 148,3 | 1 baris | 1 baris | **TIDAK** | 0 px | 880,0 (sama) |
| 1024 px | 6,7 / 57,3 / 50,6 | 148,3 | 1 baris | 1 baris | TIDAK — tidak berubah | 0 px | 1004,0 (sama) |

Brand di 821 px (v23): top 6,7 / bottom 57,3 / tinggi 50,6 /
lebar 148,3 — IDENTIK dengan keadaan normal di ≤820 px dan
1024 px. Tumpang tindih: `[]` di semua lebar, kedua route.
`document.fonts.status = 'loaded'` di semua lebar; kelima
keluarga ter-check true (Playfair Display, Cormorant Garamond,
Marcellus, Jost, Manrope) — pengukuran memakai font web asli,
bukan fallback. Posisi tombol TIDAK BERUBAH dari v22 karena
`.nav{margin-left:auto}` menyerap ruang yang dilonggarkan.

Konfirmasi silang dengan skrip v22 (`measure-header.js`, metrik
horizontal penuh): 0 px overflow di semua 11 lebar di kedua route,
0 pelanggar nyata (`realOffenders: []`), 0 tumpang tindih, tombol
kanan identik dengan v22 (801/805/810/820/840/860/880/1004).

File: `after-v23/brand-measure.json` +
`after-v23/brand-measure-demo.json` + screenshot
`after-v23/shots-brand/*.png` +
`after-v23/shots-brand-demo/*.png` (11 lebar × 2 route).
Baseline: `after-v23/brand-measure-baseline.json` +
`after-v23/brand-measure-demo-baseline.json` + screenshot
`after-v23/shots-brand-baseline/` +
`after-v23/shots-brand-demo-baseline/`.
Konfirmasi silang: `after-v23/header-measure.json` +
`after-v23/header-measure-demo.json` +
`after-v23/shots-header/` + `after-v23/shots-header-demo/`.

## Demo Luxury Ivory — regresi v23 (Playwright nyata)

Skrip `browser-test/measure-demo.js` (sama seperti v21.2/v22).
Route `#/demo/luxury-ivory`. File:
`after-v23/demo-measure.json` + `after-v23/shots-demo/demo-<lebar>.png`.

| Lebar | Hasil v23 | Kolom |
|---|---|---|
| 320 px | OK (320), 0 px | 1 kolom (`280px`) |
| 360 px | OK (360), 0 px | 1 kolom (`320px`) |
| 375 px | OK (375), 0 px | 1 kolom (`335px`) |
| 390 px | OK (390), 0 px | 1 kolom (`350px`) |
| 430 px | OK (430), 0 px | 1 kolom (`390px`) |
| 820 px | OK (820), 0 px | 1 kolom (`780px`) |
| 821 px | OK (821), 0 px | 2 kolom (`400px 345px`) — breakpoint demo sendiri (≤820 = 1 kolom) |
| 1024 px | OK (1024), 0 px | 2 kolom (`400px 548px`) — sama seperti v21.2/v22 |

Urutan mobile dibuktikan bounding rect: preview → detail →
buybox di dalam detail (`previewAboveDetail: true`,
`buyboxInsideDetail: true`). Class tetap `detail-grid demo-layout`,
tanpa inline style — layout demo TIDAK disentuh di v23.

## Perbandingan rute (baseline V22 vs v23 sesudah)

| Rute | appHtmlSha | counts | invitations | orders | storageKeys | storageNorm |
|---|---|---|---|---|---|---|
| `#/` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/dashboard` | BEDA* | identik | identik | identik | identik | identik |
| `#/admin` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/u/nadia-dan-reza` | IDENTICAL | identik | identik | identik | identik | identik |
| `#/template` | IDENTICAL | identik | identik | identik | identik | identik |

\* `#/dashboard` appHtmlSha beda, tetapi counts/invitations/
orders/storageKeys/storageNorm SEMUA identik — perbedaan hanya
stempel waktu aktivitas seed (`new Date(a.at).toLocaleString`)
yang berubah tiap menit; volatilitas yang sudah diketahui sejak
v20 (BASELINE-v19.md §8). BUKAN perubahan v23.

## Cakupan kasus (suite v23 — sama seperti v22, 222 kasus)

| Grup | Jumlah | Status v23 |
|---|---|---|
| Reset safety (js/08-s2-reset.js) | 16 (7 kasus dasar + 4 kunci + 5 pemulihan) | PASS |
| Owner guard (js/07-s2-access.js) | 5 | PASS |
| State machine layanan (js/07-s2-access.js) | 10 | PASS |
| Order: pembatalan + audit log (js/06-s2-core.js) | 7 | PASS |
| Order: pay-result terminal (js/06-s2-core.js) | 7 | PASS |
| Order: penyelarasan tier dengan template (js/06-s2-core.js) | 4 | PASS |
| Order: expired + VA (js/12-s2-views.js) | 6 | PASS |
| Order: harga paket (js/06-s2-core.js) | 5 | PASS |
| Renderer: harga + detail paket (js/12-s2-views.js) | 5 | PASS |
| Renderer: kartu tamu & RSVP (js/12-s2-views.js) | 10 | PASS |
| Renderer: tombol aksi multi-peran (js/12-s2-views.js) | 5 | PASS |
| Renderer: banner order (js/12-s2-views.js) | 6 | PASS |
| Renderer: banner akses lintas pemilik (js/12-s2-views.js) | 3 | PASS |
| Renderer: expiry (js/06-s2-core.js) | 5 | PASS |
| Builder: tier dari template (js/05-builder.js) | 4 | PASS |
| Builder: paket yang dikunci + kunci tier (js/05-builder.js) | 8 | PASS |
| Builder: QRIS -A<n> (js/11-s2-seed.js) | 3 | PASS |
| Builder: validasi + rollback (js/05-builder.js) | 2 | PASS |
| Checkout: pemrosesan + kunci tier (js/12-s2-views.js) | 2 | PASS |
| Checkout: tier versi + rollback (js/05-builder.js) | 4 | PASS |
| Checkout: konteks `?inv=` (js/12-s2-views.js) | 6 (v21.2) | PASS |
| Grup 24 (v22): CTA order batal (24a, 6) + konteks `?inv=` (24b, 3) + alias/fallback tab (24c, 4) | 13 | PASS — regresi v23, hanya diuji ulang |
| RSVP: multi-tamu + tamu tambahan (js/10-s2-rsvp.js) | 10 | PASS |
| RSVP: keamanan + isolasi (js/10-s2-rsvp.js) | 2 | PASS |
| Akses lintas pemilik: grant + pemulihan peran (js/07-s2-access.js) | 4 | PASS |
| Isolasi suite v21.1 (timer + storage + peran + grant) | 4 | PASS |
| Isolasi suite v21.1 — pemulihan penuh sesudah suite (kedua suite) | 2 | PASS |
| v21.1 — Grup 23: tier fail-closed, Paid fail-closed, isolasi, reset aman, overflow | 10 | PASS |
| Performa (js/06-s2-core.js — beban render 600 tamu + 400 order) | 3 | PASS |
| H8–H14 — handler produksi asli (js/13-s2-handlers.js) | 7 | PASS |
| H15–H18 — handler + rollback + fail-closed (js/13-s2-handlers.js) | 4 | PASS |
| H19 — isolasi handler + storage (js/13-s2-handlers.js) | 1 | PASS |
| H20 — handler v22: CTA batal (a/b/d) + alias hash nyata (c) + order batal terminal | 5 | PASS — regresi v23, hanya diuji ulang |
| **Total** | **222 (172 + 50)** | **PASS semua** |

## Catatan isolasi (v23)

- Setiap kasus mendapat salinan storage baru (snapshot → pulihkan)
  sehingga mutasi satu kasus tidak bocor ke kasus lain.
- Suite tidak meninggalkan mutasi: `cleanup.ok: true` di setiap run
  v23 (baseline, npm test branch, npm test clone bersih, run final
  manual) — sessionStorage (added/removed/changed: []) + kunci
  window (added/removed: []) kembali identik dengan snapshot
  pra-suite; 16 storage keys sesudah suite.
- Tidak ada write ke preview publik / storage produksi.

## Ringkasan file bukti v23

- `after-v23-baseline/suite-result.json` — baseline V22 (172/172 + 50/50).
- `after-v23/suite-result.json` — run final v23, manual (172/172 + 50/50).
- `after-v23/suite-result-npmtest.json` — `npm test` di branch (172/172 + 50/50).
- `after-v23/suite-result-clean-clone.json` — `npm test` clone bersih sesudah `npm ci` (172/172 + 50/50).
- `after-v23/cases.json` — 222 kasus (`name` + `pass`).
- `after-v23/brand-measure-baseline.json` + `brand-measure-demo-baseline.json` — brand v22.
- `after-v23/brand-measure.json` + `brand-measure-demo.json` — brand v23.
- `after-v23/header-measure.json` + `header-measure-demo.json` — horizontal v23.
- `after-v23/demo-measure.json` — regresi demo v23.
- `after-v23/shots-brand-baseline/` + `shots-brand-demo-baseline/` + `shots-brand/` + `shots-brand-demo/` + `shots-header/` + `shots-header-demo/` + `shots-demo/` — screenshot.
- `browser-test/measure-brand.js` — skrip ukur brand (BARU di v23).
- `REPORT-v23.md` + `BASELINE-v23.md` — laporan + baseline ronde ini.
