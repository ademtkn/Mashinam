#!/usr/bin/env python3
"""Generate Mashinam's brand assets (icon, adaptive icon, splash, favicon).

Brand: navy #0B1426, amber #FFB020, white. The mark is a bold rounded "M"
(monogram) with a subtle dashed road line underneath — simple enough to read
at 48 px, distinctive enough for a home screen.

Run from the repo root:
    python3 tools/brand/generate_assets.py

The script only writes the PNGs listed at the bottom; it does not touch app
config. Uses Pillow (bundled with the workspace Python).
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"

NAVY = (11, 20, 38, 255)
NAVY_LIGHT = (22, 34, 58, 255)
AMBER = (255, 176, 32, 255)
WHITE = (255, 255, 255, 255)

SS = 3  # supersampling factor for smooth rounded strokes


def gradient_background(size: int) -> Image.Image:
    """A calm navy field with a soft lighter centre, like the app background."""
    img = Image.new("RGBA", (size, size), NAVY)
    px = img.load()
    cx = cy = size / 2
    max_d = math.hypot(cx, cy)
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy) / max_d
            t = max(0.0, 1.0 - d) ** 1.6
            r = int(NAVY[0] + (NAVY_LIGHT[0] - NAVY[0]) * t * 0.85)
            g = int(NAVY[1] + (NAVY_LIGHT[1] - NAVY[1]) * t * 0.85)
            b = int(NAVY[2] + (NAVY_LIGHT[2] - NAVY[2]) * t * 0.85)
            px[x, y] = (r, g, b, 255)
    return img


def rounded_line(draw: ImageDraw.ImageDraw, points, fill, width):
    """Pillow's line has square caps; add circles so the strokes look drawn."""
    pts = [(int(round(x)), int(round(y))) for x, y in points]
    w = max(1, int(round(width)))
    draw.line(pts, fill=fill, width=w, joint="curve")
    r = w / 2
    for x, y in (pts[0], pts[-1]):
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def draw_mark(canvas: Image.Image, cx: float, cy: float, width: float, color=AMBER):
    """Draw the M centred at (cx, cy) with the given total width."""
    d = ImageDraw.Draw(canvas)
    h = width * 0.92
    top = cy - h / 2
    bottom = cy + h / 2
    left = cx - width / 2
    right = cx + width / 2
    stroke = width * 0.28
    mid_y = top + h * 0.62

    points = [
        (left, bottom),
        (left, top),
        (cx, mid_y),
        (right, top),
        (right, bottom),
    ]
    rounded_line(d, points, color, stroke)


def draw_road(canvas: Image.Image, cy: float, width: float, margin_ratio=0.30):
    """Three lane dashes under the mark — a quiet car/road hint."""
    d = ImageDraw.Draw(canvas)
    left = (canvas.width - width) / 2
    dash = width * 0.14
    gap = width * 0.07
    x = left
    while x < left + width:
        d.rounded_rectangle(
            (x, cy, min(x + dash, left + width), cy + max(3, width * 0.018)),
            radius=max(2, width * 0.009),
            fill=(255, 255, 255, 120),
        )
        x += dash + gap


def make_icon(size: int = 1024, with_road: bool = True) -> Image.Image:
    big = gradient_background(size * SS)
    draw_mark(big, big.width / 2, big.height * 0.48, big.width * 0.58)
    if with_road:
        draw_road(big, big.height * 0.845, big.width * 0.42)
    return big.resize((size, size), Image.LANCZOS).convert("RGB")


def make_icon_layer(size: int, color=AMBER, with_road=False) -> Image.Image:
    """Transparent layer for Android adaptive/monochrome icons."""
    big = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    draw_mark(big, big.width / 2, big.height * 0.48, big.width * 0.54, color=color)
    if with_road:
        draw_road(big, big.height * 0.825, big.width * 0.40)
    return big.resize((size, size), Image.LANCZOS)


def make_background(size: int = 512) -> Image.Image:
    return gradient_background(size).convert("RGB")


def make_splash(size: int = 1024) -> Image.Image:
    """Transparent splash artwork; the native splash background is navy."""
    big = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    draw_mark(big, big.width / 2, big.height * 0.34, big.width * 0.26)

    font_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    font = ImageFont.truetype(font_path, int(big.height * 0.108))
    d = ImageDraw.Draw(big)
    text = "Mashinam"
    box = d.textbbox((0, 0), text, font=font)
    tw = box[2] - box[0]
    tx = (big.width - tw) / 2
    ty = big.height * 0.58
    d.text((tx, ty), text, font=font, fill=WHITE)

    # A short amber rule under the wordmark, matching the app's accent.
    rule_w = big.width * 0.22
    rule_y = big.height * 0.725
    d.rounded_rectangle(
        ((big.width - rule_w) / 2, rule_y, (big.width + rule_w) / 2, rule_y + big.height * 0.008),
        radius=big.height * 0.004,
        fill=AMBER,
    )
    return big.resize((size, size), Image.LANCZOS)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    icon = make_icon(1024, with_road=True)
    icon.save(ASSETS / "icon.png", "PNG")

    make_icon_layer(512, color=AMBER, with_road=False).save(
        ASSETS / "android-icon-foreground.png", "PNG"
    )
    make_background(512).save(ASSETS / "android-icon-background.png", "PNG")
    make_icon_layer(432, color=WHITE, with_road=False).save(
        ASSETS / "android-icon-monochrome.png", "PNG"
    )

    make_splash(1024).save(ASSETS / "splash-icon.png", "PNG")

    icon.resize((180, 180), Image.LANCZOS).save(ASSETS / "favicon.png", "PNG")
    icon.resize((512, 512), Image.LANCZOS).save(ASSETS / "icon-512.png", "PNG")

    print("Wrote:")
    for name in (
        "icon.png",
        "android-icon-foreground.png",
        "android-icon-background.png",
        "android-icon-monochrome.png",
        "splash-icon.png",
        "favicon.png",
        "icon-512.png",
    ):
        p = ASSETS / name
        print(f"  {p.relative_to(ROOT)}  {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
