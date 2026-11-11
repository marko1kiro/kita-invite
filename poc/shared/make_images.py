#!/usr/bin/env python3
"""Generate POC Open Graph + cover images for Kita Invite (shared assets).

Self-made with PIL only — no third-party assets, no downloads, no hotlinks.
Reproducible: `python3 make_images.py` from this directory.

Designs (both follow the Kita Invite palette):
  - Aisha & Bima : warm ivory -> champagne gradient, gold frame.
  - Citra & Dimas: champagne -> muted-gold gradient, deeper gold frame.

Outputs (JPEG quality 72, target < 120 KB each):
  - og-aisha.jpg    1200x630
  - og-citra.jpg    1200x630
  - cover-aisha.jpg  900x1100
  - cover-citra.jpg  900x1100
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
QUALITY = 72
MAX_BYTES = 120 * 1024

SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# Kita Invite palette
IVORY = (248, 245, 239)
CHAMPAGNE = (232, 222, 208)
GOLD = (183, 155, 114)
GOLD_DARK = (154, 127, 87)
CHARCOAL = (48, 45, 41)
CHARCOAL_SOFT = (92, 86, 78)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def gradient(w: int, h: int, top: tuple, bottom: tuple) -> Image.Image:
    """Vertical gradient, deterministic."""
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        c = tuple(lerp(top[i], bottom[i], t) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return img


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def text_center(draw: ImageDraw.ImageDraw, cx: int, y: int, s: str,
                f: ImageFont.FreeTypeFont, fill: tuple) -> int:
    bbox = draw.textbbox((0, 0), s, font=f)
    w = bbox[2] - bbox[0]
    draw.text((cx - w / 2 - bbox[0], y), s, font=f, fill=fill)
    return y + (bbox[3] - bbox[1])


def ornament(draw: ImageDraw.ImageDraw, cx: int, y: int, half: int,
             color: tuple) -> None:
    """Small gold ornament: line — diamond — line."""
    draw.line([(cx - half, y), (cx - 14, y)], fill=color, width=2)
    draw.line([(cx + 14, y), (cx + half, y)], fill=color, width=2)
    d = 7
    draw.polygon([(cx, y - d), (cx + d, y), (cx, y + d), (cx - d, y)],
                 outline=color, width=2)


def draw_frame(draw: ImageDraw.ImageDraw, w: int, h: int, color: tuple,
               inset: int = 28) -> None:
    draw.rectangle([inset, inset, w - inset, h - inset], outline=color, width=3)
    draw.rectangle([inset + 9, inset + 9, w - inset - 9, h - inset - 9],
                   outline=color, width=1)


def make_image(path: Path, w: int, h: int, top: tuple, bottom: tuple,
               monogram: str, names: str, date_line: str,
               frame_color: tuple) -> None:
    img = gradient(w, h, top, bottom)
    draw = ImageDraw.Draw(img)
    draw_frame(draw, w, h, frame_color)

    cx = w // 2
    scale = w / 1200.0  # layout sized for OG width, scaled for cover

    y = int(h * 0.16)
    y = text_center(draw, cx, y, "UNDANGAN PERNIKAHAN",
                    font(SANS, int(26 * scale)), GOLD_DARK)
    y += int(28 * scale)
    ornament(draw, cx, y + int(8 * scale), int(150 * scale), frame_color)
    y += int(44 * scale)

    y = text_center(draw, cx, y, monogram,
                    font(SERIF_BOLD, int(150 * scale)), CHARCOAL)
    y += int(24 * scale)

    y = text_center(draw, cx, y, names,
                    font(SERIF, int(64 * scale)), CHARCOAL)
    y += int(30 * scale)

    ornament(draw, cx, y + int(8 * scale), int(110 * scale), frame_color)
    y += int(46 * scale)

    text_center(draw, cx, y, date_line,
                font(SERIF, int(34 * scale)), CHARCOAL_SOFT)

    img.save(path, "JPEG", quality=QUALITY, optimize=True)
    size = path.stat().st_size
    print(f"{path.name}: {w}x{h} RGB, {size} bytes "
          f"({'OK' if size < MAX_BYTES else 'OVER 120 KB!'})")
    assert size < MAX_BYTES, f"{path.name} exceeds 120 KB"


def main() -> None:
    os.chdir(HERE)
    # Aisha & Bima — warm ivory -> champagne, gold frame
    make_image(HERE / "og-aisha.jpg", 1200, 630, IVORY, CHAMPAGNE,
               "A  &  B", "Aisha & Bima", "Sabtu, 20 Februari 2027", GOLD)
    make_image(HERE / "cover-aisha.jpg", 900, 1100, IVORY, CHAMPAGNE,
               "A  &  B", "Aisha & Bima", "Sabtu, 20 Februari 2027", GOLD)
    # Citra & Dimas — champagne -> muted gold, deeper gold frame
    make_image(HERE / "og-citra.jpg", 1200, 630, CHAMPAGNE, (214, 193, 164),
               "C  &  D", "Citra & Dimas", "Minggu, 14 Maret 2027", GOLD_DARK)
    make_image(HERE / "cover-citra.jpg", 900, 1100, CHAMPAGNE, (214, 193, 164),
               "C  &  D", "Citra & Dimas", "Minggu, 14 Maret 2027", GOLD_DARK)
    print("Done.")


if __name__ == "__main__":
    main()
