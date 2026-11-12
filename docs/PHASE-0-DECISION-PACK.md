# Kita Invite — Paket Keputusan Fase 0 (Phase 0 Decision Pack)

## 0. Metadata dan batas otorisasi

| | |
|---|---|
| Judul | Kita Invite — Paket Keputusan Fase 0 |
| Versi | v0.1.7 (dokumen perencanaan Fase 0; revisi dari v0.1.6 — riwayat revisi di §8) |
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

### Penunjukan reviewer formal (v0.1.7)

- Agent Muse/Meta sudah **retired**. **Harley** adalah executor teknis; **Lora** memeriksa secara independen dan tidak menjadi executor untuk review ini.
- Owner menunjuk **Lora sebagai reviewer formal Architecture Gate pada 12 November 2026 pukul 18:49 WIB**. Review formal atas packet komparasi lokal dan verdict-nya dicatat di §4.1–§4.2.
- Verdict review yang tercatat **bukan** keputusan stack final dan **bukan** kelulusan Gerbang Arsitektur. Owner tetap pemutus stack; seluruh syarat gerbang lainnya tetap berlaku.

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
| P8 | Integrasi resmi React Router v8 plus Cloudflare Vite plugin sebagai opsi arsitektur | Opsi ini sudah dinilai dalam POC komparatif lokal yang direview Lora (§3–§4.2), tetapi tidak dipilih sebagai stack final dan tidak berarti integrasi produk disetujui atau dibangun |

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
- **Opsi yang layak:** (i) Hono + React + TypeScript + Vite — Hono Worker untuk API `/api/v1` dan route undangan publik `/:slug` dengan OG dinamis, React untuk UI interaktif (varian A POC); (ii) React Router v8 framework mode dengan Cloudflare Vite plugin resmi v1 (varian B POC, versi yang diuji tercatat di §4.2). Keduanya diuji secara lokal pada cakupan komparasi yang dicatat; belum ada pilihan stack final.
- **Rekomendasi provisional:** pertahankan Hono + React + TypeScript + Vite sebagai arah yang diutamakan sementara untuk pola API-first, dengan Hono Worker untuk `/api/v1` dan route publik `/:slug` ber-OG dinamis serta React untuk UI interaktif. HTML awal POC menampilkan fallback hero yang terbaca, bukan seluruh isi undangan tanpa JavaScript. Bukti tidak menunjukkan pemenang bundle/performa yang jelas. D1, R2, dan provider tetap keputusan terpisah. Hasil review dan batas rekomendasi dicatat di §3–§4.2; ini bukan keputusan final owner.
- **Pemutus:** Owner, setelah masukan reviewer Architecture Gate yang ditunjuk owner dan acceptance test OG ditinjau.
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
| Status | **DRAFT** — rekomendasi provisional, bukan keputusan final owner |
| Tanggal | 12 November 2026 |
| Diputuskan oleh | Belum diputuskan — owner tetap pemutus stack final setelah meninjau bukti dan seluruh syarat Gerbang Arsitektur |
| Reviewer formal | Lora, ditunjuk owner 12 November 2026 pukul 18:49 WIB; verdict review dan tindak lanjut dicatat di §4.1 |
| Dasar bukti | Perbandingan POC lokal Hono vs React Router v8 resmi + Cloudflare Vite plugin, packet `/workspace/kita-invite-architecture-comparison-20261112/reviewer-packet.md`, JSON hasil dan runner di §4.2. Bukti ini lokal/non-production dan tidak di-commit ke repository produk. |

#### Konteks dan rekomendasi provisional

Kita Invite membutuhkan route undangan publik dengan metadata Open Graph yang sesuai per slug serta UI interaktif. Owner belum memilih stack final. Untuk pola **API-first**, rekomendasi kerja tetap **Hono + React + TypeScript + Vite**: Hono Worker menangani API `/api/v1` dan route publik `/:slug` dengan HTML awal serta OG dinamis; React menangani UI interaktif. Cloudflare Vite plugin merupakan jalur build/runtime yang didukung dokumentasi Cloudflare untuk Workers. Ini rekomendasi provisional, bukan keputusan implementasi atau production.

Pilihan D1, R2, auth/provider, dan konfigurasi produksi **tidak** ditetapkan oleh perbandingan ini; masing-masing tetap keputusan terpisah di register §2. React Router v8 framework mode dengan Cloudflare Vite plugin resmi tetap alternatif yang kredibel bila owner memprioritaskan routing framework dan SSR terpusat. Jangan menambah framework/server kedua di atas Hono tanpa kebutuhan terukur.

#### Bukti komparatif yang ditinjau Lora

Dua varian POC lokal menggunakan fixture sintetis yang sama. Hono memakai Hono 4.13.17, React 19.3.1, dan Vite 7.3.8. Varian pembanding adalah React Router **v8 framework mode** (`react-router`/`@react-router/dev` 8.5.1) dengan Cloudflare Vite plugin 1.69.1, React 19.3.1, dan Vite 8.3.8. Plugin v1 adalah jalur stable yang diuji; plugin v2 masih beta. Keduanya lulus K1–K5, masing-masing **87/87 pemeriksaan** lokal; build dan typecheck lulus. Rincian hitungan, cakupan, dan provenance ada di §4.2.

Pada respons tanpa JavaScript, kedua varian menampilkan fallback hero yang terbaca: cover, nama, tanggal, venue, tombol, dan pemberitahuan bahwa konten interaktif memerlukan JavaScript; head HTML memuat title, canonical, dan metadata Open Graph. **Deskripsi/teks isi, detail acara, countdown, galeri, dan footer tidak tampak di body tanpa JavaScript**; elemen interaktif tersebut hadir setelah JavaScript dan interaksi buka undangan. Jadi POC membuktikan fallback inti, bukan seluruh isi undangan tanpa JS.

Cover sintetis ditunda 2,4 detik. Pengukuran setelah stylesheet siap menghasilkan CLS **0** dan perpindahan anchor hero maksimum **0 px** pada kedua varian. Semua tujuh lebar yang diuji (320, 360, 375, 390, 430, 820, 1024 px) lulus pemeriksaan responsif yang dicatat.

Markup hero awal Hono di server dan markup hero React client saat ini paralel/terpisah. Catatan minor review: bila arah ini berlanjut ke implementasi produk, gunakan view-model bersama untuk mengurangi risiko drift. Ini tindak lanjut desain, bukan persetujuan coding produk.

#### Bundle dan batas kesimpulan

Angka output build **tidak apples-to-apples** dan tidak mendukung klaim pemenang bundle/performa:

| Metrik output | Hono | React Router v8 |
|---|---:|---:|
| Worker/server JS | 431,905 byte (gzip 165,522) — Worker self-contained | 784,713 byte (gzip 164,373) — output JS server/SSR terpecah |
| Client JS | 225,302 byte (gzip 69,791) | 367,047 byte (gzip 114,712) — seluruh chunk client |

Cakupan output server berbeda; gzip Worker Hono mencakup bundle mandiri, sedangkan output RR8 terpecah; angka client RR8 menjumlah semua chunk, bukan jalur kritis satu halaman. Jangan gunakan tabel ini untuk menyimpulkan keunggulan performa atau ukuran yang setara.

POC ini tidak menguji konten undangan lengkap tanpa JavaScript, alur auth/data produksi, kebutuhan bisnis, operasi deployment, atau K6. Jika owner menetapkan seluruh isi undangan harus terbaca tanpa JS, kedua POC perlu diubah dan acceptance criteria ditinjau ulang; syarat tersebut **bukan** bagian acceptance test saat ini. K6 tetap **OPEN / UNVERIFIED**.

#### Status ADR dan tindak lanjut

Verdict Lora adalah **APPROVED WITH MINOR NOTES** untuk bukti POC komparatif dan mempertahankan Hono sebagai arah provisional yang diutamakan. Verdict tersebut tidak menetapkan stack final, tidak menutup keberatan owner, dan tidak meluluskan Architecture Gate. Tindak lanjut yang dicatat: (1) jangan membandingkan metrik bundle sebagai ukuran sepadan; (2) pertimbangkan view-model hero bersama sebelum implementasi produk bila kelak disetujui; (3) pastikan kebutuhan konten tanpa-JS diputuskan/ditinjau bila menjadi persyaratan produk; (4) pertahankan D1/R2/provider sebagai keputusan terpisah. Tidak ada implementasi yang disetujui oleh catatan ini.

ADR tetap **DRAFT** sampai owner membuat keputusan stack eksplisit setelah seluruh bukti dan persyaratan gate ditinjau. Sumber dokumentasi resmi yang dirujuk: [Cloudflare — Hono](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/), [Cloudflare — React Router](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/), [Cloudflare — Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), [React Router — installation](https://reactrouter.com/start/framework/installation), dan [React Router — changelog](https://reactrouter.com/changelog).

## 4. Status peninjauan arsitektur dan POC OG

### 4.1 Reviewer formal Architecture Gate dan verdict — review tercatat, gate belum lulus

**Penunjukan owner:** Lora ditunjuk sebagai **reviewer formal Architecture Gate pada 12 November 2026 pukul 18:49 WIB**. Harley adalah executor; Lora melakukan review secara independen.

**Review formal:** pada 12 November 2026, Lora meninjau packet perbandingan POC lokal Hono vs React Router v8 resmi + Cloudflare Vite plugin. Review mencakup bukti komparatif yang dicatat pada §4.2; ini bukan review atas readiness produksi.

| Field | Isi |
|---|---|
| Reviewer formal | Lora |
| Tanggal penunjukan owner | 12 November 2026, 18:49 WIB |
| Tanggal review | 12 November 2026 |
| Executor | Harley; terpisah dari reviewer |
| Bukti yang ditinjau | `/workspace/kita-invite-architecture-comparison-20261112/reviewer-packet.md`, `evidence/comparison-results.json`, dan `tools/run_local_comparison.py` |
| Verdict | **APPROVED WITH MINOR NOTES** untuk bukti POC komparatif dan mempertahankan Hono sebagai arah provisional yang diutamakan |
| Batas verdict | Bukan keputusan stack final; **tidak** meluluskan Architecture Gate, tidak menyelesaikan Fase 0, dan tidak mengizinkan Fase 1 |
| Keberatan/follow-up | Minor notes dan tindak lanjut perencanaan dicatat di bawah dan di §3; tidak ada daftar keberatan terpisah dalam ringkasan review yang diberikan. |

**Minor notes dan tindak lanjut yang dicatat:**

1. Jangan mengklaim pemenang bundle/performa: angka server dan client berbeda cakupan dan tidak apples-to-apples.
2. Hero fallback Hono di server dan React client memakai markup paralel; bila implementasi kelak disetujui, pertimbangkan view-model bersama agar tidak drift.
3. Tanpa JavaScript, kedua POC hanya menampilkan fallback hero dan OG head metadata; konten undangan lengkap belum terlihat. Jika konten lengkap tanpa-JS menjadi syarat produk, kedua POC perlu perubahan. Acceptance saat ini tidak menetapkan syarat itu.
4. D1, R2, provider, alur produksi, dan operasi deployment tidak diuji atau diputuskan oleh POC ini; keputusan terkait tetap terpisah dan milik owner.
5. K6 (kartu preview WhatsApp aktual) tidak diuji dan tetap **OPEN / UNVERIFIED**.

**Kriteria exit §6 butir 3** (reviewer formal ditunjuk, review diterima, verdict dan tindak lanjut dicatat) kini terpenuhi dan ditandai selesai. Ini menutup pencatatan reviewer/review saja; seluruh syarat gate lain dan keputusan final owner tetap berlaku. Gerbang Arsitektur **belum lulus**.

### 4.2 Bukti POC Open Graph dan audit layout — K6 OPEN / UNVERIFIED

#### Perbandingan lokal yang ditinjau Lora (bukti terkini dalam revisi ini)

Packet formal berada di `/workspace/kita-invite-architecture-comparison-20261112/reviewer-packet.md`; hasil JSON di `evidence/comparison-results.json` dan runner di `tools/run_local_comparison.py` dalam direktori yang sama. Packet, source POC pembanding, dan hasil rinci berada **lokal** dan tidak ditambahkan ke repository produk pada branch ini.

- **Varian A — Hono:** Hono 4.13.17, React 19.3.1, Vite 7.3.8; source adalah subset lokal dari kandidat branch `poc/og-arch-layout-reserve-20261112-1627`, commit `ade04bd69f329a10ed3592d77f00af4b59a85198`.
- **Varian B — React Router v8 resmi:** scaffold Cloudflare Create Cloudflare v2.74.11 untuk React Router framework mode, React Router/`@react-router/dev` 8.5.1, Cloudflare Vite plugin 1.69.1, Vite 8.3.8; dibuat dan diadaptasi di salinan lokal disposable. Plugin v1 stable; plugin v2 beta menurut dokumentasi yang dirujuk.
- Kedua varian memakai dua fixture sintetis dan lulus **87/87 pemeriksaan masing-masing**: K1 23/23, K2 4/4, K3 6/6, K4 12/12, K5 42/42. Build/typecheck lulus. Ini hasil lokal, bukan uji publik atau production.
- Delayed-cover test menahan cover 2,4 detik; snapshot diambil setelah stylesheet siap ketika gambar masih pending, lalu setelah decode. Pada kedua varian CLS **0** dan perpindahan anchor hero maksimum **0 px**. K5 menguji lebar 320, 360, 375, 390, 430, 820, dan 1024 px.
- Pada HTML awal tanpa JS, yang tampak di body ialah cover, nama, tanggal, venue, tombol “Buka Undangan”, dan pemberitahuan bahwa konten interaktif memerlukan JavaScript. Title, canonical, dan metadata OG tersedia di head. Deskripsi/teks isi undangan, detail acara, countdown, galeri, dan footer **tidak** tampak di body sampai JavaScript aktif dan interaksi buka undangan dijalankan. Dengan demikian, jangan menulis bahwa tanpa-JS “tidak ada hero yang terbaca”, atau bahwa seluruh undangan sudah server-rendered.
- Build metrics tidak sebanding: Hono Worker self-contained 431,905 byte / gzip 165,522; RR8 total output server JS 784,713 / gzip 164,373; Hono client JS 225,302 / gzip 69,791; seluruh RR8 client chunks 367,047 / gzip 114,712. Cakupan berbeda, sehingga tidak membuktikan pemenang ukuran/performa.
- Tidak ada akun/resource Cloudflare, binding remote, provisioning, atau deployment; semua HTTP/browser test hanya loopback. Tidak ada URL dikirim ke WhatsApp atau kontak/kanal eksternal. K6 **tidak diuji**.

Dokumentasi resmi yang menjadi rujukan setup/status: [Hono on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/), [React Router on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/), [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), [React Router installation](https://reactrouter.com/start/framework/installation), [React Router changelog](https://reactrouter.com/changelog). Hasil POC berlaku untuk dua varian dan konfigurasi yang benar-benar diuji, bukan klaim umum keunggulan suatu framework.

#### Catatan bukti terdahulu — tetap historis dan terpisah

- POC lama membandingkan Hono dengan React Router **7.18.5 framework-less SSR**. Hasil lama itu bukan pembanding RR8 resmi. Catatan v0.1.6 tentang laporan harness lama, audit baseline, dan patch `aspect-ratio: 9 / 11` tetap merupakan provenance historis; jangan gabungkan angka atau kesimpulannya dengan perbandingan lokal baru di atas.
- Audit layout baseline sebelumnya menemukan K4 gagal dengan perpindahan anchor 425.328 px; bukti loopback before/after untuk kandidat CSS mencatat 124/128 → 128/128 checks serta CLS/anchor 0 setelah perbaikan pada fixture cover 900×1100. Rasio tetap 9:11 hanya sesuai fixture tersebut, bukan solusi generik semua aset.
- Patch layout yang dipromosikan owner tercatat di branch [`poc/og-arch-layout-reserve-20261112-1627`](https://github.com/marko1kiro/kita-invite/tree/poc/og-arch-layout-reserve-20261112-1627), commit [`ade04bd69f329a10ed3592d77f00af4b59a85198`](https://github.com/marko1kiro/kita-invite/commit/ade04bd69f329a10ed3592d77f00af4b59a85198), dengan perubahan satu file CSS. Audit/perbandingan baru di atas tidak mengubah atau menguji deployment Worker/Cloudflare publik. Pages, bila dipakai untuk branch dokumentasi ini, hanya preview dokumen.
- Kode/harness POC lama yang memang terkomit tetap dapat ditinjau: [fixture](https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/shared/fixture.json), [Hono Worker](https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/og-a/src/worker.ts), [React Router lama](https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/og-b/src/entry.server.tsx), dan [harness lama](https://github.com/marko1kiro/kita-invite/blob/poc/og-arch/poc/tests/run-tests.mjs). Sumber tersebut bukan pengganti packet/JSON hasil terbaru yang masih lokal.

#### Kriteria acceptance HTML OG/crawler Fase 0

Kriteria ini menilai HTML dan metadata crawler, bukan kartu WhatsApp aktual. Hasil baru di atas adalah bukti komparatif lokal; pencatatan hasil tidak sama dengan approval owner atas acceptance criteria atau kelulusan gate.

1. `GET` tanpa JavaScript menghasilkan HTML awal dengan `<title>`, canonical URL, `og:title`, `og:description`, `og:type`, `og:url`, dan `og:image` absolut yang cocok dengan undangan/slug; body menampilkan fallback hero inti (cover, nama, tanggal, venue, tombol) dan pemberitahuan JavaScript.
2. `og:image` dapat diambil dengan HTTP 200 dan content type gambar yang benar.
3. Dua slug berbeda tidak berbagi metadata/cache secara keliru; slug tidak dikenal menghasilkan 404 yang jelas tanpa menampilkan pasangan lain.
4. Setelah JavaScript aktif, tampilan hero tetap sesuai dengan metadata server dan undangan interaktif; tidak ada hydration error atau lompatan konten yang merusak tampilan.
5. Halaman diuji di lebar 320, 360, 375, 390, 430, 820, dan 1024 px; overflow, clipping, serta urutan konten dicatat.
6. K6 (kartu WhatsApp aktual) dicatat terpisah sebagai **OPEN / UNVERIFIED**; jangan menyatakan kartu tampil tanpa bukti aktual.

Acceptance saat ini **tidak** mensyaratkan semua isi undangan tampil tanpa JavaScript. Bila owner menetapkan persyaratan tersebut, kedua POC harus diubah dan kriterianya ditinjau ulang sebelum gate dinilai. Pengujian WhatsApp tetap memerlukan metode aman dan persetujuan terpisah sebelum URL dikirim atau ditampilkan melalui kanal eksternal.

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
2. [ASUMSI] Hasil komparatif POC lokal dapat menjadi salah satu bukti acceptance OG bila owner menyetujuinya; hasil ini tidak membuktikan kesiapan production dan tidak menggantikan syarat gate lainnya.
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

**Status Fase 0: SEDANG BERJALAN.** Exit criterion #3 (reviewer formal, review, verdict, dan tindak lanjut tercatat) telah dipenuhi. Kriteria #1, #2, #4, #5, #6, dan #7 tetap **[ ] BELUM** sampai bukti atau approval masing-masing tersedia. Penutupan #3 tidak meluluskan Gerbang Arsitektur; jangan lanjut Fase 1 atau memulai implementasi tanpa persetujuan terpisah owner.

Checklist ini membedakan: **(A) keputusan owner yang sudah diberikan dan dicatat** (butir 1, 6, 7 — verifikasi pencatatan tetap menunggu owner); **(B) ratifikasi status dan penundaan register** (butir 2); **(C) keputusan turunan D1–D10** yang boleh mengikuti fase masing-masing sesuai register; serta **(D) syarat gate yang masih menunggu**, terutama keputusan stack final owner dan persetujuan/konfirmasi acceptance OG. Reviewer formal telah ditunjuk dan review/verdict/follow-up dicatat, sehingga butir 3 selesai; itu tidak otomatis menutup butir lain.

| # | Exit criterion | Status | Yang kurang | Yang perlu bertindak |
|---|---|---|---|---|
| 1 | Scope MVP M1–M8 sudah diputuskan owner dan dicatat (§0, §1.1, §2.1 — keputusan owner 11 November 2026 pukul 18:34 WIB); bagian pasca-MVP P1–P8 dicatat sebagai daftar kandidat (rekomendasi, belum disetujui owner sebagai roadmap pasca-MVP final) yang ditunda beserta konsekuensinya (§1.2). Pilihan MVP tidak lagi menunggu | [ ] BELUM | Keputusan cakupan M1–M8 sudah diputuskan dan dicatat; yang masih kurang untuk butir ini hanyalah **verifikasi pencatatan** oleh owner saat meninjau revisi dokumen ini. Keputusan turunan D1–D10 di §1.4 sudah tercatat di register (§2) — masing-masing dengan status, fase pemutus, blocker, dan konsekuensinya — dan owner boleh meratifikasi status/penundaannya di Fase 0; keputusan finalnya mengikuti fase masing-masing dan TIDAK semuanya harus diputuskan atau difinalisasi untuk menutup Fase 0. Masing-masing keputusan harus selesai paling lambat sebelum fase atau modul yang bergantung padanya dimulai, sesuai register §2: D1 auth provider dan model session (sebelum Fase 2 dimulai); D2 payment gateway termasuk pengujian asumsi webhook 4a/4b (sebelum integrasi webhook Fase 6); D3 domain dan D4 Cloudflare plan (sebelum provisioning production Fase 1); D5 email transaksional (sebelum Fase 7 membangun notifikasi); D6 jumlah maksimum draft Free serta TTL/retensi draft (sebelum batas atau TTL apa pun diterapkan di Fase 4); D7 aturan order sudah dibayar tetapi belum dipublikasi dan D8 harga komersial final (sebelum checkout dibuka di Fase 6); D9 kebijakan migrasi draft prototype (sebelum migrasi atau UAT di Fase 8); D10 syarat dan metode yang aman untuk menguji kartu WhatsApp nyata (bila pengujian nyata dipertimbangkan). Keputusan turunan itu tidak membatalkan scope M1–M8. | Owner (verifikasi pencatatan keputusan M1–M8; meratifikasi status/penundaan keputusan turunan D1–D10 di Fase 0; memutuskan keputusan turunan di §1.4 sesuai fasenya masing-masing — bukan sekarang sekaligus); tim (mencatat keputusan turunan beserta konsekuensinya) |
| 2 | Semua baris register (§2) sudah memiliki status (2 DECIDED BY OWNER, 10 MENUNGGU beserta metode uji aman K6); tidak ada keputusan yang dikarang atau dianggap otomatis disetujui | [ ] BELUM | Status semua baris sudah tercatat: §2.1 DECIDED BY OWNER — M1–M8 dan §2.12 DECIDED BY OWNER (status K6 tetap terbuka); 10 baris lainnya (§2.2–§2.11) masih MENUNGGU beserta metode uji aman K6. Yang masih diperlukan adalah owner **meninjau dan meratifikasi status serta penundaan yang sudah dicatat** — BUKAN memutuskan seluruh D1–D10 sekarang. Keputusan turunan tetap dapat ditunda sesuai fase dan blocker di register (§2); keputusan yang menjadi prasyarat coding suatu modul harus sudah dibuat sebelum coding modul itu dimulai | Owner (meratifikasi status dan penundaan yang tercatat); tim (memperbarui register sesuai catatan owner) |
| 3 | Reviewer formal Architecture Gate ditunjuk owner, lalu review diterima dan dicatat dengan verdict serta tindak lanjut | [x] SELESAI — review tercatat | Tidak ada yang kurang untuk kriteria pencatatan ini: Lora ditunjuk 12 November 2026 pukul 18:49 WIB; review tanggal 12 November, verdict **APPROVED WITH MINOR NOTES**, batas verdict, dan tindak lanjut tercatat di §4.1–§4.2. Ini bukan kelulusan Gerbang Arsitektur atau keputusan stack final | Tidak ada tindak lanjut pencatatan; owner tetap pemutus stack final dan syarat gate lainnya tetap harus dipenuhi |
| 4 | ADR stack tetap DRAFT sampai owner menyetujui pilihan final setelah bukti/masukan gerbang ditinjau | [ ] BELUM | Review formal Lora sudah tercatat dengan verdict **APPROVED WITH MINOR NOTES**, tetapi ADR masih **DRAFT** dan Hono tetap rekomendasi provisional. Belum ada keputusan stack final owner; acceptance OG/gerbang dan syarat lain belum ditutup. Gerbang belum lulus | Owner (memutuskan stack final setelah bukti dan seluruh syarat gate ditinjau); tim (menyediakan bukti yang diperlukan) |
| 5 | Kriteria HTML OG/crawler tertulis (§4.2) dan hasil POC yang dapat diulang dibedakan dari bukti kartu WhatsApp aktual | [ ] BELUM | Hasil POC komparatif lokal (87/87 pemeriksaan per varian, packet/JSON/runner) dan batas K6 kini dicatat di §4.2, tetapi status ini belum berarti owner menyetujui acceptance criteria atau hasil tersebut cukup untuk menutup gate. Masih diperlukan persetujuan/konfirmasi owner atas kriteria dan bukti yang diminta gate; K6 tetap terpisah dan tidak diuji | Owner (menyetujui/meratifikasi kriteria §4.2 dan kecukupan bukti); tim (melengkapi bukti bila diminta) |
| 6 | Pilihan owner K6 OPEN / UNVERIFIED sudah dicatat (§0, §2.12, §4.2); K6 bukan syarat yang dianggap lulus. Bila owner kemudian memilih K6 wajib dibuktikan sebelum final stack, gerbang menunggu metode uji aman | [ ] BELUM | Pilihan owner sudah dicatat; yang menunggu hanyalah **verifikasi pencatatan** oleh owner saat meninjau revisi dokumen ini — bukan pengulangan pilihan. Kartu WhatsApp aktual **belum diuji dan belum lulus**; dokumen ini tidak mengklaim kartu sudah diuji atau lulus | Owner (verifikasi pencatatan sudah benar saat meninjau revisi dokumen ini) |
| 7 | Izin perencanaan Fase 0 sudah diberikan owner dan dicatat (§0); izin ini tidak membuka coding produk, perubahan production, provisioning resource, deploy production, Gerbang Arsitektur, atau Fase 1 — semua itu membutuhkan persetujuan terpisah | [ ] BELUM | Izin perencanaan Fase 0 sudah diberikan dan dicatat; yang menunggu hanyalah **verifikasi pencatatan** oleh owner saat meninjau revisi dokumen ini — dibedakan dari permintaan persetujuan baru; ini bukan persetujuan baru dan bukan persetujuan Fase 0 selesai. Pemberian izin ini tidak berarti checklist lain atau Gerbang Arsitektur otomatis lulus | Owner (verifikasi pencatatan batas otorisasi saat meninjau revisi dokumen ini) |

**Bila ada exit criterion yang tertahan, pekerjaan berhenti pada perencanaan.** Tidak ada criterion yang dilewati diam-diam dan tidak ada Fase 1 yang dimulai secara otomatis. Setiap pencentangan membutuhkan bukti atau approval yang dicatat — bukan asumsi.

---

## 7. Penutup

Dokumen ini adalah paket keputusan Fase 0 untuk ditinjau owner. Dokumen ini bukan persetujuan implementasi, bukan persetujuan production deploy, bukan kelulusan Gerbang Arsitektur, dan bukan izin Fase 1. Fase 0 berstatus **SEDANG BERJALAN** dan Gerbang Arsitektur **belum lulus**.

Keputusan yang sudah dibuat owner dan tidak perlu diulang: (1) mulai Fase 0 saja, sebatas perencanaan, pencatatan keputusan, ADR, dan POC non-production yang aman; (2) K6 tetap terbuka sampai ada cara uji yang aman — status K6 **OPEN / UNVERIFIED**; (3) scope MVP M1–M8 diterima owner (11 November 2026 pukul 18:34 WIB; pesan owner: "gapapa M1-M8 juga bos").

Keputusan M1–M8 tidak menghapus exit gates keamanan, privasi, aksesibilitas, responsive layout, backup/restore, monitoring, dan rollback yang diperlukan sebelum peluncuran.

Review formal Lora dan tindak lanjutnya sudah dicatat; yang masih perlu owner tinjau dan putuskan antara lain keputusan turunan di §1.4, isi register (§2) beserta status yang masih MENUNGGU, pilihan stack final pada ADR draft (§3), kriteria acceptance OG (§4.2), serta exit criterion #1, #2, #4, #5, #6, dan #7 di §6.

Bila ada bagian dokumen ini yang bertentangan dengan keputusan terkunci di §5.1, keputusan terkunci yang berlaku.

---

## 8. Riwayat revisi

### v0.1.6 → v0.1.7

| | |
|---|---|
| Versi sebelumnya | v0.1.6 (branch `docs/phase0-planning-v0.1.6`, commit `9010c885b7fbc0d321fbf76aefbfbf47034b22f5`) |
| Versi ini | v0.1.7 (12 November 2026) — revisi dokumentasi-only dari parent tepat v0.1.6 |
| Branch revisi | `docs/phase0-planning-v0.1.7` |
| Pemicu revisi | Owner menunjuk Lora sebagai reviewer formal Architecture Gate pada 12 November 2026 pukul 18:49 WIB; review komparasi POC lokal selesai dan mencatat verdict serta minor notes |

Perubahan dokumentasi pada revisi ini:

1. **Penunjukan dan review formal (§0, §4.1):** Lora dicatat sebagai reviewer formal yang ditunjuk owner; Harley tetap executor dan Lora meninjau secara independen. Verdict **APPROVED WITH MINOR NOTES** dan tindak lanjut dicatat, tanpa mengklaim Architecture Gate lulus.
2. **Perbandingan resmi RR8 (§2.2–§4.2):** bukti pembanding diperbarui dari POC lama React Router 7.18.5 framework-less ke POC lokal React Router v8 framework mode dengan Cloudflare Vite plugin resmi v1.69.1. Kedua varian lulus K1–K5, 87/87 checks per varian, secara lokal. RR8 tetap alternatif kredibel; Hono tetap hanya rekomendasi provisional.
3. **Koreksi no-JS dan metrik (§3–§4.2):** kedua varian menampilkan fallback hero dan OG head tanpa JS, tetapi bukan seluruh body undangan; rincian acara, countdown, galeri, deskripsi/teks isi, dan footer belum tampak sebelum JavaScript/interaksi. Metrics bundle dicatat tidak apples-to-apples, tanpa klaim pemenang.
4. **Checklist §6:** hanya exit criterion #3 ditandai selesai setelah identitas reviewer, tanggal, verdict, batas review, dan tindak lanjut dicatat. Kriteria #1, #2, #4, #5, #6, dan #7 tetap `[ ] BELUM`; Fase 0 tetap **SEDANG BERJALAN**, Gerbang Arsitektur belum lulus, ADR tetap DRAFT, K6 **OPEN / UNVERIFIED**, dan Fase 1 belum disetujui.
5. **Batas perubahan:** hanya `docs/PHASE-0-DECISION-PACK.md` yang diubah. Scope M1–M8 dan register keputusan dipertahankan. Tidak ada source POC/produk, branch lain, konfigurasi atau resource Cloudflare, Worker, production, maupun deployment yang diubah. Push branch dokumentasi dapat memicu Pages preview; perlakukan sebagai preview dokumen saja.

Revisi ini bukan keputusan stack final, bukan persetujuan implementasi/Phase 1, bukan kelulusan Gerbang Arsitektur, dan bukan penyelesaian Fase 0.

### v0.1.5 → v0.1.6

| | |
|---|---|
| Versi sebelumnya | v0.1.5 (branch `docs/phase0-planning-v0.1.5`, commit `9ba8a8edbefa4afeeaf70ba237a34b47ad68ea1f`) |
| Versi ini | v0.1.6 (12 November 2026) — revisi dokumentasi-only dari v0.1.5 |
| Pemicu revisi | Klarifikasi owner bahwa Agent Muse/Meta sudah retired, Harley menggantikan sebagai executor teknis, dan Lora memeriksa hasil Harley sebagai Lead Agent; koreksi rujukan reviewer yang usang |

Perubahan pada revisi ini (dokumentasi/peran saja):

1. **Koreksi peran aktif:** Agent Muse/Meta dicatat sudah retired; Harley dicatat sebagai executor teknis/coding agent pengganti; Lora memeriksa hasil Harley sebagai Lead Agent. Atribusi “Rekomendasi Muse” yang tersisa dipertahankan sebagai catatan historis, bukan tugas atau masukan aktif.
2. **Status reviewer Architecture Gate:** rujukan aktif yang menyebut Agent Meta sebagai reviewer yang harus memberi review diubah menjadi status peninjauan formal yang netral. Penunjukan reviewer formal masih **MENUNGGU KEJELASAN owner**; tidak dinyatakan bahwa Lora telah ditunjuk. Tidak ada verdict review arsitektur yang dibuat atau dicatat dalam revisi ini. Rujukan Agent Meta pada riwayat v0.1.5 dan versi sebelumnya tetap merupakan rekaman historis dan disupersesi oleh klarifikasi ini.
3. **Status gate dan batas tetap:** seluruh tujuh exit criteria tetap `[ ] BELUM`; Fase 0 tetap **SEDANG BERJALAN**; Gerbang Arsitektur **belum lulus**; Fase 1 **belum disetujui**; ADR tetap **DRAFT/provisional**; K6 tetap **OPEN / UNVERIFIED**. Scope M1–M8, keputusan owner yang terkunci, stack provisional, register keputusan, kriteria acceptance, dan K6 tidak diubah.

Pernyataan penutup revisi: perubahan hanya pada `docs/PHASE-0-DECISION-PACK.md`; tidak ada perubahan pada source POC/main/Worker, konfigurasi Cloudflare Pages, resource Cloudflare production, dan tidak ada deploy Worker. Push branch dapat memicu Cloudflare Pages preview otomatis; bila tersedia, preview itu dicatat hanya sebagai preview dokumen dan tidak diperlakukan sebagai validasi aplikasi atau patch. Revisi ini tidak menjalankan aplikasi. Revisi ini bukan verdict review arsitektur, bukan kelulusan Gerbang Arsitektur, bukan penyelesaian Fase 0, dan bukan izin Fase 1.

### v0.1.4 → v0.1.5

| | |
|---|---|
| Versi sebelumnya | v0.1.4 (branch `docs/phase0-planning-v0.1.4`, commit `a7d56fa91241b7abe28abf1e9ac0d28febac7b4a`) |
| Versi ini | v0.1.5 (12 November 2026) — revisi dokumentasi-only dari v0.1.4 |
| Pemicu revisi | Audit independen Lora atas baseline POC dan bukti lokal kandidat layout reserve; promosi patch sudah disetujui owner |

Perubahan pada revisi ini (hanya metadata §0, klaim bukti §3–§4, dan riwayat §8; checklist §6 dipertahankan):

1. **Pemisahan provenance:** laporan harness lama yang melaporkan K1–K5 lulus tetap dicatat sebagai laporan historis, tetapi tidak lagi dipakai untuk menyatakan K4 lulus pada baseline. Audit independen Lora dicatat terpisah: K1–K3 dan K5 lulus, K4 gagal karena anchor hero teks/tombol bergeser 425.328 px; baseline agregat 124/128 checks (A/B masing-masing 62/64).
2. **Kandidat layout reserve:** dicatat kandidat satu baris `aspect-ratio: 9 / 11;` pada `poc/shared/shared.css` beserta bukti before/after lokal. Candidate agregat 128/128 checks (A/B masing-masing 64/64), CLS 0 dan anchor delta 0 px pada fixture sintetis cover 900×1100. Provenance loopback GET-only, Chromium headless 390×844, delay gambar 2.4 s, build/typecheck A/B, dan lebar K5 dicatat; batas non-production/real-device/multi-browser ditegaskan.
3. **Promosi dan batas validasi publik:** branch [`poc/og-arch-layout-reserve-20261112-1627`](https://github.com/marko1kiro/kita-invite/tree/poc/og-arch-layout-reserve-20261112-1627) dan commit [`ade04bd69f329a10ed3592d77f00af4b59a85198`](https://github.com/marko1kiro/kita-invite/commit/ade04bd69f329a10ed3592d77f00af4b59a85198) dicatat dengan parent baseline tepat dan diff satu file +1. Preview Pages root tidak memuat stylesheet POC, Worker publik A/B tetap baseline, dan tidak ada tes publik patch.
4. **Status tetap:** K6 tetap OPEN / UNVERIFIED; identitas/verdict reviewer Architecture Review tidak diubah; ADR stack tetap PROVISIONAL/DRAFT; Fase 0 tetap **SEDANG BERJALAN**, Gerbang Arsitektur belum lulus, Fase 1 belum disetujui, dan ketujuh exit criteria §6 tetap `[ ] BELUM`.

Pernyataan penutup revisi: revisi ini dokumentasi-only; tidak ada perubahan pada source POC/main/Workers, konfigurasi Pages/Cloudflare/production, dan tidak ada deploy manual. Push docs dapat memicu preview Pages otomatis; preview docs itu tidak memvalidasi aplikasi atau patch. Bukti run layout reserve yang dirujuk berada lokal dan tidak dinyatakan terarsip di GitHub. Revisi ini bukan persetujuan implementasi, bukan kelulusan Gerbang Arsitektur, bukan penyelesaian Fase 0, dan bukan izin Fase 1.

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
