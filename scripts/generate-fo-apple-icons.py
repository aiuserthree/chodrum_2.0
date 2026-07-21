#!/usr/bin/env python3
"""Generate FO/BO favicon + apple-touch icons.

Apple-touch (Safari Favorites / Add to Home Screen):
  Opaque RGB PNG — solid brand ink background + white drum.
  Transparent / white-on-transparent icons are rejected or invisible on
  Safari Favorites' light tile, which falls back to a letter ("C").

Tab favicons (16/32/ico/svg):
  Black drum on transparent, cover-fitted so the mark fills the square
  the same way for FO and BO. BO adds a tiny admin "A" corner overlay
  without shrinking the drum.
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
APPLE_PADDING_RATIO = 0.10
# Tab favicons: cover-fit, nearly edge-to-edge
FAVICON_PADDING_RATIO = 0.0

# Cache-bust token kept in sync with scripts/inject-favicons.mjs
ICON_VERSION = "20260721c"


def _fit_mark(
    src: Image.Image,
    size: int,
    padding_ratio: float,
    *,
    mode: str = "contain",
) -> Image.Image:
    """Fit mark into a square. mode='cover' fills the square (may crop sides)."""
    src = src.convert("RGBA")
    bbox = src.getbbox()
    if not bbox:
        raise SystemExit("source image has no visible pixels")
    cropped = src.crop(bbox)
    pad = max(0, int(round(size * padding_ratio)))
    inner = max(1, size - pad * 2)
    cw, ch = cropped.size
    if mode == "cover":
        scale = max(inner / cw, inner / ch)
    else:
        scale = min(inner / cw, inner / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    if mode == "cover":
        # Center and crop to exact size (overflow clipped).
        tmp = Image.new("RGBA", (max(size, nw), max(size, nh)), (0, 0, 0, 0))
        tmp.alpha_composite(resized, ((tmp.size[0] - nw) // 2, (tmp.size[1] - nh) // 2))
        cx = (tmp.size[0] - size) // 2
        cy = (tmp.size[1] - size) // 2
        return tmp.crop((cx, cy, cx + size, cy + size))

    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    layer.alpha_composite(resized, ((size - nw) // 2, (size - nh) // 2))
    return layer


def make_transparent_dark(size: int) -> Image.Image:
    # Cover-fit so tab icons fill like a proper favicon (same for FO + BO).
    return _fit_mark(Image.open(SRC_DARK), size, FAVICON_PADDING_RATIO, mode="cover")


def make_light_mark(size: int, padding_ratio: float) -> Image.Image:
    # Apple-touch keeps contain + padding (iOS corner mask).
    if SRC_LIGHT.is_file():
        return _fit_mark(Image.open(SRC_LIGHT), size, padding_ratio, mode="contain")
    dark = Image.open(SRC_DARK).convert("RGBA")
    r, g, b, a = dark.split()
    inverted = ImageOps.invert(Image.merge("RGB", (r, g, b)))
    inverted.putalpha(a)
    return _fit_mark(inverted, size, padding_ratio, mode="contain")


def add_admin_badge(base: Image.Image) -> Image.Image:
    """Tiny admin 'A' corner overlay — never shrinks the drum mark."""
    out = base.copy()
    size = out.size[0]
    s = size / 32.0
    # Smaller badge than historical 6.75r so drum stays full-bleed.
    r = max(2.0, 3.6 * s)
    cx = 28.0 * s
    cy = 28.0 * s
    draw = ImageDraw.Draw(out)
    # Light disc so the badge stays visible on dark/light tab chrome.
    draw.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        fill=(250, 250, 250, 255),
        outline=(23, 23, 23, 255),
        width=max(1, int(round(0.8 * s))),
    )
    sw = max(1, int(round(1.1 * s)))
    draw.line(
        [(26.55 * s, 28.85 * s), (28.0 * s, 25.9 * s), (29.45 * s, 28.85 * s)],
        fill=(23, 23, 23, 255),
        width=sw,
        joint="curve",
    )
    yb = 27.85 * s
    draw.line([(27.05 * s, yb), (28.95 * s, yb)], fill=(23, 23, 23, 255), width=sw)
    return out


def make_opaque_apple(size: int, bg: tuple[int, int, int] = APPLE_BG) -> Image.Image:
    """RGB (no alpha) white drum on solid background — Safari-safe."""
    mark = make_light_mark(size, APPLE_PADDING_RATIO)
    canvas = Image.new("RGB", (size, size), bg)
    canvas.paste(mark, (0, 0), mark)
    return canvas


def make_opaque_apple_bo(size: int, bg: tuple[int, int, int] = APPLE_BG) -> Image.Image:
    """Same FO apple-touch drum scale, plus tiny admin badge overlay."""
    mark = add_admin_badge(make_light_mark(size, APPLE_PADDING_RATIO))
    canvas = Image.new("RGB", (size, size), bg)
    canvas.paste(mark, (0, 0), mark)
    return canvas


def _png_data_uri(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def write_fo_svg() -> None:
    # Embed cover-fitted mark so SVG matches full-bleed PNG (never letterbox).
    mark = make_transparent_dark(256)
    uri = _png_data_uri(mark)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" '
        'role="img" aria-label="CHODRUM">\n'
        f'  <image href="{uri}" x="0" y="0" width="32" height="32" '
        'preserveAspectRatio="xMidYMid slice"/>\n'
        "</svg>\n"
    )
    path = SHARED / "favicon-fo.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} (cover-fit drum SVG)")


def write_bo_svg() -> None:
    # Same full-bleed drum as FO (width/height MUST be 32 — never 27.5).
    # Badge is a corner overlay only; do not scale the <image> down.
    mark = make_transparent_dark(256)
    uri = _png_data_uri(mark)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" '
        'role="img" aria-label="CHODRUM Admin">\n'
        f'  <image href="{uri}" x="0" y="0" width="32" height="32" '
        'preserveAspectRatio="xMidYMid slice"/>\n'
        '  <circle cx="28" cy="28" r="3.6" fill="#fafafa" stroke="#171717" '
        'stroke-width="0.8"/>\n'
        '  <path d="M26.55 28.85 28 25.9 29.45 28.85M27.05 27.85h1.9" '
        'fill="none" stroke="#171717" stroke-width="1.1" '
        'stroke-linecap="round" stroke-linejoin="round"/>\n'
        "</svg>\n"
    )
    path = SHARED / "favicon-bo.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} (cover-fit drum + corner A badge SVG)")


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

    # --- Tab favicons: cover-fit black drum (identical scale FO + BO) ---
    im16 = make_transparent_dark(16)
    im32 = make_transparent_dark(32)
    bo16 = add_admin_badge(im16)
    bo32 = add_admin_badge(im32)
    for img, name, note in [
        (im16, "favicon-fo-16.png", "cover-fit black drum, transparent"),
        (im32, "favicon-fo-32.png", "cover-fit black drum, transparent"),
        (bo16, "favicon-bo-16.png", "same drum + corner A badge"),
        (bo32, "favicon-bo-32.png", "same drum + corner A badge"),
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
