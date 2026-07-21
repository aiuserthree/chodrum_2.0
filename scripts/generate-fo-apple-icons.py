#!/usr/bin/env python3
"""Generate FO/BO favicon + apple-touch icons.

Apple-touch (Safari Favorites / Add to Home Screen):
  Opaque RGB PNG — solid brand ink background + white drum.
  Transparent / white-on-transparent icons are rejected or invisible on
  Safari Favorites' light tile, which falls back to a letter ("C").

Tab favicons (16/32/ico/svg):
  Black drum on transparent, tightly cropped (same fit for FO and BO).
  BO adds a small admin "A" badge in the corner.
"""
import base64
import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC_DARK = ROOT / "html/shared/favicon-drum-logo.png"
SRC_LIGHT = ROOT / "html/shared/logo-white.png"
SHARED = ROOT / "html/shared"

# Brand ink (#171717) — matches design-system --color-ink
APPLE_BG = (23, 23, 23)
# iOS masks round corners; leave modest inset so the mark stays readable
APPLE_PADDING_RATIO = 0.12
# Tab favicons: nearly full-bleed on transparent
FAVICON_PADDING_RATIO = 0.02

# Cache-bust token kept in sync with scripts/inject-favicons.mjs
ICON_VERSION = "20260721"


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


def add_admin_badge(base: Image.Image) -> Image.Image:
    """Small admin 'A' badge (bottom-right), scaled from the 32px SVG layout."""
    out = base.copy()
    size = out.size[0]
    s = size / 32.0
    r = max(2.0, 4.5 * s)
    cx = 27.2 * s
    cy = 27.2 * s
    draw = ImageDraw.Draw(out)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(23, 23, 23, 255))
    sw = max(1, int(round(1.2 * s)))
    draw.line(
        [(25.45 * s, 28.3 * s), (27.2 * s, 24.55 * s), (28.95 * s, 28.3 * s)],
        fill=(250, 250, 250, 255),
        width=sw,
        joint="curve",
    )
    yb = 27.05 * s
    draw.line([(26.05 * s, yb), (28.35 * s, yb)], fill=(250, 250, 250, 255), width=sw)
    return out


def make_opaque_apple(size: int, bg: tuple[int, int, int] = APPLE_BG) -> Image.Image:
    """RGB (no alpha) white drum on solid background — Safari-safe."""
    mark = make_light_mark(size, APPLE_PADDING_RATIO)
    canvas = Image.new("RGB", (size, size), bg)
    canvas.paste(mark, (0, 0), mark)
    return canvas


def make_opaque_apple_bo(size: int, bg: tuple[int, int, int] = APPLE_BG) -> Image.Image:
    """Same as FO apple-touch, plus admin badge."""
    mark = add_admin_badge(make_light_mark(size, APPLE_PADDING_RATIO))
    canvas = Image.new("RGB", (size, size), bg)
    canvas.paste(mark, (0, 0), mark)
    return canvas


def _png_data_uri(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def write_fo_svg() -> None:
    # Embed a higher-res fitted mark so SVG matches the tight PNG crop.
    mark = make_transparent_dark(256)
    uri = _png_data_uri(mark)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" '
        'role="img" aria-label="CHODRUM">\n'
        f'  <image href="{uri}" x="0" y="0" width="32" height="32" '
        'preserveAspectRatio="xMidYMid meet"/>\n'
        "</svg>\n"
    )
    path = SHARED / "favicon-fo.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} (tight-cropped drum SVG)")


def write_bo_svg() -> None:
    mark = make_transparent_dark(256)
    uri = _png_data_uri(mark)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" '
        'role="img" aria-label="CHODRUM Admin">\n'
        f'  <image href="{uri}" x="0" y="0" width="32" height="32" '
        'preserveAspectRatio="xMidYMid meet"/>\n'
        '  <circle cx="27.2" cy="27.2" r="4.5" fill="#171717"/>\n'
        '  <path d="M25.45 28.3 27.2 24.55 28.95 28.3M26.05 27.05h2.3" '
        'fill="none" stroke="#fafafa" stroke-width="1.2" '
        'stroke-linecap="round" stroke-linejoin="round"/>\n'
        "</svg>\n"
    )
    path = SHARED / "favicon-bo.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} (tight-cropped drum + admin badge SVG)")


def _save_png(img: Image.Image, path: Path, *, note: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({note})")


def main() -> None:
    # --- Apple touch: opaque RGB, conventional root paths ---
    for size in (180, 167, 152, 120):
        icon = make_opaque_apple(size)
        if size == 180:
            _save_png(
                icon,
                SHARED / "apple-touch-icon-fo.png",
                note="opaque RGB, white drum on #171717",
            )
            _save_png(
                make_opaque_apple_bo(180),
                SHARED / "apple-touch-icon-bo.png",
                note="opaque RGB FO mark + admin badge",
            )
            for path in [
                ROOT / "html/apple-touch-icon.png",
                ROOT / "html/apple-touch-icon-precomposed.png",
            ]:
                _save_png(icon, path, note="opaque RGB, white drum on #171717")
        _save_png(
            icon,
            ROOT / f"html/apple-touch-icon-{size}x{size}.png",
            note=f"opaque RGB {size}x{size}",
        )

    # --- Tab favicons: transparent black drum (same tight crop for FO + BO) ---
    im16 = make_transparent_dark(16)
    im32 = make_transparent_dark(32)
    bo16 = add_admin_badge(im16)
    bo32 = add_admin_badge(im32)
    for img, name, note in [
        (im16, "favicon-fo-16.png", "black drum, transparent"),
        (im32, "favicon-fo-32.png", "black drum, transparent"),
        (bo16, "favicon-bo-16.png", "black drum + admin badge, transparent"),
        (bo32, "favicon-bo-32.png", "black drum + admin badge, transparent"),
    ]:
        _save_png(img, SHARED / name, note=note)

    write_fo_svg()
    write_bo_svg()

    ico = ROOT / "html/favicon.ico"
    im32.save(
        ico,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[im16],
    )
    shared_ico = SHARED / "favicon.ico"
    shared_ico.write_bytes(ico.read_bytes())
    print(f"wrote {ico.relative_to(ROOT)}")
    print(f"wrote {shared_ico.relative_to(ROOT)}")
    print(f"icon version hint for link tags: ?v={ICON_VERSION}")


if __name__ == "__main__":
    main()
