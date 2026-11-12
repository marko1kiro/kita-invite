# Catatan UI fondasi Fase 1

Halaman ini adalah shell teknis internal untuk membuktikan bahwa build React dapat dilayani dan Worker health endpoint merespons. Ini bukan halaman tamu atau fitur produk.

- **Tujuan:** dalam beberapa detik, developer dapat melihat apakah Worker tersambung dan environment mana yang menjawab.
- **Nada:** teknis, tenang, dan ringkas; shell memakai palet proyek yang sudah disetujui, tetapi tidak menetapkan pola UI produk baru.
- **Batasan:** lebar minimum 320 px; tidak ada nama tamu, foto, musik, tombol, formulir, atau alur undangan. State yang dibutuhkan hanya memeriksa, aktif, dan belum terhubung.
- **Pembeda:** satu garis tipis Champagne/Muted Gold menandai area status; tidak ada dekorasi atau pola interaksi produk.
- **Token:** Ivory `#F8F5EF`, Champagne `#E8DED0`, Muted Gold `#B79B72`, Charcoal `#302D29`; ukuran dan warna ditetapkan sebagai CSS custom properties. Font lokal/fallback dipakai agar tidak ada unduhan font pihak ketiga.

Pemeriksaan responsif yang direncanakan untuk viewport 320, 360, 375, 390, 430, 820, dan 1024 px. Interaksi belum diperlukan; status diumumkan melalui `role="status"` dan `aria-live="polite"`.
