# Kita Invite V21 — TESTS.md

Ronde perbaikan logika di atas refactor V20. Baseline: branch
`muse-refactor-v20`, commit `96638db59fc5d47b668c3cddd4b4ba2da929e32e`.
Tree ini (`v21/`) mempertahankan struktur modular V20 (18 file:
`index.html` + 4 CSS + 13 JS, classic `<script src>`, bukan ES modules).

## File yang berubah vs V20 (5 file; 13 file lain byte-identical)

| File | Perubahan | Alasan (satu baris) |
|---|---|---|
| `js/07-s2-access.js` | −13 / +64 baris | `kiOrderTierGate` fail-closed (`unresolved`); `kiOrderTierHold` baru; `kiRollbackCollections` baru; publish gate / resolver / bukti Paid fail-closed |
| `js/09-s2-fixtures.js` | −4 / +400 baris | Grup (21) di `kiFixtureTests` (28 kasus) + H8–H14 di `kiHandlerTests` (23 kasus) + label tombol fixture diperbarui |
| `js/10-s2-rsvp.js` | +1 baris | `gateBlockText` cabang `tierUnresolved` |
| `js/12-s2-views.js` | −5 / +24 baris | `orderCard` + `viewPay` tampilkan hold proaktif; kode percobaan Failed/Expired dicoret + catatan tidak aktif |
| `js/13-s2-handlers.js` | −28 / +45 baris | Tolak pembuatan percobaan baru untuk order mismatch; kode QRIS baru per percobaan (`-A<n>`); rollback jujur di 10 handler multi-koleksi |
| `TESTS.md` | baru | Dokumen ini |

Tidak ada perubahan pada: `index.html`, 4 CSS, `01-core.js`,
`02-catalog.js`, `03-state.js`, `04-views.js`, `05-builder.js`,
`06-s2-core.js`, `08-s2-reset.js`, `11-s2-seed.js`. Tidak ada perubahan
seed data, harga, durasi masa aktif, atau skema storage.

## Reproduksi — harness Node (jsdom, disposable, tanpa preview publik)

Perintah dijalankan dari `~/workspace/kita-invite-refactor/`:

```bash
# Syntax check semua file yang diubah
for f in 07-s2-access.js 09-s2-fixtures.js 10-s2-rsvp.js 12-s2-views.js 13-s2-handlers.js; do
  node --check v21/js/$f
done

# Uji kesetaraan + suite lengkap pada tree v21 (membandingkan dengan
# baseline v19 yang tersimpan di baseline-v19/)
node harness/run-v21.js after-v21/suite-result.json
```

Hasil run yang benar-benar dijalankan (10 Nov 2026, ~19:30 WIB):

- `kiFixtureTests`: **128/128 PASS** (baseline V20: 100/100; +28 kasus baru grup 21)
- `kiHandlerTests`: **34/34 PASS** (baseline V20: 11/11; +23 kasus baru H8–H14)
- HTTP lokal 19/19 → 200 (semua file tree)
- 5 rute render fresh hash IDENTICAL vs baseline V20 (`#/`, `#/dashboard`,
  `#/admin`, `#/u/nadia-dan-reza`, `#/template`); hash tersimpan
  `#/dashboard` berbeda hanya karena volatilitas stempel waktu aktivitas
  seed (sudah didokumentasikan di BASELINE-v19 §8 — bukan regresi)
- Storage keys tetap 16; storage ternormalisasi identik
- Boot errors: hanya 1 jsdomError Google Fonts (artefak harness — font
  eksternal diblokir interceptor; bukan error aplikasi)

File hasil run (di `~/workspace/kita-invite-refactor/`):

- `baseline-v21/suite-result.json` — baseline SEBELUM perubahan
  (kiFixtureTests 100/100, kiHandlerTests 11/11)
- `after-v21/suite-result.json` — hasil SESUDAH perubahan
  (kiFixtureTests 128/128, kiHandlerTests 34/34)
- `after-v21/cases.json` — daftar lengkap per kasus (nama, pass,
  expected, actual) dari kedua suite

## Reproduksi — tombol fixture in-page (browser, disposable)

Buka preview Pages branch `muse-fix-v21`, lalu:

1. Dashboard → Pengaturan (tab Pengaturan).
2. Klik **"Jalankan Uji Fixture Terisolasi (…)"** — menjalankan
   `kiFixtureTests` (128 kasus, termasuk grup 21).
3. Klik **"Jalankan Uji Handler Penuh (…)"** — menjalankan
   `kiHandlerTests` (34 kasus, termasuk H8–H14).
4. Hasil tampil di bawah tombol (`#fixture-results` / `#handler-results`).

PENTING — aturan audit yang berlaku (dari Lora): tombol fixture/grant
hanya ditekan pada clone/fixture lokal disposable, BUKAN pada preview
publik. Suite ini terisolasi penuh: sebelum berjalan, seluruh state sesi
(peran, desainer aktif, flag + generasi grant, referensi koleksi, daftar
ID undangan, dump storage) di-snapshot; sesudah berjalan semuanya
dipulihkan dan kasus isolasi terakhir MEMVERIFIKASI pemulihan itu
(storage byte-per-byte, tidak ada record fixture tertinggal).

## Cakupan kasus baru

- **Grup (21) `kiFixtureTests` (28 kasus):** hold proaktif (mismatch /
  cocok / riwayat Success / Failed), fail-closed tier tak terbukti,
  publish gate (mismatch / cocok / unresolved), resolver paket
  (fail-closed dengan undangan / aturan lama tanpa undangan), bukti Paid
  (unresolved / silang-undangan / invitationId kosong), konvensi kode
  QRIS baru, RSVP dua tamu bernama sama + rollback token, core rollback
  jujur (semua OK / satu koleksi gagal), state machine reload
  (In Progress / Completed / Assigned tanpa desainer / Review), penjaga
  badge Nusantara Tech + KI-2026-1008 (baca saja, seed asli).
- **H8–H14 `kiHandlerTests` (23 kasus, handler produksi asli + event DOM
  nyata):** hold tampil di `orderCard`/`viewPay` (+ kontrol cocok),
  faktur snapshot setelah bump template v2, checkout terkunci tier versi
  undangan, tolak pembuatan percobaan baru untuk order mismatch (+
  kontrol), kode QRIS baru per percobaan, RSVP dua tamu bernama sama +
  ubah nama + gagal per tahap simpan (guests/rsvps/activity/
  notifications) + gagal tulis identitas + gagal simpan & gagal rollback,
  rollback jujur hapus tamu & penugasan (simpan gagal / tulis-balik
  gagal), state machine assign/unassign, batal terminal untuk semua
  hasil pay-result.
