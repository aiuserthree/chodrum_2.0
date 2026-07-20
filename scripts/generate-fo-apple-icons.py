#!/usr/bin/env python3
"""Generate opaque FO apple-touch / favicon PNGs for iOS Safari bookmarks.

iOS composites transparent icons onto black, so a black drum on transparent
alpha becomes an invisible black square. These assets use a solid white
background and no alpha channel.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "html/shared/favicon-drum-logo.png"
BG = (255, 255, 255, 255)
PADDING_RATIO = 0.12


def make_icon(size: int) -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    bbox = src.getbbox()
    if not bbox:
        raise SystemExit(f"no visible pixels in {SRC}")
    cropped = src.crop(bbox)
    pad = int(round(size * PADDING_RATIO))
    inner = size - pad * 2
    cw, ch = cropped.size
    scale = min(inner / cw, inner / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), BG)
    canvas.alpha_composite(resized, ((size - nw) // 2, (size - nh) // 2))
    return canvas.convert("RGB")


def main() -> None:
    icon180 = make_icon(180)
    targets = [
        ROOT / "html/shared/apple-touch-icon-fo.png",
        ROOT / "html/apple-touch-icon.png",
        ROOT / "html/apple-touch-icon-precomposed.png",
    ]
    for path in targets:
        icon180.save(path, format="PNG", optimize=True)
        print("wrote", path.relative_to(ROOT))

    im16 = make_icon(16)
    im32 = make_icon(32)
    for size, img, name in [
        (16, im16, "favicon-fo-16.png"),
        (32, im32, "favicon-fo-32.png"),
    ]:
        out = ROOT / "html/shared" / name
        img.save(out, format="PNG", optimize=True)
        print("wrote", out.relative_to(ROOT))

    ico = ROOT / "html/favicon.ico"
    im32.convert("RGBA").save(
        ico,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[im16.convert("RGBA")],
    )
    shared_ico = ROOT / "html/shared/favicon.ico"
    shared_ico.write_bytes(ico.read_bytes())
    print("wrote", ico.relative_to(ROOT))
    print("wrote", shared_ico.relative_to(ROOT))


if __name__ == "__main__":
    main()
