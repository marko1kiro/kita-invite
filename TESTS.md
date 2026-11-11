# Kita Invite V25 — TESTS.md

## Struktur tree (v25, dari v24)

Perintah kerja (di `~/workspace/kita-invite-refactor/`):

```bash
# Verifikasi dasar — tidak ada perubahan yang merusak struktur
node --check v25/js/*.js          # semua PASS
diff -rq v24 v25                  # HANYA file di bawah yang berbeda
```

| File | Perubahan di v25 |
|---|---|
| `js/13-s2-handlers.js` | **F1 + F2 (perubahan aplikasi)** — (F1) handler `pay-result`: cek idempoten dikecualikan untuk `res === 'Expired'` (retry Expired = percobaan baru, bukan duplikat) + gerbang baru `o.status !== 'Menunggu Pembayaran'` → tolak (Dibatalkan/Selesai/Diproses tidak boleh dibuka kembali); (F2) listener submit RSVP: blok strict-`?to=` baru sebelum `kiBridged` dan sebelum jalur identitas-web — `to` ada tapi kosong/tidak dikenal/bukan milik undangan ini → tolak (toast + kotak `.rsvp-reject` inline), tanpa mutasi. Lihat REPORT-v25.md §F1/§F2. |
| `js/12-s2-views.js` | **Gerbang kedua F1 di render** — CTA "Bayar Sekarang/Coba Bayar Lagi" kini mensyaratkan `o.status === 'Menunggu Pembayaran'` (dulu `!== 'Dibatalkan'`); halaman `#/bayar` order Selesai/Diproses tanpa Success menampilkan kartu "Pesanan `<status>`" tanpa tombol simulasi. |
| `js/09-s2-fixtures.js` | **Grup baru H21 (F1, 8 tes) + H22 (F2, 5 tes)**, gaya "Handler penuh", ID prefix `fx-`, cleanup `try/finally` seperti grup yang ada. |
| `harness/e2e/2b.js` | Check F2 lama ditulis ulang per kriteria v25 (strict-`?to=`) + seksi baru §12 (kosong/silang/walk-in, 3 check). Total modul 46 → **49 check**. |
| `harness/e2e/2c.js` | Check F1 lama ditulis ulang per kriteria v25 (retry diizinkan) + §F 1 check baru + seksi baru §F2 (retry 1005 + gate Selesai, 9 check) + hitung akhir diperbarui (payments 11 → 14). Total modul 57 → **67 check**. |
| `harness/e2e/regression.js` | **Assertion wordmark deterministik** — lebar persis 148,3 px DIHAPUS; syarat visual sebenarnya (satu baris, brand sepenuhnya di dalam `.topbar` ±0,5 px, tanpa overlap anak topbar lain, tanpa overflow horizontal) + gate font per route (Playfair Display 700 + Manrope 700 via pemindaian Face; FAIL menyebut nama font bila tidak tersedia). Total modul 90 → **92 check**. |
| `TESTS.md` | Dokumen ini. |
| File aplikasi lain | Byte-identical dengan v24 (4 CSS, 11 JS lainnya, `index.html`). |

SHA `index.html` TIDAK berubah dari v24.
Tidak ada node_modules / suite-result.json / e2e-result.json / PNG /
JSON di dalam tree. Tidak ada file yang di-rename
(`harness/run-v21.2.js` dipertahankan).

## Cara reproduksi (utama: `npm ci && npm test` + `npm run test:e2e`)

```bash
# Dari dalam folder harness/ (node ≥18):
cd harness/
npm ci           # instalasi deterministik dari package-lock.json
                 # (acorn 8.19.0 + jsdom 31.0.0 + playwright-core 1.65.0) — exit 0
npm test         # jsdom: "node run-v21.2.js ./suite-result.json" — exit 0
npm run test:e2e # Playwright: "node run-e2e.js ./e2e-result.json" — lihat catatan exit di bawah
```

Hasil yang diharapkan (jsdom, baris terakhir stdout):

```
TEST SUMMARY: kiFixtureTests: 172/172 PASS | kiHandlerTests: 63/63 PASS | cleanup: ok | HTTP: 19/19 | exit: 0
```

Hasil JSON lengkap ditulis ke `harness/suite-result.json` (artefak run
lokal, BUKAN bagian commit; sudah di-ignore sejak v23.1).

**E2E — exit code:** `npm run test:e2e` menjalankan SEMUA modul
berurutan dan exit 1 bila ada check yang FAIL. Pada v25 ada **2 FAIL
yang DIKENAL, keduanya gate font wordmark di modul `regression`**
(bukan cacat aplikasi — lihat §"Pengukuran header & demo" di bawah):

- `font wordmark #/` dan `font wordmark #/demo/luxury-ivory` FAIL
  karena Playfair Display 700 + Manrope 700 TIDAK termuat di runtime
  tes (Google Fonts CDN tidak terjangkau Chromium Playwright di VM
  ini; `document.fonts` berisi 0 face). Semua 22 check visual brand,
  22 overflow, 22 overlap, dan 24 demo PASS di atas font fallback.

Jadi `npm run test:e2e` pada v25 berakhir **exit 1 dengan ringkasan
360/362 PASS**. F1 dan F2 v24 SUDAH SELESAI di v25 (modul 2b 49/49
dan 2c 67/67, hijau penuh) — yang tersisa merah hanyalah 2 gate font
lingkungan, deterministik di semua run.

Chromium untuk E2E: runner memakai `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
(bila diset) → binary cache `~/.cache/ms-playwright/chromium-1254/
chrome-linux64/chrome` → default playwright-core. `playwright-core`
TIDAK mengunduh browser saat install; `npx playwright install`
tidak pernah dipakai (gagal 2x di VM ini).

Verifikasi dari clone bersih (dijalankan 11 Nov 2026): salin tree ke
`/tmp/clean-v25-final` (tanpa node_modules), lalu dari dalam
`harness/`: `npm ci` → exit 0, `npm test` → exit 0 (172/172 + 63/63),
`npm run test:e2e` → 360/362 (hanya 2 gate font), log di
`/tmp/clean-v25-final/harness/e2e-result.json`.

## Cara reproduksi (manual — jsdom)

```bash
# Jalankan manual dari layout branch (v25/harness), tanpa instalasi di tree:
NODE_PATH=/home/hatch/workspace/kita-invite-refactor/harness/node_modules node run-v21.2.js [out.json] [baseline-dir]
# Contoh: NODE_PATH=... node run-v21.2.js out.json
# (tanpa argumen: tidak menulis file — hasil hanya dicetak ke stdout)
```

Harness mengembalikan kode keluar 1 bila ada kasus gagal / ada
suite yang throw / cleanup gagal, dan 2 bila runner itu sendiri
throw. Jalankan manual itu hanya menguji in-page suite (172/172 +
63/63) + HTTP lokal; TIDAK menguji `npm test` itu sendiri
(buktikan dengan clone bersih di atas). `package-lock.json` WAJIB
ada di branch (`npm ci`).

Catatan: run manual dengan node_modules luar memakai `NODE_PATH`
karena di dalam branch tidak ada node_modules terinstal — JANGAN
instal di tree (node_modules tidak boleh masuk commit). Catatan v25:
`~/workspace/kita-invite-refactor/harness/node_modules` (bersama)
hanya berisi jsdom/acorn — `playwright-core` TIDAK ada di sana;
E2E per-modul memakai `NODE_PATH=/tmp/harness-pw/node_modules`
(salinan dengan playwright-core) atau `npm ci` di clone (menginstal
dari cache).

## Cara reproduksi (manual — E2E satu modul)

```bash
# Dari ~/workspace/kita-invite-refactor/ (NODE_PATH = salinan harness
# dengan playwright-core terinstal, di /tmp/harness-pw/node_modules):
NODE_PATH=/tmp/harness-pw/node_modules node v25/harness/run-e2e.js after-v25/<id>.json --only <id>
# <id>: regression | 2a | 2b | 2c | 2d | 2e | 2f
# Contoh: ... --only 2b   (49/49 PASS, exit 0)
# Hasil JSON + screenshot masuk after-v25/ (di LUAR tree).
```

Runner menyajikan tree lokal lewat HTTP 127.0.0.1 (port acak),
membuka Chromium nyata dengan konteks browser segar per modul,
dan mencetak `E2E SUMMARY`. Screenshot disimpan di
`harness/e2e-shots/` BILA runner dijalankan dari dalam tree
(di-ignore), atau di folder yang sama dengan out.json bila
`--root` dipakai dari luar — pada run v25, screenshot ada di
`after-v25/e2e-shots/<id>/`.

## Suite jsdom (v25 — 235 kasus)

Suite terdiri dari **235 kasus**: 172 `kiFixtureTests` (logika murni
in-page) + 63 `kiHandlerTests` (handler produksi asli + event DOM
nyata; 50 di v24 + 13 baru: H21 F1 8 tes + H22 F2 5 tes). Teks
fixture disintesis (tamu, layanan, pesanan) — TIDAK menyentuh
server produksi. HTTP lokal disajikan dari `index.html`
+ semua aset branch oleh server HTTP Node bawaan di port acak
(127.0.0.1). 19/19 URL lokal → 200.

### Hasil v25 (dijalankan pada tree v25)

| Run | kiFixtureTests | kiHandlerTests | Exit | Cleanup | HTTP |
|---|---|---|---|---|---|
| Baseline v24 (sebelum perubahan, `/tmp/clean-v24-final` run v24) | 172/172 | 50/50 | 0 | ok | 19/19 |
| `npm test` clone bersih v25 (`/tmp/clean-v25-final`) | **172/172** | **63/63** | 0 | ok | 19/19 |

Boot errors: hanya 1 jsdomError Google Fonts (artefak harness —
request non-localhost diblokir interceptor menjadi 404 sintetis).
Tidak ada kasus yang gagal.

## Hasil E2E v25 (Playwright Chromium nyata, tree lokal)

| Modul | Checks | Hasil | Catatan |
|---|---|---|---|
| `regression` | 92 | 90/92 | **2 FAIL = gate font wordmark** (Playfair + Manrope tidak termuat di runtime tes; lingkungan, deterministik). 22 brand + 22 overflow + 22 overlap + 24 demo PASS. |
| `2a` Dashboard | 38 | **38/38 PASS** | Tidak berubah dari v24. |
| `2b` Tamu & RSVP | 49 | **49/49 PASS** | F2 selesai: strict-`?to=` (tak dikenal/kosong/silang ditolak tanpa mutasi) + walk-in tanpa `?to`. |
| `2c` Order & pembayaran | 67 | **67/67 PASS** | F1 selesai: retry Expired 1005 diizinkan (attempt baru + kode baru, lama utuh) + gate terminal. |
| `2d` Admin CMS | 48 | **48/48 PASS** | Tidak berubah dari v24. |
| `2e` Layanan desain | 37 | **37/37 PASS** | Tidak berubah dari v24 (canary alur pembayaran tetap hijau). |
| `2f` Data demo & reset | 31 | **31/31 PASS** | Tidak berubah dari v24. |
| **Total** | **362** | **360/362** | 2 FAIL = gate font `regression` (lingkungan). |

Arsip hasil: `after-v25/2a.json`, `2b.json`, `2b-r2.json`,
`2c.json`, `2c-r2.json`, `2d.json`, `2e.json`, `2f.json`,
`regression-run1.json`, `regression-run2.json`,
`regression-base.json`, `e2e-result.json` (run penuh clone bersih),
`after-v25/e2e-shots/<id>/` (screenshot).

## Pengukuran header & demo — regresi v25 (modul `regression`)

Modul `regression.js` v25 menghapus assertion lebar persis 148,3 px
(v23) — angka itu terbukti lebar fallback Liberation Serif di
runtime tes (Google Fonts tidak termuat), BUKAN lebar Playfair
Display. Syarat visual sekarang, 22 check brand (11 lebar × 2
route): (i) wordmark satu baris, (ii) brand sepenuhnya di dalam
`.topbar` (toleransi 0,5 px), (iii) tanpa overlap dengan anak
topbar lain (uji irisan rect), (iv) tanpa overflow horizontal
(`scrollWidth <= innerWidth`). Font wordmark dicek eksplisit per
route via pemindaian Face (`family + weight 700 + status loaded`);
`document.fonts.check()` TIDAK dipakai — terbukti mengembalikan
`true` bahkan untuk nama font khayalan, dan `document.fonts.status`
`'loaded'` meski `document.fonts` kosong.

Hasil: baseline file lama 90/90 PASS (membuktikan assertion lama
lolos diam-diam di atas font fallback); file baru 90/92 di DUA run
clone bersih yang check-nya identik (hanya metadata run yang
berbeda) — 22 brand + 22 overflow + 22 overlap + 24 demo PASS,
2 FAIL hanya gate font. Bila font suatu hari termuat, lebar/posisi
brand akan berubah (Playfair ≠ Liberation Serif); assertion baru
dirancang tahan terhadap itu, tetapi belum ada run yang
membuktikannya dengan Playfair asli. Opsi perbaikan di luar v25:
runner mengonfigurasi proxy Chromium, atau font di-self-host.

## Catatan isolasi (v25)

- Setiap kasus jsdom mendapat salinan storage baru (snapshot →
  pulihkan) sehingga mutasi satu kasus tidak bocor ke kasus lain.
- Suite tidak meninggalkan mutasi: `cleanup.ok: true` di setiap run
  v25 — sessionStorage (added/removed/changed: []) + kunci window
  (added/removed: []) kembali identik dengan snapshot pra-suite.
- Setiap modul E2E memakai konteks browser segar (profil baru)
  dengan seed lokal sendiri; mutasi satu modul tidak bocor ke
  modul lain. Semua write-test HANYA di clone lokal disposable
  dengan data sintetis — TIDAK ADA write ke Pages publik.

## Ringkasan file bukti v25

- `after-v25/2a.json` … `after-v25/2f.json` (+ `2b-r2.json`,
  `2c-r2.json` — ulangan modul F1/F2) — hasil E2E per modul.
- `after-v25/regression-run1.json`, `regression-run2.json` —
  dua run modul regresi (check identik).
- `after-v25/regression-base.json` — run file lama (90/90).
- `after-v25/e2e-result.json` — run penuh dari clone bersih.
- `after-v25/e2e-shots/<id>/` — screenshot.
- `REPORT-v25.md` + `BASELINE-v25.md` — laporan + baseline ronde ini.
