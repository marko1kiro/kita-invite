# Kita Invite V21.1 — TESTS.md

Ronde perbaikan atas temuan audit V21. Baseline: branch
`muse-fix-v21`, commit `a6d0ea5bf0a3b9bf35bf72e1c57943a90f151f45`.
Tree ini (`v21.1/`) mempertahankan struktur modular V20/V21 (18 file:
`index.html` + 4 CSS + 13 JS, classic `<script src>`, bukan ES modules)
+ direktori `harness/` (harness yang dapat dijalankan, disertakan di
branch — lihat § Reproduksi).

## File yang berubah vs V21 (6 file + harness + TESTS.md; 12 file lain byte-identical)

| File | Perubahan | Alasan (satu baris) |
|---|---|---|
| `js/07-s2-access.js` | −14 / +45 baris | `kiInvTemplateProven` (fail-closed, tanpa fallback template terkini); `kiResolvePackageId` fail-closed juga tanpa record undangan; `kiServicePaidProof` menolak bukti Paid bila record undangan hilang |
| `js/08-s2-reset.js` | −4 / +25 baris | `kiResetCore` mempertahankan + memverifikasi pemulihan backup lama bila commit cadangan gagal (tulis / baca-balik / restore); flag `restored` jujur; kunci tmp dibersihkan di semua jalur gagal |
| `js/09-s2-fixtures.js` | −18 / +273 baris | Grup (22) baru (12 kasus) + 5 kasus reset commit + mode stub `commit-torn`/`commit-write`/`commit-restore-fail`/`backup-read` + isolasi hardened (hapus property global yang tadinya tidak ada, pulihkan timer/role/grant/storage/state) + H15–H17 (6 kasus) |
| `js/12-s2-views.js` | −7 / +13 baris | `viewCheckout` fail-closed bila tier tak terbukti (peringatan + semua paket off + tombol konfirmasi disabled); `orderCard` pill hold memakai class `wrap` |
| `js/13-s2-handlers.js` | −3 / +4 baris | Toast reset membedakan backup lama dipertahankan vs pemulihan TIDAK terverifikasi; teks modal reset menyebut verifikasi restore |
| `css/stage2.css` | −1 / +11 baris | `.pill.wrap` baru (`white-space:normal`, `overflow-wrap:anywhere`); `.lrow.grow` `min-width:0` + `overflow-wrap:anywhere` (tanpa `overflow:hidden` — tidak ada info yang dipotong) |
| `harness/run-v21.1.js` | baru (221 baris) | Harness Node (jsdom) yang disertakan di branch — salinan `harness/run-v21.js` di luar branch dengan ROOT = tree ini; perbandingan baseline opsional (argumen ke-2) |
| `harness/package.json` | baru (16 baris) | Dependensi harness: `acorn` + `jsdom` (install via `npm install`; `node_modules` TIDAK disertakan) |
| `TESTS.md` | ditulis ulang | Dokumen ini |

Tidak ada perubahan pada: `index.html`, 3 CSS lain (`design-system.css`,
`renderer.css`, `builder.css`), `01-core.js`, `02-catalog.js`,
`03-state.js`, `04-views.js`, `05-builder.js`, `06-s2-core.js`,
`10-s2-rsvp.js`, `11-s2-seed.js`. Tidak ada perubahan seed data,
harga, durasi masa aktif, skema storage, KI-2026-1008 (hold v21
dipertahankan apa adanya), atau tanggal Nusantara Tech / Nadia–Reza /
Salsa.

## Reproduksi — harness di branch (cara yang diutamakan)

Harness disertakan di branch (`v21.1/harness/`) supaya audit dapat
mereproduksi tanpa file luar. Dari direktori tree ini:

```bash
cd v21.1/harness
npm install            # acorn + jsdom; node_modules TIDAK ikut di-push
node run-v21.1.js ../../after-v21.1/suite-result-inbranch.json
# Dengan perbandingan baseline (opsional): beri direktori baseline
# yang berisi suite-result.json + index.html + state-*.json, mis.:
node run-v21.1.js ../../after-v21.1/suite-result-inbranch-v19base.json ../../baseline-v19
```

Perintah ini MENJALANKAN suite in-page yang sebenarnya (`kiFixtureTests`
+ `kiHandlerTests`) di jsdom atas tree yang disajikan lewat HTTP lokal,
bukan sekadar memeriksa sintaks. Hasil run yang benar-benar dijalankan
dari layout branch (10 Nov 2026, 20:52 WIB):

- `kiFixtureTests`: **146/146 PASS**
- `kiHandlerTests`: **40/40 PASS**
- HTTP lokal 19/19 → 200 (semua file tree)
- 5 rute render (`#/`, `#/dashboard`, `#/admin`, `#/u/nadia-dan-reza`,
  `#/template`); storage keys 16
- Tanpa argumen baseline: `compare` berisi catatan "Baseline tidak
  diberikan/ditemukan — perbandingan dilewati."
- Dengan baseline `baseline-v19/`: suite 100/100 (v19) vs 146/146 (v21.1)
  dan handler 11/11 vs 40/40 — `identical:false` karena suite BERTAMBAH
  46 kasus (diharapkan, bukan regresi); **kelima rute
  appHtmlShaFresh IDENTICAL, counts/invitations/orders/storage-keys/
  storage-ternormalisasi IDENTICAL** vs monolit v19. Boot errors: hanya
  1 jsdomError Google Fonts (artefak harness — font eksternal diblokir
  interceptor; bukan error aplikasi).

Setelah menjalankan, HAPUS `v21.1/harness/node_modules` (dan
`package-lock.json` bila terbentuk) supaya tree yang di-push tetap
bersih — hanya `run-v21.1.js` + `package.json` yang masuk commit.

## Reproduksi — harness luar (cara lama, tetap berlaku)

Perintah dijalankan dari `~/workspace/kita-invite-refactor/`:

```bash
# Syntax check semua file yang diubah
for f in 07-s2-access.js 08-s2-reset.js 09-s2-fixtures.js 12-s2-views.js 13-s2-handlers.js; do
  node --check v21.1/js/$f
done
node --check v21.1/harness/run-v21.1.js

# Suite lengkap pada tree v21.1 (tanpa baseline — perbandingan dilewati)
node harness/run-v21.1.js after-v21.1/suite-result.json
```

Hasil run yang benar-benar dijalankan (10 Nov 2026, 20:51 WIB — run
ketiga/final; run 1–2 sebelumnya gagal dengan diagnosis di bawah):

- `kiFixtureTests`: **146/146 PASS** (baseline V21: 128/128; +18 kasus)
- `kiHandlerTests`: **40/40 PASS** (baseline V21: 34/34; +6 kasus)
- HTTP lokal 19/19 → 200; storage keys 16
- Boot errors: hanya 1 jsdomError Google Fonts (artefak harness)

Catatan run: run pertama 141/145 + 38/40 (6 gagal — semuanya kesalahan
ekspektasi tes, bukan bug aplikasi: 4 kasus fixture lama memakai
invitasi tanpa `templateVersion` / invitationId sintetis yang tidak ada
di `S.invitations` setelah fail-closed diberlakukan, dan 2 kasus H17
membandingkan storage dengan snapshot yang sudah basi); run kedua
145/145 + 39/40 (satu kasus H17-B gagal karena tes mengasumsikan ada
backup lama padahal halaman fresh tidak punya — setelah tes diperbaiki
dengan preset backup lama, run ketiga 146/146 + 40/40). Detail run
1–3 ada di REPORT-v21.1.md §6.

File hasil run (di `~/workspace/kita-invite-refactor/`):

- `after-v21.1-baseline/suite-result.json` + `cases.json` — baseline V21
  SEBELUM perubahan (kiFixtureTests 128/128, kiHandlerTests 34/34;
  162 kasus, 0 gagal)
- `after-v21.1/suite-result.json` + `cases.json` — hasil SESUDAH
  perubahan (kiFixtureTests 146/146, kiHandlerTests 40/40; 186 kasus,
  0 gagal; per kasus: nama, pass, expected, actual)
- `after-v21.1/suite-result-inbranch.json` — run harness DARI layout
  branch, tanpa baseline (146/146 + 40/40)
- `after-v21.1/suite-result-inbranch-v19base.json` — run harness DARI
  layout branch dengan baseline v19 (perbandingan rute identik, lihat
  di atas)
- `after-v21.1/overflow-v21.json`, `overflow-v21.1.json`,
  `overflow-v20.json` — pengukuran overflow Playwright (lihat § Overflow)

## Reproduksi — tombol fixture in-page (browser, disposable)

Buka preview Pages branch `muse-fix-v21.1`, lalu:

1. Dashboard → Pengaturan (tab Pengaturan).
2. Klik **"Jalankan Uji Fixture Terisolasi (…)"** — menjalankan
   `kiFixtureTests` (146 kasus, termasuk grup 22).
3. Klik **"Jalankan Uji Handler Penuh (…)"** — menjalankan
   `kiHandlerTests` (40 kasus, termasuk H15–H17).
4. Hasil tampil di bawah tombol (`#fixture-results` / `#handler-results`).

PENTING — aturan audit yang berlaku (dari Lora): tombol fixture/grant
hanya ditekan pada clone/fixture lokal disposable, BUKAN pada preview
publik. Suite ini terisolasi penuh: sebelum berjalan, seluruh state sesi
(peran, desainer aktif, flag + generasi grant, referensi koleksi, daftar
ID undangan, dump storage, kunci window, sessionStorage, timer autosave)
di-snapshot; sesudah berjalan semuanya dipulihkan — termasuk MENGHAPUS
property global yang sebelumnya tidak ada (bukan mengubahnya menjadi
`false`/`0`) — dan kasus isolasi terakhir MEMVERIFIKASI pemulihan itu
(storage byte-per-byte, set kunci window identik, sessionStorage
identik, timer identik, tidak ada record fixture tertinggal).

## Overflow — pengukuran Playwright (browser nyata, bukan jsdom)

Skrip `~/workspace/kita-invite-refactor/browser-test/measure-overflow.js`
(Chromium Playwright, binary Chrome for Testing 158.0.8127.18 yang
diunduh via curl ke `~/.cache/ms-playwright/chromium-1254/` —
`npx playwright install chromium` gagal dua kali karena CDN menutup
koneksi; `executablePath` eksplisit dipakai karena Playwright default
memakai headless-shell yang belum terunduh). Route
`#/dashboard?tab=pesanan`, data seed lengkap, viewport 360/375/390/430.

| Lebar | V21 (baseline) | V21.1 | V20 |
|---|---|---|---|
| 360 px | OVERFLOW +111 px (docScrollWidth 471) | OK (360) | OK (360) |
| 375 px | OVERFLOW +96 px (471) | OK (375) | OK (375) |
| 390 px | OVERFLOW +81 px (471) | OK (390) | OK (390) |
| 430 px | OVERFLOW +41 px (471) | OK (430) | OK (430) |

Penyebab (V21): satu-satunya elemen pendorong adalah
`span.pill.exp` "Perlu pesanan baru — paket tidak sesuai tier template"
(`white-space:nowrap`, ujung kanan 453,7 px pada viewport 360) di dalam
`.lrow.grow` (`min-width:180px`) — `.lrow` berakhir 470,7 px =
docScrollWidth 471 px. Semua baris pesanan ikut melebar karena
`.list-rows` mengikuti lebar konten terlebar. **Regresi V21** (V20 tidak
overflow — pill hold baru ada di V21). Kontrol: `#/dashboard`
(ringkasan) dan `#/admin` bersih 0 px di ketiga tree pada keempat lebar.
Pill di strip tab `.s2-tabs` (`.chip`) memang melampaui viewport tapi
berada di dalam container `overflow-x:auto` yang disengaja — diklasifikasi
benign dan tidak dihitung sebagai overflow halaman.

## Cakupan kasus baru

- **Grup (22) `kiFixtureTests` (12 kasus):** 22a tier fail-closed
  (tanpa `templateVersion` → null; versi 99 → null; templateId tak
  dikenal → null; kontrol positif luxury-ivory v1 → Premium; gate
  unresolved; hold held+unresolved), 22b checkout fail-closed lewat
  render `viewCheckout` asli (peringatan + semua paket off + tombol
  konfirmasi disabled), 22c bukti Paid orphan (null bila record undangan
  hilang; kontrol positif bila record ada), 22d isolasi (probe
  `__kiProbe211` + timer autosave nyata harus HILANG setelah suite),
  22e penanda overflow in-page (`pill exp wrap` pada baris KI-2026-1008).
- **Kasus reset `kiFixtureTests` (5 kasus):** commit cadangan robek
  (baca-balik tidak cocok) → backup lama dipulihkan terverifikasi;
  commit lempar saat tulis → backup lama tidak pernah tertimpa; commit
  robek + pemulihan gagal → `restored=false` jujur; backup lama tidak
  bisa dibaca → stage `backup-read`; commit robek tanpa backup lama →
  nilai robek dibersihkan, kunci kembali tidak ada (`restored=true` —
  tidak ada yang hilang).
- **Kasus yang diubah namanya (4):** resolver tanpa record undangan kini
  2 kasus fail-closed (aturan lama dihapus — lihat keputusan di
  REPORT-v21.1.md §2); kasus seed "dua paket → null" diganti
  filter-tier (dua bukti harus sama dengan tier, jadi ambiguitas
  mustahil bila tier terbukti); kedua kasus isolasi ditulis ulang
  (memeriksa keberadaan property, set kunci window, sessionStorage,
  timer).
- **H15–H17 `kiHandlerTests` (6 kasus, handler produksi asli + event DOM
  nyata):** H15 checkout fail-closed (klik paket ditolak + klik
  konfirmasi ditolak, 0 pesanan tercipta), H16 Paid orphan lewat handler
  assign asli (ditolak bila record hilang; lolos bila record ada),
  H17 reset backup aman lewat handler reset-demo + modal + fault
  injection `Storage.prototype.setItem` (commit lempar → toast "backup
  lama dipertahankan"; commit robek + restore gagal → toast "TIDAK
  terverifikasi").
