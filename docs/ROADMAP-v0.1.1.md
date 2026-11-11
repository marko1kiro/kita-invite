# Kita Invite Production Implementation Roadmap v0.1.1

## 1. Judul dan metadata

Judul: Kita Invite Production Implementation Roadmap v0.1.1

Versi: v0.1.1

Tanggal: 11 November 2026 (revisi v0.1.1 dari v0.1 pada hari yang sama; riwayat revisi di Bagian 9)

Status: DRAFT untuk ditinjau owner — menggantikan v0.1. Dokumen ini BUKAN persetujuan implementasi, BUKAN persetujuan Fase 0, dan BUKAN persetujuan production deploy.

Baseline produk: Stage 2 V25, commit 68bf66ceb62e2182a6559fe7a238d354568e7cbf (provenance hasil tes di §3.1.1)

Baseline POC: branch poc/og-arch, commit 93df620d016562235c79238299c0f5491a8ca538

Laporan POC: laporan lengkap REPORT-poc-og.md HANYA tersedia lokal (~/workspace/kita-invite-refactor/REPORT-poc-og.md) dan TIDAK terarsip di GitHub — diverifikasi via GitHub API pada 11 November 2026: tidak ada di tree branch poc/og-arch commit 93df620d (66 blob; tidak ada REPORT-poc-og.md; tidak ada poc/tests/evidence/) dan tidak ada di tree main commit 70bb0641. Rujukan yang dapat dibuka pembaca adalah kode dan harness POC yang benar-benar terkomit di branch poc/og-arch: fixture di https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/shared/fixture.json, varian A di https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/og-a/src/worker.ts, varian B di https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/og-b/src/entry.server.tsx, dan harness di https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/tests/run-tests.mjs serta https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/tests/local-server.mjs. Bukti run (HTML mentah, screenshot, results.json) tidak terkomit; angka hasil tes yang dikutip di dokumen ini berasal dari laporan lokal tersebut dan dicatat dengan provenance di §3.1.1 dan §9. Langkah reproduksi terperinci tidak ditulis ulang di sini karena hanya ada di laporan lokal yang tidak terarsip.

Penegasan: dokumen ini HANYA dokumen perencanaan untuk ditinjau owner. Dokumen ini BUKAN persetujuan implementasi. Dokumen ini BUKAN persetujuan production deploy. Tidak ada pekerjaan implementasi yang dimulai atas dasar dokumen ini saja. Owner harus menyetujui Fase 0 lebih dulu sebelum pekerjaan lanjut dibahas. Persetujuan Fase 0 HANYA mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; persetujuan Fase 0 TIDAK mengizinkan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1 — Fase 1 memerlukan persetujuan tersendiri dari owner. Lihat Bagian 8 untuk pernyataan lengkapnya.

Ruang lingkup dokumen: urutan kerja, keputusan yang harus dibuat owner, gerbang pemeriksaan, dan pemisahan MVP dengan fitur pasca MVP. Dokumen ini tidak berisi kode produk, tidak mengubah deployment yang ada, dan tidak menggantikan review Agent Meta atau acceptance test.

Catatan penulisan: angka yang dikutip di dokumen ini hanya angka yang sudah ada sebagai fakta di baseline atau bukti POC yang terukur. Angka itu ditulis sebagai fakta atau acuan, bukan sebagai target. Segala hal yang belum ada angkanya ditulis sebagai belum diputuskan atau sebagai syarat kualitatif tanpa angka.

## 2. Ringkasan satu halaman

### Rekomendasi stack kerja

Rekomendasi kerja, bukan keputusan final: React plus TypeScript plus Vite untuk antarmuka; Hono di Cloudflare Worker untuk API di jalur /api/v1 dan untuk HTML awal route undangan dengan metadata OG dinamis; D1 untuk data relasional; R2 untuk media. Jangan tambahkan KV, Durable Objects, atau queues sampai ada kebutuhan terukur. Migrasi SQL terkontrol. ORM seperti Drizzle hanya rekomendasi opsional, bukan keputusan wajib.

POC membandingkan dua varian. Varian A adalah Hono plus React 19 plus Vite 7 plus TypeScript, Worker ki-og-poc-a, di https://ki-og-poc-a.xdirgawa.workers.dev, bundle 431.881 byte, SHA 013cc380f800b89e6827f9885d94df986b025388e22ab885f70b855819b96e08. Varian B adalah React Router SSR framework-less, React 18 plus Vite 6, Worker ki-og-poc-b, di https://ki-og-poc-b.xdirgawa.workers.dev, bundle 664.078 byte, SHA c91c01cf817e26190584056fa2f1da9394a6a8a74f2538b1fc1968f4f82ff699. Kedua varian lolos kriteria K1 sampai K5 di 8 run harness, dengan 125 cek per run. Smoke A 59 dari 59, smoke B 62 dari 62. Rebuild dari clone bersih menghasilkan byte yang identik.

POC merekomendasikan Varian A dengan alasan satu lapisan routing eksplisit, tanpa kelas bug hydration, bundle 35 persen lebih kecil, dan satu pola Hono untuk API dan halaman. Rekomendasi ini diperlakukan sebagai REKOMENDASI KERJA yang tetap PROVISIONAL, bukan keputusan final. POC membuktikan HTML OG dan alur teknis kriteria K1 sampai K5; POC TIDAK membuktikan kartu WhatsApp aktual (K6 belum terverifikasi, lihat Caveat 1). Dokumen ini tidak mengklaim salah satu framework menang mutlak, dan tidak mengklaim Hono menang atas React Router secara umum. Keputusan final diambil di Gerbang Arsitektur di Fase 0, setelah review Agent Meta dan acceptance test OG.

Temuan POC yang relevan untuk perencanaan: bug hydration pada varian B, yaitu HydratedRouter hanya tersedia di framework-mode, diperbaiki dengan createBrowserRouter; error 1042, yaitu workers.dev per script harus diaktifkan via API; dan trade-off varian A, yaitu HTML awal hanya shell plus OG plus JSON, sehingga tanpa JS undangan tidak terbaca. Dua Worker POC, ki-og-poc-a dan ki-og-poc-b, sedang dipertahankan sebagai demo. Dokumen ini tidak memerintahkan penghapusan atau perubahan terhadap keduanya.

### Keputusan owner yang harus dibuat SEBELUM coding

Owner harus memutuskan sebelum coding dimulai: kunci MVP, ADR stack, dan hasil Gerbang Arsitektur, serta status tiap keputusan terbuka sesuai Register Keputusan di Bagian 3.2. Register itu membedakan keputusan yang wajib final di Fase 0 (kunci MVP, pilihan stack final di Gerbang Arsitektur, dan keputusan eksplisit tentang status K6) dari keputusan yang arahnya ditetapkan di Fase 0 tetapi nilai akhirnya boleh ditunda ke fase yang menjadi pemiliknya (auth provider, payment gateway, domain, email transaksional, Cloudflare plan, batas dan retensi draft Free, aturan order sudah dibayar tapi belum dipublikasi, harga komersial final, kebijakan migrasi). TIDAK benar bahwa semua keputusan itu harus final sebelum seluruh Fase 0 selesai; sebaliknya, coding suatu modul TIDAK BOLEH dimulai bila keputusan yang menjadi prasyarat modul itu menurut register belum dibuat. Tanpa Fase 0 yang lolos, Fase 1 dan seterusnya tidak memiliki dasar yang cukup untuk dimulai.

### 3 tindakan berikutnya

1. Owner meninjau dokumen ini dan Bagian 3, lalu menyatakan keputusan atas tiap keputusan terbuka yang menjadi prasyarat Fase 0, atau menyatakan mana yang ditunda dengan sadar beserta konsekuensinya.
2. Tim menyiapkan ADR stack dan acceptance test OG atau crawler serta test kartu WhatsApp yang aman, lalu menjalankan Gerbang Arsitektur sesuai kriteria masuk dan keluar di Fase 0.
3. Owner menyetujui atau menolak hasil Fase 0 secara eksplisit, dan menyatakan apakah gerbang Fase 0 LULUS atau GAGAL. Persetujuan Fase 0 HANYA mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; persetujuan itu TIDAK mengizinkan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1 — Fase 1 memerlukan persetujuan tersendiri. Bila Fase 0 gagal atau ada blocker yang belum diputuskan, pekerjaan berhenti pada perencanaan dan tidak otomatis memulai Fase 1.

### Dua caveat POC, wajib dibaca sebelum keputusan apa pun

Caveat 1: POC BELUM membuktikan kartu WhatsApp sebenarnya. Kriteria K6 belum terverifikasi. Tidak ada cara aman melihat kartu tanpa mengirim pesan ke penerima nyata. OG HTML yang benar hanya prasyarat, bukan bukti kartu tampil. Karena itu, acceptance test OG di Fase 0 tidak boleh ditulis sebagai bukti kartu WhatsApp tampil.

Caveat 2: Varian React Router yang dibandingkan BUKAN integrasi resmi React Router v8 plus Cloudflare Vite plugin. Yang diuji adalah React Router 7.18.5 framework-less SSR. Karena itu, perbandingan POC tidak boleh dibaca sebagai penilaian atas integrasi resmi tersebut. Bila integrasi resmi dipertimbangkan di kemudian hari, ia harus dinilai tersendiri sebagai pekerjaan baru, bukan sebagai kesimpulan dari POC ini.

## 3. Keputusan terkunci versus keputusan terbuka

Bagian ini memisahkan dengan tegas apa yang sudah terkunci dari apa yang masih terbuka. Keputusan terkunci ditulis apa adanya, tanpa diubah, tanpa ditambah angka. Keputusan terbuka harus menyebut siapa yang memutuskan dan kapan dalam urutan fase.

### 3.1 Keputusan terkunci

1. Semua akun baru Free. Free boleh edit semua template dan menyimpan draft. Batas jumlah draft dan retention atau TTL masih belum diputuskan.
2. Paket ditentukan oleh versi template yang dipilih. Basic 1 bulan, Premium 6 bulan, Signature 12 bulan, Exclusive 18 bulan. Masa aktif mulai saat undangan dipublikasikan, bukan saat pembayaran. Expiry akhir bulan 23:59:59 WIB. Tanggal acara tidak menutup undangan.
3. Harga prototype Basic Rp29.000, Premium Rp59.000, Signature Rp99.000, Exclusive mulai Rp149.000 adalah acuan prototype, bukan otomatis harga komersial final.
4. Data prototype localStorage bersifat per perangkat atau pengguna. Jangan diasumsikan seluruh draft otomatis berpindah ke production. Seed prototype hanya data fiktif, bukan data pelanggan.
5. Stage 2 V25 diterima sebagai APPROVED WITH MINOR NOTES berdasarkan verdict audit independen Agent Lora (11 November 2026 pukul 12:07 WIB, via Cue). Status ini adalah baseline, bukan persetujuan production. Angka dan kronologi hasil tes dicatat di §3.1.1 — angka 362 dari 362 adalah hasil audit belakangan, bukan catatan commit V25.

### 3.1.1 Provenance hasil tes V25 (kronologi, jangan dicampur)

Kronologi ini membedakan catatan tes pada commit V25 dari audit independen setelahnya. Kedua angka dipertahankan; keduanya benar pada waktunya masing-masing, dan tidak boleh ditukar.

1. Catatan pada commit V25 (commit 68bf66ceb62e2182a6559fe7a238d354568e7cbf, TESTS.md yang terkomit di commit itu): `npm run test:e2e` berakhir exit 1 dengan ringkasan 360 dari 362 PASS. Dua FAIL yang dikenal, keduanya gate font wordmark di modul regression (Playfair Display 700 dan Manrope 700 tidak tersedia di runtime tes; document.fonts berisi 0 face). Semua check lain lolos: modul 2a 38 dari 38, 2b 49 dari 49, 2c 67 dari 67, 2d 48 dari 48, 2e 37 dari 37, 2f 31 dari 31, dan regression 90 dari 92. Tes fixture 172 dari 172 dan tes handler 63 dari 63 lolos dengan exit 0.
2. Audit independen Lora yang lebih baru (11 November 2026 pukul 12:07 WIB, via Cue): Lora mengulang dari clone bersih dengan font termuat dan menghasilkan E2E 362 dari 362, beserta fixture 172 dari 172 dan handler 63 dari 63.
3. Setelah audit itu, Stage 2 diterima sebagai APPROVED WITH MINOR NOTES. Status approval ini adalah verdict audit Lora, bukan klaim dari Muse.

Aturan penulisan yang berlaku untuk dokumen ini: JANGAN menyatakan V25 sendiri mencatat 362 dari 362. Bila angka 362 dari 362 dikutip, sebut sumbernya sebagai audit independen Lora pada 11 November 2026 pukul 12:07 WIB. Bila angka commit V25 dikutip, tulis 360 dari 362 dengan exit 1 dan dua gate font.
6. Dua Worker POC ki-og-poc-a dan ki-og-poc-b dipertahankan sebagai demo. Jangan hapus, jangan ubah.

### 3.2 Register Keputusan (keputusan terbuka)

Register ini adalah acuan tunggal untuk urutan keputusan. Setiap baris menyatakan keputusan, modul apa yang tidak boleh di-coding sebelum keputusan itu dibuat, ke fase mana keputusan boleh ditunda, siapa pemutusnya, kapan keputusan dibutuhkan, dan konsekuensi atau blocker bila ditunda.

Aturan yang mengikat register ini: (1) TIDAK semua keputusan harus final sebelum seluruh Fase 0 selesai — hanya kunci MVP, pilihan stack final, dan keputusan status K6 yang wajib final di Fase 0; keputusan lain mengikuti kolom "boleh ditunda". (2) Coding suatu modul TIDAK BOLEH dimulai bila keputusan yang menjadi prasyarat modul itu menurut register belum dibuat. Register ini sudah diperiksa konsistensinya terhadap tabel fase (§5) dan exit criteria tiap fase (§4): dependency Fase 1 (arah domain dan Cloudflare plan), Fase 2 (auth provider dipilih), Fase 4 (batas draft diputuskan atau penundaan sadar dicatat), Fase 6 (gateway dipilih, harga final diputuskan, aturan order diputuskan — checkout tidak dibuka tanpanya), Fase 7 (email dipilih, template disetujui), dan Fase 8 (kebijakan migrasi diputuskan) semuanya cocok dengan kolom register di bawah; tidak ada ketidakkonsistenan yang ditemukan saat revisi v0.1.1.

| Keputusan | Wajib dibuat sebelum coding modul apa | Boleh ditunda ke fase mana | Pemutus | Kapan dibutuhkan | Konsekuensi / blocker bila ditunda |
|---|---|---|---|---|---|
| Kunci MVP (cakupan MVP vs pasca-MVP) | Semua modul produk (Fase 1 dan seterusnya) | Tidak boleh ditunda — wajib final di Fase 0 | Owner | Fase 0, sebelum Fase 0 keluar | Fase 0 tidak dapat lolos; tidak ada fase lanjut yang dimulai |
| Pilihan stack final di Gerbang Arsitektur, termasuk nasib React Router SSR sebagai alternatif | Semua coding produk (Fase 1 dan seterusnya) | Tidak boleh ditunda — wajib final di Fase 0, di Gerbang Arsitektur | Owner, setelah review Agent Meta dan acceptance test OG | Fase 0, di Gerbang Arsitektur | Gerbang tidak lolos; tidak ada coding production yang dimulai |
| Status K6 kartu WhatsApp: (a) kartu aktual wajib diuji sebelum keputusan stack final, atau (b) K6 boleh tetap terbuka sampai tersedia cara uji yang aman | Keputusan stack final di Gerbang Arsitektur | Tidak boleh ditunda — wajib diputuskan eksplisit di Fase 0 | Owner | Fase 0, sebelum Gerbang Arsitektur diputuskan | Gerbang tidak dapat diputuskan; Fase 0 tidak lolos. Bila pilihan (a) diambil dan belum ada cara uji yang aman, gerbang tertahan sampai bukti uji yang aman ada |
| Auth provider | Fase 2 (auth, roles, data) | Nilai akhir boleh ditunda sampai sebelum Fase 2 dimulai; arah ditetapkan di Fase 0 | Owner | Sebelum Fase 2 dimulai | Fase 2 tidak dapat dimulai (blocker); Fase 0 dan Fase 1 tidak terpengaruh |
| Domain | Konfigurasi production di Fase 1 | Penetapan final boleh ditunda ke Fase 1; arah ditetapkan di Fase 0 | Owner | Sebelum provisioning production di Fase 1 | Fase 1 dapat berjalan untuk dev/staging, tetapi provisioning production tertahan |
| Cloudflare plan | Provisioning production di Fase 1 | Penetapan final boleh ditunda ke Fase 1; arah ditetapkan di Fase 0 | Owner | Sebelum provisioning production di Fase 1 | Provisioning production tertahan; Fase 1 dev/staging tidak terpengaruh |
| Email transaksional (provider) | Notifikasi di Fase 7 | Pilihan provider boleh ditunda sampai sebelum Fase 7; isi template diputuskan di Fase 7 | Owner | Sebelum Fase 7 membangun notifikasi | Fase 7 tidak dapat membangun dan menguji notifikasi |
| Payment gateway | Integrasi checkout di Fase 6 | Pilihan arah di Fase 0; pengesahan akhir boleh ditunda ke Fase 6 | Owner | Sebelum integrasi webhook di Fase 6 | Fase 6 tidak dapat memulai integrasi; checkout tetap tertutup |
| Harga komersial final | Pembukaan checkout di Fase 6 | Boleh ditunda ke Fase 6 (bukan prasyarat Fase 0) | Owner | Sebelum checkout dibuka di Fase 6 | Checkout tidak dibuka; fase lain tidak terpengaruh |
| Aturan order sudah dibayar tapi belum dipublikasi | Pembukaan checkout di Fase 6 | Arah di Fase 0; aturan final boleh ditunda ke Fase 6 | Owner | Sebelum checkout dibuka di Fase 6 | Checkout tidak dibuka; order yang sudah dibayar tidak memiliki penanganan yang diputuskan |
| Batas jumlah draft dan retention/TTL draft Free | Penerapan batas/TTL apa pun di Fase 4 | Penetapan final boleh ditunda ke Fase 4; arah ditetapkan di Fase 0 | Owner | Sebelum batas atau TTL apa pun diterapkan di Fase 4 | Fase 4 berjalan tanpa batas/TTL yang diterapkan; JANGAN menerapkan batas atau TTL sebelum owner memutuskan |
| Kebijakan migrasi data prototype | Migrasi/UAT di Fase 8 | Boleh ditunda ke Fase 8 | Owner | Sebelum migrasi atau UAT di Fase 8 | Tidak ada migrasi yang dilakukan; UAT berjalan tanpa data prototype yang dimigrasikan |

## 4. Fase 0 sampai Fase 8

Setiap fase di bawah ini memiliki keenam elemen berikut: tujuan, deliverables, dependency, exit criteria, risiko, dan keputusan owner. Tidak ada fase yang dimulai sebelum dependency dan keputusan owner prasyaratnya terpenuhi.

### Fase 0. Pra-build: kunci MVP, keputusan terbuka, ADR stack, acceptance test OG atau crawler dan test kartu WhatsApp yang aman

#### Tujuan

Mengunci apa yang termasuk MVP dan apa yang tidak, menyelesaikan atau menjadwalkan secara eksplisit tiap keputusan terbuka yang menjadi prasyarat, mendokumentasikan ADR stack, dan menyiapkan acceptance test OG atau crawler serta test kartu WhatsApp yang aman sebelum satu baris kode production ditulis.

#### Deliverables

1. Daftar MVP yang dikunci dan disetujui owner, beserta daftar fitur yang dinyatakan pasca MVP.
2. Daftar keputusan terbuka beserta status tiap item: diputuskan, ditunda dengan sadar, atau belum diputuskan dan menjadi blocker — mengikuti Register Keputusan di Bagian 3.2.
3. ADR stack yang mencatat rekomendasi kerja, alternatif yang dipertimbangkan, dan alasan yang bersumber dari POC.
4. Acceptance test OG atau crawler yang tertulis dan dapat diulang, beserta hasil run awalnya.
5. Rencana test kartu WhatsApp yang aman, yang menjelaskan dengan jujur batasannya, yaitu kartu sebenarnya belum terbukti di POC dan tidak ada pengiriman ke penerima nyata tanpa persetujuan dan tanpa penerima uji yang sah.
6. Keputusan eksplisit owner tentang status K6 kartu WhatsApp: pilihan (a) kartu aktual wajib diuji sebelum keputusan stack final, atau (b) K6 boleh tetap terbuka sampai tersedia cara uji yang aman — beserta konsekuensinya terhadap Gerbang Arsitektur (lihat §3.2). Tidak ada pengiriman pesan atau tautan ke kontak nyata dalam pengujian apa pun.
7. Review Agent Meta: tinjauan tertulis dengan verdict dan keberatan yang harus dijawab. Status pada saat dokumen ini ditulis: masih menunggu (belum diterima). Bila review belum diterima saat gerbang dinilai, kriteria masuk gerbang tidak terpenuhi dan gerbang dinyatakan tidak lolos.
8. Hasil Gerbang Arsitektur, lihat subbagian Gerbang Arsitektur di bawah.

#### Dependency

1. Baseline V25 dan bukti POC yang terkomit di branch poc/og-arch (rujukan di §1); laporan lengkap POC hanya tersedia lokal dan ditandai tidak terarsip di GitHub.
2. Ketersediaan owner untuk meninjau dan memutuskan.
3. Ketersediaan reviewer Agent Meta untuk review arsitektur.

#### Exit criteria

1. MVP dikunci secara tertulis dan disetujui owner.
2. Tiap keputusan terbuka prasyarat memiliki status yang jelas, dan tidak ada blocker yang disembunyikan.
3. ADR stack selesai dan dapat dirujuk oleh fase berikutnya.
4. Acceptance test OG atau crawler dapat dijalankan ulang dan hasilnya terdokumentasi.
5. Keputusan eksplisit owner tentang status K6 sudah tercatat (pilihan a atau b), dan konsekuensinya terhadap gerbang sudah diterapkan.
6. Review Agent Meta sudah diterima dan keberatannya dijawab, atau gerbang dinyatakan tidak lolos karena review belum diterima.
7. Gerbang Arsitektur mencapai keputusan yang tercatat, lolos atau tidak lolos, dengan alasan tertulis.
8. Hasil Fase 0 dinyatakan secara eksplisit sebagai LULUS atau GAGAL. Bila gagal atau ada blocker yang belum diputuskan, pekerjaan berhenti pada perencanaan dan tidak otomatis memulai Fase 1.
9. Makna persetujuan Fase 0 sudah dicatat dan disetujui owner: persetujuan Fase 0 HANYA mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; persetujuan itu TIDAK mengizinkan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1. Fase 1 memerlukan persetujuan tersendiri.

#### Risiko

1. MVP mengembang karena keputusan ditunda tanpa dicatat sebagai penundaan sadar.
2. Acceptance test OG ditulis seolah membuktikan kartu WhatsApp, padahal K6 belum terverifikasi.
3. Rekomendasi POC dibaca sebagai keputusan final, sehingga Gerbang Arsitektur dilewati.
4. Keputusan terbuka yang belum diputuskan terbawa diam-diam ke fase berikutnya dan memaksa pengerjaan ulang.

#### Keputusan owner

Owner memutuskan kunci MVP, status tiap keputusan terbuka prasyarat, ADR stack, keputusan eksplisit tentang status K6, dan hasil Gerbang Arsitektur. Tanpa persetujuan owner atas Fase 0, tidak ada fase lanjut yang dimulai. Persetujuan Fase 0 HANYA mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; persetujuan itu TIDAK mengizinkan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1.

#### Gerbang Arsitektur

Gerbang ini adalah SATU gerbang arsitektur yang ditinggalkan untuk keputusan owner setelah review Agent Meta dan acceptance test OG. Gerbang ini bukan formalitas. Gerbang ini memutuskan stack final untuk implementasi production.

Kriteria masuk gerbang: ADR stack selesai; acceptance test OG atau crawler sudah dijalankan dan hasilnya terdokumentasi; review Agent Meta sudah diterima; keputusan eksplisit owner tentang status K6 sudah tercatat; kedua caveat POC sudah dibaca dan dicatat dalam keputusan; daftar MVP sudah dikunci.

Kriteria keluar, lolos: review Agent Meta tidak menemukan keberatan yang belum dijawab; acceptance test OG lolos sesuai kriteria yang tertulis di Fase 0; trade-off varian A, yaitu HTML awal hanya shell plus OG plus JSON dan undangan tidak terbaca tanpa JS, sudah dipertimbangkan secara eksplisit dan diterima atau dimitigasi dengan rencana tertulis; status K6 sudah diputuskan secara eksplisit — bila pilihan (a) diambil, bukti uji kartu yang aman sudah ada sebelum gerbang lolos; bila pilihan (b) diambil, K6 dicatat tetap terbuka dan keputusan stack dibuat berdasarkan bukti K1 sampai K5 saja; status React Router SSR diputuskan secara eksplisit sebagai dipilih atau tidak dipilih, bukan dibiarkan menggantung; dan owner mencatat keputusan final secara tertulis.

Kriteria keluar, tidak lolos: salah satu kriteria masuk tidak terpenuhi; review Agent Meta menemukan keberatan yang belum dijawab; acceptance test OG gagal; keputusan status K6 belum dibuat; atau owner belum memutuskan. Bila gerbang tidak lolos, pekerjaan berhenti di gerbang. Tidak ada coding production yang dimulai untuk menutupi kegagalan gerbang. Tim mencatat apa yang gagal, apa yang harus diperbaiki, dan kapan gerbang diulang, tanpa mengarang tanggal atau durasi.

Kedua caveat POC berlaku penuh di gerbang ini. Pertama, kartu WhatsApp sebenarnya belum terbukti, K6 belum terverifikasi, dan OG HTML yang benar hanya prasyarat, bukan bukti kartu tampil. Kedua, varian React Router yang dibandingkan bukan integrasi resmi React Router v8 plus Cloudflare Vite plugin, melainkan React Router 7.18.5 framework-less SSR. Keputusan gerbang tidak boleh mengklaim sebaliknya.

### Fase 1. Fondasi Cloudflare: repo, CI atau CD, Worker, D1 atau R2, secrets, migrasi, logging, backup atau restore, dev atau staging atau production benar-benar terpisah

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

1. Fase 0 lolos, termasuk Gerbang Arsitektur dan keputusan owner atas Fase 0.
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
5. Pekerjaan yang tidak boleh paralel: implementasi production Fase 1 sampai Fase 8 tidak boleh berjalan paralel dengan Gerbang Arsitektur yang belum lolos. Implementasi checkout Fase 6 tidak boleh berjalan paralel dengan keputusan gateway dan harga yang belum diputuskan.

## 6. Exit gate lintas fase

Gate di bagian ini bukan catatan akhir. Tiap gate diperiksa pada titik yang disebut, dan bila gagal, pekerjaan berhenti atau kembali ke fase terkait sampai gate lolos atau owner memutuskan lain secara tertulis. Tidak ada gate yang dilewati diam-diam. Tidak ada angka yang dikarang di bagian ini.

### Gate keamanan

Kapan diperiksa: di akhir tiap fase yang menyentuh auth, data, upload, pembayaran, atau admin, dan secara menyeluruh di Fase 8. Bila gagal: temuan dicatat, perbaikan dilakukan di fase terkait, dan fase tidak dinyatakan lolos. Bila owner menerima risiko secara tertulis, penerimaan itu dicatat beserta alasannya dan tidak dianggap sebagai kelolosan gate.

### Gate aksesibilitas

Kapan diperiksa: di Fase 3 untuk renderer undangan publik, di Fase 4 untuk builder, dan secara menyeluruh di Fase 8. Bila gagal: temuan dicatat dan diperbaiki di fase terkait. Peluncuran tidak disetujui bila temuan yang disepakati sebagai blocker belum ditindaklanjuti.

### Gate responsif

Kapan diperiksa: di Fase 3 untuk undangan publik, di Fase 4 untuk builder, dan di Fase 8 untuk UAT. Bila gagal: tampilan yang rusak dicatat beserta perangkat dan ukuran layar yang diuji, lalu diperbaiki di fase terkait sebelum fase dinyatakan lolos.

### Gate OG preview

Kapan diperiksa: di Fase 0 untuk acceptance test, di Fase 3 untuk HTML dan OG per undangan, dan di Fase 8 untuk UAT. Gate ini menguji HTML dan OG sebagai bukti prasyarat crawler, BUKAN sebagai bukti kartu WhatsApp tampil. K6 (kartu WhatsApp aktual) dicatat belum terbukti pada setiap pemeriksaan gate ini sampai ada bukti kartu yang benar-benar terlihat; tidak ada klaim kartu WhatsApp yang boleh dipakai untuk meloloskan gate ini. Bila gagal: OG diperbaiki dan acceptance test diulang. Kegagalan gate ini tidak boleh ditutupi dengan klaim kartu WhatsApp, karena kartu WhatsApp sebenarnya belum terbukti dan K6 belum terverifikasi.

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
8. Integrasi resmi React Router v8 plus Cloudflare Vite plugin, bila dipertimbangkan di kemudian hari. Integrasi ini harus dinilai tersendiri, karena POC membandingkan React Router 7.18.5 framework-less SSR, bukan integrasi resmi tersebut.

Aturan pemisahan: bila satu fitur kandidat ternyata dibutuhkan untuk menutup risiko keamanan, aksesibilitas, backup, atau rollback, fitur itu tidak lagi diperlakukan sebagai pasca-MVP. Owner memutuskan perpindahan itu secara tertulis di fase terkait.

## 8. Daftar asumsi dan pernyataan bukan persetujuan

### Daftar asumsi

Semua asumsi di bawah ini ditandai dengan label [ASUMSI]. Asumsi bukan fakta. Bila asumsi terbukti salah, fase terkait harus ditinjau ulang dan owner harus memutuskan langkah berikutnya.

1. [ASUMSI] Baseline V25 dan bukti POC yang dirujuk di Bagian 1 adalah acuan perencanaan ini. Laporan lengkap POC hanya tersedia lokal dan ditandai tidak terarsip di GitHub; bagian perencanaan yang bersandar pada laporan itu memakai angka yang dikutip dengan provenance di §3.1.1 dan §9, bukan rujukan yang seolah dapat dibuka pembaca.
2. [ASUMSI] Owner dan reviewer Agent Meta tersedia untuk meninjau Fase 0 dan Gerbang Arsitektur.
3. [ASUMSI] Lingkungan dev, staging, dan production dapat dipisahkan sepenuhnya di Cloudflare sesuai rencana Fase 1.
4a. [ASUMSI] Payment gateway yang akan dipilih owner mendukung signature verification dan event verification untuk webhook — asumsi ini perlu diuji terhadap gateway terpilih setelah provider dipilih, dan BUKAN fakta sebelum provider dipilih. Tidak ada fitur gateway tertentu yang dinyatakan sebagai fakta di dokumen ini.
4b. [ASUMSI] Pemrosesan webhook di aplikasi bersifat idempotent, yaitu pengiriman ulang webhook tidak membuat order ganda — ini asumsi tentang perilaku aplikasi, terpisah dari verifikasi signature/event pada 4a, dan harus dibuktikan dengan pengujian di Fase 6. Pemisahan ini berlaku juga untuk risiko webhook di Fase 6: webhook yang tidak terverifikasi dan webhook yang tidak idempotent adalah dua kegagalan yang berbeda.
5. [ASUMSI] Draft server-side dapat dipulihkan setelah perangkat berganti, selama draft itu sudah tersimpan di server.
6. [ASUMSI] Data prototype localStorage tidak berpindah otomatis ke production, dan ekspor-impor lokal hanya dilakukan bila dibutuhkan dan bila owner menyetujuinya.
7. [ASUMSI] Template baru tidak mengubah undangan versi lama, selama versioning diterapkan sesuai Fase 3.
8. [ASUMSI] Acceptance test OG atau crawler yang disiapkan di Fase 0 cukup untuk menilai HTML dan OG per undangan, dan tidak dipakai untuk mengklaim kartu WhatsApp tampil.
9. [ASUMSI] Tidak ada kebutuhan KV, Durable Objects, atau queues sampai ada kebutuhan terukur yang dicatat dan disetujui owner.
10. [ASUMSI] Harga prototype yang dikutip di Bagian 3 tetap menjadi acuan yang sah sampai owner memutuskan harga komersial final di Fase 6.

### Pernyataan eksplisit

Roadmap ini BUKAN persetujuan implementasi. Roadmap ini BUKAN persetujuan production deploy. Dokumen ini hanya perencanaan untuk ditinjau owner. Owner harus menyetujui Fase 0 lebih dulu sebelum pekerjaan lanjut dibahas. Persetujuan Fase 0 HANYA mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; persetujuan Fase 0 TIDAK mengizinkan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1. Fase 1 memerlukan persetujuan tersendiri dari owner. Persetujuan Fase 0 tidak sama dengan persetujuan peluncuran. Peluncuran membutuhkan persetujuan terpisah di Fase 8. Tidak ada janji keberhasilan, tidak ada janji performa, dan tidak ada klaim bahwa mengikuti roadmap ini menjamin hasil tertentu. Bila ada bagian dokumen ini yang bertentangan dengan keputusan terkunci di Bagian 3, keputusan terkunci yang berlaku.

## 9. Riwayat revisi v0.1 ke v0.1.1

Revisi ini hanya mengubah dokumentasi, berdasarkan temuan review terhadap v0.1 (prompt koreksi Lora, diteruskan 11 November 2026). Tidak ada file v25 yang diubah, tidak ada kode produk yang ditulis, tidak ada resource Cloudflare yang dibuat, dan tidak ada klaim status deployment apa pun di dokumen ini. File yang berubah: docs/ROADMAP-v0.1.md menjadi pointer ke dokumen ini, dan docs/ROADMAP-v0.1.1.md adalah dokumen ini (baru). Perubahan per koreksi:

1. Provenance hasil tes V25 (§3.1.1 baru; §3.1 butir 5 ditulis ulang): kronologi 360 dari 362 exit 1 pada commit V25 versus 362 dari 362 pada audit independen Lora 11 November 2026 pukul 12:07 WIB kini ditulis terpisah dan lengkap; catatan 360 dari 362 dipertahankan; tidak ada pernyataan bahwa V25 sendiri mencatat 362 dari 362; status APPROVED WITH MINOR NOTES ditandai sebagai verdict audit Lora, bukan klaim dari Muse.
2. Rujukan laporan POC (§1; Fase 0 dependency 1; §8 asumsi 1): rujukan yang seolah REPORT-poc-og.md dapat dibuka pembaca dihapus; diganti tautan ke branch poc/og-arch commit 93df620d dan jalur harness/bukti yang benar-benar terkomit. Verifikasi via GitHub API 11 November 2026: tree poc/og-arch (93df620d) berisi 66 blob; REPORT-poc-og.md tidak ada di tree itu; poc/tests/evidence/ tidak terkomit; tree main (70bb0641) juga tidak berisi REPORT-poc-og.md. Laporan lengkap ditandai tidak terarsip di GitHub; langkah reproduksi terperinci tidak ditulis ulang dari laporan lokal.
3. Status stack provisional (§2; Caveat 1 dan 2 dipertahankan dan dipertegas): Hono plus React/Vite/TypeScript tetap rekomendasi kerja, bukan keputusan final; POC membuktikan HTML OG dan alur teknis K1 sampai K5, bukan kartu WhatsApp aktual; varian React Router yang dibandingkan adalah React Router 7.18.5 framework-less SSR, bukan React Router v8 dengan Cloudflare Vite plugin resmi; tidak ada klaim Hono menang atas React Router secara umum.
4. Makna gate Fase 0 (§1; §2 tindakan ke-3; exit criteria Fase 0; pernyataan §8): persetujuan Fase 0 kini dinyatakan secara eksplisit hanya mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman — bukan coding produk, provisioning D1/R2 produksi, perubahan akun/konfigurasi production, deploy production, atau persetujuan Fase 1. Fase 1 memerlukan persetujuan tersendiri.
5. Register Keputusan (§3.2 ditulis ulang): daftar keputusan terbuka kini berbentuk register dengan kolom keputusan, wajib dibuat sebelum coding modul apa, boleh ditunda ke fase mana, pemutus, kapan dibutuhkan, dan konsekuensi/blocker bila ditunda. Register diperiksa konsistensinya terhadap tabel fase (§5) dan exit criteria tiap fase (§4); tidak ada ketidakkonsistenan yang ditemukan — dependency Fase 1, 2, 4, 6, 7, dan 8 semuanya cocok dengan kolom register. Dokumen tidak lagi menyiratkan semua keputusan fase 4/6/8 harus final sebelum seluruh Fase 0 selesai.
6. Acceptance metadata sosial (§2 Caveat 1; Fase 0 deliverables dan exit criteria; Gerbang Arsitektur; §6 Gate OG preview): HTML OG dinyatakan sebagai bukti prasyarat crawler, bukan bukti kartu WhatsApp tampil; K6 dicatat belum terbukti; Fase 0 kini meminta owner memilih secara eksplisit antara (a) kartu aktual wajib diuji sebelum keputusan stack final, atau (b) K6 boleh tetap terbuka sampai tersedia cara uji yang aman. Pilihan ini menjadi keputusan register dan prasyarat gerbang. Tidak ada pengiriman pesan atau tautan ke kontak nyata dalam pengujian apa pun.
7. Asumsi pembayaran/webhook (§8): asumsi 4 dipecah menjadi 4a (dukungan gateway untuk signature/event verification — asumsi yang perlu diuji terhadap gateway terpilih, bukan fakta) dan 4b (idempotensi pemrosesan di aplikasi — terpisah dari verifikasi signature/event, dibuktikan dengan pengujian di Fase 6). Tidak ada fitur gateway tertentu yang dinyatakan sebagai fakta sebelum provider dipilih.

Status review Agent Meta pada saat dokumen ini ditulis: masih menunggu (belum diterima). Gerbang Arsitektur tidak dapat lolos tanpa review itu diterima dan keberatannya dijawab; bila belum diterima saat gerbang dinilai, gerbang dinyatakan tidak lolos. Fase 0 belum disetujui owner pada saat dokumen ini ditulis; persetujuan itu tetap milik owner.
