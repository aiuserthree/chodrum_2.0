#!/usr/bin/env python3
"""Generate FO/BO favicon + apple-touch icons.

Apple-touch (Safari Favorites / Add to Home Screen):
  Opaque RGB PNG — solid brand ink background + white drum.
  Transparent / white-on-transparent icons are rejected or invisible on
  Safari Favorites' light tile, which falls back to a letter ("C").

Tab favicons (16/32/ico):
  Black drum on transparent (unchanged) for light browser chrome.
"""
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC_DARK = ROOT / "html/shared/favicon-drum-logo.png"
SRC_LIGHT = ROOT / "html/shared/logo-white.png"

# Brand ink (#171717) — matches design-system --color-ink
APPLE_BG = (23, 23, 23)
# iOS masks round corners; leave modest inset so the mark stays readable
APPLE_PADDING_RATIO = 0.12
# Tab favicons: nearly full-bleed on transparent
FAVICON_PADDING_RATIO = 0.02

# Cache-bust token kept in sync with scripts/inject-favicons.mjs
ICON_VERSION = "20260720"


def _fit_mark(src: Image.Image, size: int, padding_ratio: float) -> Image.Image:
    src = src.convert("RGBA")
    bbox = src.getbbox()
    if not bbox:
        raise SystemExit("source image has no visible pixels")
    cropped = src.crop(bbox)
    pad = max(0, int(round(size * padding_ratio)))
    inner = max(1, size - pad * 2)
    cw, ch = cropped.size
    scale = min(inner / cw, inner / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    layer.alpha_composite(resized, ((size - nw) // 2, (size - nh) // 2))
    return layer


def make_transparent_dark(size: int) -> Image.Image:
    return _fit_mark(Image.open(SRC_DARK), size, FAVICON_PADDING_RATIO)


def make_light_mark(size: int, padding_ratio: float) -> Image.Image:
    if SRC_LIGHT.is_file():
        return _fit_mark(Image.open(SRC_LIGHT), size, padding_ratio)
    dark = Image.open(SRC_DARK).convert("RGBA")
    r, g, b, a = dark.split()
    inverted = ImageOps.invert(Image.merge("RGB", (r, g, b)))
    inverted.putalpha(a)
    return _fit_mark(inverted, size, padding_ratio)


def make_opaque_apple(size: int, bg: tuple[int, int, int] = APPLE_BG) -> Image.Image:
    """RGB (no alpha) white drum on solid background — Safari-safe."""
    mark = make_light_mark(size, APPLE_PADDING_RATIO)
    canvas = Image.new("RGB", (size, size), bg)
    canvas.paste(mark, (0, 0), mark)
    return canvas


def _save_png(img: Image.Image, path: Path, *, note: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({note})")


def main() -> None:
    # --- Apple touch: opaque RGB, conventional root paths ---
    for size in (180, 167, 152, 120):
        icon = make_opaque_apple(size)
        if size == 180:
            for path in [
                ROOT / "html/shared/apple-touch-icon-fo.png",
                ROOT / "html/shared/apple-touch-icon-bo.png",
                ROOT / "html/apple-touch-icon.png",
                ROOT / "html/apple-touch-icon-precomposed.png",
            ]:
                _save_png(icon, path, note="opaque RGB, white drum on #171717")
        _save_png(
            icon,
            ROOT / f"html/apple-touch-icon-{size}x{size}.png",
            note=f"opaque RGB {size}x{size}",
        )

    # --- Tab favicons: transparent black drum ---
    im16 = make_transparent_dark(16)
    im32 = make_transparent_dark(32)
    for img, name in [(im16, "favicon-fo-16.png"), (im32, "favicon-fo-32.png")]:
        _save_png(img, ROOT / "html/shared" / name, note="black drum, transparent")

    ico = ROOT / "html/favicon.ico"
    im32.save(
        ico,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[im16],
    )
    shared_ico = ROOT / "html/shared/favicon.ico"
    shared_ico.write_bytes(ico.read_bytes())
    print(f"wrote {ico.relative_to(ROOT)}")
    print(f"wrote {shared_ico.relative_to(ROOT)}")
    print(f"icon version hint for link tags: ?v={ICON_VERSION}")


if __name__ == "__main__":
    main()
