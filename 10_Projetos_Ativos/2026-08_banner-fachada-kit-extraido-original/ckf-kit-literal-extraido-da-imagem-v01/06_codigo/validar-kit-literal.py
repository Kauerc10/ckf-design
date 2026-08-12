from __future__ import annotations

import base64
import hashlib
import json
import re
from pathlib import Path

from PIL import Image


PROJECT = Path(__file__).resolve().parent.parent
PNG_1X = PROJECT / "01_png_transparente_original"
PNG_4X = PROJECT / "02_png_transparente_4x"
SVG_DIR = PROJECT / "03_svg_autocontido"
LAYOUTS = PROJECT / "04_montagens_7x1"
MANIFEST = PROJECT / "manifesto-kit-extraido.json"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assets = manifest["assets"]
    if len(assets) != 39:
        raise RuntimeError(f"Manifesto deveria ter 39 assets; possui {len(assets)}.")

    pngs_1x = sorted(PNG_1X.glob("*.png"))
    pngs_4x = sorted(PNG_4X.glob("*.png"))
    svgs = sorted(SVG_DIR.glob("*.svg"))
    if (len(pngs_1x), len(pngs_4x), len(svgs)) != (39, 39, 39):
        raise RuntimeError(f"Contagem divergente: 1x={len(pngs_1x)}, 4x={len(pngs_4x)}, svg={len(svgs)}")

    checked_alpha = 0
    checked_embeds = 0
    checked_4x = 0
    for asset in assets:
        png_1x = PROJECT / asset["png_1x"]
        png_4x = PROJECT / asset["png_4x"]
        svg_path = PROJECT / asset["svg"]
        image_1x = Image.open(png_1x).convert("RGBA")
        image_4x = Image.open(png_4x).convert("RGBA")

        extrema = image_1x.getchannel("A").getextrema()
        if extrema[0] != 0 or extrema[1] != 255:
            raise RuntimeError(f"Canal alfa inválido em {png_1x.name}: {extrema}")
        if image_1x.getchannel("A").getbbox() is None:
            raise RuntimeError(f"Asset completamente vazio: {png_1x.name}")
        checked_alpha += 1

        if image_4x.size != (image_1x.width * 4, image_1x.height * 4):
            raise RuntimeError(f"Dimensão 4x incorreta em {png_4x.name}: {image_4x.size}")
        checked_4x += 1

        svg_text = svg_path.read_text(encoding="utf-8")
        match = re.search(r"data:image/png;base64,([^\"]+)", svg_text)
        if not match:
            raise RuntimeError(f"PNG incorporado não encontrado em {svg_path.name}")
        embedded = base64.b64decode(match.group(1))
        source_bytes = png_1x.read_bytes()
        if sha256(embedded) != sha256(source_bytes):
            raise RuntimeError(f"O SVG {svg_path.name} não incorpora exatamente o PNG correspondente.")
        checked_embeds += 1

    layout_png = LAYOUTS / "ckf-banner-7x1-recortes-originais-recomendado.png"
    layout_svg = LAYOUTS / "ckf-banner-7x1-recortes-originais-recomendado-escala-1-10.svg"
    layout = Image.open(layout_png)
    if layout.size != (7000, 1000):
        raise RuntimeError(f"Montagem deveria ter 7000x1000 px; possui {layout.size}.")
    svg_text = layout_svg.read_text(encoding="utf-8")
    if 'width="1050mm" height="150mm"' not in svg_text or 'viewBox="0 0 7000 1000"' not in svg_text:
        raise RuntimeError("SVG da montagem não está na proporção 7:1 e escala 1:10 esperadas.")

    source = PROJECT / manifest["source"]
    if Image.open(source).size != tuple(manifest["source_size"]):
        raise RuntimeError("A cópia da fonte não corresponde às dimensões registradas.")

    print(json.dumps({
        "status": "PASS",
        "assets": len(assets),
        "alpha_validated": checked_alpha,
        "png_4x_validated": checked_4x,
        "svg_embeds_byte_identical": checked_embeds,
        "layout_png": [7000, 1000],
        "layout_svg": "1050 x 150 mm (1:10)",
        "source_preserved": list(Image.open(source).size),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
