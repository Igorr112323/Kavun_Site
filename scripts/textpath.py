"""Текст в SVG-пути: детерминированная типографика без зависимости от fontconfig.

Используется генераторами обложек каталогов и OG-изображений.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

FONT_DIR = "/home/user/.local/share/fonts"

FONTS = {
    "display": ["OswaldSemi.ttf", "OswaldSemiLat.ttf"],
    "body": ["OnestBook.ttf", "OnestBookLat.ttf"],
    "body-med": ["OnestMed.ttf", "OnestMedLat.ttf"],
    "mono": ["PlexMono-Medium.ttf", "PlexMono-MediumLat.ttf"],
}


@dataclass
class GlyphRun:
    svg: str
    width: float


def _load(path: str) -> TTFont:
    return TTFont(os.path.join(FONT_DIR, path))


_cache: dict[str, TTFont] = {}


def _font(path: str) -> TTFont:
    if path not in _cache:
        _cache[path] = _load(path)
    return _cache[path]


def text_path(
    text: str,
    font: str = "display",
    size: int = 48,
    x: float = 0,
    y: float = 0,
    color: str = "#ffffff",
    letter_spacing: float = 0,
) -> GlyphRun:
    """Возвращает SVG-path с текстом. y — базовая линия."""
    fonts = [_font(path) for path in FONTS[font]]
    cmaps = [f.getBestCmap() for f in fonts]
    glyphsets = [f.getGlyphSet() for f in fonts]
    upems = [f["head"].unitsPerEm for f in fonts]
    hmtx = [f["hmtx"] for f in fonts]

    scale = size / upems[0]
    cursor = 0.0
    parts: list[str] = []

    for ch in text:
        idx = None
        for i, cmap in enumerate(cmaps):
            if ord(ch) in cmap:
                idx = i
                break
        if idx is None:
            cursor += size * 0.34 + letter_spacing
            continue
        name = cmaps[idx][ord(ch)]
        gs = glyphsets[idx]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        d = pen.getCommands()
        s = scale if idx == 0 else size / upems[idx]
        if d:
            parts.append(
                f'<path d="{d}" transform="translate({cursor:.2f} 0) scale({s:.5f} {-s:.5f})" />'
            )
        cursor += hmtx[idx][name][0] * s + letter_spacing

    svg = (
        f'<g transform="translate({x} {y})" fill="{color}">' + "".join(parts) + "</g>"
    )
    return GlyphRun(svg=svg, width=cursor)


def measure(text: str, font: str = "display", size: int = 48, letter_spacing: float = 0) -> float:
    return text_path(text, font=font, size=size, letter_spacing=letter_spacing).width


def block(
    lines: list[tuple[str, str, int, str, float]],
    x: float,
    y: float,
    line_height: float = 1.0,
) -> str:
    """Несколько строк. Каждая: (текст, шрифт, кегль, цвет, трекинг)."""
    out = []
    cursor = y
    for text, font, size, color, tracking in lines:
        run = text_path(text, font=font, size=size, x=x, y=cursor, color=color, letter_spacing=tracking)
        out.append(run.svg)
        cursor += size * line_height
    return "".join(out)
