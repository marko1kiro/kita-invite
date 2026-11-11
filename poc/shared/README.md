# Kita Invite — POC Open Graph: Konten Bersama (`shared/`)

Konten bersama yang dipakai **IDENTIK** oleh varian A (Hono) dan varian B
(React Router SSR). Kedua varian membaca file yang sama dari direktori ini —
tidak ada salinan per varian.

> Ruang lingkup POC: tidak ada pembayaran, login, form kontak, atau data nyata.
> Semua nama, tanggal, dan venue di sini **fiktif**.

## Isi

| File | Keterangan |
| --- | --- |
| `fixture.json` | Dua undangan fiktif (JSON murni, bisa dibaca Node) |
| `shared.css` | CSS bersama, bahasa visual prototype Kita Invite |
| `og-aisha.jpg` | OG image Aisha & Bima, 1200×630 |
| `og-citra.jpg` | OG image Citra & Dimas, 1200×630 |
| `cover-aisha.jpg` | Cover Aisha & Bima, 900×1100 (potret) |
| `cover-citra.jpg` | Cover Citra & Dimas, 900×1100 (potret) |
| `make_images.py` | Generator gambar (PIL) — reproducible |

## Fixture (`fixture.json`)

Struktur: `{ "invitations": [ ... ] }`. Setiap undangan punya field:

`slug`, `names`, `title`, `description`, `date` (ISO 8601 + offset WIB),
`dateDisplay` (id-ID), `venue`, `city`, `details[]` (3 item:
`title`, `time`, `description`), `gallery[]` (2–3 item: `title`, `caption`),
`ogImage`, `coverImage` (nama file gambar di direktori ini).

| Slug | Nama | Tanggal | Venue (fiktif) |
| --- | --- | --- | --- |
| `aisha-dan-bima` | Aisha & Bima | Sabtu, 20 Februari 2027 | Gedung Serbaguna Melati, Jakarta |
| `citra-dan-dimas` | Citra & Dimas | Minggu, 14 Maret 2027 | Balai Serbaguna Kenanga, Bandung |

Detail acara (keduanya): Akad Nikah, Resepsi, Dress Code — semuanya generik,
tanpa nama orang/toko/vendor nyata.

### Tidak ada data sensitif

Fixture ini **TIDAK** berisi nomor telepon, rekening bank, alamat email,
alamat rumah, atau informasi sensitif apa pun. Verifikasi:

```bash
grep -nE '08[0-9]{7,}|\+62|@|\b[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\b|\b[0-9]{10,}\b' fixture.json
# harus kosong (tidak ada match)
python3 -c "import json; json.load(open('fixture.json'))"  # JSON valid
```

## CSS (`shared.css`)

Palet prototype Kita Invite:

| Token | Nilai | Peran |
| --- | --- | --- |
| `--ivory` | `#F8F5EF` | Latar utama |
| `--champagne` | `#E8DED0` | Latar sekunder / aksen lembut |
| `--gold` | `#B79B72` | Aksen, garis, tombol |
| `--charcoal` | `#302D29` | Teks utama |

Font:

- Display: `'Playfair Display', 'Cormorant Garamond', Georgia, serif`
- UI: `'Inter', 'Manrope', system-ui, sans-serif`

**Tidak ada `@import` webfont yang wajib termuat.** Bila font di atas tidak
terpasang / CDN tidak terjangkau, CSS fallback ke serif dan sans-serif sistem
sehingga tes tetap lolos tanpa jaringan. CSS deterministik, tanpa dependensi
eksternal.

Cakupan: layout mobile-first (konten `max-width: 640px`, padding responsif),
hero/cover, judul pasangan, tanggal/venue, tombol `.open-btn` ("Buka
Undangan"), countdown (`.countdown`, angka + label), seksi detail (`.detail`)
dan galeri (`.gallery`), footer kecil (`.footer`).

## Gambar

Semua gambar **dibuat sendiri dengan Python PIL** (gradasi + bingkai emas +
monogram + nama + tanggal). **Tanpa aset pihak ketiga, tanpa hotlink, tanpa
download** — tidak ada masalah lisensi.

- Aisha & Bima: gradasi hangat ivory → champagne, bingkai emas, monogram "A & B".
- Citra & Dimas: gradasi champagne → emas redup, bingkai emas gelap, monogram "C & D".

| File | Dimensi | Ukuran |
| --- | --- | --- |
| `og-aisha.jpg` | 1200×630 | 33.379 byte |
| `og-citra.jpg` | 1200×630 | 32.573 byte |
| `cover-aisha.jpg` | 900×1100 | 33.606 byte |
| `cover-citra.jpg` | 900×1100 | 32.090 byte |

Semua < 120 KB (JPEG kualitas 72) agar bundle Worker tetap kecil.

### Generate ulang

```bash
cd poc/shared
python3 make_images.py
```

Skrip memakai font DejaVu Serif/Sans dari sistem (`/usr/share/fonts/truetype/dejavu/`,
fallback ke font default PIL bila tidak ada). Output deterministik: dimensi,
mode RGB, dan ukuran byte yang sama pada tiap run (kecuali bila font sistem
berbeda). Skrip meng-assert setiap file < 120 KB dan gagal bila melebihi batas.

Verifikasi dimensi/mode:

```bash
python3 -c "
from PIL import Image
for f in ['og-aisha.jpg','og-citra.jpg','cover-aisha.jpg','cover-citra.jpg']:
    im = Image.open(f); print(f, im.size, im.mode, im.format)
"
```
