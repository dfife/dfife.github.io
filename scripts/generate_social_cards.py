#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "social"
WIDTH = 1200
HEIGHT = 630


@dataclass(frozen=True)
class CardSpec:
    slug: str
    kicker: str
    title: str
    subtitle: str
    path_label: str
    accent: tuple[int, int, int]


def font_path(pattern: str) -> str:
    try:
        return (
            subprocess.check_output(["fc-match", "-f", "%{file}\n", pattern], text=True)
            .strip()
            .splitlines()[0]
        )
    except Exception:
        fallback = {
            "DejaVu Sans:style=Book": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "DejaVu Sans:style=Bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "DejaVu Sans Mono:style=Book": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        }
        return fallback[pattern]


FONT_SANS = font_path("DejaVu Sans:style=Book")
FONT_BOLD = font_path("DejaVu Sans:style=Bold")
FONT_MONO = font_path("DejaVu Sans Mono:style=Book")


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int, max_lines: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word
            if len(lines) == max_lines - 1:
                break
    lines.append(current)

    # Consume remaining words with ellipsis if needed.
    consumed = sum(len(line.split()) for line in lines)
    if consumed < len(words):
        remainder = " ".join(words[consumed:])
        last = lines[-1]
        for candidate in [last + "…", last + " ..."]:
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                lines[-1] = candidate
                break
        else:
            truncated = last
            while truncated and draw.textbbox((0, 0), truncated + "…", font=font)[2] > max_width:
                truncated = truncated[:-1]
            lines[-1] = (truncated.rstrip(" .,;:-") or last[:10]).rstrip() + "…"
    return lines[:max_lines]


def vertical_gradient(width: int, height: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGB", (width, height), top)
    pixels = img.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        row = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(width):
            pixels[x, y] = row
    return img


def add_glow(base: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    base.alpha_composite(layer)


def draw_motif(base: Image.Image, accent: tuple[int, int, int]) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = 920, 315
    ring = (*accent, 120)
    faint = (255, 255, 255, 24)
    for radius, width in [(180, 3), (135, 2), (96, 2), (58, 2)]:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=ring, width=width)
    draw.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), fill=(*accent, 200))
    draw.line((770, 198, 1070, 198), fill=faint, width=2)
    draw.line((770, 432, 1070, 432), fill=faint, width=2)
    draw.line((920, 120, 920, 510), fill=faint, width=2)
    base.alpha_composite(layer)


def generate_card(spec: CardSpec) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bg = vertical_gradient(WIDTH, HEIGHT, (7, 16, 28), (19, 37, 59)).convert("RGBA")
    add_glow(bg, (1020, 156), 210, spec.accent, 92)
    add_glow(bg, (860, 470), 170, (76, 132, 180), 64)
    add_glow(bg, (180, 80), 120, (255, 255, 255), 18)
    draw_motif(bg, spec.accent)

    draw = ImageDraw.Draw(bg)
    title_font = load_font(FONT_BOLD, 62)
    subtitle_font = load_font(FONT_SANS, 28)
    path_font = load_font(FONT_MONO, 22)
    brand_font = load_font(FONT_BOLD, 24)

    left = 84
    max_text_width = 620

    kicker_size = 26
    kicker_font = load_font(FONT_MONO, kicker_size)
    kicker_text = spec.kicker.upper()
    kicker_width = draw.textbbox((0, 0), kicker_text, font=kicker_font)[2]
    while kicker_width > 280 and kicker_size > 18:
        kicker_size -= 2
        kicker_font = load_font(FONT_MONO, kicker_size)
        kicker_width = draw.textbbox((0, 0), kicker_text, font=kicker_font)[2]
    pill_width = kicker_width + 36
    pill_height = 48
    draw.rounded_rectangle((left, 64, left + pill_width, 64 + pill_height), radius=16, fill=(*spec.accent, 230))
    draw.text((left + 18, 76), kicker_text, font=kicker_font, fill=(8, 16, 28))

    title_lines = wrap_text(draw, spec.title, title_font, max_text_width, 3)
    y = 160
    for line in title_lines:
        draw.text((left, y), line, font=title_font, fill=(244, 247, 250))
        y += 74

    subtitle_lines = wrap_text(draw, spec.subtitle, subtitle_font, max_text_width, 4)
    y += 10
    for line in subtitle_lines:
        draw.text((left, y), line, font=subtitle_font, fill=(193, 205, 220))
        y += 40

    draw.text((left, HEIGHT - 82), "The Interior Observer Framework", font=brand_font, fill=(244, 247, 250))
    draw.text((left, HEIGHT - 50), spec.path_label, font=path_font, fill=(143, 160, 181))

    out_path = OUT_DIR / f"{spec.slug}.png"
    bg.convert("RGB").save(out_path, format="PNG", optimize=True)
    return out_path


def top_level_specs() -> list[CardSpec]:
    return [
        CardSpec("home-share", "Main Portal", "The Interior Observer Framework", "The public portal for theorem-grade predictions, papers, bridge structure, and the live calculator surface.", "dfife.github.io/", (218, 172, 88)),
        CardSpec("bridge-map-share", "Interactive Map", "The Quantum Gravity Bridge Map", "Boundary-to-bulk crossings across the public 35-paper archive, aligned to the active Paper 10 legacy branch through Paper 35.", "dfife.github.io/bridge-map.html", (111, 198, 214)),
        CardSpec("papers-share", "Paper Archive", "Papers 1–35", "Short-form paper index with full-subtitle detail pages and direct Zenodo records for the Interior Observer Framework archive.", "dfife.github.io/papers.html", (218, 172, 88)),
        CardSpec("calculator-share", "Calculator", "IO Calculator Theorem Surface", "Zero fitted parameters, theorem-grade predictions, and machine-readable output provenance on the active public branch.", "dfife.github.io/calculator.html", (111, 198, 214)),
        CardSpec("calculator-theorems-share", "Reference Surface", "Calculator Theorem Nodes", "Public theorem dictionary for the calculator surface with self-contained statements, premises, proof outlines, and scope boundaries.", "dfife.github.io/calculator-theorems.html", (148, 206, 122)),
        CardSpec("resources-share", "Public Resources", "IO Framework Public Resources", "Public artifacts, reproducibility links, and outward-facing archive resources for the Interior Observer Framework.", "dfife.github.io/io-framework.html", (173, 183, 197)),
        CardSpec("lithium-share", "Accessible Explanation", "Lithium Problem Solved", "The IO framework resolves the cosmological lithium problem with zero fitted parameters and an honest BBN triple comparison.", "dfife.github.io/lithium.html", (224, 145, 102)),
        CardSpec("scorecard-share", "Prediction Surface", "IO Framework Scorecard", "Zero fitted cosmological parameters, direct-observable confrontations, calculator links, and open-item boundaries on one page.", "dfife.github.io/scorecard.html", (148, 206, 122)),
        CardSpec("data-license-share", "Structured Data Policy", "Dataset License", "License terms for the machine-readable dataset objects published on the calculator and scorecard surfaces.", "dfife.github.io/data-license.html", (173, 183, 197)),
    ]


def paper_specs() -> Iterable[CardSpec]:
    papers = json.loads((ROOT / "data" / "papers.json").read_text())
    accents = [
        (218, 172, 88),
        (111, 198, 214),
        (148, 206, 122),
        (224, 145, 102),
    ]
    for idx, paper in enumerate(sorted(papers, key=lambda item: item["paper"])):
        slug = f"paper-{paper['paper']:02d}-share"
        yield CardSpec(
            slug=slug,
            kicker=paper["era"],
            title=paper["short_form"],
            subtitle=paper["meta_description"],
            path_label=f"dfife.github.io/{paper['paper_url']}",
            accent=accents[idx % len(accents)],
        )


def main() -> None:
    generated = []
    for spec in [*top_level_specs(), *paper_specs()]:
        generated.append(generate_card(spec))
    print(f"generated {len(generated)} social cards in {OUT_DIR}")


if __name__ == "__main__":
    main()
