"""Генерация обложек каталогов и OG-изображений.

Особенность: вся типографика переводится в SVG-пути (textpath.py), поэтому
результат не зависит от наличия шрифтов в системе рендера и воспроизводится
один в один.

Запуск: python3 scripts/gen-assets.py && node scripts/render-assets.mjs
"""
from __future__ import annotations

import base64
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textpath import measure, text_path  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public", "images")
OUT = "/tmp/asset-svg"

INK = "#101310"
PAPER = "#ece9e1"
ACCENT = "#ff4d12"
MUTED = "#9aa094"

os.makedirs(OUT, exist_ok=True)


def photo_b64(name: str) -> str:
    with open(os.path.join(IMG, name), "rb") as f:
        return base64.b64encode(f.read()).decode()


def cover(
    slug: str,
    photo: str,
    brand: str,
    category: str,
    title: list[str],
    meta: list[str],
    index: str,
    year: str = "2025",
) -> None:
    W, H = 1600, 1200
    b64 = photo_b64(photo)

    parts: list[str] = []
    parts.append(f'<image href="data:image/jpeg;base64,{b64}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"/>')
    # затемнение + градиент
    parts.append(f'<rect width="{W}" height="{H}" fill="{INK}" opacity="0.34"/>')
    parts.append(
        f'<defs><linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">'
        f'<stop offset="0" stop-color="{INK}" stop-opacity="0.05"/>'
        f'<stop offset="0.45" stop-color="{INK}" stop-opacity="0.35"/>'
        f'<stop offset="0.78" stop-color="{INK}" stop-opacity="0.9"/>'
        f'<stop offset="1" stop-color="{INK}" stop-opacity="0.97"/></linearGradient></defs>'
        f'<rect width="{W}" height="{H}" fill="url(#g)"/>'
    )
    parts.append(
        f'<defs><linearGradient id="left" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0" stop-color="{INK}" stop-opacity="0.88"/>'
        f'<stop offset="0.5" stop-color="{INK}" stop-opacity="0.45"/>'
        f'<stop offset="1" stop-color="{INK}" stop-opacity="0"/></linearGradient></defs>'
        f'<rect width="{W}" height="{H}" fill="url(#left)"/>'
    )
    # техническая сетка
    for x in range(0, W, 100):
        parts.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{PAPER}" stroke-opacity="0.05"/>')
    # рамка
    parts.append(f'<rect x="40" y="40" width="{W-80}" height="{H-80}" fill="none" stroke="{PAPER}" stroke-opacity="0.18"/>')

    # верхняя строка
    top = text_path(f"КАТАЛОГ · {year}", font="mono", size=22, x=72, y=96, color=MUTED, letter_spacing=4)
    parts.append(top.svg)
    parts.append(f'<line x1="72" y1="118" x2="{W-72}" y2="118" stroke="{PAPER}" stroke-opacity="0.16"/>')
    idx = text_path(index, font="mono", size=22, x=W - 72 - measure(index, "mono", 22, 4), y=96, color=ACCENT, letter_spacing=4)
    parts.append(idx.svg)

    # размерная линия с засечками
    y_dim = 168
    parts.append(f'<line x1="72" y1="{y_dim}" x2="620" y2="{y_dim}" stroke="{ACCENT}" stroke-opacity="0.8"/>')
    parts.append(f'<line x1="72" y1="{y_dim-8}" x2="72" y2="{y_dim+8}" stroke="{ACCENT}"/>')
    parts.append(f'<line x1="620" y1="{y_dim-8}" x2="620" y2="{y_dim+8}" stroke="{ACCENT}"/>')
    dim = text_path("1 600 × 1 200 · 4:3", font="mono", size=15, x=632, y=y_dim + 6, color=MUTED, letter_spacing=2)
    parts.append(dim.svg)

    # бренд
    brand_size = 190
    bm = measure(brand, "display", brand_size, 2)
    if bm > W - 200:
        brand_size = int(brand_size * (W - 200) / bm)
        bm = measure(brand, "display", brand_size, 2)
    parts.append(text_path(brand, font="display", size=brand_size, x=68, y=420, color=PAPER, letter_spacing=2).svg)
    parts.append(f'<rect x="72" y="456" width="{bm:.0f}" height="6" fill="{ACCENT}"/>')

    # категория
    parts.append(text_path(category.upper(), font="mono", size=24, x=72, y=520, color=ACCENT, letter_spacing=5).svg)

    # заголовок
    size = 108
    y = 690
    for line in title:
        parts.append(text_path(line, font="display", size=size, x=68, y=y, color=PAPER, letter_spacing=1).svg)
        y += size * 0.99

    # метаданные внизу
    meta_str = "   /   ".join(meta)
    parts.append(f'<line x1="72" y1="{H-150}" x2="{W-72}" y2="{H-150}" stroke="{PAPER}" stroke-opacity="0.18"/>')
    parts.append(text_path(meta_str, font="mono", size=21, x=72, y=H - 104, color=MUTED, letter_spacing=3).svg)

    # логотип-знак справа внизу
    mx, my, ms = W - 190, H - 190, 96
    parts.append(
        f'<g transform="translate({mx} {my})" stroke="{PAPER}" fill="none" stroke-width="4">'
        f'<rect x="0" y="0" width="{ms}" height="{ms}"/>'
        f'<rect x="{ms*0.23:.0f}" y="{ms*0.23:.0f}" width="{ms*0.54:.0f}" height="{ms*0.54:.0f}" stroke-opacity="0.45" stroke-width="2"/>'
        f'<line x1="{ms/2}" y1="0" x2="{ms/2}" y2="{ms*0.2:.0f}"/>'
        f'<line x1="{ms/2}" y1="{ms*0.8:.0f}" x2="{ms/2}" y2="{ms}"/>'
        f'<line x1="{ms*0.72:.0f}" y1="{ms*0.23:.0f}" x2="{ms}" y2="{ms*0.23:.0f}" stroke="{ACCENT}"/>'
        f'<line x1="{ms*0.72:.0f}" y1="0" x2="{ms*0.72:.0f}" y2="{ms*0.23:.0f}" stroke="{ACCENT}"/>'
        f"</g>"
    )
    parts.append(
        text_path("VIP-SERVICE", font="mono", size=16, x=mx, y=my + ms + 30, color=MUTED, letter_spacing=3).svg
    )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">' + "".join(parts) + "</svg>"
    )
    with open(os.path.join(OUT, f"{slug}.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("cover:", slug)


def og(slug: str, title_lines: list[str], kicker: str, note: str, photo: str | None = None) -> None:
    W, H = 1200, 630
    parts: list[str] = []
    parts.append(f'<rect width="{W}" height="{H}" fill="{INK}"/>')
    if photo:
        b64 = photo_b64(photo)
        parts.append(
            f'<svg x="640" y="0" width="560" height="{H}" viewBox="0 0 560 {H}" preserveAspectRatio="xMidYMid slice">'
            f'<image href="data:image/jpeg;base64,{b64}" width="560" height="{H}" preserveAspectRatio="xMidYMid slice"/>'
            f"</svg>"
        )
        parts.append(
            f'<defs><linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">'
            f'<stop offset="0" stop-color="{INK}"/><stop offset="0.55" stop-color="{INK}" stop-opacity="0.55"/>'
            f'<stop offset="1" stop-color="{INK}" stop-opacity="0.25"/></linearGradient></defs>'
            f'<rect x="640" y="0" width="560" height="{H}" fill="url(#fade)"/>'
        )
    for x in range(0, W, 80):
        parts.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{PAPER}" stroke-opacity="0.05"/>')
    parts.append(f'<rect x="28" y="28" width="{W-56}" height="{H-56}" fill="none" stroke="{PAPER}" stroke-opacity="0.16"/>')

    # знак
    ms = 44
    parts.append(
        f'<g transform="translate(64 64)" stroke="{PAPER}" fill="none" stroke-width="2.4">'
        f'<rect width="{ms}" height="{ms}"/>'
        f'<rect x="{ms*0.23:.0f}" y="{ms*0.23:.0f}" width="{ms*0.54:.0f}" height="{ms*0.54:.0f}" stroke-opacity="0.5" stroke-width="1"/>'
        f'<line x1="{ms/2}" y1="0" x2="{ms/2}" y2="{ms*0.2:.0f}"/>'
        f'<line x1="{ms/2}" y1="{ms*0.8:.0f}" x2="{ms/2}" y2="{ms}"/>'
        f'<line x1="{ms*0.72:.0f}" y1="{ms*0.23:.0f}" x2="{ms}" y2="{ms*0.23:.0f}" stroke="{ACCENT}"/>'
        f'<line x1="{ms*0.72:.0f}" y1="0" x2="{ms*0.72:.0f}" y2="{ms*0.23:.0f}" stroke="{ACCENT}"/>'
        f"</g>"
    )
    parts.append(text_path("VIP-SERVICE", font="display", size=26, x=122, y=97, color=PAPER, letter_spacing=2).svg)
    parts.append(text_path("КРАСНОДАР", font="mono", size=13, x=123, y=118, color=MUTED, letter_spacing=3).svg)

    parts.append(text_path(kicker.upper(), font="mono", size=15, x=64, y=196, color=ACCENT, letter_spacing=3).svg)

    y = 268
    for line in title_lines:
        size = 74
        parts.append(text_path(line, font="display", size=size, x=62, y=y, color=PAPER, letter_spacing=1).svg)
        y += size * 0.97

    parts.append(text_path(note, font="body", size=21, x=64, y=y + 26, color=MUTED).svg)

    parts.append(f'<line x1="64" y1="{H-104}" x2="{W-64}" y2="{H-104}" stroke="{PAPER}" stroke-opacity="0.18"/>')
    parts.append(text_path("+7 (988) 000-00-00", font="mono", size=19, x=64, y=H-58, color=PAPER, letter_spacing=1).svg)
    parts.append(
        text_path(
            "СТАРОКОРСУНСКАЯ · ПОЛЕВАЯ 43",
            font="mono",
            size=15,
            x=W - 64 - measure("СТАРОКОРСУНСКАЯ · ПОЛЕВАЯ 43", "mono", 15, 2),
            y=H - 58,
            color=MUTED,
            letter_spacing=2,
        ).svg
    )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        + "".join(parts)
        + "</svg>"
    )
    with open(os.path.join(OUT, f"{slug}.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("og:", slug)


cover(
    "og-catalog-elumatec",
    "prod-machining-centre.jpg",
    "elumatec",
    "Оборудование для алюминия",
    ["ПРОФИЛЬ.", "ТОЧНОСТЬ.", "СЕРИЯ."],
    ["180 страниц", "9,4 МБ", "PDF"],
    "01",
)

cover(
    "og-catalog-elumatec-pvc",
    "pvc-welding.jpg",
    "elumatec",
    "Оборудование для ПВХ",
    ["СВАРКА.", "ЗАЧИСТКА.", "ЛИНИЯ."],
    ["96 страниц", "6,1 МБ", "PDF"],
    "02",
)

cover(
    "og-catalog-emmegi",
    "hero-workshop.jpg",
    "Emmegi",
    "Портальные центры Satellite",
    ["ДЛИННЫЕ", "ЗАГОТОВКИ", "БЕЗ ПЕРЕХВАТА."],
    ["32 страницы", "4,8 МБ", "PDF"],
    "03",
)

cover(
    "og-catalog-stuertz",
    "workshop-wide.jpg",
    "Stürtz",
    "Линии сварки и зачистки",
    ["СВАРКА", "ДО 3 050", "МИЛЛИМЕТРОВ."],
    ["64 страницы", "5,2 МБ", "PDF"],
    "04",
)

cover(
    "og-catalog-haffner",
    "profiles.jpg",
    "Haffner",
    "Оборудование для ПВХ",
    ["ЦЕНТРЫ SBA.", "СВАРКА.", "ПРЕССЫ."],
    ["120 страниц", "7,7 МБ", "PDF"],
    "05",
)

og(
    "og-default",
    ["СТАНКИ ДЛЯ", "АЛЮМИНИЯ", "И ПВХ."],
    "Краснодар · склад и сервис",
    "Продажа · ремонт · перевозка",
    "hero-workshop.jpg",
)

og(
    "og-new",
    ["НОВОЕ", "ОБОРУДОВАНИЕ."],
    "elumatec · Emmegi · Stürtz · Haffner",
    "Наличие в Краснодаре, пусконаладка",
    "prod-machining-centre.jpg",
)

og(
    "og-used",
    ["Б/У С ПРОВЕРКОЙ:", "ДЕВЯТЬ", "ПУНКТОВ."],
    "Протокол механика в каждой карточке",
    "Гарантия 3 месяца на механику",
    "used-warehouse.jpg",
)

og(
    "og-service",
    ["РЕМОНТ,", "КОТОРЫЙ", "ЗАКРЫВАЕТСЯ", "В ДЕНЬ ВЫЕЗДА."],
    "Выезд по ЮФО · 24–48 часов",
    "Диагностика 2 500 ₽, входит в ремонт",
    "service-hands.jpg",
)
