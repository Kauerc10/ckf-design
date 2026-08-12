from __future__ import annotations

import base64
import json
import shutil
from dataclasses import dataclass, asdict
from io import BytesIO
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont, ImageFilter


PROJECT = Path(__file__).resolve().parent.parent
SOURCE_TEMP = Path(r"C:\Users\Kauerc\AppData\Local\Temp\codex-clipboard-ff16116b-30c9-4f0d-a49d-1fbb9b48db6d.png")
SOURCE_DIR = PROJECT / "00_fonte_original"
PNG_1X = PROJECT / "01_png_transparente_original"
PNG_4X = PROJECT / "02_png_transparente_4x"
SVG_DIR = PROJECT / "03_svg_autocontido"
LAYOUTS = PROJECT / "04_montagens_7x1"
PREVIEWS = PROJECT / "05_previews"
SOURCE = SOURCE_DIR / "banner-fonte-original.png"

YELLOW = (251, 200, 0, 255)
BLACK = (9, 12, 13, 255)
BLACK_2 = (15, 19, 20, 255)
WHITE = (247, 247, 244, 255)


@dataclass(frozen=True)
class AssetSpec:
    name: str
    label: str
    category: str
    box: tuple[int, int, int, int]
    mode: str = "foreground"


ASSETS: list[AssetSpec] = [
    AssetSpec("logo-completa", "Logo CKF completa", "marca", (43, 123, 742, 384)),
    AssetSpec("logo-simbolo", "Símbolo CKF", "marca", (43, 123, 324, 384)),
    AssetSpec("logo-tipografia", "CKF + Manutenção", "marca", (326, 151, 742, 374)),
    AssetSpec("logo-sigla-ckf", "Sigla CKF", "marca", (326, 151, 742, 317)),
    AssetSpec("logo-texto-manutencao", "Texto Manutenção", "marca", (326, 315, 742, 377)),
    AssetSpec("whatsapp-icone", "Ícone WhatsApp", "contatos", (68, 486, 196, 620)),
    AssetSpec("telefone-01", "(47) 99121-4232", "contatos", (232, 476, 727, 563)),
    AssetSpec("telefone-02", "(47) 99913-0409", "contatos", (232, 572, 727, 661)),
    AssetSpec("contatos-bloco", "WhatsApp e dois telefones", "contatos", (68, 476, 727, 661)),
    AssetSpec("marca-e-contatos-bloco", "Marca e contatos", "blocos", (43, 123, 742, 661)),
    AssetSpec("titulo-solucoes-manutencao-geral", "Soluções em Manutenção Geral", "titulo", (846, 111, 1867, 205)),

    AssetSpec("especialidade-01-icone", "Ícone caminhões e máquinas pesadas", "especialidades", (833, 233, 1023, 416)),
    AssetSpec("especialidade-01-texto", "Caminhões e máquinas pesadas", "especialidades", (1048, 236, 1303, 412)),
    AssetSpec("especialidade-01-bloco", "Bloco caminhões e máquinas pesadas", "blocos", (830, 231, 1305, 418)),

    AssetSpec("especialidade-02-icone", "Ícone central de concreto", "especialidades", (1387, 230, 1562, 419)),
    AssetSpec("especialidade-02-texto", "Central de concreto", "especialidades", (1581, 276, 1857, 397)),
    AssetSpec("especialidade-02-bloco", "Bloco central de concreto", "blocos", (1384, 228, 1859, 421)),

    AssetSpec("especialidade-03-icone", "Ícone reforma de equipamentos", "especialidades", (833, 465, 1014, 640)),
    AssetSpec("especialidade-03-texto", "Reforma de equipamentos e chassis", "especialidades", (1041, 470, 1302, 640)),
    AssetSpec("especialidade-03-bloco", "Bloco reforma de equipamentos e chassis", "blocos", (830, 462, 1305, 642)),

    AssetSpec("especialidade-04-icone", "Ícone estruturas metálicas", "especialidades", (1387, 474, 1565, 642)),
    AssetSpec("especialidade-04-texto", "Estruturas metálicas", "especialidades", (1582, 500, 1861, 629)),
    AssetSpec("especialidade-04-bloco", "Bloco estruturas metálicas", "blocos", (1384, 470, 1863, 644)),

    AssetSpec("servicos-faixa-completa", "Faixa completa de serviços", "servicos", (804, 668, 1864, 718)),
    AssetSpec("servico-01-suspensao", "Suspensão", "servicos", (808, 671, 936, 718)),
    AssetSpec("servico-02-solda", "Solda", "servicos", (968, 671, 1041, 718)),
    AssetSpec("servico-03-preventiva", "Preventiva", "servicos", (1073, 671, 1200, 718)),
    AssetSpec("servico-04-freios", "Freios", "servicos", (1231, 671, 1309, 718)),
    AssetSpec("servico-05-hidraulica", "Hidráulica", "servicos", (1340, 671, 1465, 718)),
    AssetSpec("servico-06-reforma", "Reforma", "servicos", (1495, 671, 1596, 718)),
    AssetSpec("servico-07-pintura", "Pintura", "servicos", (1626, 671, 1718, 718)),
    AssetSpec("servico-08-embreagem", "Embreagem", "servicos", (1748, 671, 1877, 718)),
    AssetSpec("servicos-separador-ponto", "Ponto separador dos serviços", "servicos", (944, 671, 962, 718)),

    AssetSpec("divisor-principal-angular", "Divisor principal angular", "divisores", (754, 78, 806, 742), "yellow"),
    AssetSpec("divisor-grade-horizontal", "Linha horizontal da grade", "divisores", (824, 428, 1863, 447), "yellow"),
    AssetSpec("divisor-grade-vertical", "Linha vertical da grade", "divisores", (1328, 232, 1344, 643), "yellow"),
    AssetSpec("grade-especialidades-completa", "Grade completa de especialidades", "blocos", (824, 228, 1865, 645)),
    AssetSpec("conteudo-direito-completo", "Título, especialidades e serviços", "blocos", (804, 108, 1870, 721)),
    AssetSpec("conteudo-total-sem-fundo", "Todo o conteúdo do banner sem fundo", "blocos", (42, 108, 1870, 721)),
]


def ensure_dirs() -> None:
    for directory in [SOURCE_DIR, PNG_1X, PNG_4X, SVG_DIR, LAYOUTS, PREVIEWS]:
        directory.mkdir(parents=True, exist_ok=True)


def clean_foreground(crop: Image.Image, mode: str) -> Image.Image:
    source = crop.convert("RGBA")
    result = Image.new("RGBA", source.size, (0, 0, 0, 0))
    src = source.load()
    dst = result.load()

    for y in range(source.height):
        for x in range(source.width):
            r, g, b, _ = src[x, y]
            if mode == "yellow":
                score = max(0, min(r, g) - b)
                if score <= 24 or r < 70 or g < 55:
                    alpha = 0
                elif score >= 125:
                    alpha = 255
                else:
                    alpha = round((score - 24) / 101 * 255)
            else:
                peak = max(r, g, b)
                if peak <= 27:
                    alpha = 0
                elif peak >= 145:
                    alpha = 255
                else:
                    alpha = round(((peak - 27) / 118) ** 0.9 * 255)

            if alpha < 12:
                dst[x, y] = (0, 0, 0, 0)
                continue

            if alpha < 255:
                # Remove a contaminação do fundo preto somente nas bordas.
                factor = min(2.5, 255 / max(alpha, 1))
                r = min(255, round(r * factor))
                g = min(255, round(g * factor))
                b = min(255, round(b * factor))
            dst[x, y] = (r, g, b, alpha)

    bbox = result.getchannel("A").getbbox()
    if bbox is None:
        raise RuntimeError(f"Recorte vazio após remoção de fundo: modo={mode}")
    result = result.crop(bbox)
    padded = Image.new("RGBA", (result.width + 24, result.height + 24), (0, 0, 0, 0))
    padded.alpha_composite(result, (12, 12))
    return padded


def save_svg_wrapper(png_path: Path, svg_path: Path, label: str, physical: bool = False) -> None:
    image = Image.open(png_path)
    raw = png_path.read_bytes()
    encoded = base64.b64encode(raw).decode("ascii")
    width_attr = 'width="1050mm" height="150mm"' if physical else f'width="{image.width}" height="{image.height}"'
    svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {image.width} {image.height}" '
        f'{width_attr} role="img" aria-label="{label}">\n'
        f'  <image width="{image.width}" height="{image.height}" href="data:image/png;base64,{encoded}"/>\n'
        '</svg>\n'
    )
    svg_path.write_text(svg, encoding="utf-8")


def draw_gradient_background(size: tuple[int, int]) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size, BLACK)
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            horizontal = x / max(1, width - 1)
            vertical = abs(y / max(1, height - 1) - 0.5) * 2
            lift = round(8 * (1 - vertical) + 3 * horizontal)
            pixels[x, y] = (BLACK[0] + lift, BLACK[1] + lift, BLACK[2] + lift, 255)
    return image


def fit_image(image: Image.Image, box: tuple[int, int, int, int], contain: bool = True) -> tuple[Image.Image, tuple[int, int]]:
    left, top, right, bottom = box
    max_w = right - left
    max_h = bottom - top
    scale = min(max_w / image.width, max_h / image.height) if contain else max(max_w / image.width, max_h / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    x = left + (max_w - resized.width) // 2
    y = top + (max_h - resized.height) // 2
    return resized, (x, y)


def place(canvas: Image.Image, asset: Image.Image, box: tuple[int, int, int, int]) -> None:
    resized, pos = fit_image(asset, box)
    canvas.alpha_composite(resized, pos)


def rounded_card(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], primary: bool = False) -> None:
    fill = (13, 17, 18, 242)
    outline = YELLOW if primary else (60, 66, 68, 255)
    draw.rounded_rectangle(box, radius=28, fill=fill, outline=outline, width=7 if primary else 3)
    if not primary:
        x1, _, x2, y2 = box
        center = (x1 + x2) // 2
        draw.line((center - 75, y2 - 20, center + 75, y2 - 20), fill=YELLOW, width=6)


def build_layout(asset_images: dict[str, Image.Image]) -> Image.Image:
    canvas = draw_gradient_background((7000, 1000))
    draw = ImageDraw.Draw(canvas)

    place(canvas, asset_images["logo-completa"], (105, 25, 2200, 555))
    # WhatsApp sob o símbolo da CKF e telefones sob a parte tipográfica.
    place(canvas, asset_images["whatsapp-icone"], (545, 600, 895, 950))
    place(canvas, asset_images["telefone-01"], (900, 555, 2200, 755))
    place(canvas, asset_images["telefone-02"], (900, 760, 2200, 960))
    place(canvas, asset_images["divisor-principal-angular"], (2290, 0, 2450, 1000))

    place(canvas, asset_images["titulo-solucoes-manutencao-geral"], (2590, 45, 6870, 300))

    # Especialidades sem cards: apenas os recortes originais ampliados.
    starts = [2460, 3585, 4710, 5835]
    specialty_names = [
        ("especialidade-01-icone", "especialidade-01-texto"),
        ("especialidade-02-icone", "especialidade-02-texto"),
        ("especialidade-03-icone", "especialidade-03-texto"),
        ("especialidade-04-icone", "especialidade-04-texto"),
    ]
    for index, (icon_name, text_name) in enumerate(specialty_names):
        x1 = starts[index]
        place(canvas, asset_images[icon_name], (x1 + 15, 335, x1 + 485, 795))
        place(canvas, asset_images[text_name], (x1 + 470, 345, x1 + 1110, 785))

    # A faixa de serviços usa o mesmo fundo preto/quase preto de toda a lona.
    draw.rectangle((2500, 825, 6910, 831), fill=YELLOW)
    place(canvas, asset_images["servicos-faixa-completa"], (2560, 850, 6850, 980))
    return canvas


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", size)


def make_contact_sheet(
    title: str,
    specs: Iterable[AssetSpec],
    asset_images: dict[str, Image.Image],
    output: Path,
) -> None:
    specs = list(specs)
    cols = 3
    cell_w, cell_h = 760, 470
    rows = (len(specs) + cols - 1) // cols
    canvas = draw_gradient_background((cols * cell_w, 130 + rows * cell_h))
    draw = ImageDraw.Draw(canvas)
    draw.text((55, 35), title, font=load_font(54), fill=WHITE)

    for index, spec in enumerate(specs):
        col = index % cols
        row = index // cols
        x = col * cell_w + 35
        y = 120 + row * cell_h + 20
        draw.rounded_rectangle((x, y, x + cell_w - 70, y + cell_h - 55), radius=20, fill=(8, 10, 11, 255), outline=(48, 54, 55, 255), width=2)
        place(canvas, asset_images[spec.name], (x + 35, y + 30, x + cell_w - 105, y + cell_h - 145))
        label = spec.label if len(spec.label) <= 38 else spec.label[:35] + "..."
        draw.text((x + 35, y + cell_h - 125), label, font=load_font(27), fill=WHITE)
        draw.text((x + 35, y + cell_h - 87), f"{spec.name}.png", font=load_font(19), fill=(174, 181, 182, 255))
    canvas.convert("RGB").save(output, quality=95)


def make_crop_map(source: Image.Image) -> None:
    mapped = source.convert("RGBA")
    draw = ImageDraw.Draw(mapped)
    colors = {
        "marca": (0, 220, 255, 255),
        "contatos": (0, 220, 255, 255),
        "titulo": (255, 0, 160, 255),
        "especialidades": (0, 255, 120, 255),
        "servicos": (255, 140, 0, 255),
        "divisores": (170, 80, 255, 255),
        "blocos": (255, 255, 255, 255),
    }
    for index, spec in enumerate(ASSETS):
        if spec.category == "blocos":
            continue
        draw.rectangle(spec.box, outline=colors[spec.category], width=2)
        if index < 22:
            draw.text((spec.box[0] + 2, spec.box[1] + 2), str(index + 1), font=load_font(15), fill=colors[spec.category])
    mapped.save(PREVIEWS / "mapa-dos-recortes.png")


def main() -> None:
    ensure_dirs()
    if not SOURCE_TEMP.exists() and not SOURCE.exists():
        raise FileNotFoundError("A imagem-fonte não foi encontrada no temporário nem no projeto.")
    if SOURCE_TEMP.exists():
        shutil.copy2(SOURCE_TEMP, SOURCE)

    source = Image.open(SOURCE).convert("RGB")
    if source.size != (1918, 820):
        raise RuntimeError(f"Dimensão inesperada da fonte: {source.size}; esperado 1918x820.")

    asset_images: dict[str, Image.Image] = {}
    manifest_assets: list[dict] = []
    for spec in ASSETS:
        crop = source.crop(spec.box)
        cleaned = clean_foreground(crop, spec.mode)
        png_1x = PNG_1X / f"{spec.name}.png"
        png_4x = PNG_4X / f"{spec.name}-4x.png"
        svg = SVG_DIR / f"{spec.name}.svg"
        cleaned.save(png_1x, optimize=True)
        upscaled = cleaned.resize((cleaned.width * 4, cleaned.height * 4), Image.Resampling.LANCZOS)
        upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1.0, percent=55, threshold=4))
        upscaled.save(png_4x, optimize=True)
        save_svg_wrapper(png_1x, svg, spec.label)
        asset_images[spec.name] = cleaned
        manifest_assets.append({
            **asdict(spec),
            "box": list(spec.box),
            "png_1x": str(png_1x.relative_to(PROJECT)),
            "png_4x": str(png_4x.relative_to(PROJECT)),
            "svg": str(svg.relative_to(PROJECT)),
            "size_1x": [cleaned.width, cleaned.height],
            "transparent": True,
            "provenance": "Recorte literal da imagem-fonte; nenhuma forma, letra ou ícone foi redesenhado.",
        })

    # Fonte sem as margens brancas da captura, mantida como referência.
    source.crop((0, 78, 1918, 742)).save(SOURCE_DIR / "banner-original-sem-margens.png", optimize=True)
    make_crop_map(source)

    layout = build_layout(asset_images)
    layout_png = LAYOUTS / "ckf-banner-7x1-recortes-originais-v03-fundo-unico.png"
    layout_jpg = LAYOUTS / "ckf-banner-7x1-recortes-originais-v03-fundo-unico.jpg"
    layout_svg = LAYOUTS / "ckf-banner-7x1-recortes-originais-v03-fundo-unico-escala-1-10.svg"
    layout.save(layout_png, optimize=True)
    layout.convert("RGB").save(layout_jpg, quality=95, subsampling=0)
    save_svg_wrapper(layout_png, layout_svg, "Banner CKF 10,50 x 1,50 m montado com recortes originais", physical=True)

    make_contact_sheet(
        "CKF — MARCA, CONTATOS E TÍTULO EXTRAÍDOS",
        [spec for spec in ASSETS if spec.category in {"marca", "contatos", "titulo"}],
        asset_images,
        PREVIEWS / "preview-01-marca-contatos-titulo.jpg",
    )
    make_contact_sheet(
        "CKF — ESPECIALIDADES EXTRAÍDAS",
        [spec for spec in ASSETS if spec.category in {"especialidades", "blocos"} and "conteudo" not in spec.name and "marca-e" not in spec.name],
        asset_images,
        PREVIEWS / "preview-02-especialidades.jpg",
    )
    make_contact_sheet(
        "CKF — SERVIÇOS E DIVISORES EXTRAÍDOS",
        [spec for spec in ASSETS if spec.category in {"servicos", "divisores"}],
        asset_images,
        PREVIEWS / "preview-03-servicos-divisores.jpg",
    )

    manifest = {
        "project": "CKF — Kit literal extraído do banner aprovado",
        "source": str(SOURCE.relative_to(PROJECT)),
        "source_size": [1918, 820],
        "final_banner_size_mm": [10500, 1500],
        "ratio": "7:1",
        "method": "Recortes de pixels + remoção determinística do fundo escuro + SVG autocontido por base64.",
        "important": "Os SVGs não são vetorização em curvas; incorporam o PNG transparente para preservar o desenho exato.",
        "assets": manifest_assets,
        "layout_recommended_v03": {
            "png": str(layout_png.relative_to(PROJECT)),
            "jpg": str(layout_jpg.relative_to(PROJECT)),
            "svg": str(layout_svg.relative_to(PROJECT)),
            "pixel_size": [7000, 1000],
            "svg_scale": "1050 x 150 mm (1:10)",
        },
    }
    (PROJECT / "manifesto-kit-extraido.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "status": "OK",
        "assets": len(ASSETS),
        "png_1x": len(list(PNG_1X.glob("*.png"))),
        "png_4x": len(list(PNG_4X.glob("*.png"))),
        "svg": len(list(SVG_DIR.glob("*.svg"))),
        "layout": str(layout_png),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
