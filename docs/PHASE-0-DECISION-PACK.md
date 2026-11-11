# Kita Invite — Paket Keputusan Fase 0 (Phase 0 Decision Pack)

## 0. Metadata dan batas otorisasi

| | |
|---|---|
| Judul | Kita Invite — Paket Keputusan Fase 0 |
| Versi | v0.1.4 (dokumen perencanaan Fase 0; revisi dari v0.1.3 — riwayat revisi di §8) |
| Tanggal | 12 November 2026 |
| Status Fase 0 | **SEDANG BERJALAN** — belum selesai, Gerbang Arsitektur belum lulus |
| Acuan rencana | Roadmap v0.1.1, `docs/ROADMAP-v0.1.1.md`, branch `docs/roadmap-v0.1.1`, commit `c7b4e36fe900e0a47a927f20dd6ab477eeed013f` — https://github.com/marko1kiro/kita-invite/blob/docs/roadmap-v0.1.1/docs/ROADMAP-v0.1.1.md |
| Baseline produk | Stage 2 V25, commit `68bf66ceb62e2182a6559fe7a238d354568e7cbf` (provenance hasil tes di §5.2) |
| Baseline POC | Branch `poc/og-arch`, commit `93df620d016562235c79238299c0f5491a8ca538` |

### Keputusan owner yang sudah dibuat (fakta — jangan minta owner mengulang pilihan ini)

1. **Owner menyetujui MULAI Fase 0 saja** — sebatas perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman (instruksi Lora yang diteruskan owner, 11 November 2026 pukul 16:34 WIB).
2. **Owner memilih K6 (kartu preview WhatsApp aktual) TETAP TERBUKA sampai ada cara uji yang aman.** Status K6: **OPEN / UNVERIFIED**. Jangan mengklaim K6 lulus. Bila nanti ada metode uji nyata yang aman, dokumen ini menyatakan perlu persetujuan terpisah sebelum mengirim atau menampilkan URL melalui kanal eksternal.
3. **Owner menyetujui scope MVP M1–M8 seperti tertulis di §1.1.** Keputusan owner 11 November 2026 pukul 18:34 WIB; pesan owner: "gapapa M1-M8 juga bos". M1–M8 ditandai **DECIDED BY OWNER — MVP scope accepted**. Scope ini tidak perlu ditanyakan kembali, tidak diganti dengan Revenue MVP, pilot M1–M4, atau scope yang lebih sempit. Keputusan M1–M8 tidak menghapus exit gates keamanan, privasi, aksesibilitas, responsive layout, backup/restore, monitoring, dan rollback yang diperlukan sebelum peluncuran.

### Batas otorisasi Fase 0 (baca dulu)

Persetujuan memulai Fase 0 **HANYA** mengizinkan perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman. Persetujuan ini **TIDAK** mengizinkan:

- coding produk;
- provisioning D1/R2 production, secrets, atau resource Cloudflare apa pun;
- perubahan akun atau konfigurasi production;
- deployment production;
- kelulusan Gerbang Arsitektur;
- izin Fase 1.

Semua hal di atas membutuhkan persetujuan terpisah dari owner. Otorisasi untuk memulai Fase 0 (perencanaan saja) **SUDAH diberikan owner** dan dicatat di atas — pemberian otorisasi itu tidak berarti checklist exit lain atau Gerbang Arsitektur otomatis lulus. Dokumen ini adalah bahan tinjauan, bukan persetujuan implementasi. **Jangan pernah menandai gerbang lulus atau Fase 0 selesai di dokumen ini.**

### Cara membaca dokumen ini

- **FAKTA** — hal yang sudah terjadi atau sudah diputuskan, dengan sumber yang disebut.
- **KUNCI PRODUK** — keputusan produk yang tidak boleh diubah (§5.1); angka di dalamnya ditulis persis.
- **REKOMENDASI** — usulan Muse untuk owner; selalu ditandai `REKOMENDASI`. Rekomendasi bukan keputusan. Yang memutuskan adalah owner, dan disebutkan di tiap baris register.
- **[ASUMSI]** — hal yang diasumsikan benar dan perlu diuji; bila terbukti salah, bagian terkait harus ditinjau ulang.
- **MENUNGGU** — pertanyaan terbuka yang belum diputuskan; tidak ada yang dianggap otomatis disetujui.

Dokumen ini tidak berisi angka, timeline, biaya, atau janji performa yang dikarang. Angka yang dikutip hanya angka yang sudah ada sebagai fakta di baseline atau bukti POC yang terukur.

---

## 1. Scope MVP dan pasca-MVP

> **DECIDED BY OWNER — MVP scope accepted.** Scope MVP M1–M8 di §1.1 sudah diputuskan owner pada 11 November 2026 pukul 18:34 WIB (pesan owner: "gapapa M1-M8 juga bos"). Scope ini tidak perlu ditanyakan kembali dan tidak diganti dengan Revenue MVP, pilot M1–M4, atau scope yang lebih sempit. Yang masih berupa REKOMENDASI adalah daftar pasca-MVP P1–P8 di §1.2 dan alternatif scope di §1.3, yang dicatat sebagai opsi yang TIDAK dipilih. Keputusan M1–M8 tidak menghapus exit gates keamanan, privasi, aksesibilitas, responsive layout, backup/restore, monitoring, dan rollback yang diperlukan sebelum peluncuran — standar itu tetap berlaku penuh.

### 1.1 Scope MVP M1–M8 (DECIDED BY OWNER — MVP scope accepted)

MVP adalah hasil Fase 0 sampai Fase 8 yang dikunci owner, dalam urutan yang bisa diuji dan diluncurkan secara bertahap. Setiap butir di bawah ini adalah **keputusan owner** (11 November 2026 pukul 18:34 WIB). Detail operasional di dalam tiap butir yang masih memerlukan keputusan turunan dicatat di §1.4; keputusan turunan itu tidak membatalkan scope yang sudah dipilih.

| # | Cakupan MVP (DECIDED BY OWNER) | Fase roadmap | Mengapa masuk MVP | Cara menguji (kualitatif, tanpa angka yang dikarang) |
|---|---|---|---|---|
| M1 | Fondasi Cloudflare: repo, CI/CD, Worker, D1/R2 yang terpisah untuk dev/staging/production, secrets, migrasi SQL terkontrol, logging, backup/restore | Fase 1 | Tanpa fondasi yang terpisah, semua fase berikutnya berdiri di atas konfigurasi yang tidak dapat diaudit | Buktikan dari konfigurasi bahwa dev, staging, dan production benar-benar terpisah; migrasi tercatat; backup dan restore sudah diuji |
| M2 | Auth, roles, dan data: Customer/Admin/Designer, session yang terkontrol dan dapat dicabut, ownership dan RBAC wajib di server, audit trail, gate lintas-akun | Fase 2 | Keamanan akses adalah prasyarat semua data pelanggan; otorisasi hanya di klien dapat dilewati | Gate lintas-akun: satu akun tidak dapat membaca atau mengubah data akun lain; semua pemeriksaan berjalan di server |
| M3 | Template/CMS dan undangan publik: slug yang stabil, renderer undangan publik, template versioning (template baru tidak mengubah undangan versi lama), media upload yang aman ke R2, HTML awal dan metadata OG per undangan | Fase 3 | Ini produk intinya — undangan publik yang benar dan dapat dibagikan | Undangan lama tidak berubah saat template baru diterbitkan; slug yang sudah dipublikasikan tetap mengarah ke undangan yang benar; HTML dan OG per undangan lolos acceptance test OG (§4.2) |
| M4 | Builder, draft, dan entitlement: draft server-side dengan autosave, Free (semua akun baru Free; Free boleh edit semua template dan menyimpan draft), paket yang ditentukan versi template, expiry dan publish dengan masa aktif mulai saat publish | Fase 4 | Builder adalah tempat pelanggan membuat undangan; draft harus tersimpan di server agar dapat dipulihkan setelah perangkat berganti | Draft tersimpan di server dan dapat dipulihkan; masa aktif dihitung dari waktu publish, bukan dari waktu pembayaran; expiry akhir bulan 23:59:59 WIB berperilaku sesuai kunci produk |
| M5 | Guest/RSVP dasar: manajemen tamu dan grup, RSVP yang tertaut benar ke tamu dan undangan, guestbook dengan moderasi dasar | Fase 5 | RSVP adalah fungsi inti undangan; kesalahan penautan berarti data tamu tercampur antar undangan | RSVP dan guestbook yang diuji tidak pernah tertaut ke undangan atau tamu yang salah; moderasi tercatat |
| M6 | Checkout dan pembayaran (satu gateway): price snapshot, webhook yang terverifikasi dan idempotent, rekonsiliasi, order status terpisah dari payment state | Fase 6 | Tanpa checkout, paket berbayar tidak dapat dijual; tanpa pemisahan order status dan payment state, order yang belum lunas dapat tampak sudah selesai | Webhook yang dikirim ulang tidak membuat order ganda; rekonsiliasi menunjukkan selisih bila ada; checkout tidak dibuka sebelum harga komersial final diputuskan |
| M7 | Admin dan assisted service (dasar): CMS operasional untuk customer/order/media, assignment, revisions, approvals, notifications sesuai template yang disetujui, activity log | Fase 7 | Assisted service adalah bagian dari layanan; tanpa jejak, perubahan oleh Admin/Designer tidak dapat ditelusuri | Assignment, revisions, dan approvals tercatat dari awal sampai akhir; tidak ada perubahan order atau media tanpa jejak di activity log |
| M8 | Kesiapan peluncuran: UAT, security review dan accessibility review, observability, restore test, staged cutover dan rollback | Fase 8 | Peluncuran tanpa rencana rollback adalah risiko yang tidak dapat diterima | UAT lolos sesuai kriteria Fase 0; restore test dijalankan dan terdokumentasi; langkah rollback jelas dan dapat dijalankan |

### 1.2 Fitur kandidat pasca-MVP yang lebih tepat ditunda (REKOMENDASI — belum disetujui owner sebagai roadmap pasca-MVP final)

P1–P8 adalah daftar fitur kandidat yang tidak termasuk scope MVP saat ini dan direkomendasikan untuk ditinjau/diprioritaskan kemudian; daftar ini mengikuti kandidat pasca-MVP di roadmap v0.1.1 §7. Owner belum menyetujui tiap fitur sebagai roadmap pasca-MVP final dan belum berkomitmen membangunnya. Setiap penundaan membawa konsekuensi praktis yang ditulis di bawah ini agar owner memutuskan dengan mata terbuka.

| # | Fitur yang ditunda (REKOMENDASI) | Konsekuensi praktis bila ditunda |
|---|---|---|
| P1 | Template tambahan di luar katalog template awal yang dikunci di Fase 0 | Katalog template saat peluncuran terbatas pada katalog awal; pelanggan melihat pilihan yang lebih sedikit; template baru membutuhkan pekerjaan versioning tersendiri setelah peluncuran |
| P2 | Fitur builder lanjutan di luar draft server-side, autosave, dan publish yang dikunci di Fase 0 | Builder berfungsi penuh untuk membuat dan menerbitkan undangan, tetapi tanpa fitur lanjutan; pengguna yang mengharapkan fitur lanjutan harus menunggu gelombang berikutnya |
| P3 | Fitur guestbook lanjutan di luar moderasi dasar yang dikunci di Fase 0 | Guestbook tersedia dengan moderasi dasar; interaksi yang lebih kaya (bila ada) belum tersedia saat peluncuran |
| P4 | Integrasi pembayaran tambahan di luar gateway yang dipilih owner di Fase 6 | Saat peluncuran hanya ada satu gateway; pelanggan yang tidak dapat memakai gateway itu tidak dapat membayar; penambahan gateway adalah pekerjaan integrasi tersendiri |
| P5 | Otomasi notifikasi lanjutan di luar template notifikasi yang disetujui di Fase 7 | Notifikasi hanya mengikuti template yang disetujui; tidak ada alur notifikasi otomatis lanjutan sampai pekerjaan itu dijadwalkan |
| P6 | Laporan dan analitik lanjutan di luar activity log dan observability dasar | Tidak ada dasbor laporan lanjutan saat peluncuran; wawasan bisnis dibatasi pada activity log dan observability dasar |
| P7 | Migrasi data prototype yang luas | Draft prototype tetap tersimpan lokal per perangkat/pengguna dan tidak berpindah otomatis; bila owner menginginkan pemindahan, itu pekerjaan ekspor-impor terbatas di Fase 8 yang membutuhkan persetujuan tersendiri |
| P8 | Integrasi resmi React Router v8 plus Cloudflare Vite plugin | Keputusan stack dibuat berdasarkan bukti POC (React Router 7.18.5 framework-less SSR), bukan berdasarkan integrasi resmi tersebut; bila integrasi resmi dipertimbangkan di kemudian hari, ia harus dinilai tersendiri sebagai pekerjaan baru, bukan sebagai kesimpulan dari POC ini |

**Aturan pemisahan (dari roadmap v0.1.1 §7):** bila satu fitur kandidat ternyata dibutuhkan untuk menutup risiko keamanan, aksesibilitas, backup, atau rollback, fitur itu tidak lagi diperlakukan sebagai pasca-MVP. Owner memutuskan perpindahan itu secara tertulis di fase terkait.

### 1.3 Alternatif scope — opsi yang TIDAK dipilih

Alternatif di bawah ini dicatat sebagai opsi yang tidak dipilih owner. Pilihan owner saat ini adalah M1–M8 (§1.1). Alternatif ini tidak berlaku sebagai scope.

- **MVP lebih sempit (tidak dipilih):** hanya M1 sampai M4 (fondasi, auth, template/undangan publik, builder) pada gelombang pertama; checkout (M6) dan admin (M7) menyusul pada gelombang kedua. Trade-off: produk dapat diuji pada gelombang pertama tanpa menunggu pembayaran, tetapi tidak ada pendapatan dan tidak ada assisted service sampai gelombang kedua. **Bukan scope yang berlaku — jangan menyempitkan M1–M8 menjadi pilot M1–M4 atau Revenue MVP.**
- **MVP lebih luas (tidak dipilih):** memasukkan satu atau lebih fitur P1–P8 ke dalam MVP. Trade-off: cakupan lebih besar berarti permukaan risiko lebih besar dan keputusan yang harus dibuat sebelum peluncuran lebih banyak.
- **Catatan:** rekomendasi Muse di v0.1 ("terima scope §1.1 apa adanya sebagai MVP") kini sudah menjadi keputusan owner (11 November 2026 pukul 18:34 WIB); rekomendasi itu tidak lagi berstatus rekomendasi untuk bagian scope.

### 1.4 Keputusan turunan di dalam M1–M8 yang masih perlu diputus

Scope M1–M8 sudah diputuskan, tetapi beberapa detail operasional di dalam scope itu masih memerlukan keputusan owner. Detail-detail ini dicatat secara eksplisit di bawah ini sebagai keputusan turunan; keputusan turunan yang belum dibuat **tidak membatalkan** scope M1–M8, tetapi modul terkait tidak boleh mulai dicoding sebelum keputusan prasyaratnya dibuat (aturan register §2).

| # | Keputusan turunan (masih MENUNGGU) | Baris register | Diperlukan sebelum |
|---|---|---|---|
| D1 | Auth provider dan model session | §2.3 | Fase 2 dimulai |
| D2 | Payment gateway (termasuk pengujian asumsi webhook 4a/4b) | §2.4 | Integrasi webhook Fase 6 |
| D3 | Domain | §2.5 | Provisioning production Fase 1 |
| D4 | Cloudflare plan | §2.6 | Provisioning production Fase 1 |
| D5 | Email transaksional (provider dan isi template) | §2.7 | Fase 7 membangun notifikasi |
| D6 | Jumlah maksimum draft Free serta TTL/retensi draft — batas jumlah dan TTL tetap belum diputuskan; jangan menerapkannya sebelum owner memutuskan | §2.8 | Batas atau TTL apa pun diterapkan di Fase 4 |
| D7 | Aturan order yang telah dibayar tetapi belum dipublikasi | §2.9 | Checkout dibuka di Fase 6 |
| D8 | Harga komersial final | §2.10 | Checkout dibuka di Fase 6 |
| D9 | Kebijakan migrasi draft prototype yang tersimpan di localStorage | §2.11 | Migrasi atau UAT di Fase 8 |
| D10 | Syarat dan metode yang aman untuk menguji kartu WhatsApp nyata (K6) — status K6 sudah diputuskan (tetap terbuka); yang masih terbuka hanyalah metode uji amannya | §2.12 | Pengujian nyata dipertimbangkan |

Keputusan M1–M8 tidak menurunkan standar peluncuran: exit gates keamanan, privasi, aksesibilitas, responsive layout, backup/restore, monitoring, dan rollback tetap diperlukan sebelum peluncuran (lihat M8 dan exit gates lintas fase di roadmap v0.1.1 §6). Dokumen ini tidak mengarang jumlah template, batas draft, TTL, harga final, provider, timeline, biaya, atau detail lain yang belum diputuskan.

---

## 2. Register keputusan owner

Register ini adalah acuan tunggal untuk urutan keputusan, dan konsisten dengan roadmap v0.1.1 §3.2 (12 baris). Setiap keputusan mencantumkan ketujuh kolom berikut: pilihan yang harus dibuat; opsi yang layak; rekomendasi Muse (ditandai `REKOMENDASI`); pemutus; fase paling lambat sebelum keputusan dibutuhkan; apakah menjadi blocker; konsekuensi bila ditunda. Kolom **Status** menunjukkan `DIPUTUSKAN`, `DITUNDA DENGAN SADAR`, atau `MENUNGGU` pada saat dokumen ini ditulis; tidak ada keputusan yang dikarang atau dianggap otomatis disetujui.

Aturan yang mengikat register ini (dari roadmap v0.1.1 §3.2): (1) TIDAK semua keputusan harus final sebelum seluruh Fase 0 selesai — hanya kunci MVP, pilihan stack final, dan keputusan status K6 yang wajib final di Fase 0; keputusan lain mengikuti kolom "Paling lambat". (2) Coding suatu modul TIDAK BOLEH dimulai bila keputusan yang menjadi prasyarat modul itu menurut register belum dibuat.

Pada revisi v0.1.1, dua baris register berstatus **DECIDED BY OWNER**: batas MVP (§2.1 — M1–M8, keputusan owner 11 November 2026 pukul 18:34 WIB) dan status K6 (§2.12 — tetap terbuka). Sepuluh baris lainnya (§2.2–§2.11) tetap MENUNGGU, beserta metode uji aman K6.

### 2.1 (a) Batas MVP dan fitur pasca-MVP

- **Pilihan yang sudah dibuat (DECIDED BY OWNER):** scope MVP M1–M8 seperti tertulis di §1.1, dengan P1–P8 sebagai daftar kandidat pasca-MVP (rekomendasi, belum disetujui owner sebagai roadmap pasca-MVP final). Scope M1–M8 tidak perlu ditanyakan kembali.
- **Opsi yang layak:** (i) terima scope §1.1 apa adanya — **ini pilihan owner**; (ii) MVP lebih sempit — hanya M1 sampai M4 pada gelombang pertama, checkout dan admin menyusul — opsi yang tidak dipilih; (iii) MVP lebih luas — memasukkan satu atau lebih fitur P1–P8 — opsi yang tidak dipilih.
- **Rekomendasi Muse:** `REKOMENDASI` di v0.1 — terima scope §1.1 apa adanya — kini sudah menjadi keputusan owner (11 November 2026 pukul 18:34 WIB; pesan owner: "gapapa M1-M8 juga bos") dan tidak lagi berstatus rekomendasi untuk bagian scope. Trade-off yang dicatat di v0.1 tetap berlaku sebagai catatan: scope ini mencakup satu alur utuh (daftar, buat, terbitkan, RSVP, bayar, kelola) sehingga dapat diuji end-to-end, tanpa menambah permukaan keputusan di luar yang sudah ada di roadmap.
- **Pemutus:** Owner.
- **Paling lambat:** Fase 0 — wajib final sebelum Fase 0 keluar.
- **Blocker:** YA — tanpa ini Fase 0 tidak dapat lolos dan tidak ada fase lanjut yang dimulai.
- **Status:** **DECIDED BY OWNER — M1–M8** (keputusan owner 11 November 2026 pukul 18:34 WIB; pesan owner: "gapapa M1-M8 juga bos").
- **Konsekuensi bila ditunda:** tidak berlaku — keputusan sudah dibuat. Yang masih tertunda adalah keputusan turunan di §1.4 (baris register §2.3–§2.12 yang masih MENUNGGU); keputusan turunan itu tidak membatalkan scope M1–M8.

### 2.2 (b) Stack produksi final serta pilihan renderer/SSR

- **Pilihan yang harus dibuat:** stack produksi final dan renderer/SSR yang dipakai untuk undangan publik dan API.
- **Opsi yang layak:** (i) Hono + React + TypeScript + Vite — Hono di Worker untuk API `/api/v1` dan HTML awal route undangan dengan OG dinamis, React untuk interaksi (rekomendasi kerja POC, varian A); (ii) React Router SSR framework-less 7.18.5 (varian B POC); (iii) integrasi resmi React Router v8 plus Cloudflare Vite plugin — opsi ini TIDAK diuji di POC dan harus dinilai tersendiri sebagai pekerjaan baru bila dipertimbangkan.
- **Rekomendasi Muse:** `REKOMENDASI` — Hono + React + TypeScript + Vite sebagai arah kerja awal (lihat ADR draft di §3). Trade-off: satu lapisan routing eksplisit, tanpa kelas bug hydration, bundle lebih kecil dengan versi terkini; harganya HTML awal hanya shell plus OG plus JSON sehingga tanpa JS undangan tidak terbaca. Rekomendasi ini tetap PROVISIONAL sampai review Agent Meta dan syarat Gerbang Arsitektur selesai.
- **Pemutus:** Owner, setelah review Agent Meta dan acceptance test OG.
- **Paling lambat:** Fase 0, di Gerbang Arsitektur.
- **Blocker:** YA — tanpa ini gerbang tidak lolos dan tidak ada coding production yang dimulai.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** Gerbang tidak lolos; tidak ada coding production yang dimulai; pekerjaan berhenti pada perencanaan.

### 2.3 (c) Auth provider dan model session

- **Pilihan yang harus dibuat:** penyedia auth dan model session yang dipakai (termasuk pencabutan session dan penegakan peran).
- **Opsi yang layak:** (i) penyedia auth terkelola (contoh kandidat untuk dievaluasi: Auth0, Clerk, Supabase Auth — contoh, bukan fakta kecocokan); (ii) session berbasis server di Worker dengan penyimpanan D1 (tanpa penyedia eksternal); (iii) tautan masuk berbasis email (magic link) yang dikelola sendiri atau melalui penyedia.
- **Rekomendasi Muse:** `REKOMENDASI` — tidak ada rekomendasi tegas atas satu penyedia sebelum evaluasi. Evaluasi di Fase 0 harus menguji: session dapat dicabut, peran Customer/Admin/Designer dapat ditegakkan di server, dan audit trail dapat dicatat. Tetapkan arah di Fase 0, putuskan nilai akhir sebelum Fase 2 dimulai. Trade-off: penyedia terkelola mengurangi pekerjaan auth tetapi menambah dependensi eksternal; session berbasis D1 memberi kontrol penuh tetapi tim yang membangun dan memelihara mekanisme session, pencabutan, dan auditnya.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum Fase 2 dimulai (arah ditetapkan di Fase 0).
- **Blocker:** YA untuk Fase 2; TIDAK untuk Fase 0 dan Fase 1.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** Fase 2 tidak dapat dimulai; Fase 0 dan Fase 1 tidak terpengaruh.

### 2.4 (d) Payment gateway

- **Pilihan yang harus dibuat:** payment gateway yang dipakai untuk checkout, termasuk dukungan webhook-nya.
- **Opsi yang layak:** gateway pembayaran yang beroperasi untuk pelanggan di Indonesia dan menyediakan webhook (contoh kandidat untuk dievaluasi: Midtrans, Xendit, Doku — contoh, bukan fakta kecocokan). Setiap kandidat harus dinilai terhadap dua asumsi yang terpisah: (4a) dukungan untuk signature/event verification webhook, dan (4b) idempotensi pemrosesan di aplikasi (lihat §5.3).
- **Rekomendasi Muse:** `REKOMENDASI` — tidak ada rekomendasi tegas atas satu gateway sebelum evaluasi. Tetapkan arah di Fase 0, dan sahkan pilihan akhir di Fase 6 setelah menguji asumsi 4a dan 4b terhadap gateway terpilih. Jangan menyebut fitur gateway tertentu sebagai fakta sebelum provider dipilih. Trade-off: gateway yang sudah dikenal tim mempercepat integrasi tetapi belum tentu memenuhi kedua asumsi webhook; gateway baru membutuhkan pengujian lebih banyak.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum integrasi webhook di Fase 6 (arah di Fase 0; pengesahan akhir di Fase 6).
- **Blocker:** YA untuk Fase 6; TIDAK untuk fase lain.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** Fase 6 tidak dapat memulai integrasi; checkout tetap tertutup; fase lain tidak terpengaruh.

### 2.5 (e1) Domain

- **Pilihan yang harus dibuat:** domain yang dipakai untuk production.
- **Opsi yang layak:** (i) memakai domain yang sudah dimiliki owner, bila ada; (ii) mendaftarkan domain baru; (iii) memakai subdomain layanan Cloudflare untuk tahap dev/staging saja, dengan domain production diputuskan sebelum provisioning production.
- **Rekomendasi Muse:** `REKOMENDASI` — tetapkan arah di Fase 0 (apakah memakai domain yang sudah ada atau domain baru) dan putuskan nilai akhir sebelum provisioning production di Fase 1. Tidak ada rekomendasi atas nama domain tertentu; itu keputusan owner.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum provisioning production di Fase 1 (arah di Fase 0).
- **Blocker:** YA untuk provisioning production di Fase 1; TIDAK untuk dev/staging.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** Fase 1 dapat berjalan untuk dev/staging, tetapi provisioning production tertahan.

### 2.6 (e2) Cloudflare plan

- **Pilihan yang harus dibuat:** paket Cloudflare yang dipakai untuk production.
- **Opsi yang layak:** paket Cloudflare yang tersedia (Free, Pro, Business, atau lebih tinggi — nama paket adalah nama yang dipakai Cloudflare; batas pemakaian dan fitur berbeda per paket dan harus dicek ke dokumentasi Cloudflare saat keputusan dibuat; dokumen ini tidak mengutip harga atau angka batas).
- **Rekomendasi Muse:** `REKOMENDASI` — tetapkan arah di Fase 0 berdasarkan kebutuhan yang sudah diketahui (D1, R2, Workers) dan putuskan paket final sebelum provisioning production di Fase 1. Jangan memilih paket berdasarkan perkiraan beban tanpa dasar; bila kebutuhan beban belum diketahui, catat sebagai pertanyaan terbuka, bukan sebagai angka.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum provisioning production di Fase 1 (arah di Fase 0).
- **Blocker:** YA untuk provisioning production di Fase 1; TIDAK untuk dev/staging.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** provisioning production tertahan; Fase 1 untuk dev/staging tidak terpengaruh.

### 2.7 (f) Email transaksional

- **Pilihan yang harus dibuat:** penyedia email transaksional dan isi template notifikasi yang wajib.
- **Opsi yang layak:** penyedia email transaksional terkelola (contoh kandidat untuk dievaluasi: Resend, Postmark, SendGrid, Mailgun — contoh, bukan fakta kecocokan). Catatan: Email Routing Cloudflare adalah layanan routing email masuk, bukan layanan pengiriman transaksional, sehingga bukan opsi untuk kebutuhan ini.
- **Rekomendasi Muse:** `REKOMENDASI` — tidak ada rekomendasi tegas atas satu penyedia sebelum evaluasi. Pilihan provider boleh ditunda sampai sebelum Fase 7; isi template notifikasi diputuskan di Fase 7. Trade-off: penyedia terkelola mengurangi pekerjaan pengiriman dan penanganan kegagalan, tetapi menambah dependensi eksternal; penundaan pilihan tidak menghambat fase lain.
- **Pemutus:** Owner (provider dan isi template).
- **Paling lambat:** sebelum Fase 7 membangun notifikasi (isi template diputuskan di Fase 7).
- **Blocker:** YA untuk Fase 7; TIDAK untuk fase lain.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** Fase 7 tidak dapat membangun dan menguji notifikasi; fase lain tidak terpengaruh.

### 2.8 (g) Jumlah maksimum draft Free serta TTL/retensi draft

- **Pilihan yang harus dibuat:** apakah ada batas jumlah draft Free dan/atau TTL/retensi draft, dan berapa nilainya.
- **Opsi yang layak:** struktural, tanpa angka yang dikarang: (i) tanpa batas jumlah dan tanpa TTL pada MVP — draft tidak kedaluwarsa; (ii) batas jumlah ditetapkan, tanpa TTL; (iii) TTL/retensi ditetapkan, tanpa batas jumlah; (iv) keduanya ditetapkan. Nilai angka untuk opsi (ii)–(iv) HANYA boleh diisi oleh owner; dokumen ini tidak menciptakan angka.
- **Rekomendasi Muse:** `REKOMENDASI` — opsi (i) untuk MVP: jangan menerapkan batas atau TTL apa pun sebelum owner memutuskan. Tetapkan nilai akhir di Fase 4 bila owner memutuskan untuk menerapkan batas. Trade-off: tanpa batas, tidak ada risiko draft pengguna hilang karena aturan yang belum diputuskan; dengan batas, ada kepastian biaya dan beban penyimpanan, tetapi risiko draft hilang bila batas tidak dikomunikasikan dengan benar.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum batas atau TTL apa pun diterapkan di Fase 4 (arah ditetapkan di Fase 0).
- **Blocker:** YA untuk penerapan batas/TTL apa pun; TIDAK untuk Fase 4 berjalan tanpa batas yang diterapkan.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** Fase 4 berjalan tanpa batas/TTL yang diterapkan. **JANGAN menerapkan batas atau TTL sebelum owner memutuskan.**

### 2.9 (h) Aturan order yang telah dibayar tetapi belum dipublikasi

- **Pilihan yang harus dibuat:** penanganan order yang sudah dibayar tetapi undangannya belum dipublikasi.
- **Opsi yang layak:** (i) order menunggu publikasi tanpa batas waktu; masa aktif mulai saat publish (sesuai kunci produk); (ii) order dipublikasikan otomatis segera setelah pembayaran lunas, sehingga masa aktif mulai saat itu juga; (iii) order menunggu publikasi dengan penanganan manual — pelanggan dihubungi bila order tak kunjung dipublikasi, dan penanganannya (termasuk pengembalian dana bila berlaku) didefinisikan bersama aturan ini.
- **Rekomendasi Muse:** `REKOMENDASI` — opsi (i) sebagai aturan dasar, dilengkapi penanganan manual dari opsi (iii) untuk order yang tak kunjung dipublikasi. Trade-off: opsi (i) paling sederhana dan paling konsisten dengan kunci produk (masa aktif mulai saat publish), tetapi order dapat menggantung tanpa batas bila pelanggan tidak pernah mempublikasikan; opsi (ii) menghilangkan penundaan tetapi mengambil alih keputusan publish dari pelanggan.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum checkout dibuka di Fase 6 (arah di Fase 0; aturan final di Fase 6).
- **Blocker:** YA untuk pembukaan checkout di Fase 6.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** checkout tidak dibuka; order yang sudah dibayar tidak memiliki penanganan yang diputuskan.

### 2.10 (i) Harga komersial final

- **Pilihan yang harus dibuat:** harga komersial final per paket.
- **Opsi yang layak:** (i) harga prototype menjadi harga final (Basic Rp29.000, Premium Rp59.000, Signature Rp99.000, Exclusive mulai Rp149.000); (ii) harga final disesuaikan dari acuan prototype; (iii) struktur harga baru yang dibedakan per versi template. Harga prototype adalah acuan, bukan harga final yang otomatis.
- **Rekomendasi Muse:** Tidak ada rekomendasi tegas — ini keputusan komersial owner, bukan keputusan teknis. Dokumen ini hanya mencatat bahwa harga prototype adalah acuan dan checkout tidak boleh dibuka sebelum harga final diputuskan.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum checkout dibuka di Fase 6 (bukan prasyarat Fase 0).
- **Blocker:** YA untuk pembukaan checkout di Fase 6; TIDAK untuk fase lain.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** checkout tidak dibuka; fase lain tidak terpengaruh.

### 2.11 (j) Kebijakan migrasi draft prototype yang tersimpan di localStorage

- **Pilihan yang harus dibuat:** apakah draft prototype yang tersimpan di localStorage dimigrasikan, dan dengan cara apa.
- **Opsi yang layak:** (i) tidak ada migrasi — draft tetap tersimpan lokal per perangkat/pengguna; (ii) ekspor-impor lokal terbatas per pemilik/perangkat di Fase 8, bila dibutuhkan dan bila owner menyetujuinya; (iii) migrasi otomatis penuh semua draft ke production — **tidak direkomendasikan**, karena bertentangan dengan sifat data localStorage yang per perangkat/pengguna.
- **Rekomendasi Muse:** `REKOMENDASI` — opsi (i) sebagai aturan dasar; opsi (ii) hanya bila dibutuhkan dan disetujui owner di Fase 8. Jangan menjanjikan seluruh draft pindah otomatis.
- **Pemutus:** Owner.
- **Paling lambat:** sebelum migrasi atau UAT di Fase 8.
- **Blocker:** YA untuk migrasi di Fase 8; TIDAK untuk UAT yang berjalan tanpa data prototype yang dimigrasikan.
- **Status:** MENUNGGU.
- **Konsekuensi bila ditunda:** tidak ada migrasi yang dilakukan; UAT berjalan tanpa data prototype yang dimigrasikan.

### 2.12 (k) Syarat aman untuk menguji kartu WhatsApp nyata (K6)

- **Pilihan yang harus dibuat:** syarat dan metode yang aman untuk menguji kartu preview WhatsApp aktual, bila pengujian itu dilakukan.
- **Status keputusan ini — SUDAH DIPUTUSKAN OWNER, jangan minta owner mengulang pilihan ini:** owner memilih K6 **TETAP TERBUKA sampai ada cara uji yang aman** (instruksi 11 November 2026 pukul 16:34 WIB). Status K6: **OPEN / UNVERIFIED**. Yang masih terbuka hanyalah syarat/metode uji amannya, bukan status K6.
- **Opsi yang layak:** untuk metode uji aman, bila suatu hari diuji: (i) akun uji atau penerima terkendali dengan persetujuan eksplisit — membutuhkan persetujuan terpisah sebelum mengirim atau menampilkan URL apa pun melalui kanal eksternal; (ii) alat debug resmi WhatsApp bila Meta merilisnya; (iii) K6 tetap terbuka tanpa batas waktu sebagai celah yang diketahui dan dicatat.
- **Rekomendasi Muse:** `REKOMENDASI` — pertahankan opsi (iii) sebagai posisi yang berlaku; opsi (i) atau (ii) hanya bila metode yang aman benar-benar tersedia DAN persetujuan terpisah sudah diperoleh. Jangan mengklaim K6 lulus; OG HTML yang benar hanya prasyarat crawler, bukan bukti kartu tampil.
- **Pemutus:** Owner (untuk metode uji; status "tetap terbuka" sudah diputuskan owner).
- **Paling lambat:** terbuka — tidak ada tenggat yang ditetapkan; metode uji diputuskan bila dan hanya bila pengujian nyata dipertimbangkan.
- **Blocker:** TIDAK untuk keputusan stack (sesuai keputusan owner bahwa K6 tetap terbuka). YA untuk gerbang hanya bila owner kemudian memilih bahwa kartu wajib dibuktikan sebelum final stack — dalam hal itu gerbang menunggu metode uji yang aman.
- **Status:** DIPUTUSKAN (status K6: tetap terbuka); metode uji aman: MENUNGGU.
- **Konsekuensi bila ditunda:** untuk metode uji — tidak ada. K6 tetap tercatat terbuka dan keputusan stack dibuat berdasarkan bukti K1 sampai K5 saja.

---

## 3. ADR stack — rekomendasi provisional (DRAFT)

### ADR-001 (DRAFT): Arah stack kerja — Hono + React + TypeScript + Vite di Cloudflare Workers

| | |
|---|---|
| Status | **DRAFT** — rekomendasi provisional, bukan keputusan final |
| Tanggal | 11 November 2026 |
| Diputuskan oleh | Belum diputuskan — pemutus adalah owner, setelah review Agent Meta dan syarat Gerbang Arsitektur selesai |
| Dasar bukti | POC Open Graph, branch `poc/og-arch`, commit `93df620d016562235c79238299c0f5491a8ca538` (laporan lengkap hanya tersedia lokal dan TIDAK terarsip di GitHub; kode dan harness yang terkomit ditautkan di §4.2) |

#### Konteks

Kita Invite membutuhkan satu renderer untuk undangan publik dinamis: HTML awal harus memuat metadata Open Graph yang benar untuk crawler, dan pengalaman interaktif harus dimuat setelahnya. POC membandingkan dua arsitektur dengan konten, aset, CSS, dan data fixture sintetis yang sama (dua pasangan fiktif; gambar dibuat sendiri; tanpa data pelanggan).

#### Keputusan yang direkomendasikan (REKOMENDASI — provisional)

- **React + TypeScript + Vite** untuk antarmuka dan interaksi.
- **Hono di Cloudflare Worker** untuk API di jalur `/api/v1` dan untuk HTML awal route undangan `/:slug` dengan metadata OG dinamis.
- **D1** untuk data relasional.
- **R2** untuk media.
- **Tanpa KV, Queues, atau Durable Objects** sampai kebutuhan nyata terbukti dan dicatat.
- Migrasi SQL terkontrol; ORM seperti Drizzle hanya rekomendasi opsional, bukan keputusan wajib.

#### Bukti POC yang mendasari rekomendasi

- Varian A (Hono + React 19.3.1 + Vite 7.3.8): bundle `dist/worker.mjs` 431.881 byte, SHA-256 `013cc380f800b89e6827f9885d94df986b025388e22ab885f70b855819b96e08`; preview https://ki-og-poc-a.xdirgawa.workers.dev.
- Varian B (React Router 7.18.5 framework-less SSR, React 18.3.1 + Vite 6.4.6): bundle 664.078 byte, SHA-256 `c91c01cf817e26190584056fa2f1da9394a6a8a74f2538b1fc1968f4f82ff699`; preview https://ki-og-poc-b.xdirgawa.workers.dev.
- Kedua varian lolos kriteria K1–K5 di 8 run harness (125 cek per run: K1 19, K2 6, K3 6, K4 50, K5 44), exit 0 di semua run; smoke A 59/59, B 62/62; rebuild dari clone bersih menghasilkan byte yang identik.
- K6 (kartu WhatsApp aktual) **belum terverifikasi** untuk kedua varian — POC tidak membuktikan kartu WhatsApp tampil.

#### Perbandingan yang adil dengan React Router SSR

| Aspek | Hono + React (varian A, direkomendasikan) | React Router SSR framework-less (varian B) |
|---|---|---|
| Akurasi metadata crawler | Seri — keduanya menyajikan meta lengkap dan identik per slug (K1 19/19) | Seri — sama |
| Kesamaan renderer preview vs undangan nyata | HTML awal hanya shell + OG + JSON; konten dirender React setelah JS | Lebih dekat di HTML awal — konten lengkap dikirim lewat SSR; seri setelah JS aktif (K4 50/50) |
| Kompleksitas route/data | Satu file Hono untuk halaman, API, gambar, aset, favicon; data dibaca dari fixture, tanpa state | Definisi route sekali (bagus), tetapi dua config Vite + build kustom, API harus keluar dari router (keterbatasan `StaticHandler.query()`), client di-inline gzip+base64 dengan `DecompressionStream` saat runtime |
| Hydration | Tidak ada kelas masalah ini — React CSR biasa mount ke shell | Rapuh di luar framework-mode — `HydratedRouter` hanya untuk framework-mode; POC menemukan bug nyata (React meng-unmount seluruh konten SSR) yang diperbaiki dengan `createBrowserRouter` + `parseHydrationData()` implisit |
| Kecocokan dengan Workers | Hono dirancang untuk runtime seperti Workers; bundle 431.881 byte dengan React 19/Vite 7 tanpa kompromi | Butuh React 18 (bundle SSR React 19 1.211 KB, di atas target 800 KB) + Vite 6 + inlining gzip+base64 agar muat |
| Beban maintenance | Dependensi lebih sedikit, satu pola untuk semua endpoint, satu perintah build yang transparan | React Router SSR framework-less + dua config Vite + build kustom + dua workaround tercatat; setiap upgrade berisiko menggeser seam itu |

**Penegasan penting:** varian B yang dibandingkan di POC adalah **React Router 7.18.5 framework-less SSR, BUKAN integrasi resmi React Router v8 plus Cloudflare Vite plugin**. Perbandingan POC tidak boleh dibaca sebagai penilaian atas integrasi resmi tersebut. Bila integrasi resmi dipertimbangkan di kemudian hari, ia harus dinilai tersendiri sebagai pekerjaan baru.

#### Yang TIDAK direkomendasikan

- **Jangan menambah React Router SSR sebagai server kedua di atas Hono tanpa kebutuhan yang terukur.** Satu renderer untuk Kita Invite adalah tujuan yang dinyatakan POC; dua lapisan server berarti dua pola routing, dua jalur data, dan dua kelas bug yang harus dipelihara.
- Jangan mengklaim Hono menang atas React Router secara umum. Kedua varian memenuhi semua kriteria K1–K5; rekomendasi ini soal kesederhanaan dan beban maintenance untuk kasus ini, bukan kemenangan mutlak.

#### Trade-off rekomendasi ini

1. HTML awal varian A hanya shell + OG + JSON — pengunjung tanpa JS tidak melihat isi undangan. Bila konten tanpa-JS menjadi syarat keras (mis. aksesibilitas/SEO), varian B perlu ditinjau ulang.
2. Hono menambah satu dependensi server ke dalam codebase (kecil, mapan, dirancang untuk Workers).
3. Bila nanti butuh SSR penuh (mis. pratinjau tautan yang menampilkan isi, bukan hanya kartu OG), arsitektur perlu ditambah — bukan diganti dari nol, karena client React-nya sama.
4. Rekomendasi ini dibuat berdasarkan POC yang memakai React 19/Vite 7 untuk varian A dan React 18/Vite 6 untuk varian B (varian B di-downgrade demi ukuran bundle). Perbedaan versi ini dicatat, bukan disembunyikan.

#### Yang dapat mengubah keputusan ini

- Review Agent Meta yang menemukan keberatan atas arah ini yang belum dijawab.
- Acceptance test OG yang gagal untuk varian yang direkomendasikan.
- Keputusan owner bahwa konten tanpa-JS menjadi syarat keras.
- Evaluasi tersendiri yang membuktikan integrasi resmi React Router v8 plus Cloudflare Vite plugin lebih sesuai — evaluasi itu adalah pekerjaan baru, bukan kesimpulan dari POC ini.

#### Status ADR ini

ADR ini tetap **DRAFT** sampai owner menyetujui pilihan final setelah bukti dan masukan gerbang ditinjau (exit criterion 4). Stack final **BELUM** ditetapkan sampai review Agent Meta dan syarat Gerbang Arsitektur selesai.

**Tindak lanjut terbuka dari laporan review POC yang diterima 12 November 2026:** laporan merekomendasikan agar pilihan stack Hono/React/Vite dipisahkan dari pilihan D1/R2 dan provider. Ini adalah rekomendasi untuk dipertimbangkan dalam revisi ADR-001, bukan keputusan atau perubahan arsitektur yang sudah disetujui. ADR tetap DRAFT/provisional; keputusan arsitektur tetap milik owner setelah masukan peninjau ditinjau.

---

## 4. Status Agent Meta dan POC OG

### 4.1 Masukan untuk peninjau arsitektur diterima; verdict review — MASIH MENUNGGU

**Laporan review POC untuk peninjau arsitektur diterima pada 12 November 2026.** Laporan tersebut adalah input/evidence untuk peninjau arsitektur, bukan review atau verdict peninjau arsitektur. Identitas reviewer dan verdict review peninjau arsitektur tetap **MENUNGGU**; dokumen ini tidak menyatakan review tersebut sudah diterima. Tanpa review/verdict peninjau yang sebenarnya, gerbang belum lengkap — jangan menandainya lulus.

Slot pencatatan review/verdict peninjau arsitektur (diisi setelah review peninjau tersedia; laporan input di atas bukan verdict):

| Field | Isi |
|---|---|
| Reviewer | (menunggu) |
| Tanggal diterima | (menunggu — tanggal penerimaan review/verdict peninjau arsitektur) |
| Verdict | (menunggu) |
| Keberatan yang harus dijawab | (menunggu) |
| Jawaban owner/tim atas tiap keberatan | (menunggu) |
| Status tindak lanjut | (menunggu) |

Ketentuan: bila review/verdict peninjau arsitektur belum diterima saat gerbang dinilai, kriteria masuk gerbang tidak terpenuhi dan gerbang dinyatakan **tidak lolos**. Laporan input POC di atas tidak menggantikan review itu. Review peninjau arsitektur adalah prasyarat Gerbang Arsitektur, bukan formalitas.

### 4.2 Status POC Open Graph — K1–K5 dilaporkan lulus, K6 OPEN / UNVERIFIED

**Fakta (dari laporan POC lokal, dengan provenance di bawah):**

- POC membandingkan dua arsitektur dengan konten, aset, CSS, dan data fixture sintetis yang sama, di branch `poc/og-arch`, commit `93df620d016562235c79238299c0f5491a8ca538`.
- Varian A (Hono + React + Vite + TypeScript): https://ki-og-poc-a.xdirgawa.workers.dev — bundle 431.881 byte.
- Varian B (React Router SSR + Vite + TypeScript): https://ki-og-poc-b.xdirgawa.workers.dev — bundle 664.078 byte.
- Kriteria K1–K5 **dilaporkan lulus** untuk kedua varian di 8 run harness (125 cek per run), exit 0 di semua run; smoke A 59/59, B 62/62; rebuild dari clone bersih menghasilkan byte yang identik. Angka 8 run, smoke, dan rebuild ini berasal dari laporan POC awal dan berbeda provenance dari audit independen di bawah.
- **Audit independen K1–K5 (dalam laporan review POC yang diterima 12 November 2026):** Varian A dan Varian B masing-masing **125/125, exit 0**. Satu run langsung per varian berhasil direproduksi secara independen. Salinan harness sementara untuk audit menghapus hanya konfigurasi proxy lokal `127.0.0.1:8888` yang tidak tersedia; URL target, fixtures, assertions, serta metode GET/browser dipertahankan. Hasil ini adalah bukti run independen terpisah, bukan hasil dari delapan run yang dilaporkan lingkungan pembuat.
- Bukti perbandingan hanya berlaku untuk Varian A dan Varian B yang benar-benar diuji. Varian B adalah React Router 7.18.5 framework-less SSR, bukan integrasi resmi React Router v8 + Cloudflare Vite plugin; perbedaan versi/setup membatasi kesetaraan. Hasil A-vs-tested-B ini **bukan bukti umum bahwa Hono lebih unggul daripada React Router**.
- **K6 (kartu preview WhatsApp aktual) tetap OPEN / UNVERIFIED** sesuai keputusan owner (lihat §0 dan §2.12). Kartu WhatsApp aktual **tidak diuji** dan tidak ada klaim kartu tampil. OG HTML yang benar hanya prasyarat crawler, bukan bukti kartu tampil.

**Provenance bukti — baca dengan teliti:**

- Laporan lengkap POC (`REPORT-poc-og.md`) **HANYA tersedia lokal** di `~/workspace/kita-invite-refactor/REPORT-poc-og.md` dan **TIDAK terarsip di GitHub** (diverifikasi via GitHub API: tidak ada di tree branch `poc/og-arch` commit `93df620d` yang berisi 66 blob, tidak ada di tree `main` commit `70bb0641`, dan `poc/tests/evidence/` tidak terkomit). Bukti run (HTML mentah, screenshot, `results.json`) juga tidak terkomit.
- Karena itu, dokumen ini hanya menautkan kode dan harness POC yang **benar-benar ada** di GitHub (sudah diverifikasi di roadmap v0.1.1):
  - Fixture (dua pasangan fiktif): https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/shared/fixture.json
  - Varian A (Hono Worker): https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/og-a/src/worker.ts
  - Varian B (entry server SSR): https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/og-b/src/entry.server.tsx
  - Harness tes: https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/tests/run-tests.mjs
  - Server lokal untuk harness: https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/tests/local-server.mjs
- Provenance hasil dibedakan: angka delapan run, smoke, dan rebuild berasal dari laporan POC awal yang hanya lokal; angka 125/125 per varian berasal dari audit independen yang dicatat dalam laporan review POC yang diterima. Audit independen adalah bukti run terpisah, bukan artefak source/harness yang terkomit. Laporan POC awal lengkap, raw HTML, screenshots, dan `results.json` **tidak committed ke GitHub**; source dan harness POC yang ditautkan di atas ada di branch, tetapi bukan pengganti bukti hasil run tersebut. Langkah reproduksi terperinci laporan awal tidak ditulis ulang di sini.
- Dua Worker POC (`ki-og-poc-a` dan `ki-og-poc-b`) dipertahankan sebagai demo atas permintaan owner. Dokumen ini tidak memerintahkan penghapusan atau perubahan terhadap keduanya.

**Kriteria acceptance HTML OG/crawler untuk Fase 0 (ditulis agar dapat diuji ulang):**

Kriteria ini membedakan bukti prasyarat crawler dari bukti kartu WhatsApp aktual. Lolosnya kriteria ini **bukan** bukti kartu WhatsApp tampil.

1. `GET` tanpa JavaScript menghasilkan HTML awal berstatus benar dengan `<title>`, canonical URL, `og:title`, `og:description`, `og:type`, `og:url`, dan `og:image` absolut; nama pasangan, deskripsi, slug, dan gambar sesuai undangan itu.
2. `og:image` dapat diambil publik dengan HTTP 200 dan content type gambar yang benar.
3. Dua slug berbeda tidak berbagi metadata/cache secara keliru; slug tak dikenal menghasilkan 404 yang jelas, tanpa menampilkan fallback pasangan lain.
4. Setelah JavaScript aktif, tampilan pasangan tetap sama dengan metadata server dan undangan tetap interaktif; tidak ada hydration error atau lompatan konten yang merusak tampilan.
5. Halaman diuji di lebar 320, 360, 375, 390, 430, 820, dan 1024 px; overflow, clipping, dan urutan konten dicatat.
6. K6 (kartu WhatsApp aktual) dicatat terpisah sebagai **OPEN / UNVERIFIED**; tidak ada klaim kartu tampil tanpa bukti kartu yang benar-benar terlihat.

**Batasan pengujian WhatsApp (mengikat):** tidak ada pengiriman URL lewat WhatsApp atau kanal lain ke kontak nyata. Bila nanti ada metode uji nyata yang aman, perlu persetujuan terpisah sebelum mengirim atau menampilkan URL melalui kanal eksternal.

---

## 5. Kunci produk yang tidak boleh diubah

### 5.1 Keputusan produk yang terkunci (tulis persis, tanpa ubah angka)

1. Semua akun baru Free. Free boleh edit semua template dan menyimpan draft.
2. Batas jumlah draft Free dan TTL/retensi draft belum diputuskan. Jangan menciptakan angka.
3. Tier/paket ditentukan oleh versi template yang dipilih.
4. Basic aktif 1 bulan, Premium 6 bulan, Signature 12 bulan, Exclusive 18 bulan. Masa aktif dimulai saat undangan dipublikasikan, bukan saat dibayar.
5. Expiry dikunci pada akhir bulan target pukul 23:59:59 WIB. Tanggal acara tidak menutup undangan.
6. Harga prototype Basic Rp29.000, Premium Rp59.000, Signature Rp99.000, Exclusive mulai Rp149.000 hanya referensi prototype, bukan harga komersial final.
7. Auth provider, payment gateway, domain, email transaksional, Cloudflare plan, harga komersial final, batas/retensi draft, aturan order sudah dibayar tetapi belum dipublikasi, dan kebijakan migrasi prototype tetap keputusan owner.
8. Migrasi data localStorage bersifat per pengguna/per perangkat. Jangan menjanjikan semua draft pindah otomatis.
9. Seed prototype adalah data fiktif, bukan data pelanggan.
10. Pages hanya untuk preview/audit. Target production di masa depan tetap Cloudflare Full Stack, tetapi Fase 0 tidak mengimplementasikannya.
11. Dua Worker POC (`ki-og-poc-a` dan `ki-og-poc-b`) tetap aktif sementara atas permintaan owner.

### 5.2 Provenance tes V25 dan status Stage 2

Kronologi ini membedakan catatan tes pada commit V25 dari audit independen setelahnya. Kedua angka dipertahankan; keduanya benar pada waktunya masing-masing, dan tidak boleh ditukar.

1. Catatan pada commit V25 (commit `68bf66ceb62e2182a6559fe7a238d354568e7cbf`, `TESTS.md` yang terkomit di commit itu): `npm run test:e2e` berakhir exit 1 dengan ringkasan **360 dari 362** PASS. Dua FAIL yang dikenal, keduanya gate font wordmark di modul regression (Playfair Display 700 dan Manrope 700 tidak tersedia di runtime tes).
2. Audit independen Lora yang lebih baru (11 November 2026 pukul 12:07 WIB, via Cue): Lora mengulang dari clone bersih dengan font termuat dan menghasilkan E2E **362 dari 362**, beserta fixture 172 dari 172 dan handler 63 dari 63.
3. Setelah audit itu, Stage 2 diterima sebagai **APPROVED WITH MINOR NOTES**. Status approval ini adalah **verdict audit Lora, bukan klaim dari Muse**.

Aturan penulisan yang berlaku untuk dokumen ini: JANGAN menyatakan V25 sendiri mencatat 362 dari 362. Bila angka 362 dari 362 dikutip, sebut sumbernya sebagai audit independen Lora pada 11 November 2026 pukul 12:07 WIB. Bila angka commit V25 dikutip, tulis 360 dari 362 dengan exit 1 dan dua gate font.

### 5.3 Asumsi tercatat

Semua asumsi di bawah ini ditandai dengan label `[ASUMSI]`. Asumsi bukan fakta. Bila asumsi terbukti salah, bagian terkait harus ditinjau ulang dan owner harus memutuskan langkah berikutnya.

1. [ASUMSI] Baseline V25 dan bukti POC yang dirujuk di dokumen ini adalah acuan perencanaan yang benar dan lengkap. Laporan lengkap POC hanya tersedia lokal dan ditandai tidak terarsip di GitHub (§4.2).
2. [ASUMSI] Owner dan reviewer Agent Meta tersedia untuk meninjau Fase 0 dan Gerbang Arsitektur.
3. [ASUMSI] Lingkungan dev, staging, dan production dapat dipisahkan sepenuhnya di Cloudflare sesuai rencana Fase 1 roadmap.
4a. [ASUMSI] Payment gateway yang akan dipilih owner mendukung signature verification dan event verification untuk webhook — asumsi ini perlu diuji terhadap gateway terpilih setelah provider dipilih, dan BUKAN fakta sebelum provider dipilih. Tidak ada fitur gateway tertentu yang dinyatakan sebagai fakta di dokumen ini.
4b. [ASUMSI] Pemrosesan webhook di aplikasi bersifat idempotent, yaitu pengiriman ulang webhook tidak membuat order ganda — ini asumsi tentang perilaku aplikasi, terpisah dari verifikasi signature/event pada 4a, dan harus dibuktikan dengan pengujian di Fase 6.
5. [ASUMSI] Draft server-side dapat dipulihkan setelah perangkat berganti, selama draft itu sudah tersimpan di server.
6. [ASUMSI] Data prototype localStorage tidak berpindah otomatis ke production, dan ekspor-impor lokal hanya dilakukan bila dibutuhkan dan bila owner menyetujuinya.
7. [ASUMSI] Template baru tidak mengubah undangan versi lama, selama versioning diterapkan sesuai Fase 3 roadmap.
8. [ASUMSI] Acceptance test OG atau crawler yang disiapkan di Fase 0 cukup untuk menilai HTML dan OG per undangan, dan tidak dipakai untuk mengklaim kartu WhatsApp tampil.
9. [ASUMSI] Tidak ada kebutuhan KV, Durable Objects, atau Queues sampai ada kebutuhan terukur yang dicatat dan disetujui owner.
10. [ASUMSI] Harga prototype yang dikutip di §5.1 tetap menjadi acuan yang sah sampai owner memutuskan harga komersial final di Fase 6.

---

## 6. Checklist exit Fase 0

**Status Fase 0: SEDANG BERJALAN.** Semua checklist di bawah ini **BELUM dicentang** sampai ada bukti atau approval yang disyaratkan. Jangan menyatakan Gerbang Arsitektur lulus, jangan lanjut Fase 1, dan jangan memulai implementasi sebelum checklist ini terpenuhi dan owner menyatakannya secara eksplisit.

Checklist ini membedakan empat hal yang berbeda: **(A) keputusan owner yang sudah diberikan dan dicatat** (butir 1, 6, 7 — yang menunggu hanyalah verifikasi pencatatan oleh owner saat meninjau revisi dokumen ini, bukan pengulangan keputusan); **(B) ratifikasi status dan penundaan yang sudah tercatat** (butir 2 — yang dibutuhkan adalah owner meratifikasi status serta penundaan di register, bukan memutuskan seluruh keputusan turunan D1–D10 sekarang); **(C) keputusan yang boleh ditunda** sesuai fase dan blocker di register (keputusan turunan D1–D10 — bukan syarat menutup Fase 0, kecuali kunci MVP, pilihan stack final, dan keputusan status K6 yang wajib final di Fase 0); **(D) syarat gerbang yang masih menunggu bukti atau keputusan eksternal** (butir 3, 4, 5 — review Agent Meta, bukti OG, dan keputusan stack final yang sungguh belum ada).

| # | Exit criterion | Status | Yang kurang | Yang perlu bertindak |
|---|---|---|---|---|
| 1 | Scope MVP M1–M8 sudah diputuskan owner dan dicatat (§0, §1.1, §2.1 — keputusan owner 11 November 2026 pukul 18:34 WIB); bagian pasca-MVP P1–P8 dicatat sebagai daftar kandidat (rekomendasi, belum disetujui owner sebagai roadmap pasca-MVP final) yang ditunda beserta konsekuensinya (§1.2). Pilihan MVP tidak lagi menunggu | [ ] BELUM | Keputusan cakupan M1–M8 sudah diputuskan dan dicatat; yang masih kurang untuk butir ini hanyalah **verifikasi pencatatan** oleh owner saat meninjau revisi dokumen ini. Keputusan turunan D1–D10 di §1.4 sudah tercatat di register (§2) — masing-masing dengan status, fase pemutus, blocker, dan konsekuensinya — dan owner boleh meratifikasi status/penundaannya di Fase 0; keputusan finalnya mengikuti fase masing-masing dan TIDAK semuanya harus diputuskan atau difinalisasi untuk menutup Fase 0. Masing-masing keputusan harus selesai paling lambat sebelum fase atau modul yang bergantung padanya dimulai, sesuai register §2: D1 auth provider dan model session (sebelum Fase 2 dimulai); D2 payment gateway termasuk pengujian asumsi webhook 4a/4b (sebelum integrasi webhook Fase 6); D3 domain dan D4 Cloudflare plan (sebelum provisioning production Fase 1); D5 email transaksional (sebelum Fase 7 membangun notifikasi); D6 jumlah maksimum draft Free serta TTL/retensi draft (sebelum batas atau TTL apa pun diterapkan di Fase 4); D7 aturan order sudah dibayar tetapi belum dipublikasi dan D8 harga komersial final (sebelum checkout dibuka di Fase 6); D9 kebijakan migrasi draft prototype (sebelum migrasi atau UAT di Fase 8); D10 syarat dan metode yang aman untuk menguji kartu WhatsApp nyata (bila pengujian nyata dipertimbangkan). Keputusan turunan itu tidak membatalkan scope M1–M8. | Owner (verifikasi pencatatan keputusan M1–M8; meratifikasi status/penundaan keputusan turunan D1–D10 di Fase 0; memutuskan keputusan turunan di §1.4 sesuai fasenya masing-masing — bukan sekarang sekaligus); tim (mencatat keputusan turunan beserta konsekuensinya) |
| 2 | Semua baris register (§2) sudah memiliki status (2 DECIDED BY OWNER, 10 MENUNGGU beserta metode uji aman K6); tidak ada keputusan yang dikarang atau dianggap otomatis disetujui | [ ] BELUM | Status semua baris sudah tercatat: §2.1 DECIDED BY OWNER — M1–M8 dan §2.12 DECIDED BY OWNER (status K6 tetap terbuka); 10 baris lainnya (§2.2–§2.11) masih MENUNGGU beserta metode uji aman K6. Yang masih diperlukan adalah owner **meninjau dan meratifikasi status serta penundaan yang sudah dicatat** — BUKAN memutuskan seluruh D1–D10 sekarang. Keputusan turunan tetap dapat ditunda sesuai fase dan blocker di register (§2); keputusan yang menjadi prasyarat coding suatu modul harus sudah dibuat sebelum coding modul itu dimulai | Owner (meratifikasi status dan penundaan yang tercatat); tim (memperbarui register sesuai catatan owner) |
| 3 | Review peninjau arsitektur diterima dan dicatat dengan verdict serta keberatan/tindak lanjut; jika belum tersedia, gerbang arsitektur masih tertahan | [ ] BELUM | Review/verdict peninjau arsitektur **belum diterima** (status: MASIH MENUNGGU, §4.1). Laporan review POC diterima 12 November 2026 sebagai input/evidence bagi peninjau, bukan verdict; identitas reviewer dan verdict tetap menunggu. Tanpa review peninjau ini kriteria masuk gerbang tidak terpenuhi, dan stack final belum dipilih | Peninjau arsitektur (memberi review); owner/tim (mencatat identitas, verdict, keberatan, dan jawaban setelah diterima) |
| 4 | ADR stack tetap DRAFT sampai owner menyetujui pilihan final setelah bukti/masukan gerbang ditinjau | [ ] BELUM | ADR di §3 masih berstatus **DRAFT** (rekomendasi provisional Hono + React + TypeScript + Vite, D1, R2). Finalisasi menunggu review Agent Meta (§4.1), acceptance OG (§4.2), dan keputusan eksplisit owner atas pilihan final. Gerbang Arsitektur belum lulus | Owner (menyetujui pilihan final setelah bukti gerbang ditinjau); tim (menyiapkan bukti gerbang) |
| 5 | Kriteria HTML OG/crawler tertulis (§4.2) dan hasil POC yang dapat diulang dibedakan dari bukti kartu WhatsApp aktual | [ ] BELUM | Kriteria **tertulis belum berarti disetujui owner atau tes ulang sudah terdokumentasi**. Bukti atau persetujuan yang masih diperlukan sebelum gerbang dinilai: (a) persetujuan owner atas kriteria §4.2; (b) pencatatan run ulang yang terdokumentasi dan dapat diulang (hasil harness beserta bukti run yang dapat diverifikasi). Pemisahan dari bukti kartu WhatsApp sudah dinyatakan tetapi belum dikonfirmasi owner | Owner (menyetujui kriteria §4.2); tim (menjalankan dan mendokumentasikan run ulang bila diminta) |
| 6 | Pilihan owner K6 OPEN / UNVERIFIED sudah dicatat (§0, §2.12, §4.2); K6 bukan syarat yang dianggap lulus. Bila owner kemudian memilih K6 wajib dibuktikan sebelum final stack, gerbang menunggu metode uji aman | [ ] BELUM | Pilihan owner sudah dicatat; yang menunggu hanyalah **verifikasi pencatatan** oleh owner saat meninjau revisi dokumen ini — bukan pengulangan pilihan. Kartu WhatsApp aktual **belum diuji dan belum lulus**; dokumen ini tidak mengklaim kartu sudah diuji atau lulus | Owner (verifikasi pencatatan sudah benar saat meninjau revisi dokumen ini) |
| 7 | Izin perencanaan Fase 0 sudah diberikan owner dan dicatat (§0); izin ini tidak membuka coding produk, perubahan production, provisioning resource, deploy production, Gerbang Arsitektur, atau Fase 1 — semua itu membutuhkan persetujuan terpisah | [ ] BELUM | Izin perencanaan Fase 0 sudah diberikan dan dicatat; yang menunggu hanyalah **verifikasi pencatatan** oleh owner saat meninjau revisi dokumen ini — dibedakan dari permintaan persetujuan baru; ini bukan persetujuan baru dan bukan persetujuan Fase 0 selesai. Pemberian izin ini tidak berarti checklist lain atau Gerbang Arsitektur otomatis lulus | Owner (verifikasi pencatatan batas otorisasi saat meninjau revisi dokumen ini) |

**Bila ada exit criterion yang tertahan, pekerjaan berhenti pada perencanaan.** Tidak ada criterion yang dilewati diam-diam dan tidak ada Fase 1 yang dimulai secara otomatis. Setiap pencentangan membutuhkan bukti atau approval yang dicatat — bukan asumsi.

---

## 7. Penutup

Dokumen ini adalah paket keputusan Fase 0 untuk ditinjau owner. Dokumen ini bukan persetujuan implementasi, bukan persetujuan production deploy, bukan kelulusan Gerbang Arsitektur, dan bukan izin Fase 1. Fase 0 berstatus **SEDANG BERJALAN** dan Gerbang Arsitektur **belum lulus**.

Keputusan yang sudah dibuat owner dan tidak perlu diulang: (1) mulai Fase 0 saja, sebatas perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; (2) K6 tetap terbuka sampai ada cara uji yang aman — status K6 **OPEN / UNVERIFIED**; (3) scope MVP M1–M8 diterima owner (11 November 2026 pukul 18:34 WIB; pesan owner: "gapapa M1-M8 juga bos").

Keputusan M1–M8 tidak menghapus exit gates keamanan, privasi, aksesibilitas, responsive layout, backup/restore, monitoring, dan rollback yang diperlukan sebelum peluncuran.

Yang masih perlu owner tinjau dan putuskan: keputusan turunan di §1.4; isi register keputusan (§2) beserta status tiap baris yang masih MENUNGGU; ADR stack draft (§3); kriteria acceptance OG (§4.2); dan ketujuh exit criterion di §6.

Bila ada bagian dokumen ini yang bertentangan dengan keputusan terkunci di §5.1, keputusan terkunci yang berlaku.

---

## 8. Riwayat revisi

### v0.1.3 → v0.1.4

| | |
|---|---|
| Versi sebelumnya | v0.1.3 (branch `docs/phase0-planning-v0.1.3`, commit `2c1bba8d1f48a6d11097bb48b5118354c5cd1ed7`) |
| Versi ini | v0.1.4 (12 November 2026) — revisi dokumentasi-only dari v0.1.3 |
| Pemicu revisi | Laporan review POC untuk peninjau arsitektur diterima 12 November 2026; dicatat sebagai input/evidence, bukan verdict peninjau arsitektur |

Perubahan pada revisi ini (hanya metadata §0, catatan terbuka §3, status §4.1–§4.2, klarifikasi §6 butir 3, dan riwayat §8):

1. **Laporan POC dan status peninjau (§4.1):** laporan review POC dicatat diterima 12 November 2026 sebagai input untuk peninjau arsitektur. Identitas reviewer dan verdict review tetap MENUNGGU; laporan tersebut bukan verdict dan tidak membuat Gerbang Arsitektur lulus.
2. **Audit independen dan provenance (§4.2):** K1–K5 dicatat 125/125, exit 0 untuk masing-masing varian yang diuji; satu run langsung per varian direproduksi independen. Salinan harness audit menghapus hanya konfigurasi proxy lokal yang tidak tersedia, sambil mempertahankan URL, fixtures, assertions, dan metode GET/browser. Source/harness yang terkomit dibedakan dari bukti run independen; laporan POC awal lengkap, raw HTML, screenshots, dan `results.json` tidak committed ke GitHub.
3. **Batas klaim (§4.2):** K6 tetap OPEN / UNVERIFIED dan kartu WhatsApp aktual tidak diuji. Perbandingan A-vs-tested-B dibatasi pada dua varian dan konfigurasi yang diuji, bukan bukti umum bahwa Hono unggul atas React Router.
4. **Tindak lanjut ADR (§3):** rekomendasi laporan untuk memisahkan pilihan Hono/React/Vite dari D1/R2/provider dicatat sebagai item terbuka; ADR-001 tetap DRAFT/provisional dan pilihan arsitektur tidak diputuskan oleh revisi ini.
5. **Status fase dan kriteria:** klarifikasi §6 butir 3 menyatakan laporan input bukan verdict review peninjau. Ketujuh exit criteria tetap `[ ] BELUM`; Fase 0 tetap **SEDANG BERJALAN**, Gerbang Arsitektur belum lulus, Fase 1 belum disetujui, dan tidak ada status K6/stack yang dinaikkan.

Pernyataan penutup revisi: revisi ini dokumentasi-only; tidak ada kode aplikasi, prototype, seed data, konfigurasi atau resource Cloudflare, atau deployment production yang diubah. Revisi ini bukan persetujuan implementasi, bukan kelulusan Gerbang Arsitektur, bukan penyelesaian Fase 0, dan bukan izin Fase 1.

### v0.1.2 → v0.1.3

| | |
|---|---|
| Versi sebelumnya | v0.1.2 (branch `docs/phase0-planning-v0.1.2`, commit `aecec9d253c2a9979f55b3dccbd3995fcfc1d11d`) |
| Versi ini | v0.1.3 (11 November 2026) — revisi dokumentasi-only dari v0.1.2 |
| Pemicu revisi | Prompt klarifikasi Lora yang diteruskan owner 11 November 2026 pukul 20:13 WIB |

Perubahan pada revisi ini (hanya §6 butir 1, rujukan P1–P8, §0, dan §8):

1. **Checklist §6 butir 1 — keputusan turunan D1–D10.** "Yang kurang" disusun ulang: yang masih kurang untuk butir 1 hanyalah verifikasi pencatatan keputusan M1–M8. D1–D10 sudah tercatat di register (§2) — masing-masing dengan status, fase pemutus, blocker, dan konsekuensinya — dan owner boleh meratifikasi status/penundaannya di Fase 0; keputusan finalnya mengikuti fase masing-masing dan TIDAK semuanya harus diputuskan atau difinalisasi untuk menutup Fase 0. Masing-masing keputusan harus selesai paling lambat sebelum fase atau modul yang bergantung padanya dimulai, sesuai register §2. Daftar D1–D10 tidak lagi tampil seolah seluruhnya "masih kurang" sebagai syarat exit Fase 0.
2. **P1–P8 sebagai daftar kandidat (bukan roadmap pasca-MVP final).** Pengantar dan judul §1.2, §2.1, serta §6 butir 1 kini menyebut P1–P8 sebagai daftar fitur kandidat yang tidak termasuk scope MVP saat ini dan direkomendasikan untuk ditinjau/diprioritaskan kemudian — daftar kandidat (rekomendasi, belum disetujui owner sebagai roadmap pasca-MVP final). Owner belum menyetujui tiap fitur sebagai roadmap pasca-MVP final dan belum berkomitmen membangunnya. Isi dan urutan 8 baris tabel P1–P8 tidak berubah.

Pernyataan penutup revisi: revisi ini dokumentasi-only; tidak ada kode produk, resource Cloudflare, atau deployment yang diubah. Fase 0 tetap **SEDANG BERJALAN**; Gerbang Arsitektur **belum lulus** dan Fase 1 **belum disetujui**. Revisi ini bukan approval Fase 0 — hanya klarifikasi redaksional atas dua ambiguitas kecil.

### v0.1.1 → v0.1.2

| | |
|---|---|
| Versi sebelumnya | v0.1.1 (branch `docs/phase0-planning-v0.1.1`, commit `2744ba23ebfc146718bd4600c53ee551869f99fd`) |
| Versi ini | v0.1.2 (11 November 2026) — revisi dokumentasi-only dari v0.1.1 |
| Pemicu revisi | Prompt klarifikasi Lora yang diteruskan owner 11 November 2026 pukul 18:58 WIB |

Perubahan pada revisi ini (hanya §6, §0, dan §8):

1. **Checklist exit Fase 0 (§6) ditulis ulang agar membedakan empat hal:** (A) keputusan owner yang sudah diberikan dan dicatat; (B) ratifikasi status dan penundaan yang sudah tercatat; (C) keputusan yang boleh ditunda sesuai register; (D) syarat gerbang yang masih menunggu bukti atau keputusan eksternal. Ketujuh kriteria tetap `[ ] BELUM`; tidak satu pun yang ditandai `[x]`.
2. **Butir 1 (scope MVP):** teks kriteria kini menyatakan scope M1–M8 sudah diputuskan owner dan dicatat, bukan lagi "Owner menyetujui scope MVP" yang terbaca seolah pilihan masih menunggu. Keputusan turunan D1–D10 disebut beserta waktu yang diperlukan masing-masing, dan ditegaskan tidak semua detail harus ditetapkan untuk menutup Fase 0 — hanya kunci MVP, pilihan stack final, dan keputusan status K6 yang wajib final di Fase 0.
3. **Butir 2 (register keputusan):** teks kriteria kini menyatakan semua baris sudah memiliki status; yang dibutuhkan adalah ratifikasi owner atas status dan penundaan yang tercatat, bukan memutuskan seluruh D1–D10 sekarang. Ditegaskan keputusan turunan tetap dapat ditunda sesuai fase dan blocker di register, dan keputusan prasyarat coding harus dibuat sebelum coding modul itu dimulai.
4. **Butir 3 dan 4:** tetap BELUM/MENUNGGU dan tetap DRAFT; ditegaskan tidak ada klaim review sudah ada dan stack final belum dipilih.
5. **Butir 5 (acceptance OG/crawler):** ditegaskan kriteria tertulis belum berarti disetujui owner atau tes ulang sudah terdokumentasi; bukti dan persetujuan yang masih diperlukan sebelum gerbang dinilai disebutkan eksplisit (persetujuan owner atas kriteria §4.2 + pencatatan run ulang yang terdokumentasi dan dapat diulang).
6. **Butir 6 (K6) dan 7 (batas otorisasi):** frasa "verifikasi pencatatan" menggantikan permintaan konfirmasi yang dapat terbaca sebagai pengulangan keputusan; verifikasi pencatatan dibedakan dari permintaan persetujuan baru. Tidak ada klaim kartu WhatsApp sudah diuji atau lulus.
7. **Tidak ada perubahan pada:** scope M1–M8, K6, harga/paket/expiry, aturan Free/draft, stack recommendation, atau keputusan produk lainnya; review Agent Meta — masih menunggu (§4.1); provenance tes V25 (§5.2); kunci produk §5.1.

Pernyataan penutup revisi: revisi ini dokumentasi-only; tidak ada kode produk, resource Cloudflare, atau deployment yang diubah. Fase 0 tetap **SEDANG BERJALAN**; Gerbang Arsitektur **belum lulus** dan Fase 1 **belum disetujui**. Revisi ini bukan approval Fase 0 — hanya klarifikasi dokumentasi atas status checklist.

### v0.1 → v0.1.1

| | |
|---|---|
| Versi sebelumnya | v0.1 (branch `docs/phase0-planning-v0.1`, commit `1d3411a6b9a44e4a095193bbdea84e153a60719d`) |
| Versi ini | v0.1.1 (11 November 2026) — revisi dokumentasi-only dari v0.1 |
| Pemicu revisi | Keputusan owner 11 November 2026 pukul 18:34 WIB (pesan owner: "gapapa M1-M8 juga bos") dan prompt koreksi Lora yang diteruskan owner 11 November 2026 pukul 18:35 WIB |

Perubahan pada revisi ini:

1. **Scope M1–M8 sebagai keputusan owner.** M1–M8 ditandai DECIDED BY OWNER — MVP scope accepted (§0 butir 3, §1, §2.1). Alternatif scope di §1.3 dicatat sebagai opsi yang TIDAK dipilih. Scope tidak diganti dengan Revenue MVP, pilot M1–M4, atau scope yang lebih sempit. Daftar pasca-MVP P1–P8 dipertahankan seperti v0.1, tanpa perubahan cakupan. §1.4 baru mencatat 10 keputusan turunan di dalam M1–M8 yang masih perlu diputus (D1–D10), tanpa membatalkan scope yang sudah dipilih.
2. **Register keputusan (§2).** §2.1 berubah dari MENUNGGU menjadi DECIDED BY OWNER — M1–M8. §2.12 K6 tetap DECIDED BY OWNER (status tetap terbuka; metode uji aman MENUNGGU). Sepuluh baris lainnya (§2.2–§2.11) tetap MENUNGGU. Rekomendasi "tanpa batas/TTL draft sampai ada keputusan" di §2.8 tetap rekomendasi dan tidak berubah menjadi keputusan owner; batas jumlah dan TTL tetap belum diputuskan dan jangan diterapkan.
3. **Checklist exit Fase 0 (§6).** Ketujuh kriteria tetap `[ ] BELUM`. Butir 1 mencatat keputusan M1–M8 sudah diterima owner beserta keputusan turunan yang masih perlu diputus. Butir 2 menyatakan status register sudah dicatat (2 baris DECIDED BY OWNER, 10 baris MENUNGGU beserta metode uji aman K6) dan owner masih perlu meratifikasi baris yang belum diputuskan — bukan seolah status semua baris kosong. Butir 6 dan 7 tidak meminta owner mengulang keputusan yang sudah diberikan (K6 dan otorisasi Fase 0); yang kurang hanya peninjauan owner atas pencatatan ini dalam revisi dokumen ini. Butir 3, 4, dan 5 tidak berubah secara substansi.
4. **Batas otorisasi Fase 0 ditandai sudah diberikan owner (§0).** Pemberian otorisasi itu tidak berarti checklist lain atau Gerbang Arsitektur otomatis lulus.
5. **Tidak ada perubahan pada:** stack provisional (Hono + React + TypeScript + Vite, D1, R2) dan ADR draft (§3); status review Agent Meta — masih menunggu (§4.1); provenance tes V25 — TESTS.md V25 mencatat 360/362 exit 1, audit Lora setelahnya 362/362 saat font termuat, Stage 2 APPROVED WITH MINOR NOTES adalah verdict audit Lora (§5.2); status K6 — OPEN / UNVERIFIED (§4.2); kunci produk §5.1; tautan GitHub — hanya kode/harness POC yang benar-benar terkomit; REPORT-poc-og.md tetap tidak terarsip di GitHub.

Pernyataan penutup revisi: revisi ini dokumentasi-only; tidak ada kode produk, resource Cloudflare, atau deployment yang diubah. Fase 0 tetap **SEDANG BERJALAN**; Gerbang Arsitektur **belum lulus** dan Fase 1 **belum disetujui**. Persetujuan Fase 0 sebelumnya adalah izin melanjutkan planning saja — bukan persetujuan coding produk, provisioning production, deploy production, atau Fase 1; Fase 1 memerlukan persetujuan owner terpisah.
