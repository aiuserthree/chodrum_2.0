#!/usr/bin/env python3
"""Generate transparent, full-bleed FO favicon / apple-touch PNGs.

- Transparent background (no solid fill).
- Drum mark scaled nearly edge-to-edge (tight bbox crop, minimal padding).

Tab favicons (16/32/ico): black drum for light browser chrome.
Apple touch (180): white drum — iOS often composites transparent icons onto
black; a black mark would disappear. Background stays transparent either way.
"""
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC_DARK = ROOT / "html/shared/favicon-drum-logo.png"
SRC_LIGHT = ROOT / "html/shared/logo-white.png"
# Optical hairline only — user wants 꽉 찬 (full-bleed) mark
PADDING_RATIO = 0.02


def _fit_on_transparent(src: Image.Image, size: int) -> Image.Image:
    src = src.convert("RGBA")
    bbox = src.getbbox()
    if not bbox:
        raise SystemExit("source image has no visible pixels")
    cropped = src.crop(bbox)
    pad = max(0, int(round(size * PADDING_RATIO)))
    inner = max(1, size - pad * 2)
    cw, ch = cropped.size
    # Contain into inner box (no clip) — after tight bbox this is nearly edge-to-edge
    scale = min(inner / cw, inner / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size - nw) // 2, (size - nh) // 2))
    return canvas


def make_dark_icon(size: int) -> Image.Image:
    return _fit_on_transparent(Image.open(SRC_DARK), size)


def make_light_icon(size: int) -> Image.Image:
    if SRC_LIGHT.is_file():
        return _fit_on_transparent(Image.open(SRC_LIGHT), size)
    dark = Image.open(SRC_DARK).convert("RGBA")
    r, g, b, a = dark.split()
    inverted = ImageOps.invert(Image.merge("RGB", (r, g, b)))
    inverted.putalpha(a)
    return _fit_on_transparent(inverted, size)


def main() -> None:
    icon180 = make_light_icon(180)
    for path in [
        ROOT / "html/shared/apple-touch-icon-fo.png",
        ROOT / "html/apple-touch-icon.png",
        ROOT / "html/apple-touch-icon-precomposed.png",
    ]:
        icon180.save(path, format="PNG", optimize=True)
        print("wrote", path.relative_to(ROOT), "(white drum, transparent, full-bleed)")

    im16 = make_dark_icon(16)
    im32 = make_dark_icon(32)
    for img, name in [(im16, "favicon-fo-16.png"), (im32, "favicon-fo-32.png")]:
        out = ROOT / "html/shared" / name
        img.save(out, format="PNG", optimize=True)
        print("wrote", out.relative_to(ROOT), "(black drum, transparent, full-bleed)")

    ico = ROOT / "html/favicon.ico"
    im32.save(
        ico,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[im16],
    )
    shared_ico = ROOT / "html/shared/favicon.ico"
    shared_ico.write_bytes(ico.read_bytes())
    print("wrote", ico.relative_to(ROOT))
    print("wrote", shared_ico.relative_to(ROOT))


if __name__ == "__main__":
    main()
