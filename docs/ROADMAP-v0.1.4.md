# Kita Invite Production Implementation Roadmap v0.1.4

## 1. Judul dan metadata

Judul: Kita Invite Production Implementation Roadmap v0.1.4

Versi: v0.1.4

Tanggal: 13 November 2026 (revisi dokumentasi-only dari Roadmap v0.1.3)

Status: Architecture Gate **PASS berdasarkan keputusan eksplisit owner pada 13 November 2026 pukul 03:19 WIB**; Fase 0 **SELESAI — PASS berdasarkan keputusan eksplisit owner pada 13 November 2026 pukul 04:50 WIB**; Fase 1 **NOT APPROVED** dan memerlukan persetujuan owner terpisah. Phase 0 PASS hanya menutup planning; bukan izin coding/implementasi, provisioning, konfigurasi production, atau deployment.

Sumber versi: branch `docs/roadmap-v0.1.4`, dibuat langsung dari parent Roadmap v0.1.3 `2dcee58efd4e46ddf231883e587b64e4cc7e0096`.

Baseline produk: Stage 2 V25, commit `68bf66ceb62e2182a6559fe7a238d354568e7cbf` (provenance tes tetap seperti riwayat dan catatan sebelumnya).

Acuan keputusan terkini: Decision Pack v0.1.13, branch `docs/phase0-planning-v0.1.13`, commit `83effede4b49022428d4f090d10e926298aa959b`, parent Decision Pack v0.1.12 `0012c826149d0e0f650e9d1ebc2dc57a9d0e8a0c` — https://github.com/marko1kiro/kita-invite/blob/docs/phase0-planning-v0.1.13/docs/PHASE-0-DECISION-PACK.md.

Acuan POC komparatif terkini: bukti lokal `/workspace/kita-invite-architecture-comparison-20261112/reviewer-packet.md`, `evidence/comparison-results.json`, dan `tools/run_local_comparison.py`; reviewer formal Lora. POC tindak lanjut no-JS berada di salinan disposable lokal `/workspace/kita-invite-nojs-poc-20261113/`, bukan di branch repository produk.

Dokumen ini mencatat hasil Fase 0 **SELESAI — PASS** berdasarkan keputusan eksplisit owner pada 13 November 2026 pukul 04:50 WIB, beserta perencanaan, bukti lokal, dan batas otorisasi. Tidak ada keputusan, status, tenggat, atau blocker D1–D10 yang diubah; M1–M8, K6, dan stack final tetap seperti sebelumnya. Tidak ada product code, source POC repository, konfigurasi/resource Cloudflare, Worker, production, atau deployment yang diubah oleh branch dokumentasi ini. Tidak ada URL eksternal yang dikirim ke kontak atau kanal eksternal.

## 2. Ringkasan status dan keputusan

### Status saat ini

| Area | Status yang tercatat | Batas makna |
|---|---|---|
| Otorisasi | Owner menyetujui Fase 0 sebatas perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman. | Persetujuan planning-only tidak dengan sendirinya mencakup Gate PASS; Architecture Gate PASS telah disetujui owner secara terpisah pada 13 Nov 2026, 03:19 WIB. Ini tetap bukan izin product coding/scaffolding, provisioning atau perubahan production, deployment, atau Fase 1. |
| Scope MVP | **M1–M8 diterima owner**; P1–P8 tetap kandidat rekomendasi, bukan roadmap pasca-MVP yang disetujui. | Jangan menyempitkan ke Revenue MVP/M1–M4. |
| Stack | **Hono + React + TypeScript + Vite diputuskan owner sebagai stack final** (12 Nov 2026, 21:48 WIB). | Keputusan arsitektur bukan kelulusan Gate, implementasi, atau pilihan D1/R2/provider. |
| Kriteria POC | Owner menyetujui bukti lokal **K1–K5**, 87/87 pemeriksaan per varian, sebagai masukan perencanaan (12 Nov 2026, 21:30 WIB). | K6 dikecualikan; hasil tersebut bukan Gate/Fase 0 PASS dan tidak mencakup requirement no-JS baru. |
| Reviewer | **Lora** adalah reviewer formal; review independen atas POC no-JS/Roadmap memberi verdict **APPROVED WITH MINOR NOTES** (13 Nov 2026). | Minor note tentang browser hero name/date/venue yang belum fail-closed sudah diperbaiki oleh Harley, diuji ulang, dan dikonfirmasi tertutup oleh Lora. Verdict bukan Gate PASS. |
| K6 | **OPEN / UNVERIFIED**; owner memilih tetap terbuka sampai metode uji aman tersedia; pilihan itu telah dipenuhi sebagai keputusan Fase 0. | K6 tidak diuji; tidak ada kartu aktual atau URL yang dikirim ke WhatsApp/kontak eksternal. |
| Informasi inti tanpa JavaScript | Owner menetapkan pada 13 Nov 2026, 00:29 WIB, bahwa HTML undangan publik harus menampilkan nama pasangan, jenis acara/upacara, tanggal/waktu setiap acara, serta nama dan alamat venue tanpa JavaScript. | Acceptance tersebut kini lulus pada POC Hono/React disposable lokal untuk dua fixture; ini bukti teknis prototipe Fase 0, bukan implementasi produk, kesiapan production, atau Gate PASS. Gallery, countdown, animasi, dan interaksi opsional bukan minimum inti kecuali keputusan produk lain menetapkannya. |
| Gerbang/Fase 0/Fase 1 | Architecture Gate **PASS** (keputusan eksplisit owner, 13 Nov 2026, 03:19 WIB); Fase 0 **SELESAI — PASS** (keputusan eksplisit owner, 13 Nov 2026, 04:50 WIB); Fase 1 **NOT APPROVED**. | Phase 0 PASS hanya menutup planning; bukan izin coding, provisioning, konfigurasi production, deployment, atau Fase 1. Fase 1 memerlukan persetujuan owner terpisah. |

### Bukti perbandingan arsitektur yang benar

Perbandingan terbaru adalah POC lokal Hono versus React Router **v8 framework mode** (`react-router`/`@react-router/dev` 8.5.1) dengan Cloudflare Vite plugin 1.69.1; plugin v1 adalah jalur stable yang diuji. Kedua varian memakai fixture sintetis dan lulus K1–K5, masing-masing 87/87 (K1 23/23, K2 4/4, K3 6/6, K4 12/12, K5 42/42). Build dan typecheck lulus. Bukti dan cakupan dicatat di reviewer packet lokal. Angka bundle memiliki cakupan berbeda dan tidak apples-to-apples.

### POC no-JavaScript lokal — essential fields lulus di salinan disposable

Pada salinan disposable Hono + React (`/workspace/kita-invite-nojs-poc-20261113`), dua fixture sintetis (`aisha-dan-bima`, `citra-dan-dimas`) lulus GET dan Chromium Playwright dengan JavaScript dimatikan. Masing-masing HTML berstatus 200 (`text/html; charset=UTF-8`); hero menampilkan nama pasangan, tanggal, venue, alamat; dua acara aktual (`Akad Nikah`, `Resepsi`) masing-masing menampilkan jenis/title, tanggal, waktu, venue, alamat. Pemeriksaan dua arah atas nama, tanggal hero, venue, alamat, serta tanggal/waktu unik acara fixture lain tidak menemukan cross-slug leak (`assertions.pass=true`, `failures=[]`). Dress Code ditandai opsional dan tidak termasuk fallback atau acceptance event; gallery/countdown juga bukan syarat.

Regression check tambahan dengan JavaScript aktif memastikan field inti tetap ada setelah React hydration dan tombol undangan dibuka. Jalur interaktif tetap menampilkan Dress Code sebagai detail opsional.

Hasil command POC: `npm ci` exit 0 pada setup awal (tidak diulang pada final rerun); `npm run typecheck` 0, `npm run build` 0, `npm run smoke` 0 (61 lulus, 0 gagal), dan `python3 evidence/browser/nojs_check.py` final 0. Final browser/raw audit menguji ulang assertion setelah cakupan isolasi diperluas; build/typecheck/smoke tidak diulang pada rerun terakhir karena source tidak berubah. Bukti lengkap lokal: `/workspace/kita-invite-nojs-poc-20261113/evidence/RESULTS.md`, `evidence/browser/nojs-check.json`, `evidence/browser/nojs_check.py`, raw HTML dan screenshot. Ini bukti satu varian Hono/React disposable saja; K1–K5 **tidak dijalankan ulang** dalam POC ini (K1–K5 N/A untuk varian tersebut). Bukti K1–K5 87/87 per varian berasal dari komparasi terpisah di atas. Tidak ada product code, comparator, Cloudflare, URL eksternal, atau production yang diubah.

Catatan Roadmap v0.1.1 tentang React Router 7.18.5 framework-less SSR sudah usang untuk perbandingan saat ini. Riwayat v0.1.1 dipertahankan di §9 sebagai sejarah, bukan fakta aktif.

### Status dan langkah setelah Fase 0 PASS

1. Keputusan Architecture Gate PASS (13 November 2026 pukul 03:19 WIB) dan keputusan Fase 0 **SELESAI — PASS** (13 November 2026 pukul 04:50 WIB) dicatat sebagai dua keputusan owner yang terpisah.
2. Pilihan owner agar K6 tetap terbuka telah dipenuhi sebagai keputusan; K6 tetap OPEN / UNVERIFIED dan tidak diuji. D1–D10 tetap pada status, penundaan, tenggat, dan blocker yang tercatat; M1–M8 dan stack final Hono + React + TypeScript + Vite tidak berubah.
3. Phase 0 PASS tidak memulai Fase 1 otomatis. Fase 1 tetap **NOT APPROVED** dan hanya dapat dimulai setelah persetujuan owner yang terpisah; keputusan Phase 0 ini tidak mengizinkan coding/implementasi, provisioning, konfigurasi production, atau deployment.

### Caveat yang tetap mengikat

1. **K6:** metadata/HTML OG dan hasil K1–K5 bukan bukti kartu WhatsApp aktual. K6 tetap OPEN / UNVERIFIED, tanpa tes atau kirim URL eksternal.
2. **No-JS:** kedua POC komparatif pembanding sebelumnya hanya menampilkan fallback hero. POC Hono/React disposable yang baru diuji kini lulus essential fields untuk dua fixture lokal; ini bukan bukti product implementation/production, dan K1–K5 tidak diulang pada varian ini.
3. **Alternatif framework:** React Router v8 + Cloudflare Vite plugin sudah diuji dalam komparasi lokal terbaru, tetapi owner memilih Hono + React + TypeScript + Vite. Jangan menggambarkan perbandingan aktif sebagai RR7 lama.

## 3. Keputusan terkunci versus keputusan terbuka

Bagian ini memisahkan dengan tegas apa yang sudah terkunci dari apa yang masih terbuka. Keputusan terkunci ditulis apa adanya, tanpa diubah, tanpa ditambah angka. Keputusan terbuka harus menyebut siapa yang memutuskan dan kapan dalam urutan fase.

### 3.1 Keputusan terkunci

1. Semua akun baru Free. Free boleh edit semua template dan menyimpan draft. Batas jumlah draft dan retention atau TTL tetap belum diputuskan.
2. Paket ditentukan oleh versi template yang dipilih. Basic 1 bulan, Premium 6 bulan, Signature 12 bulan, Exclusive 18 bulan. Masa aktif mulai saat undangan dipublikasikan, bukan saat pembayaran. Expiry akhir bulan 23:59:59 WIB. Tanggal acara tidak menutup undangan.
3. Harga prototype Basic Rp29.000, Premium Rp59.000, Signature Rp99.000, Exclusive mulai Rp149.000 adalah acuan prototype, bukan otomatis harga komersial final.
4. Data prototype localStorage bersifat per perangkat atau pengguna. Jangan diasumsikan seluruh draft otomatis berpindah ke production. Seed prototype hanya data fiktif, bukan data pelanggan.
5. Stage 2 V25 diterima sebagai APPROVED WITH MINOR NOTES berdasarkan verdict audit independen Lora (11 November 2026 pukul 12:07 WIB, via Cue). Status ini adalah baseline, bukan persetujuan production. Angka dan kronologi hasil tes dicatat di §3.1.1.
6. **Requirement owner no-JavaScript (13 November 2026, 00:29 WIB):** HTML publik undangan harus menyajikan tanpa JavaScript nama pasangan; jenis acara/upacara; tanggal dan waktu masing-masing acara; nama venue; serta alamat venue. Ini requirement produk yang diputuskan owner, bukan otorisasi Phase 1 atau product implementation. Gallery, countdown, animasi, dan interaksi lain tetap opsional untuk minimum ini kecuali keputusan produk yang sudah ada menyatakan sebaliknya. POC lokal disposable Hono/React kini lulus cek no-JS untuk dua fixture sintetis; hasil ini belum membuktikan product implementation atau kesiapan production.
7. Dua Worker POC lama `ki-og-poc-a` dan `ki-og-poc-b` dipertahankan sebagai demo. Jangan hapus atau ubah keduanya dalam tindak lanjut ini.

### 3.1.1 Provenance hasil tes V25 (kronologi, jangan dicampur)

Kronologi ini membedakan catatan tes pada commit V25 dari audit independen setelahnya. Kedua angka dipertahankan; keduanya benar pada waktunya masing-masing, dan tidak boleh ditukar.

1. Catatan pada commit V25 (commit `68bf66ceb62e2182a6559fe7a238d354568e7cbf`, `TESTS.md` yang terkomit di commit itu): `npm run test:e2e` berakhir exit 1 dengan ringkasan 360 dari 362 PASS. Dua FAIL yang dikenal, keduanya gate font wordmark di modul regression (Playfair Display 700 dan Manrope 700 tidak tersedia di runtime tes; `document.fonts` berisi 0 face). Tes fixture 172/172 dan handler 63/63 lolos dengan exit 0.
2. Audit independen Lora pada 11 November 2026 pukul 12:07 WIB, via Cue: clone bersih dengan font termuat, E2E 362/362, fixture 172/172, dan handler 63/63.
3. Status APPROVED WITH MINOR NOTES adalah verdict audit independen Lora, bukan klaim dari Muse.

Aturan penulisan: jangan menyatakan V25 sendiri mencatat 362/362. Bila angka tersebut dikutip, atribusikan ke audit independen Lora 11 November 2026. Catatan commit V25 tetap 360/362 dengan exit 1 dan dua gate font.

### 3.2 Register Keputusan (keputusan terbuka)

Register ini adalah acuan tunggal untuk urutan keputusan. Setiap baris menyatakan keputusan, modul apa yang tidak boleh di-coding sebelum keputusan itu dibuat, ke fase mana keputusan boleh ditunda, siapa pemutusnya, kapan keputusan dibutuhkan, dan konsekuensi atau blocker bila ditunda.

Aturan yang mengikat register ini: (1) TIDAK semua keputusan harus final sebelum seluruh Fase 0 selesai — hanya kunci MVP, pilihan stack final, dan keputusan status K6 yang wajib final di Fase 0; keputusan lain mengikuti kolom "boleh ditunda". (2) Coding suatu modul TIDAK BOLEH dimulai bila keputusan yang menjadi prasyarat modul itu menurut register belum dibuat. Register ini sudah diperiksa konsistensinya terhadap tabel fase (§5) dan exit criteria tiap fase (§4): dependency Fase 1 (arah domain dan Cloudflare plan), Fase 2 (auth provider dipilih), Fase 4 (batas draft diputuskan atau penundaan sadar dicatat), Fase 6 (gateway dipilih, harga final diputuskan, aturan order diputuskan — checkout tidak dibuka tanpanya), Fase 7 (email dipilih, template disetujui), dan Fase 8 (kebijakan migrasi diputuskan) semuanya cocok dengan kolom register di bawah; tidak ada ketidakkonsistenan yang ditemukan saat revisi v0.1.1.

| Keputusan | Wajib dibuat sebelum coding modul apa | Boleh ditunda ke fase mana | Pemutus | Kapan dibutuhkan | Konsekuensi / blocker bila ditunda |
|---|---|---|---|---|---|
| Kunci MVP (cakupan MVP vs pasca-MVP) | Semua modul produk (Fase 1 dan seterusnya) | Tidak boleh ditunda — wajib final di Fase 0 | Owner | Fase 0, sebelum Fase 0 keluar | Fase 0 tidak dapat lolos; tidak ada fase lanjut yang dimulai |
| Pilihan stack final di Gerbang Arsitektur, termasuk nasib React Router SSR sebagai alternatif | Semua coding produk (Fase 1 dan seterusnya) | Tidak boleh ditunda — wajib final di Fase 0, di Gerbang Arsitektur | Owner, setelah review formal Lora dan acceptance test OG/no-JS yang berlaku | Fase 0, di Gerbang Arsitektur | Gerbang tidak lolos; tidak ada coding production yang dimulai |
| Status K6 kartu WhatsApp: (a) kartu aktual wajib diuji sebelum keputusan stack final, atau (b) K6 boleh tetap OPEN / UNVERIFIED sampai tersedia cara uji yang aman — **owner memilih opsi (b)** | Keputusan Gate/stack (status K6 telah diputuskan; Gate PASS dan Phase 0 PASS dicatat terpisah) | Pilihan status wajib eksplisit di Fase 0; metode uji aman tidak memiliki tenggat dan hanya diputuskan jika pengujian aktual dipertimbangkan | Owner | Status K6 sudah diputuskan di Fase 0; metode aman sebelum uji aktual | Pilihan owner agar K6 tetap terbuka telah dipenuhi sebagai keputusan dan **tidak menghalangi Gate PASS atau Phase 0 PASS**. K6 tetap OPEN / UNVERIFIED dan tidak diuji; jangan menguji atau mengirim URL tanpa metode aman serta persetujuan terpisah |
| Auth provider | Fase 2 (auth, roles, data) | Nilai akhir boleh ditunda sampai sebelum Fase 2 dimulai; arah ditetapkan di Fase 0 | Owner | Sebelum Fase 2 dimulai | Fase 2 tidak dapat dimulai (blocker); Fase 0 dan Fase 1 tidak terpengaruh |
| Domain | Konfigurasi production di Fase 1 | Penetapan final boleh ditunda ke Fase 1; arah ditetapkan di Fase 0 | Owner | Sebelum provisioning production di Fase 1 | Fase 1 dapat berjalan untuk dev/staging, tetapi provisioning production tertahan |
| Cloudflare plan | Provisioning production di Fase 1 | Penetapan final boleh ditunda ke Fase 1; arah ditetapkan di Fase 0 | Owner | Sebelum provisioning production di Fase 1 | Provisioning production tertahan; Fase 1 dev/staging tidak terpengaruh |
| Email transaksional (provider) | Notifikasi di Fase 7 | Pilihan provider boleh ditunda sampai sebelum Fase 7; isi template diputuskan di Fase 7 | Owner | Sebelum Fase 7 membangun notifikasi | Fase 7 tidak dapat membangun dan menguji notifikasi |
| Payment gateway | Integrasi checkout di Fase 6 | Pilihan arah di Fase 0; pengesahan akhir boleh ditunda ke Fase 6 | Owner | Sebelum integrasi webhook di Fase 6 | Fase 6 tidak dapat memulai integrasi; checkout tetap tertutup |
| Harga komersial final | Pembukaan checkout di Fase 6 | Boleh ditunda ke Fase 6 (bukan prasyarat Fase 0) | Owner | Sebelum checkout dibuka di Fase 6 | Checkout tidak dibuka; fase lain tidak terpengaruh |
| Aturan order sudah dibayar tapi belum dipublikasi | Pembukaan checkout di Fase 6 | Arah di Fase 0; aturan final boleh ditunda ke Fase 6 | Owner | Sebelum checkout dibuka di Fase 6 | Checkout tidak dibuka; order yang sudah dibayar tidak memiliki penanganan yang diputuskan |
| Batas jumlah draft dan retention/TTL draft Free | Penerapan batas/TTL apa pun di Fase 4 | Penetapan final boleh ditunda ke Fase 4; arah ditetapkan di Fase 0 | Owner | Sebelum batas atau TTL apa pun diterapkan di Fase 4 | Fase 4 berjalan tanpa batas/TTL yang diterapkan; JANGAN menerapkan batas atau TTL sebelum owner memutuskan |
| Kebijakan migrasi data prototype | Migrasi/UAT di Fase 8 | Boleh ditunda ke Fase 8 | Owner | Sebelum migrasi atau UAT di Fase 8 | Tidak ada migrasi yang dilakukan; UAT berjalan tanpa data prototype yang dimigrasikan |

Catatan status per Roadmap v0.1.4: D1–D10 tetap mengikuti status, penundaan sadar/menunggu, tenggat, dan blocker pada register §3.2 serta Decision Pack v0.1.13 §1.4 dan §2. Revisi v0.1.4 tidak mengubah keputusan, nilai, urutan, tenggat, atau blocker D1–D10.

## 4. Fase 0 sampai Fase 8

Setiap fase di bawah ini memiliki keenam elemen berikut: tujuan, deliverables, dependency, exit criteria, risiko, dan keputusan owner. Tidak ada fase yang dimulai sebelum dependency dan keputusan owner prasyaratnya terpenuhi.

### Fase 0. Pra-build: scope, keputusan, ADR, K1–K5 dan acceptance no-JavaScript, K6 OPEN / UNVERIFIED

#### Tujuan

Mengunci apa yang termasuk MVP; mencatat status keputusan yang terbuka sesuai register tanpa memfinalisasi D1–D10 di luar deadline; mendokumentasikan ADR; menjalankan acceptance OG/crawler yang dapat diulang; serta menguji HTML essential fields tanpa JavaScript pada POC lokal/non-production. Fase 0 tidak memulai product implementation, provisioning, atau production deployment.

#### Deliverables

1. Daftar MVP M1–M8 yang disetujui owner dan fitur kandidat P1–P8.
2. Status setiap keputusan turunan dan penundaan D1–D10 sesuai register §3.2, termasuk deadline/blocker; tidak mengarang keputusan atau deadline.
3. ADR yang mencatat pilihan final owner Hono + React + TypeScript + Vite, alternatif RR8 yang dievaluasi, alasan/bukti, trade-off, dan batas keputusan.
4. Kriteria K1–K5 yang dapat diulang dan hasil lokalnya; hasil ini dibedakan dari K6, production readiness, dan Gate/Fase 0.
5. Acceptance no-JavaScript: untuk dua atau lebih fixture undangan sintetis, HTML response yang diterima tamu menampilkan langsung di body (bukan hanya di head, JSON/hydration payload, atau setelah JS/interaksi) pasangan, jenis acara/upacara, tanggal dan waktu tiap acara, nama venue, dan alamat venue. Uji GET dan browser dengan JavaScript dinonaktifkan; cek pula isolasi fixture/data. Opsional gallery, countdown, animasi, serta interaksi lain tidak termasuk minimum ini kecuali ada keputusan produk lain yang menjadikannya wajib. Bukti disposable lokal untuk dua fixture tersedia di `/workspace/kita-invite-nojs-poc-20261113/evidence/`; K1–K5 merupakan hasil pembanding terpisah dan tidak diulang pada varian no-JS ini.
6. Rencana uji K6 yang aman dan batasnya: K6 aktual belum terbukti; tidak mengirim URL ke penerima atau kanal eksternal tanpa cara uji aman dan persetujuan terpisah.
7. Keputusan owner atas K6: tetap OPEN / UNVERIFIED sampai tersedia metode aman; K6 tidak dipakai sebagai bukti lulus.
8. Review formal Lora yang independen dari executor Harley, verdict, dan tindak lanjutnya. Review no-JS/Roadmap 13 Nov memberi APPROVED WITH MINOR NOTES; minor note tentang fail-closed hero assertions diperbaiki, rerun lokal lulus, dan Lora mengonfirmasi note tertutup. Verdict review tidak meluluskan Gate.
9. Catat Architecture Gate PASS yang disetujui eksplisit owner pada 13 November 2026 pukul 03:19 WIB dan keputusan Fase 0 **SELESAI — PASS** yang disetujui owner secara terpisah pada 13 November 2026 pukul 04:50 WIB. Phase 0 PASS adalah keputusan owner, bukan hasil otomatis checklist; keputusan ini hanya menutup planning.

#### Dependency

1. Baseline V25 dan bukti POC lokal/non-production yang dirujuk di Bagian 1.
2. Ketersediaan owner untuk keputusan yang memang menjadi hak owner.
3. Ketersediaan Lora sebagai reviewer formal dan Harley sebagai executor teknis, tanpa reviewer menilai pekerjaannya sendiri.
4. Sumber POC lokal yang dapat disalin secara disposable; tidak memakai Cloudflare production, resource remote, URL publik, atau data pelanggan.

#### Exit criteria

1. Scope MVP M1–M8 dikunci tertulis dan disetujui owner.
2. Setiap keputusan terbuka prasyarat memiliki status jelas; D1–D10 dan tenggatnya tetap mengikuti register, dan tidak ada blocker tersembunyi.
3. ADR stack final owner selesai dan dapat dirujuk; bukan izin implementasi.
4. K1–K5 OG/crawler dapat dijalankan ulang dengan hasil terdokumentasi. Tambahan requirement no-JS baru dinyatakan teknis terpenuhi hanya setelah GET dan browser checks tanpa JavaScript lulus untuk setidaknya dua fixture sintetis, menguji seluruh essential fields dan isolasi data. K1–K5 sebelumnya tidak membuktikan acceptance no-JS ini.
5. Keputusan owner tentang K6 dan konsekuensinya tercatat: tetap OPEN / UNVERIFIED; stack/gate tidak menunggu bukti kartu aktual selama pilihan itu berlaku.
6. Review formal Lora diterima dan tidak memiliki keberatan Gate yang belum dijawab; minor notes/catatan tindak lanjut dievaluasi terhadap requirement owner no-JS dan bukti POC terbaru.
7. Keputusan owner atas Gerbang Arsitektur dicatat dengan alasan. **PASS disetujui secara eksplisit oleh owner pada 13 November 2026 pukul 03:19 WIB**; ini bukan keputusan Phase 0 PASS/FAIL atau persetujuan Fase 1.
8. Owner menyatakan hasil Fase 0 secara eksplisit PASS atau FAIL. **TERPENUHI — owner menetapkan SELESAI / PASS pada 13 November 2026 pukul 04:50 WIB.**
9. Makna persetujuan Fase 0 planning-only dicatat dan disetujui owner: hanya perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; bukan product code/scaffolding, production provisioning/setting, deployment, atau Fase 1. Architecture Gate PASS dan keputusan Fase 0 PASS yang terpisah tidak memperluas otorisasi tersebut.

#### Crosswalk status sembilan exit criteria pada Roadmap v0.1.4

Status berikut memisahkan bukti/keputusan dalam batasnya dari kesiapan produk. Keputusan owner Fase 0 PASS pada 13 November 2026 pukul 04:50 WIB dicatat secara eksplisit pada criterion #8; status ini tidak mengubah batas izin planning-only.

| # | Exit criterion Roadmap | Status saat ini | Bukti dan batas |
|---|---|---|---|
| 1 | M1–M8 dikunci tertulis dan disetujui; P1–P8 tetap kandidat | **SELESAI sebagai keputusan/dokumentasi** | Decision Pack v0.1.13 §1 dan §6 (checkpoint #1) serta ratifikasi owner 13 Nov 00:07 WIB. |
| 2 | Status keputusan terbuka prasyarat jelas, tanpa blocker tersembunyi | **SELESAI sebagai pencatatan** | Decision Pack v0.1.13 §1.4/§2 dan checkpoint #2; D1–D10 tetap deferred/menunggu sesuai tenggat dan blocker masing-masing, bukan difinalisasi oleh Roadmap ini. |
| 3 | ADR stack lengkap dan dapat dirujuk | **SELESAI sebagai artefak perencanaan** | ADR-001 mencatat Hono + React + TypeScript + Vite dan alternatif/hasil evaluasi. Bukan izin implementasi atau Gate PASS. |
| 4 | Acceptance OG/K1–K5 dan essential no-JS dapat diulang serta hasil terdokumentasi | **SELESAI sebagai bukti perencanaan lokal** | K1–K5 sebelumnya disetujui owner, 87/87 per varian pada komparasi terpisah. POC Hono/React disposable no-JS kini lulus GET + Chromium JS-off untuk dua fixture, tiap field inti dan isolasi unique fields; JS-on juga mempertahankan field inti. Bukti lokal `/workspace/kita-invite-nojs-poc-20261113/evidence/RESULTS.md`. K1–K5 tidak diulang pada varian no-JS ini; ini bukan kesiapan produk/production atau Gate PASS. |
| 5 | Keputusan owner tentang K6 dan konsekuensi Gate tercatat | **SELESAI — pilihan tetap terbuka sebagai keputusan** | Decision Pack v0.1.13 §2.12; pilihan owner agar K6 tetap terbuka telah dipenuhi sebagai keputusan. K6 tetap **OPEN / UNVERIFIED** dan tidak diuji; tidak ada URL eksternal yang dikirim. |
| 6 | Review yang diminta diterima dan keberatan ditangani, atau Gate dinyatakan tidak lolos | **SELESAI — review diterima, minor note ditutup** | Lora memberi **APPROVED WITH MINOR NOTES**; minor note agar hero assertions fail-closed sudah diperbaiki Harley dan dikonfirmasi tertutup Lora pada follow-up review. Verdict review bukan keputusan PASS Gate; keputusan Gate owner tercatat terpisah di #7. |
| 7 | Keputusan Gerbang Arsitektur tercatat dengan alasan | **SELESAI — owner memutuskan PASS** | Owner secara eksplisit menyetujui Architecture Gate PASS pada 13 Nov 2026, 03:19 WIB. Keputusan ini memenuhi criterion #7 saja; bukan Phase 0 PASS/FAIL atau persetujuan Fase 1. |
| 8 | Hasil Fase 0 dinyatakan eksplisit PASS atau FAIL | **SELESAI — PASS** | Owner secara eksplisit menetapkan Fase 0 **SELESAI — PASS pada 13 November 2026 pukul 04:50 WIB**. Keputusan ini hanya menutup planning; Fase 1 tidak dimulai otomatis dan tetap memerlukan persetujuan owner terpisah. |
| 9 | Arti izin Fase 0 planning-only dicatat dan disetujui owner | **SELESAI sebagai catatan/ratifikasi** | Decision Pack v0.1.13 §0 dan §6 checkpoint #7; Phase 0 PASS tidak memberi izin coding/provisioning/deployment/Fase 1. |

#### Risiko

1. Scope MVP atau keputusan turunan melebar/berubah tanpa keputusan owner.
2. K1–K5 atau metadata OG disalahartikan sebagai bukti bahwa essential information sudah terlihat tanpa JS atau bahwa kartu WhatsApp aktual tampil.
3. Status dokumentasi/checkpoint disamakan dengan kesiapan teknis, Gate PASS, atau Phase 0 PASS.
4. Minor notes reviewer dan fixture/data cross-contamination tidak diperiksa setelah perubahan.

#### Keputusan owner

Owner sudah menetapkan M1–M8, stack Hono + React + TypeScript + Vite, K6 tetap OPEN / UNVERIFIED, dan essential-info no-JS requirement. Owner menyetujui Architecture Gate PASS pada 13 Nov 2026 pukul 03:19 WIB dan secara terpisah menetapkan Fase 0 **SELESAI — PASS pada 13 Nov 2026 pukul 04:50 WIB**. Phase 0 PASS hanya menutup planning, bukan izin coding/Fase 1; Fase 1 tetap **NOT APPROVED** dan memerlukan persetujuan owner terpisah.

#### Gerbang Arsitektur — kondisi dan status terkini

Architecture Gate **PASS berdasarkan keputusan eksplisit owner 13 November 2026 pukul 03:19 WIB**. Ini adalah keputusan Gate saja. Owner menetapkan hasil Fase 0 **SELESAI — PASS secara terpisah pada 13 November 2026 pukul 04:50 WIB**; keputusan Fase 0 hanya menutup planning, bukan persetujuan Fase 1.

**Kriteria masuk**

| Kondisi masuk | Status | Catatan |
|---|---|---|
| ADR stack selesai | **SELESAI sebagai dokumen** | Keputusan owner final Hono + React + TypeScript + Vite tercatat; bukan persetujuan implementasi. |
| Acceptance OG/crawler dan no-JS dijalankan serta hasil tercatat | **SELESAI untuk K1–K5 terpisah dan POC no-JS lokal** | K1–K5 tetap 87/87 per varian pada komparasi terdahulu. POC Hono/React disposable lulus GET/browser no-JS dua fixture dan regression JS-on; K1–K5 tidak dijalankan ulang di varian no-JS. K6 dan kesiapan produk/production tidak termasuk. |
| Review formal diterima | **SELESAI — APPROVED WITH MINOR NOTES, minor note ditutup** | Lora mereview POC no-JS/Roadmap; hero assertion patch diverifikasi pada follow-up review. Verdict tetap bukan Gate PASS. |
| Keputusan K6 owner tercatat | **SELESAI — pilihan OPEN dipenuhi sebagai keputusan** | Owner memilih K6 tetap OPEN / UNVERIFIED; pilihan itu memenuhi keputusan status K6. K6 tidak diuji dan tidak ada URL aktual yang dikirim. |
| Caveat POC dibaca dan dicatat | **SELESAI sebagai pencatatan** | K6 bukan bukti OG; RR8 resmi kini pembanding terverifikasi; no-JS requirement dicatat sebagai syarat teknis baru. |
| M1–M8 dikunci | **SELESAI** | Owner menerima M1–M8; checkpoint dokumentasi diratifikasi. |

**Kriteria keluar untuk PASS**

| Kondisi keluar | Status | Catatan |
|---|---|---|
| Tidak ada keberatan review Gate yang belum dijawab | **SELESAI untuk review; keputusan Gate PASS owner tercatat terpisah** | Lora memberi APPROVED WITH MINOR NOTES dan mengonfirmasi minor note hero assertion tertutup setelah patch/rerun. Verdict review tidak menggantikan keputusan Gate owner. |
| Acceptance K1–K5 lulus | **SELESAI dalam cakupan uji lama** | K1–K5 87/87 per varian; bukan no-JS essential-info acceptance. |
| Essential fields no-JS tampil dan terisolasi pada POC lokal | **SELESAI sebagai tes lokal; minor note review ditutup** | GET dan Chromium JS-off membuktikan nama pasangan, jenis/title dua acara, tanggal/waktu, venue, alamat untuk dua fixture sintetis; tidak ada cross-slug leak pada nilai unik. JS-on tetap menampilkan field setelah hydration, dan Lora mengonfirmasi minor note hero assertion tertutup. Ini tidak menyatakan product implementation/production siap. |
| Keputusan K6 eksplisit | **SELESAI — pilihan tetap terbuka dipenuhi sebagai keputusan** | Pilihan owner agar K6 tetap terbuka telah dipenuhi; K6 tetap OPEN / UNVERIFIED dan tidak diuji. Tidak ada izin tes aktual. |
| Status React Router diputuskan | **SELESAI** | Hono dipilih; RR8 resmi + Cloudflare Vite plugin dievaluasi tetapi tidak dipilih sebagai stack final. |
| Keputusan owner final atas Gate tercatat | **SELESAI — PASS** | Owner secara eksplisit menyetujui Architecture Gate PASS pada 13 Nov 2026, 03:19 WIB. Keputusan Gate terpisah dari Phase 0 PASS (13 Nov 2026, 04:50 WIB) dan bukan persetujuan Fase 1. |

**Kesimpulan Gate:** Architecture Gate **PASS berdasarkan keputusan eksplisit owner pada 13 November 2026 pukul 03:19 WIB**. Bukti K1–K5/no-JS dan review Lora tetap dibatasi sebagaimana dijelaskan; keputusan Gate hanya menutup Gate. Owner kemudian secara terpisah menetapkan Fase 0 **SELESAI — PASS pada 13 November 2026 pukul 04:50 WIB**. Keputusan Fase 0 hanya menutup planning, bukan persetujuan Fase 1 atau izin implementasi.

### Fase 1. Fondasi Cloudflare: repo, CI atau CD, Worker, D1 atau R2, secrets, migrasi, logging, backup atau restore, dev atau staging atau production benar-benar terpisah

**Status:** Fase 1 **NOT APPROVED**. Phase 0 PASS tidak memberi izin untuk memulai Fase 1; persetujuan owner yang terpisah wajib diperoleh sebelum aktivitas fase ini.

#### Tujuan

Membangun fondasi Cloudflare yang bersih dan terpisah per lingkungan, sehingga pekerjaan fase berikutnya berdiri di atas repo, pipeline, data, dan secrets yang terkontrol dan dapat diaudit.

#### Deliverables

1. Repo dan struktur kerja yang disepakati, dengan CI atau CD yang menjalankan pemeriksaan yang disepakati owner.
2. Worker untuk API dan HTML awal, sesuai keputusan Gerbang Arsitektur.
3. D1 dan R2 yang terpisah untuk dev, staging, dan production.
4. Pengelolaan secrets yang terdokumentasi, tanpa secret di repo atau di dokumen ini.
5. Mekanisme migrasi SQL terkontrol, dengan catatan tiap migrasi.
6. Logging dasar dan prosedur backup dan restore yang tertulis dan teruji.
7. Pages hanya dipakai sebagai preview atau audit, bukan sebagai production.

#### Dependency

1. Fase 0 telah dinyatakan **SELESAI — PASS** oleh owner; ini bukan izin memulai Fase 1. Persetujuan owner yang terpisah tetap wajib dan belum diberikan.
2. Keputusan arah domain dan Cloudflare plan sudah ada, atau penundaannya dicatat sebagai risiko yang diterima owner.

#### Exit criteria

1. Dev, staging, dan production benar-benar terpisah dan dapat dibuktikan dari konfigurasi, bukan dari klaim.
2. CI atau CD berjalan dan hasil pemeriksaannya terdokumentasi.
3. Migrasi dapat dijalankan maju dan tercatat, tanpa migrasi yang tidak terlacak.
4. Backup dan restore sudah diuji dan terdokumentasi, tanpa angka yang dikarang.
5. Tidak ada secret di repo dan tidak ada akses production yang tidak tercatat.

#### Risiko

1. Lingkungan tercampur karena konfigurasi yang disalin tanpa penyesuaian.
2. Secret bocor melalui repo, log, atau dokumen.
3. Migrasi tidak terkontrol sehingga staging dan production berbeda skema tanpa catatan.
4. Pages dipakai sebagai production secara diam-diam karena kemudahan preview.

#### Keputusan owner

Owner memutuskan penetapan domain dan Cloudflare plan untuk production, serta menyetujui struktur repo dan pipeline sebelum provisioning production dilakukan.

### Fase 2. Auth, roles dan data: Customer atau Admin atau Designer, session, ownership atau RBAC wajib di server, audit trail, model awal, gate lintas-akun

#### Tujuan

Membangun auth, peran, dan model data awal dengan penegakan ownership dan RBAC wajib di server, sehingga tidak ada akses lintas-akun melalui jalur klien.

#### Deliverables

1. Auth sesuai provider yang dipilih owner, dengan session yang terkontrol.
2. Peran Customer, Admin, dan Designer beserta batas kewenangannya.
3. Penegakan ownership dan RBAC di server untuk tiap operasi tulis dan baca yang sensitif.
4. Audit trail untuk aksi sensitif.
5. Model data awal yang konsisten dengan migrasi Fase 1.
6. Gate lintas-akun yang menguji bahwa satu akun tidak dapat membaca atau mengubah data akun lain.

#### Dependency

1. Fase 0 lolos dan Fase 1 lolos.
2. Auth provider sudah dipilih owner.

#### Exit criteria

1. Semua pemeriksaan ownership dan RBAC berjalan di server, bukan hanya di antarmuka.
2. Gate lintas-akun lolos dan hasilnya terdokumentasi.
3. Session dapat dicabut dan perilakunya terdokumentasi.
4. Audit trail tercatat untuk aksi sensitif yang disepakati di Fase 0.

#### Risiko

1. Otorisasi hanya di klien sehingga dapat dilewati.
2. Peran Designer dan Admin tercampur kewenangannya.
3. Audit trail tidak lengkap sehingga insiden tidak dapat ditelusuri.
4. Session yang tidak dapat dicabut memperpanjang dampak kebocoran kredensial.

#### Keputusan owner

Owner memutuskan auth provider dan batas kewenangan tiap peran, serta menyetujui daftar aksi sensitif yang wajib masuk audit trail.

### Fase 3. Template atau CMS dan undangan publik: slug, renderer, template versioning, media upload aman ke R2, HTML atau OG per undangan, template baru tidak mengubah undangan versi lama

#### Tujuan

Membangun template dan CMS serta renderer undangan publik dengan slug yang stabil, versioning template yang melindungi undangan lama, dan media upload yang aman ke R2, termasuk HTML dan OG per undangan.

#### Deliverables

1. Slug undangan yang stabil dan terdokumentasi perilakunya.
2. Renderer undangan publik yang konsisten dengan template yang dipilih.
3. Template versioning, sehingga template baru tidak mengubah undangan versi lama.
4. Media upload yang aman ke R2, dengan validasi yang berjalan di server.
5. HTML awal dan metadata OG per undangan, sesuai keputusan Gerbang Arsitektur.
6. Katalog template dan versinya yang terdokumentasi.

#### Dependency

1. Fase 1 lolos dan Fase 2 lolos.
2. Keputusan stack final dari Gerbang Arsitektur.

#### Exit criteria

1. Undangan lama tidak berubah saat template baru diterbitkan, dibuktikan dengan pengujian versi.
2. Slug yang sudah dipublikasikan tetap mengarah ke undangan yang benar.
3. Media upload yang tidak valid ditolak di server dan penolakan itu terdokumentasi.
4. HTML dan OG per undangan lolos acceptance test OG yang disiapkan di Fase 0.

#### Risiko

1. Perubahan template merusak undangan yang sudah dipublikasikan.
2. Slug berubah atau bertabrakan sehingga tautan yang sudah tersebar rusak.
3. Upload media yang tidak divalidasi di server menjadi jalur penyalahgunaan.
4. OG yang tidak konsisten per undangan menimbulkan pratinjau yang salah.

#### Keputusan owner

Owner memutuskan katalog template awal yang masuk MVP dan aturan versioning yang berlaku untuk undangan yang sudah dipublikasikan.

### Fase 4. Builder, draft dan entitlement: draft server-side, autosave, Free, paket, expiry dan publish

#### Tujuan

Membangun builder dengan draft server-side dan autosave, serta entitlement Free dan paket dengan expiry dan publish yang mengikuti keputusan terkunci.

#### Deliverables

1. Draft server-side dengan autosave yang perilakunya terdokumentasi.
2. Entitlement Free, yaitu semua akun baru Free, Free boleh edit semua template dan menyimpan draft.
3. Paket yang ditentukan oleh versi template yang dipilih, dengan masa aktif Basic 1 bulan, Premium 6 bulan, Signature 12 bulan, Exclusive 18 bulan, masa aktif mulai saat undangan dipublikasikan, expiry akhir bulan 23:59:59 WIB, dan tanggal acara tidak menutup undangan.
4. Alur publish yang mencatat waktu publish sebagai awal masa aktif.
5. Penanganan draft yang belum dipublikasikan dan yang sudah kedaluwarsa, sesuai aturan yang diputuskan owner.

#### Dependency

1. Fase 2 lolos dan Fase 3 lolos.
2. Keputusan owner atas batas jumlah draft dan retention atau TTL draft Free, atau penundaan sadar yang dicatat bila belum diputuskan.

#### Exit criteria

1. Draft tersimpan di server dan dapat dipulihkan setelah perangkat berganti, sesuai asumsi yang dicatat di Bagian 8.
2. Autosave tidak menimpa perubahan pengguna lain tanpa aturan yang terdokumentasi.
3. Masa aktif dihitung dari waktu publish, bukan dari waktu pembayaran, dan dibuktikan dengan pengujian.
4. Expiry akhir bulan 23:59:59 WIB berperilaku sesuai keputusan terkunci.
5. Tidak ada batas atau TTL draft yang diterapkan sebelum owner memutuskan.

#### Risiko

1. Batas atau TTL draft diterapkan sebelum diputuskan, sehingga draft pengguna hilang tanpa dasar keputusan.
2. Masa aktif dihitung dari pembayaran, bukan dari publish, sehingga bertentangan dengan keputusan terkunci.
3. Autosave menimpa draft dan perubahan hilang tanpa jejak.
4. Entitlement paket tidak konsisten antara builder, publish, dan tampilan publik.

#### Keputusan owner

Owner memutuskan batas jumlah draft dan retention atau TTL draft Free, serta aturan penanganan draft yang belum dipublikasikan dan yang sudah kedaluwarsa. Keputusan ini adalah prasyarat sebelum batas apa pun diterapkan.

### Fase 5. Guest atau RSVP: manajemen tamu atau grup, RSVP dan guestbook yang tertaut benar, moderasi, anti-spam

#### Tujuan

Membangun manajemen tamu dan grup, RSVP dan guestbook yang tertaut benar ke undangan dan tamu yang tepat, beserta moderasi dan anti-spam.

#### Deliverables

1. Manajemen tamu dan grup yang tertaut ke undangan yang benar.
2. RSVP yang tertaut benar ke tamu dan undangan, tanpa RSVP yang tercatat ke undangan lain.
3. Guestbook yang tertaut benar dan dapat dimoderasi.
4. Moderasi untuk RSVP dan guestbook.
5. Anti-spam yang perilakunya terdokumentasi dan tidak memblokir tamu sah tanpa jalur pemulihan.

#### Dependency

1. Fase 2 lolos, Fase 3 lolos, dan Fase 4 lolos untuk alur publish.
2. Aturan moderasi dan anti-spam yang disepakati owner.

#### Exit criteria

1. RSVP dan guestbook yang diuji tidak pernah tertaut ke undangan atau tamu yang salah.
2. Moderasi dapat menyembunyikan atau memulihkan entri dan tindakannya tercatat.
3. Anti-spam diuji dengan upaya yang wajar dan hasilnya terdokumentasi, tanpa klaim ketahanan mutlak.
4. Tamu sah yang tertolak oleh anti-spam memiliki jalur pemulihan yang terdokumentasi.

#### Risiko

1. RSVP atau guestbook tertaut ke undangan yang salah, sehingga data tamu tercampur.
2. Moderasi yang tidak tercatat menyulitkan penelusuran.
3. Anti-spam terlalu agresif dan memblokir tamu sah.
4. Anti-spam terlalu longgar sehingga guestbook dipenuhi entri yang tidak diinginkan.

#### Keputusan owner

Owner memutuskan aturan moderasi, ambang anti-spam secara kualitatif, dan siapa yang berwenang memoderasi.

### Fase 6. Checkout atau pembayaran: price snapshot, gateway yang dipilih owner, verified atau idempotent webhook, rekonsiliasi, order status terpisah dari payment state, masa aktif tetap mulai saat publish

#### Tujuan

Membangun checkout dan pembayaran dengan price snapshot, webhook yang terverifikasi dan idempotent, dan rekonsiliasi, dengan order status yang terpisah dari payment state, dan masa aktif yang tetap mulai saat publish.

#### Deliverables

1. Price snapshot pada saat order dibuat, sehingga perubahan harga tidak mengubah order yang sudah dibuat.
2. Integrasi gateway yang dipilih owner, sesuai keputusan Fase 0 dan pengesahan akhir di fase ini.
3. Webhook yang terverifikasi dan idempotent, dengan penanganan pengiriman ulang.
4. Rekonsiliasi antara order, payment state, dan catatan gateway.
5. Order status yang terpisah dari payment state, dengan transisi yang terdokumentasi.
6. Aturan final untuk order sudah dibayar tapi belum dipublikasi, sesuai keputusan owner.
7. Harga komersial final yang diputuskan owner, dengan harga prototype hanya sebagai acuan.

#### Dependency

1. Fase 2 lolos dan Fase 4 lolos.
2. Payment gateway sudah dipilih owner dan akun gateway sudah siap menurut owner.
3. Harga komersial final sudah diputuskan owner, atau penundaannya dicatat sebagai blocker untuk membuka checkout.

#### Exit criteria

1. Webhook yang dikirim ulang tidak membuat order ganda dan perilakunya terdokumentasi.
2. Rekonsiliasi dapat menunjukkan selisih antara order dan payment state bila ada, dan selisih itu ditindaklanjuti.
3. Order status dan payment state tidak tercampur dalam satu field atau satu transisi.
4. Masa aktif tetap mulai saat publish, dibuktikan dengan pengujian order yang dibayar lebih dulu lalu dipublikasikan kemudian.
5. Checkout tidak dibuka sebelum harga komersial final diputuskan.

#### Risiko

1. Webhook yang tidak terverifikasi atau tidak idempotent membuat order ganda atau order palsu.
2. Price snapshot tidak ada sehingga perubahan harga mengubah order lama.
3. Order status tercampur dengan payment state sehingga order yang belum lunas tampak sudah selesai, atau sebaliknya.
4. Aturan order sudah dibayar tapi belum dipublikasi tidak diputuskan, sehingga order menggantung tanpa penanganan.

#### Keputusan owner

Owner memutuskan payment gateway, harga komersial final, dan aturan order sudah dibayar tapi belum dipublikasi. Owner juga menyetujui pembukaan checkout.

### Fase 7. Admin dan assisted service: CMS operasional, customer atau order atau media, assignment, revisions, approvals, notifications dan activity log

#### Tujuan

Membangun CMS operasional untuk Admin dan Designer, termasuk pengelolaan customer, order, dan media, assignment, revisions, approvals, notifications, dan activity log untuk assisted service.

#### Deliverables

1. CMS operasional untuk customer, order, dan media.
2. Assignment pekerjaan ke Designer beserta statusnya.
3. Revisions dan approvals yang tercatat dan dapat ditelusuri.
4. Notifications sesuai provider email transaksional yang dipilih owner, dengan isi template yang disetujui.
5. Activity log untuk aksi admin dan designer.

#### Dependency

1. Fase 2 lolos, Fase 4 lolos, dan Fase 6 lolos untuk data order.
2. Email transaksional sudah dipilih owner dan template notifikasi sudah disetujui.

#### Exit criteria

1. Assignment, revisions, dan approvals tercatat dan dapat ditelusuri dari awal sampai akhir.
2. Tidak ada perubahan order atau media oleh Admin atau Designer tanpa jejak di activity log.
3. Notifications terkirim sesuai template yang disetujui dan kegagalannya tercatat.
4. Batas kewenangan Admin dan Designer ditegakkan di server, bukan hanya di antarmuka.

#### Risiko

1. Assisted service mengubah undangan pelanggan tanpa persetujuan yang tercatat.
2. Revisions tidak terlacak sehingga versi yang disetujui tidak dapat dibuktikan.
3. Notifications gagal tanpa catatan sehingga pelanggan tidak tahu status ordernya.
4. Activity log tidak lengkap sehingga sengketa tidak dapat diselesaikan dari catatan.

#### Keputusan owner

Owner memutuskan isi template notifikasi, alur approvals untuk assisted service, dan siapa yang berwenang menyetujui revisi.

### Fase 8. Migrasi atau UAT atau peluncuran: ekspor-impor lokal bila dibutuhkan per pemilik atau perangkat, validasi atau rekonsiliasi, security dan accessibility review, observability, restore test, staged cutover dan rollback

#### Tujuan

Menyiapkan migrasi, UAT, dan peluncuran secara bertahap, dengan validasi dan rekonsiliasi, security dan accessibility review, observability, restore test, dan rencana staged cutover dan rollback yang dapat dijalankan.

#### Deliverables

1. Rencana ekspor-impor lokal bila dibutuhkan, per pemilik atau per perangkat, dengan batasan yang jujur tentang data localStorage.
2. Hasil validasi dan rekonsiliasi data yang dimigrasikan, bila migrasi dilakukan.
3. Security review dan accessibility review yang hasilnya terdokumentasi beserta tindak lanjutnya.
4. Observability yang berjalan untuk production, dengan alert yang disepakati owner.
5. Restore test yang sudah dijalankan dan terdokumentasi.
6. Rencana staged cutover dan rollback yang tertulis dan dapat dijalankan.

#### Dependency

1. Semua fase sebelumnya lolos, atau penundaan yang dicatat secara eksplisit dan diterima owner.
2. Keputusan owner atas kebijakan migrasi data prototype.
3. Semua exit gate lintas fase di Bagian 6 sudah diperiksa.

#### Exit criteria

1. UAT lolos sesuai kriteria yang disepakati di Fase 0 dan hasilnya terdokumentasi.
2. Security dan accessibility review selesai dan temuan yang disepakati sudah ditindaklanjuti atau dicatat sebagai risiko yang diterima owner.
3. Restore test sudah dijalankan dan terdokumentasi.
4. Rencana staged cutover dan rollback sudah diuji sejauh yang dapat diuji tanpa mengganggu production, dan langkah rollbacknya jelas.
5. Owner menyetujui peluncuran secara eksplisit, terpisah dari persetujuan Fase 0.

#### Risiko

1. Migrasi data localStorage diasumsikan otomatis, padahal data itu per perangkat atau pengguna dan seed prototype hanya data fiktif.
2. Cutover dilakukan sekaligus tanpa rollback yang dapat dijalankan.
3. Temuan security atau accessibility dibiarkan tanpa keputusan owner.
4. Observability tidak siap sehingga gangguan production tidak terdeteksi.

#### Keputusan owner

Owner memutuskan kebijakan migrasi data prototype, persetujuan atas temuan security dan accessibility review, dan persetujuan peluncuran. Persetujuan peluncuran di fase ini terpisah dari persetujuan Fase 0 dan tidak boleh dianggap sudah diberikan oleh dokumen ini.

## 5. Urutan dependensi antar fase dan pekerjaan yang bisa paralel

Urutan utama: Fase 0, lalu Fase 1, lalu Fase 2, lalu Fase 3, lalu Fase 4, lalu Fase 5 dan Fase 6, lalu Fase 7, lalu Fase 8. Urutan ini adalah urutan dependensi, bukan jadwal. Dokumen ini tidak memberi tanggal atau durasi.

Tabel urutan dalam bentuk daftar:

1. Fase 0 menjadi prasyarat untuk semua fase. Tidak ada fase yang dimulai sebelum Fase 0 lolos, termasuk Gerbang Arsitektur yang lolos dan keputusan status K6 yang tercatat. Register Keputusan di Bagian 3.2 mengatur keputusan mana yang harus final sebelum tiap fase; tidak ada fase yang memulai coding modulnya bila keputusan prasyarat modul itu menurut register belum dibuat.
2. Fase 1 menjadi prasyarat untuk Fase 2 sampai Fase 8.
3. Fase 2 menjadi prasyarat untuk Fase 3, Fase 4, Fase 5, Fase 6, dan Fase 7.
4. Fase 3 menjadi prasyarat untuk Fase 4 dan Fase 5.
5. Fase 4 menjadi prasyarat untuk Fase 5, Fase 6, dan Fase 7.
6. Fase 6 menjadi prasyarat untuk bagian order di Fase 7 dan untuk peluncuran di Fase 8.
7. Fase 8 menjadi penutup dan tidak dimulai sebelum semua exit gate lintas fase di Bagian 6 diperiksa.

Pekerjaan yang bisa paralel, dengan syarat dependency masing-masing terpenuhi:

1. Penulisan konten template dan persiapan media dapat berjalan paralel dengan Fase 1 dan Fase 2, selama tidak mengubah keputusan stack dan tidak memakai data pelanggan.
2. Perancangan alur moderasi dan anti-spam Fase 5 dapat disiapkan paralel dengan Fase 3 dan Fase 4, selama implementasinya menunggu Fase 2 dan Fase 4 lolos.
3. Perancangan template notifikasi Fase 7 dapat disiapkan paralel dengan Fase 4, selama pengiriman menunggu email transaksional diputuskan dan Fase 2 lolos.
4. Perancangan rencana observability, backup, dan restore Fase 8 dapat disiapkan paralel dengan Fase 1, selama pengujian menunggu lingkungan production siap.
5. Pekerjaan yang tidak boleh paralel: implementasi production Fase 1 sampai Fase 8 tidak boleh dimulai sebelum Fase 0 mendapat keputusan PASS dan persetujuan Fase 1 terpisah; Architecture Gate PASS saja tidak mengizinkan implementasi. Implementasi checkout Fase 6 tidak boleh berjalan paralel dengan keputusan gateway dan harga yang belum diputuskan.

## 6. Exit gate lintas fase

Gate di bagian ini bukan catatan akhir. Tiap gate diperiksa pada titik yang disebut, dan bila gagal, pekerjaan berhenti atau kembali ke fase terkait sampai gate lolos atau owner memutuskan lain secara tertulis. Tidak ada gate yang dilewati diam-diam. Tidak ada angka yang dikarang di bagian ini.

### Gate keamanan

Kapan diperiksa: di akhir tiap fase yang menyentuh auth, data, upload, pembayaran, atau admin, dan secara menyeluruh di Fase 8. Bila gagal: temuan dicatat, perbaikan dilakukan di fase terkait, dan fase tidak dinyatakan lolos. Bila owner menerima risiko secara tertulis, penerimaan itu dicatat beserta alasannya dan tidak dianggap sebagai kelolosan gate.

### Gate aksesibilitas

Kapan diperiksa: di Fase 3 untuk renderer undangan publik, di Fase 4 untuk builder, dan secara menyeluruh di Fase 8. Bila gagal: temuan dicatat dan diperbaiki di fase terkait. Peluncuran tidak disetujui bila temuan yang disepakati sebagai blocker belum ditindaklanjuti.

### Gate responsif

Kapan diperiksa: di Fase 3 untuk undangan publik, di Fase 4 untuk builder, dan di Fase 8 untuk UAT. Bila gagal: tampilan yang rusak dicatat beserta perangkat dan ukuran layar yang diuji, lalu diperbaiki di fase terkait sebelum fase dinyatakan lolos.

### Gate OG preview

Kapan diperiksa: di Fase 0 untuk K1–K5 dan acceptance no-JavaScript essential fields, di Fase 3 untuk HTML/OG dan body per undangan, dan di Fase 8 untuk UAT. Selain metadata OG, HTML body tanpa JavaScript wajib menampilkan nama pasangan, jenis acara/upacara, tanggal/waktu masing-masing acara, nama venue, serta alamat venue sesuai keputusan owner 13 Nov 2026 pukul 00:29 WIB. Uji K6 (kartu WhatsApp aktual) terpisah dan bukan bukti gate ini; K6 tetap OPEN / UNVERIFIED. Bila salah satu essential field gagal terlihat, acceptance no-JS belum lulus dan Gate tidak boleh dinyatakan PASS; perbaiki hanya setelah izin fase yang sesuai dan jalankan ulang acceptance. OG tetap prasyarat crawler, bukan bukti kartu tampil.

### Gate tes otomatis dan browser

Kapan diperiksa: di tiap fase untuk tes yang relevan dengan fase itu, dan secara menyeluruh di Fase 8. Bila gagal: hasil tes yang gagal dicatat, perbaikan dilakukan, dan tes diulang sampai lolos. Tidak ada fase yang dinyatakan lolos dengan tes yang gagal tanpa keputusan tertulis owner.

### Gate backup dan restore

Kapan diperiksa: di Fase 1 saat prosedur pertama dibuat, dan di Fase 8 saat restore test diulang sebelum peluncuran. Bila gagal: restore diperbaiki dan diuji ulang. Peluncuran tidak disetujui bila restore belum teruji dan terdokumentasi.

### Gate observability

Kapan diperiksa: di Fase 1 untuk logging dasar, dan di Fase 8 untuk observability production sebelum peluncuran. Bila gagal: logging atau observability diperbaiki dan diuji ulang. Peluncuran tidak disetujui bila gangguan production tidak dapat dideteksi dan ditelusuri.

### Gate rollback

Kapan diperiksa: di Fase 1 untuk migrasi, dan di Fase 8 untuk staged cutover sebelum peluncuran. Bila gagal: rencana rollback diperbaiki dan diuji sejauh yang dapat diuji tanpa mengganggu production. Cutover tidak dijalankan bila rollback tidak jelas atau tidak dapat dijalankan.

## 7. Pemisahan MVP launch versus fitur pasca-MVP

MVP launch adalah hasil Fase 0 sampai Fase 8 yang sudah dikunci owner. Fitur di bawah ini adalah kandidat pasca-MVP secara eksplisit. Kandidat ini bisa ditunda bila menunda mengurangi risiko. Penundaan kandidat tidak mengubah keputusan terkunci di Bagian 3.

Kandidat pasca-MVP:

1. Template tambahan di luar katalog template awal yang dikunci di Fase 0.
2. Fitur builder lanjutan di luar draft server-side, autosave, dan publish yang dikunci di Fase 0.
3. Fitur guestbook lanjutan di luar moderasi dasar yang dikunci di Fase 0.
4. Integrasi pembayaran tambahan di luar gateway yang dipilih owner di Fase 6.
5. Otomasi notifikasi lanjutan di luar template notifikasi yang disetujui di Fase 7.
6. Laporan dan analitik lanjutan di luar activity log dan observability dasar.
7. Migrasi data prototype yang luas, bila owner belum memutuskan kebijakannya di Fase 8. Asumsi awal tetap berlaku: tidak ada pemindahan otomatis seluruh draft localStorage ke production.
8. Integrasi resmi React Router v8 framework mode plus Cloudflare Vite plugin, bila dipertimbangkan di kemudian hari. Opsi ini telah dievaluasi dalam perbandingan POC lokal terbaru (React Router/@react-router/dev 8.5.1 dan plugin 1.69.1), tetapi bukan stack final yang dipilih owner; integrasi produk tetap tidak disetujui atau dibangun.

Aturan pemisahan: bila satu fitur kandidat ternyata dibutuhkan untuk menutup risiko keamanan, aksesibilitas, backup, atau rollback, fitur itu tidak lagi diperlakukan sebagai pasca-MVP. Owner memutuskan perpindahan itu secara tertulis di fase terkait.

## 8. Daftar asumsi dan pernyataan bukan persetujuan

### Daftar asumsi

Item berlabel [ASUMSI] adalah dugaan yang belum menjadi fakta. Baris [FAKTA] mencatat batas pengujian yang dibuktikan atau keputusan yang sudah tercatat. Bila asumsi terbukti salah, fase terkait harus ditinjau ulang dan owner harus memutuskan langkah berikutnya.

1. [ASUMSI] Baseline V25 dan bukti POC yang dirujuk di Bagian 1 adalah acuan perencanaan ini. Laporan lengkap POC hanya tersedia lokal dan ditandai tidak terarsip di GitHub; bagian perencanaan yang bersandar pada laporan itu memakai angka yang dikutip dengan provenance di §3.1.1 dan §9, bukan rujukan yang seolah dapat dibuka pembaca.
2. [ASUMSI] Owner dan reviewer formal Lora tersedia untuk meninjau Fase 0 dan Gerbang Arsitektur; Harley tetap executor teknis.
3. [ASUMSI] Lingkungan dev, staging, dan production dapat dipisahkan sepenuhnya di Cloudflare sesuai rencana Fase 1.
4a. [ASUMSI] Payment gateway yang akan dipilih owner mendukung signature verification dan event verification untuk webhook — asumsi ini perlu diuji terhadap gateway terpilih setelah provider dipilih, dan BUKAN fakta sebelum provider dipilih. Tidak ada fitur gateway tertentu yang dinyatakan sebagai fakta di dokumen ini.
4b. [ASUMSI] Pemrosesan webhook di aplikasi bersifat idempotent, yaitu pengiriman ulang webhook tidak membuat order ganda — ini asumsi tentang perilaku aplikasi, terpisah dari verifikasi signature/event pada 4a, dan harus dibuktikan dengan pengujian di Fase 6. Pemisahan ini berlaku juga untuk risiko webhook di Fase 6: webhook yang tidak terverifikasi dan webhook yang tidak idempotent adalah dua kegagalan yang berbeda.
5. [ASUMSI] Draft server-side dapat dipulihkan setelah perangkat berganti, selama draft itu sudah tersimpan di server.
6. [ASUMSI] Data prototype localStorage tidak berpindah otomatis ke production, dan ekspor-impor lokal hanya dilakukan bila dibutuhkan dan bila owner menyetujuinya.
7. [ASUMSI] Template baru tidak mengubah undangan versi lama, selama versioning diterapkan sesuai Fase 3.
8. [FAKTA — batas pengujian] Kriteria K1–K5 menilai HTML/OG crawler dan tidak membuktikan kartu WhatsApp aktual. Requirement essential fields no-JavaScript adalah keputusan owner terpisah; kepatuhan teknisnya harus dibuktikan dengan GET/browser test lokal.
9. [ASUMSI] Tidak ada kebutuhan KV, Durable Objects, atau queues sampai ada kebutuhan terukur yang dicatat dan disetujui owner.
10. [ASUMSI] Harga prototype yang dikutip di Bagian 3 tetap menjadi acuan yang sah sampai owner memutuskan harga komersial final di Fase 6.

### Pernyataan eksplisit

Roadmap ini BUKAN persetujuan implementasi atau production deploy. Owner telah mengotorisasi Fase 0 sebatas perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman. Keputusan owner atas Fase 0 **SELESAI — PASS pada 13 November 2026 pukul 04:50 WIB** hanya menutup planning; keputusan itu tidak memperluas izin dan TIDAK mengizinkan product coding/scaffolding, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deployment, atau Fase 1. Architecture Gate PASS disetujui owner secara terpisah pada 13 November 2026 pukul 03:19 WIB; kedua keputusan itu tidak memberi otorisasi implementasi atau Fase 1. Fase 1 tetap **NOT APPROVED** dan memerlukan persetujuan owner terpisah. Persetujuan Fase 0 tidak sama dengan persetujuan peluncuran, yang memerlukan persetujuan tersendiri di Fase 8. Tidak ada janji keberhasilan/performa atau klaim bahwa roadmap menjamin hasil tertentu. Bila dokumen bertentangan dengan keputusan terkunci di Bagian 3, keputusan terkunci yang berlaku.

## 9. Riwayat revisi v0.1 ke v0.1.1 (catatan historis; aktifnya disupersesi §10)

Revisi ini hanya mengubah dokumentasi, berdasarkan temuan review terhadap v0.1 (prompt koreksi Lora, diteruskan 11 November 2026). Tidak ada file v25 yang diubah, tidak ada kode produk yang ditulis, tidak ada resource Cloudflare yang dibuat, dan tidak ada klaim status deployment apa pun di dokumen ini. File yang berubah: docs/ROADMAP-v0.1.md menjadi pointer ke dokumen ini, dan docs/ROADMAP-v0.1.1.md adalah dokumen ini (baru). Perubahan per koreksi:

1. Provenance hasil tes V25 (§3.1.1 baru; §3.1 butir 5 ditulis ulang): kronologi 360 dari 362 exit 1 pada commit V25 versus 362 dari 362 pada audit independen Lora 11 November 2026 pukul 12:07 WIB kini ditulis terpisah dan lengkap; catatan 360 dari 362 dipertahankan; tidak ada pernyataan bahwa V25 sendiri mencatat 362 dari 362; status APPROVED WITH MINOR NOTES ditandai sebagai verdict audit Lora, bukan klaim dari Muse.
2. Rujukan laporan POC (§1; Fase 0 dependency 1; §8 asumsi 1): rujukan yang seolah REPORT-poc-og.md dapat dibuka pembaca dihapus; diganti tautan ke branch poc/og-arch commit 93df620d dan jalur harness/bukti yang benar-benar terkomit. Verifikasi via GitHub API 11 November 2026: tree poc/og-arch (93df620d) berisi 66 blob; REPORT-poc-og.md tidak ada di tree itu; poc/tests/evidence/ tidak terkomit; tree main (70bb0641) juga tidak berisi REPORT-poc-og.md. Laporan lengkap ditandai tidak terarsip di GitHub; langkah reproduksi terperinci tidak ditulis ulang dari laporan lokal.
3. Status stack provisional (§2; Caveat 1 dan 2 dipertahankan dan dipertegas): Hono plus React/Vite/TypeScript tetap rekomendasi kerja, bukan keputusan final; POC membuktikan HTML OG dan alur teknis K1 sampai K5, bukan kartu WhatsApp aktual; varian React Router yang dibandingkan adalah React Router 7.18.5 framework-less SSR, bukan React Router v8 dengan Cloudflare Vite plugin resmi; tidak ada klaim Hono menang atas React Router secara umum.
4. Makna gate Fase 0 (§1; §2 tindakan ke-3; exit criteria Fase 0; pernyataan §8): persetujuan Fase 0 kini dinyatakan secara eksplisit hanya mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman — bukan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1. Fase 1 memerlukan persetujuan tersendiri.
5. Register Keputusan (§3.2 ditulis ulang): daftar keputusan terbuka kini berbentuk register dengan kolom keputusan, wajib dibuat sebelum coding modul apa, boleh ditunda ke fase mana, pemutus, kapan dibutuhkan, dan konsekuensi/blocker bila ditunda. Register diperiksa konsistensinya terhadap tabel fase (§5) dan exit criteria tiap fase (§4); tidak ada ketidakkonsistenan yang ditemukan — dependency Fase 1, 2, 4, 6, 7, dan 8 semuanya cocok dengan kolom register. Dokumen tidak lagi menyiratkan semua keputusan fase 4/6/8 harus final sebelum seluruh Fase 0 selesai.
6. Acceptance metadata sosial (§2 Caveat 1; Fase 0 deliverables dan exit criteria; Gerbang Arsitektur; §6 Gate OG preview): HTML OG dinyatakan sebagai bukti prasyarat crawler, bukan bukti kartu WhatsApp tampil; K6 dicatat belum terbukti; Fase 0 kini meminta owner memilih secara eksplisit antara (a) kartu aktual wajib diuji sebelum keputusan stack final, atau (b) K6 boleh tetap terbuka sampai tersedia cara uji yang aman. Pilihan ini menjadi keputusan register dan prasyarat gerbang. Tidak ada pengiriman pesan atau tautan ke kontak nyata dalam pengujian apa pun.
7. Asumsi pembayaran/webhook (§8): asumsi 4 dipecah menjadi 4a (dukungan gateway untuk signature/event verification — asumsi yang perlu diuji terhadap gateway terpilih, bukan fakta) dan 4b (idempotensi pemrosesan di aplikasi — terpisah dari verifikasi signature/event, dibuktikan dengan pengujian di Fase 6). Tidak ada fitur gateway tertentu yang dinyatakan sebagai fakta sebelum provider dipilih.

Status review Agent Meta pada saat dokumen ini ditulis: masih menunggu (belum diterima). Gerbang Arsitektur tidak dapat lolos tanpa review itu diterima dan keberatannya dijawab; bila belum diterima saat gerbang dinilai, gerbang dinyatakan tidak lolos. Fase 0 belum disetujui owner pada saat dokumen ini ditulis; persetujuan itu tetap milik owner.


## 10. Riwayat revisi v0.1.1 ke v0.1.2

| | |
|---|---|
| Versi sebelumnya | Roadmap v0.1.1, commit sumber `c7b4e36fe900e0a47a927f20dd6ab477eeed013f` |
| Versi ini | Roadmap v0.1.2, 13 November 2026 |
| Branch | `docs/roadmap-v0.1.2`, dibuat langsung dari commit sumber v0.1.1 tersebut |
| Batas | Dokumentasi saja pada repository; POC no-JS berada di salinan disposable lokal terpisah. Tidak mengubah Decision Pack, D1–D10, product code, konfigurasi/resource Cloudflare, Worker, atau production; tidak ada deployment atau URL eksternal dikirim. |
| Pemicu | Keputusan owner 13 Nov 2026 00:29 WIB: essential information invitation must render without JavaScript; rekonsiliasi reviewer Lora dan fakta perbandingan RR8 resmi yang telah diverifikasi. |

Perubahan utama v0.1.2:

1. Memutakhirkan status perencanaan sesuai Decision Pack v0.1.10: M1–M8 diterima, K1–K5 disetujui sebagai masukan lokal, stack final Hono + React + TypeScript + Vite, K6 OPEN / UNVERIFIED, Fase 0 berjalan, Gate NOT PASSED, dan Fase 1 NOT APPROVED.
2. Mengganti referensi aktif reviewer retired Agent Meta menjadi Lora sebagai reviewer formal (Harley sebagai executor), sambil mempertahankan rujukan lama hanya di sejarah revisi v0.1.1.
3. Mengganti pernyataan aktif pembanding RR7 framework-less dengan bukti komparasi RR8 v8 framework mode + Cloudflare Vite plugin v1.69.1; riwayat v0.1.1 tidak dihapus.
4. Mencatat keputusan owner no-JavaScript essential fields dan acceptance test GET/browser untuk sedikitnya dua fixture, termasuk isolasi data. POC disposable lokal kini lulus tes GET/browser JS-off dan regression JS-on; hasil ini adalah bukti planning/POC saja, bukan kesiapan produk, dan K1–K5 tetap hasil pembanding terpisah.
5. Menambahkan crosswalk sembilan exit criteria Fase 0 dan kondisi masuk/keluar Architecture Gate, membedakan checkpoint dokumentasi/approval dari kesiapan teknis. Tidak menyatakan Gate PASS atau Phase 0 PASS.
6. D1–D10 tidak diubah; status/penundaan dan deadline tetap mengikuti register yang berlaku.
7. Lora mereview POC no-JS/Roadmap pada 13 Nov 2026 pukul 00:49 WIB dengan verdict APPROVED WITH MINOR NOTES. Minor note tentang browser hero values yang belum fail-closed ditangani dengan exact fixture comparisons pada JS-off/JS-on; rerun evidence exit 0 dan `hero_fields` true untuk empat kombinasi. Pada 00:53 WIB Lora mengonfirmasi minor note tertutup, tanpa blocker baru.

Pada revisi ini, acceptance essential no-JS **LULUS pada POC Hono/React disposable lokal** untuk dua fixture; ini tidak menyatakan requirement sudah diimplementasikan di produk atau kesiapan production. K1–K5 tidak dijalankan ulang pada varian POC ini. Lora memberi APPROVED WITH MINOR NOTES dan mengonfirmasi minor note hero assertion tertutup. Decision Pack v0.1.10 belum diubah dan memerlukan follow-up dokumentasi-only: catat keputusan owner no-JS beserta hasil GET/browser dan batas POC-only; verdict Lora dan disposisi minor note; perbedaan acceptance K1–K5 lama dari tes no-JS lokal; status crosswalk sembilan exit criteria (#6 review selesai, #7 Gate masih pending, #8 Fase 0 pending); pertahankan Gate NOT PASSED hingga keputusan owner. Jangan ubah D1–D10 atau mengklaim Phase 0 PASS/Phase 1. Revisi ini bukan keputusan Fase 0 PASS/FAIL, bukan Architecture Gate PASS/FAIL, bukan izin coding/implementasi/Fase 1, provisioning, atau deployment.

## 11. Riwayat revisi v0.1.2 ke v0.1.3
| | |
|---|---|
| Versi sebelumnya | Roadmap v0.1.2, commit sumber `b7f11138408a9a5add4b30f17edd4b5157045b25` |
| Versi ini | Roadmap v0.1.3, 13 November 2026 — dokumentasi-only |
| Branch | `docs/roadmap-v0.1.3`, dibuat langsung dari parent v0.1.2 `b7f11138408a9a5add4b30f17edd4b5157045b25` |
| Acuan Decision Pack | Decision Pack v0.1.12, branch `docs/phase0-planning-v0.1.12`, dari parent v0.1.11 `64fdb04fdef68d6374e25d13c840f7a36a1425a0` |
| Pemicu | Keputusan eksplisit owner untuk Architecture Gate PASS pada 13 November 2026 pukul 03:19 WIB |
| Batas | Satu file dokumen roadmap ini saja; tidak mengubah D1–D10, K6, product code, POC, Cloudflare, Worker, production, deployment, atau `main`. |

Perubahan v0.1.3:
1. Mencatat Architecture Gate **PASS berdasarkan keputusan eksplisit owner** pada 13 November 2026 pukul 03:19 WIB; Roadmap criterion #7 selesai sebagai keputusan owner.
2. Menegaskan Fase 0 tetap **SEDANG BERJALAN**, owner belum memutuskan Phase 0 PASS/FAIL (criterion #8 pending), dan Fase 1 **NOT APPROVED**. Gate PASS bukan Phase 0 completion atau Phase 1 authorization.
3. Memutakhirkan metadata, status aktif, crosswalk, kondisi/exit Gate, langkah berikutnya, serta acuan aktif ke Decision Pack v0.1.12.
4. K6 tetap **OPEN / UNVERIFIED** dan D1–D10 tetap sesuai status/deadline/blocker sebelumnya. Riwayat v0.1.2 dan sebelumnya dipertahankan sebagai catatan historis, bukan status terkini.


## 12. Riwayat revisi v0.1.3 ke v0.1.4 (catatan historis; status aktif di §§1–8)

| | |
|---|---|
| Versi sebelumnya | Roadmap v0.1.3, branch `docs/roadmap-v0.1.3`, commit sumber `2dcee58efd4e46ddf231883e587b64e4cc7e0096` |
| Versi ini | Roadmap v0.1.4, 13 November 2026 — dokumentasi-only |
| Branch revisi | `docs/roadmap-v0.1.4`, dibuat langsung dari parent v0.1.3 tersebut |
| Acuan Decision Pack | Decision Pack v0.1.13, branch `docs/phase0-planning-v0.1.13`, commit `83effede4b49022428d4f090d10e926298aa959b` (parent tepat `0012c826149d0e0f650e9d1ebc2dc57a9d0e8a0c`) |
| Pemicu revisi | Keputusan eksplisit owner menetapkan Fase 0 **SELESAI — PASS pada 13 November 2026 pukul 04:50 WIB** |
| Batas | Satu dokumen Roadmap baru saja; D1–D10, M1–M8, K6, dan stack tidak diubah. Tidak mengubah dokumen Decision Pack, product code/POC source, Cloudflare, Workers, production, deployment, branch lain, atau `main`. |

Perubahan v0.1.4:
1. Mencatat keputusan eksplisit owner Fase 0 **SELESAI — PASS** pada 13 November 2026 pukul 04:50 WIB; memperbarui status aktif, langkah setelah Fase 0, exit criterion #8, crosswalk sembilan kriteria, dan kesimpulan/penutup.
2. Mempertahankan Architecture Gate **PASS** (03:19 WIB), K6 **OPEN / UNVERIFIED** dan tidak diuji, status serta tenggat D1–D10, scope M1–M8, dan stack final Hono + React + TypeScript + Vite. Pilihan owner agar K6 tetap terbuka dipenuhi sebagai keputusan dan tidak menghalangi Gate/Phase 0 PASS.
3. Menegaskan Phase 0 PASS hanya menutup planning; Fase 1 tetap **NOT APPROVED** dan memerlukan persetujuan owner terpisah. Tidak ada izin coding/scaffolding/implementasi, provisioning, konfigurasi production, atau deployment.
4. Memperbaiki redaksi aktif register K6 yang sebelumnya menyiratkan Gate tidak dapat diputuskan bila K6 OPEN. Riwayat v0.1.3 dan sebelumnya dipertahankan sebagai sejarah, bukan status aktif.

Revisi ini dokumentasi-only. Tidak ada implementasi, perubahan akun/konfigurasi production, provisioning, atau deployment.
