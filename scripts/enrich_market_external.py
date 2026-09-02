"""External enrichment for market-feed.json via Linkup and Firecrawl."""
from __future__ import annotations

import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import requests
except ImportError:
    requests = None  # type: ignore

LINKUP_API = "https://api.linkup.so/v1/search"
FIRECRAWL_API = "https://api.firecrawl.dev/v1/scrape"

LINKUP_PROFILES: dict[str, dict] = {
    "Almanya": {
        "query": "Germany medical cannabis pharmacy flower importer landed wholesale price per gram 2025 2026",
        "domains": ["flowzz.com", "bfarm.de", "cannabisindustryjournal.com"],
    },
    "İngiltere": {
        "query": "UK medical cannabis private clinic pharmacy flower price per gram MedBud 2025 2026",
        "domains": ["medbud.wiki", "gov.uk"],
    },
    "Portekiz": {
        "query": "Portugal medical cannabis pharmacy retail price flower INFARMED 2025 2026",
        "domains": ["infarmed.pt", "cannabisindustryjournal.com"],
    },
    "Türkiye": {
        "query": "Turkey medical cannabis TMO CANNABI kenevir regulation pricing GACP cultivation 2026",
        "domains": ["tmo.gov.tr", "saglik.gov.tr", "resmigazete.gov.tr"],
    },
}

REGULATION_QUERIES: dict[str, str] = {
    "Türkiye": "Turkey medical cannabis TMO licensing regulation GACP cultivation 2026",
    "Almanya": "Germany BfArM medical cannabis cultivation import license 2026",
    "Hollanda": "Netherlands OMC Bedrocan medical cannabis export regulation 2026",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _parse_eur_per_g(text: str) -> float | None:
    if not text:
        return None
    range_m = re.search(r"([\d.,]+)\s*€?\s*/?\s*g", text, re.I)
    if range_m:
        return float(range_m.group(1).replace(",", "."))
    m = re.search(r"€\s*([\d.,]+)", text)
    if m:
        val = float(m.group(1).replace(",", "."))
        return val if val < 50 else None
    return None


def _g_to_kg(g: float) -> int:
    return int(round(g * 1000 / 50) * 50)


def _extract_prices_from_text(text: str) -> dict[str, int | None]:
    landed = None
    retail = []
    for m in re.finditer(r"([\d.,]+)\s*EUR?\s*/?\s*gr?", text, re.I):
        g = float(m.group(1).replace(",", "."))
        if 2 <= g <= 25:
            retail.append(g)
    for m in re.finditer(r"€\s*([\d.,]+)\s*/?\s*g", text, re.I):
        g = float(m.group(1).replace(",", "."))
        if 2 <= g <= 25:
            retail.append(g)
    if retail:
        retail.sort()
        landed = retail[len(retail) // 3] * 0.62
    if landed:
        return {
            "gacpKg": _g_to_kg(landed),
            "gmpKg": _g_to_kg(landed * 1.29),
            "extractKg": _g_to_kg(landed * 1.45),
        }
    return {}


def linkup_search(api_key: str, query: str, depth: str = "deep", max_results: int = 6,
                  include_domains: list[str] | None = None) -> dict:
    if not requests or not api_key:
        return {"ok": False, "error": "linkup unavailable"}
    body: dict[str, Any] = {
        "q": query,
        "depth": depth,
        "outputType": "searchResults",
        "maxResults": max_results,
    }
    if include_domains:
        body["includeDomains"] = include_domains
    try:
        r = requests.post(
            LINKUP_API,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=body,
            timeout=90,
        )
        payload = r.json() if r.content else {}
        if r.status_code != 200:
            return {"ok": False, "error": str(payload)[:280], "status": r.status_code}
        return {"ok": True, "results": list(payload.get("results") or [])}
    except Exception as e:
        return {"ok": False, "error": str(e)[:280]}


def firecrawl_scrape(api_key: str, url: str) -> dict:
    if not requests or not api_key or not url:
        return {"ok": False, "error": "firecrawl unavailable"}
    try:
        r = requests.post(
            FIRECRAWL_API,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"url": url, "formats": ["markdown"], "onlyMainContent": True},
            timeout=120,
        )
        payload = r.json() if r.content else {}
        if r.status_code != 200:
            return {"ok": False, "error": str(payload)[:280], "status": r.status_code}
        data = payload.get("data") or {}
        md = data.get("markdown") or data.get("content") or ""
        return {"ok": True, "markdown": str(md)[:4000], "url": url}
    except Exception as e:
        return {"ok": False, "error": str(e)[:280]}


def load_linkup_cache(db_path: Path) -> list[dict]:
    if not db_path.is_file():
        return []
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT source_name, url, payload_json, fetched_at FROM linkup_source_cache ORDER BY fetched_at DESC LIMIT 80"
        ).fetchall()
        conn.close()
        out = []
        for row in rows:
            item = dict(row)
            try:
                item["payload"] = json.loads(item.pop("payload_json") or "[]")
            except json.JSONDecodeError:
                item["payload"] = []
            out.append(item)
        return out
    except sqlite3.DatabaseError:
        return []


def load_regulation_news(db_path: Path, limit: int = 40) -> list[dict]:
    if not db_path.is_file():
        return []
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        q = """
            SELECT region, grp, source, title, summary, link, published_at
            FROM news
            WHERE grp IN ('Regülasyon & Hukuk', 'Pazar & Fiyat', 'Üretim')
               OR title LIKE '%GACP%' OR title LIKE '%GMP%' OR title LIKE '%TMO%'
            ORDER BY COALESCE(published_at, fetched_at) DESC
            LIMIT ?
        """
        rows = conn.execute(q, (limit,)).fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except sqlite3.DatabaseError:
        return []


def enrich_countries(countries: dict, *, linkup_key: str = "", firecrawl_key: str = "",
                     linkup_cache: list[dict] | None = None,
                     news: list[dict] | None = None,
                     max_linkup: int = 5) -> dict:
    enriched = 0
    linkup_key = linkup_key or os.environ.get("LINKUP_API_KEY", "")
    firecrawl_key = firecrawl_key or os.environ.get("FIRECRAWL_API_KEY", "")

    for name, profile in list(LINKUP_PROFILES.items())[:max_linkup]:
        if name not in countries:
            continue
        entry = countries[name]
        intel = entry.setdefault("intelligence", {})
        if linkup_key:
            res = linkup_search(
                linkup_key,
                profile["query"],
                include_domains=profile.get("domains"),
            )
            if res.get("ok"):
                results = res.get("results") or []
                snippets = []
                sources = []
                merged_text = ""
                for r in results[:6]:
                    content = str(r.get("content") or r.get("snippet") or "")
                    merged_text += " " + content
                    snippets.append(content[:320])
                    sources.append({"name": r.get("name") or "", "url": r.get("url") or ""})
                intel["linkup"] = {
                    "query": profile["query"],
                    "snippets": snippets,
                    "sources": sources,
                    "fetchedAt": _now_iso(),
                }
                parsed = _extract_prices_from_text(merged_text)
                if parsed.get("gacpKg"):
                    prices = entry.setdefault("prices", {})
                    prices.update({k: v for k, v in parsed.items() if v})
                    prices["basis"] = "Linkup canlı tarama + Cannastream benchmark"
                    intel["linkup"]["priceHint"] = parsed
                enriched += 1

        reg_q = REGULATION_QUERIES.get(name)
        if linkup_key and reg_q:
            reg = linkup_search(linkup_key, reg_q, max_results=4)
            if reg.get("ok"):
                intel["regulation"] = {
                    "query": reg_q,
                    "items": [
                        {
                            "title": (r.get("name") or "")[:140],
                            "url": r.get("url") or "",
                            "snippet": str(r.get("content") or "")[:280],
                        }
                        for r in (reg.get("results") or [])[:4]
                    ],
                    "fetchedAt": _now_iso(),
                }

        src = (entry.get("officialSource") or {}).get("url")
        if firecrawl_key and src:
            fc = firecrawl_scrape(firecrawl_key, src)
            if fc.get("ok"):
                intel["firecrawl"] = {
                    "url": src,
                    "excerpt": fc.get("markdown") or "",
                    "fetchedAt": _now_iso(),
                }
                enriched += 1

    if linkup_cache:
        for item in linkup_cache[:30]:
            for name in countries:
                intel = countries[name].setdefault("intelligence", {})
                cache_list = intel.setdefault("linkupCache", [])
                if len(cache_list) >= 3:
                    continue
                cache_list.append({
                    "source": item.get("source_name"),
                    "url": item.get("url"),
                    "fetchedAt": item.get("fetched_at"),
                })

    if news:
        for name in countries:
            intel = countries[name].setdefault("intelligence", {})
            matched = []
            for n in news:
                blob = f"{n.get('region','')} {n.get('title','')} {n.get('summary','')}"
                if name == "Türkiye" and "Türkiye" not in blob and "TMO" not in blob and "Turkey" not in blob:
                    if n.get("region") not in ("Türkiye", "Global"):
                        continue
                elif name != "Türkiye" and name not in blob and (n.get("region") or "") != name:
                    continue
                matched.append({
                    "title": n.get("title"),
                    "link": n.get("link"),
                    "source": n.get("source"),
                    "group": n.get("grp"),
                })
                if len(matched) >= 5:
                    break
            if matched:
                intel["news"] = matched

    return {"countries": countries, "enriched": enriched, "hasLinkup": bool(linkup_key), "hasFirecrawl": bool(firecrawl_key)}
