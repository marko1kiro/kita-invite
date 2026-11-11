# Kita Invite V24 — TESTS.md

## Struktur tree (v24, dari v23.2)

Perintah kerja (di `~/workspace/kita-invite-refactor/`):

```bash
# Verifikasi dasar — tidak ada perubahan yang merusak struktur
node --check v24/js/*.js          # semua PASS
diff -rq v23.2 v24                # HANYA file di bawah yang berbeda
```

| File | Perubahan di v24 |
|---|---|
| `js/13-s2-handlers.js` | **F3 (satu-satunya perubahan aplikasi)** — pesan penolakan penugasan desainer dibedakan menurut pemblokir sebenarnya (handler `data-s2-assign`): tier-mismatch / tier tak terbukti / record pembayaran tak tertaut / record undangan hilang, masing-masing dengan pesan sendiri; pesan lama ("pembayaran ... belum Success") hanya dipakai bila paymentStatus memang bukan Success. Tidak ada perubahan perilaku gerbang (penolakan/penerimaan sama). Lihat REPORT-v24.md §2E. |
| `harness/run-e2e.js` | BARU — runner E2E Playwright (Chromium nyata) terhadap tree lokal via HTTP 127.0.0.1, profil browser segar per modul. Guard: root harus berisi `index.html` + `js/13-s2-handlers.js` (tidak pernah Pages publik). CLI: `node run-e2e.js [out.json] [--only <id>] [--root <tree-dir>]`. |
| `harness/e2e/*.js` | BARU — 7 modul: `regression.js` (header 11 lebar × 2 route + demo 8 lebar), `2a.js` (Dashboard), `2b.js` (Tamu & RSVP), `2c.js` (Order & pembayaran), `2d.js` (Admin CMS), `2e.js` (Layanan desain, + regresi F3), `2f.js` (Data demo & reset). |
| `harness/package.json` | Script baru `"test:e2e": "node run-e2e.js ./e2e-result.json"` + dependensi baru `playwright-core 1.65.0` (exact). `npm test` TIDAK berubah. |
| `harness/package-lock.json` | Entri `playwright-core` (lockfile +14/−1 baris, hanya entri itu). |
| `.gitignore` | +2 entri: `harness/e2e-result.json`, `harness/e2e-shots/` (artefak run E2E lokal). |
| `TESTS.md` | Dokumen ini. |
| File aplikasi lain | Byte-identical dengan v23.2 (4 CSS, 12 JS lainnya, `index.html`). |

SHA `index.html` TIDAK berubah dari v23.2.
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
TEST SUMMARY: kiFixtureTests: 172/172 PASS | kiHandlerTests: 50/50 PASS | cleanup: ok | HTTP: 19/19 | exit: 0
```

Hasil JSON lengkap ditulis ke `harness/suite-result.json` (artefak run
lokal, BUKAN bagian commit; sudah di-ignore sejak v23.1).

**E2E — exit code:** `npm run test:e2e` menjalankan SEMUA modul
berurutan dan exit 1 bila ada check yang FAIL. Pada v24 ada **2 FAIL
yang DIKENAL dan disengaja dibiarkan** (bukan regresi — keduanya
perilaku yang dirancang, dipertanyakan ke Lora sebagai keputusan
desain; lihat REPORT-v24.md §2B/§2C):

- **F1** (modul 2c): order Expired KI-2026-1005 bisa dibayar ulang
  (percobaan baru + kode baru; record lama tetap final).
- **F2** (modul 2b): RSVP dengan kode tamu salah (`?to=T9999`) tidak
  ditolak — tamu walk-in baru dibuat (desain RSVP publik terbuka).

Jadi `npm run test:e2e` pada v24 berakhir **exit 1 dengan ringkasan
345/347 PASS** (lihat tabel hasil di bawah). Itu status yang
diharapkan sampai Lora memutuskan F1/F2. Modul lain semuanya hijau.

Chromium untuk E2E: runner memakai `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
(bila diset) → binary cache `~/.cache/ms-playwright/chromium-1254/
chrome-linux64/chrome` → default playwright-core. `playwright-core`
TIDAK mengunduh browser saat install; `npx playwright install`
tidak pernah dipakai (gagal 2x di VM ini).

Verifikasi dari clone bersih (dijalankan 11 Nov 2026): salin tree ke
`/tmp/clean-v24-final` (tanpa node_modules), lalu dari dalam
`harness/`: `npm ci` → exit 0, `npm test` → exit 0 (172/172 + 50/50),
`npm run test:e2e` → 345/347 (F1 + F2 saja yang FAIL), log di
`/tmp/clean-v24-final-e2e.log`.

## Cara reproduksi (manual — jsdom)

```bash
# Jalankan manual dari layout branch (v24/harness), tanpa instalasi di tree:
NODE_PATH=/home/hatch/workspace/kita-invite-refactor/harness/node_modules node run-v21.2.js [out.json] [baseline-dir]
# Contoh: NODE_PATH=... node run-v21.2.js out.json
# (tanpa argumen: tidak menulis file — hasil hanya dicetak ke stdout)
```

Harness mengembalikan kode keluar 1 bila ada kasus gagal / ada
suite yang throw / cleanup gagal, dan 2 bila runner itu sendiri
throw. Jalankan manual itu hanya menguji in-page suite (172/172 +
50/50) + HTTP lokal; TIDAK menguji `npm test` itu sendiri
(buktikan dengan clone bersih di atas). `package-lock.json` WAJIB
ada di branch (`npm ci`).

Catatan: run manual dengan node_modules luar memakai `NODE_PATH`
karena di dalam branch tidak ada node_modules terinstal — JANGAN
instal di tree (node_modules tidak boleh masuk commit).

## Cara reproduksi (manual — E2E satu modul)

```bash
# Dari ~/workspace/kita-invite-refactor/ (NODE_PATH = salinan harness
# dengan playwright-core terinstal, di /tmp/harness-pw/node_modules):
NODE_PATH=/tmp/harness-pw/node_modules node v24/harness/run-e2e.js after-v24/<id>.json --only <id>
# <id>: regression | 2a | 2b | 2c | 2d | 2e | 2f
# Contoh: ... --only 2e   (37/37 PASS, exit 0)
# Hasil JSON + screenshot masuk after-v24/ (di LUAR tree).
```

Runner menyajikan tree lokal lewat HTTP 127.0.0.1 (port acak),
membuka Chromium nyata dengan konteks browser segar per modul,
dan mencetak `E2E SUMMARY`. Screenshot disimpan di
`harness/e2e-shots/` BILA runner dijalankan dari dalam tree
(di-ignore), atau di folder yang sama dengan out.json bila
`--root` dipakai dari luar — pada run v24, screenshot ada di
`after-v24/e2e-shots/<id>/`.

## Suite jsdom (tidak berubah di v24 — 222 kasus)

Suite terdiri dari **222 kasus**: 172 `kiFixtureTests` (logika murni
in-page) + 50 `kiHandlerTests` (handler produksi asli + event DOM
nyata). Teks fixture disintesis (tamu, layanan, pesanan) — TIDAK
menyentuh server produksi. HTTP lokal disajikan dari `index.html`
+ semua aset branch oleh server HTTP Node bawaan di port acak
(127.0.0.1). 19/19 URL lokal → 200.

### Hasil v24 (dijalankan pada tree v24 sesudah fix F3)

| Run | kiFixtureTests | kiHandlerTests | Exit | Cleanup | HTTP |
|---|---|---|---|---|---|
| Baseline v23.2 (sebelum perubahan, `/tmp/clean-v24-base`) | 172/172 | 50/50 | 0 | ok | 19/19 |
| `npm test` clone bersih sesudah fix (`/tmp/clean-v24-final`) | **172/172** | **50/50** | 0 | ok | 19/19 |

Boot errors: hanya 1 jsdomError Google Fonts (artefak harness —
request non-localhost diblokir interceptor menjadi 404 sintetis).
Tidak ada kasus yang gagal. Suite TIDAK berubah di v24 — fix F3
adalah pesan toast di handler; satu-satunya fixture yang menyentuh
pesan itu (js/09:1391, Paid ORPHAN) hanya meng-assert prefix
"belum dapat ditugaskan" yang dipertahankan semua cabang baru,
jadi tetap lulus tanpa perubahan.

## Hasil E2E v24 (Playwright Chromium nyata, tree lokal)

| Modul | Checks | Hasil | Catatan |
|---|---|---|---|
| `regression` | 90 | **90/90 PASS** | Header brand 11 lebar (768–1024) × 2 route + demo Luxury Ivory 8 lebar; 0 px overflow; tanpa clipping. |
| `2a` Dashboard | 38 | **38/38 PASS** | Ringkasan, filter, cari, duplikat, arsip, hapus + cascade, persist reload. |
| `2b` Tamu & RSVP | 46 | 45/46 | **F2**: RSVP kode salah (`?to=T9999`) tidak ditolak → tamu walk-in baru. Pertanyaan desain untuk Lora. |
| `2c` Order & pembayaran | 57 | 56/57 | **F1**: order Expired KI-2026-1005 bisa dibayar ulang (percobaan baru). Pertanyaan desain untuk Lora. |
| `2d` Admin CMS | 48 | **48/48 PASS** | 14 tab + alias/fallback, izin peran & kepemilikan, grant per sesi, template CMS + versioning. |
| `2e` Layanan desain | 37 | **37/37 PASS** | Alur status penuh, penugasan, catatan internal, satu record tiga peran, **+ 2 check regresi F3**. |
| `2f` Data demo & reset | 31 | **31/31 PASS** | Seed counts/relasi, konfirmasi reset, draft buatan sendiri ikut terhapus, seed kembali tanpa orphan. |
| **Total** | **347** | **345/347** | 2 FAIL = F1 + F2 (desain, menunggu Lora). |

Arsip hasil: `after-v24/2a.json`, `2b.json`, `2c.json`, `2d.json`,
`2e.json`, `2f.json`, `after-v24/e2e-shots/<id>/` (screenshot),
`after-v24/CONSOLIDATION.md` (catatan konsolidasi per modul),
`/tmp/clean-v24-final-e2e.log` (run penuh dari clone bersih).

## Pengukuran header & demo — regresi v24 (modul `regression`)

Modul `regression.js` adalah port pengukuran v23
(`browser-test/measure-brand.js` + `measure-demo.js`) ke runner
E2E: brand top 6,7 / bottom 57,3 / tinggi 50,6 / lebar 148,3 di
semua 11 lebar (768–1024) pada route `#/` dan
`#/demo/luxury-ivory`; horizontal overflow 0 px; demo 1 kolom di
320–820 px dan 2 kolom di 1024 px, 0 px overflow. **90/90 PASS**
pada v24 — header/demo TIDAK berubah dari v23. Detail tabel
pengukuran v23 (baseline v22 vs sesudah perbaikan) tetap ada di
`REPORT-v23.md` §2 dan TESTS.md versi v23 (di tree v23.2).

## Catatan isolasi (v24)

- Setiap kasus jsdom mendapat salinan storage baru (snapshot →
  pulihkan) sehingga mutasi satu kasus tidak bocor ke kasus lain.
- Suite tidak meninggalkan mutasi: `cleanup.ok: true` di setiap run
  v24 — sessionStorage (added/removed/changed: []) + kunci window
  (added/removed: []) kembali identik dengan snapshot pra-suite.
- Setiap modul E2E memakai konteks browser segar (profil baru)
  dengan seed lokal sendiri; mutasi satu modul tidak bocor ke
  modul lain. Semua write-test HANYA di clone lokal disposable
  dengan data sintetis — TIDAK ADA write ke Pages publik.

## Ringkasan file bukti v24

- `after-v24/2a.json` … `after-v24/2f.json` — hasil E2E per modul.
- `after-v24/e2e-shots/2a/` … `after-v24/e2e-shots/2f/` — screenshot.
- `after-v24/CONSOLIDATION.md` — konsolidasi per modul + F3.
- `/tmp/probe-tier.json` + `/tmp/probe-tier.png` — bukti browser
  F3 sebelum & sesudah fix.
- `/tmp/clean-v24-final-e2e.log` — run E2E penuh dari clone bersih.
- `REPORT-v24.md` + `BASELINE-v24.md` — laporan + baseline ronde ini.
