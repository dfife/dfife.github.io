#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

from generate_social_cards import ROOT


PAGE_SLUGS = {
    "index.html": "home-share",
    "bridge-map.html": "bridge-map-share",
    "papers.html": "papers-share",
    "calculator.html": "calculator-share",
    "calculator-theorems.html": "calculator-theorems-share",
    "io-framework.html": "resources-share",
    "lithium.html": "lithium-share",
    "scorecard.html": "scorecard-share",
    "data-license.html": "data-license-share",
}

PAPER_SLUGS = {
    f"papers/paper-{i:02d}.html": f"paper-{i:02d}-share" for i in range(1, 36)
}

SLUGS = PAGE_SLUGS | PAPER_SLUGS
PAPERS = json.loads((ROOT / "data" / "papers.json").read_text())
ARTICLE_TYPES = {"ScholarlyArticle"}
PAGE_TYPES = {"WebPage", "CollectionPage", "AboutPage"}
ASSET_TYPES = {"SoftwareApplication", "Dataset", "CreativeWork"}
TARGET_TYPES = ARTICLE_TYPES | PAGE_TYPES | ASSET_TYPES

ORG = {
    "@type": "Organization",
    "@id": "https://dfife.github.io/#organization",
    "name": "The Interior Observer Framework",
    "url": "https://dfife.github.io/",
    "description": "The Interior Observer Framework is a black hole cosmology research program publishing theorem-grade predictions and reproducible cosmological calculator outputs with zero fitted parameters.",
    "founder": {"@type": "Person", "name": "David Fife"},
    "sameAs": [
        "https://github.com/dfife/io-framework-public",
        "https://zenodo.org/communities/interior-observer",
        "https://orcid.org/0009-0001-0090-5825",
    ],
}

WEBSITE = {
    "@type": "WebSite",
    "@id": "https://dfife.github.io/#website",
    "url": "https://dfife.github.io/",
    "name": "The Interior Observer Framework",
    "publisher": {"@id": "https://dfife.github.io/#organization"},
    "description": "Interior Observer Framework black hole cosmology website with theorem-grade predictions, zero fitted parameters, papers, bridge map, and cosmological calculator.",
}

PAGE_TYPE_MAP = {
    "index.html": "WebPage",
    "bridge-map.html": "CollectionPage",
    "papers.html": "CollectionPage",
    "calculator.html": "WebPage",
    "calculator-theorems.html": "CollectionPage",
    "io-framework.html": "AboutPage",
    "lithium.html": "WebPage",
    "scorecard.html": "WebPage",
    "data-license.html": "WebPage",
}


def image_url_for(rel: str) -> str:
    slug = SLUGS[rel]
    return f"https://dfife.github.io/assets/social/{slug}.png"


def image_alt(title: str) -> str:
    return f"Social preview card for {title}"


def build_social_block(title: str, desc: str, canon: str, image_url: str, alt: str, og_type: str) -> str:
    esc = html_escape
    return (
        "\n  <!-- SEO: social-meta:start -->\n"
        '  <meta property="og:site_name" content="The Interior Observer Framework">\n'
        f'  <meta property="og:title" content="{esc(title)}">\n'
        f'  <meta property="og:description" content="{esc(desc)}">\n'
        f'  <meta property="og:type" content="{og_type}">\n'
        f'  <meta property="og:url" content="{esc(canon)}">\n'
        f'  <meta property="og:image" content="{esc(image_url)}">\n'
        '  <meta property="og:image:type" content="image/png">\n'
        '  <meta property="og:image:width" content="1200">\n'
        '  <meta property="og:image:height" content="630">\n'
        f'  <meta property="og:image:alt" content="{esc(alt)}">\n'
        '  <meta name="twitter:card" content="summary_large_image">\n'
        f'  <meta name="twitter:title" content="{esc(title)}">\n'
        f'  <meta name="twitter:description" content="{esc(desc)}">\n'
        f'  <meta name="twitter:image" content="{esc(image_url)}">\n'
        f'  <meta name="twitter:image:alt" content="{esc(alt)}">\n'
        "  <!-- SEO: social-meta:end -->\n"
    )


def html_escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def iter_nodes(data):
    if isinstance(data, dict) and "@graph" in data:
        return data["@graph"]
    return [data]


def augment_jsonld(data, canon: str, img: str, alt: str) -> bool:
    changed = False
    image_object = {
        "@type": "ImageObject",
        "@id": canon + "#primaryimage",
        "url": img,
        "contentUrl": img,
        "width": 1200,
        "height": 630,
        "caption": alt,
    }

    for node in iter_nodes(data):
        if not isinstance(node, dict):
            continue
        node_types = node.get("@type")
        if isinstance(node_types, str):
            node_types = {node_types}
        elif isinstance(node_types, list):
            node_types = set(node_types)
        else:
            node_types = set()

        local = False
        node_id = node.get("@id", "")
        if isinstance(node_id, str) and node_id.startswith(canon):
            local = True
        if node.get("url") == canon or node.get("mainEntityOfPage") == canon:
            local = True
        if not local or not (node_types & TARGET_TYPES):
            continue

        if node.get("image") != img:
            node["image"] = img
            changed = True

        if node_types & PAGE_TYPES:
            if node.get("primaryImageOfPage") != image_object:
                node["primaryImageOfPage"] = image_object
                changed = True
    return changed


def page_id(canon: str) -> str:
    return canon + "#webpage"


def breadcrumb(canon: str, crumbs: list[tuple[str, str]]) -> dict:
    return {
        "@type": "BreadcrumbList",
        "@id": canon + "#breadcrumb",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": url}
            for i, (name, url) in enumerate(crumbs)
        ],
    }


def build_page_schema(rel: str, title: str, desc: str, canon: str, img: str, alt: str) -> dict:
    nodes = [ORG, WEBSITE]
    ptype = PAGE_TYPE_MAP.get(Path(rel).name, "WebPage")
    page = {
        "@type": ptype,
        "@id": page_id(canon),
        "url": canon,
        "name": title,
        "description": desc,
        "inLanguage": "en",
        "isPartOf": {"@id": "https://dfife.github.io/#website"},
        "about": {"@id": "https://dfife.github.io/#organization"},
        "image": img,
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "@id": canon + "#primaryimage",
            "url": img,
            "contentUrl": img,
            "width": 1200,
            "height": 630,
            "caption": alt,
        },
    }
    crumbs = [("Home", "https://dfife.github.io/")]

    if rel == "papers.html":
        itemlist = {
            "@type": "ItemList",
            "@id": canon + "#itemlist",
            "name": "Interior Observer Framework paper pages",
            "itemListOrder": "https://schema.org/ItemListOrderAscending",
            "numberOfItems": len(PAPERS),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "url": "https://dfife.github.io/" + p["paper_url"],
                    "name": p["short_form"],
                }
                for idx, p in enumerate(sorted(PAPERS, key=lambda x: x["paper"]))
            ],
        }
        page["mainEntity"] = {"@id": canon + "#itemlist"}
        nodes.extend([page, itemlist, breadcrumb(canon, crumbs + [("Papers", canon)])])
    elif rel.startswith("papers/paper-"):
        page["mainEntity"] = {"@id": canon + "#article"}
        article = {
            "@id": canon + "#article",
            "@type": "ScholarlyArticle",
            "isAccessibleForFree": True,
            "inLanguage": "en",
            "isPartOf": {"@id": "https://dfife.github.io/#website"},
            "image": img,
        }
        short = title.replace(" | Interior Observer Framework", "")
        nodes.extend([page, article, breadcrumb(canon, crumbs + [("Papers", "https://dfife.github.io/papers.html"), (short, canon)])])
    elif rel == "lithium.html":
        page["mainEntity"] = {"@id": canon + "#article"}
        article = {
            "@id": canon + "#article",
            "@type": "ScholarlyArticle",
            "isAccessibleForFree": True,
            "inLanguage": "en",
            "isPartOf": {"@id": "https://dfife.github.io/#website"},
            "image": img,
        }
        nodes.extend([page, article, breadcrumb(canon, crumbs + [("Lithium", canon)])])
    elif rel == "calculator.html":
        page["mainEntity"] = {"@id": canon + "#application"}
        nodes.extend([page, breadcrumb(canon, crumbs + [("Calculator", canon)])])
    elif rel == "calculator-theorems.html":
        page["mainEntity"] = {"@id": canon + "#article"}
        article = {
            "@id": canon + "#article",
            "@type": "ScholarlyArticle",
            "isAccessibleForFree": True,
            "inLanguage": "en",
            "isPartOf": {"@id": "https://dfife.github.io/#website"},
            "image": img,
        }
        nodes.extend([page, article, breadcrumb(canon, crumbs + [("Calculator Theorems", canon)])])
    elif rel == "scorecard.html":
        page["mainEntity"] = {"@id": canon + "#dataset"}
        dataset = {
            "@id": canon + "#dataset",
            "@type": "Dataset",
            "isAccessibleForFree": True,
            "inLanguage": "en",
            "isPartOf": {"@id": "https://dfife.github.io/#website"},
            "image": img,
        }
        nodes.extend([page, dataset, breadcrumb(canon, crumbs + [("Scorecard", canon)])])
    elif rel == "bridge-map.html":
        page["about"] = [
            {"@id": "https://dfife.github.io/#organization"},
            {"@type": "Thing", "name": "Quantum gravity bridge map"},
        ]
        nodes.extend([page, breadcrumb(canon, crumbs + [("Bridge Map", canon)])])
    elif rel == "io-framework.html":
        nodes.extend([page, breadcrumb(canon, crumbs + [("Public Resources", canon)])])
    elif rel == "data-license.html":
        license_node = {
            "@type": "CreativeWork",
            "@id": canon + "#license",
            "name": "IO Framework dataset license",
            "url": canon,
            "license": "https://github.com/dfife/io-calculator/blob/main/LICENSE",
            "isAccessibleForFree": True,
            "inLanguage": "en",
            "publisher": {"@id": "https://dfife.github.io/#organization"},
            "image": img,
        }
        nodes.extend([page, license_node, breadcrumb(canon, crumbs + [("Dataset License", canon)])])
    else:
        nodes.extend([page, breadcrumb(canon, crumbs + [(title.replace(" | Interior Observer Framework", ""), canon)])])

    return {"@context": "https://schema.org", "@graph": nodes}


def update_file(path: Path) -> bool:
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    if rel not in SLUGS:
        return False

    text = path.read_text()
    soup = BeautifulSoup(text, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    desc_tag = soup.find("meta", attrs={"name": "description"})
    desc = desc_tag.get("content", "").strip() if desc_tag else ""
    canon_tag = soup.find("link", rel="canonical")
    canon = canon_tag.get("href", "").strip() if canon_tag else ""
    if not (title and desc and canon):
        return False

    img = image_url_for(rel)
    alt = image_alt(title)
    og_type = "article" if rel.startswith("papers/paper-") or rel in {"lithium.html", "calculator-theorems.html"} else "website"

    social_block = build_social_block(title, desc, canon, img, alt, og_type)
    social_re = re.compile(r"\n\s*<!-- SEO: social-meta:start -->.*?<!-- SEO: social-meta:end -->\n", re.S)
    if social_re.search(text):
        text = social_re.sub(social_block, text)
    else:
        canon_re = re.compile(r"(<link[^>]+rel=[\"']canonical[\"'][^>]*>)", re.I)
        text, count = canon_re.subn(r"\1" + social_block, text, count=1)
        if count == 0:
            raise RuntimeError(f"Could not place social metadata for {rel}")

    page_schema = build_page_schema(rel, title, desc, canon, img, alt)
    soup = BeautifulSoup(text, "html.parser")
    for old in soup.find_all("script", attrs={"data-page-schema": "1"}):
        old.decompose()
    new_script = soup.new_tag("script", type="application/ld+json")
    new_script["data-page-schema"] = "1"
    new_script.string = "\n" + json.dumps(page_schema, ensure_ascii=False, indent=2) + "\n"
    anchor = soup.find("script", src="/assets/js/canonical-url.js")
    if anchor is None:
        anchor = soup.find("script", src=True)
    if anchor is not None:
        anchor.insert_after(new_script)
    elif soup.head is not None:
        soup.head.append(new_script)

    changed = True
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        if script.get("data-page-schema") == "1":
            continue
        raw = script.string or script.get_text()
        try:
            data = json.loads(raw)
        except Exception:
            continue
        if augment_jsonld(data, canon, img, alt):
            script.string = "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n"
            changed = True

    if changed:
        path.write_text(str(soup))
    return changed


def main() -> None:
    files = sorted([p for p in ROOT.glob("*.html")] + [p for p in (ROOT / "papers").glob("paper-*.html")])
    changed = 0
    for file in files:
        if update_file(file):
            changed += 1
    print(f"updated {changed} html files")


if __name__ == "__main__":
    main()
