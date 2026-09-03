#!/usr/bin/env python3
"""Export Cannastream market intelligence to simulator data/market-feed.json.

Reads Python source directly — no Streamlit import required.

Usage:
  python scripts/export-market-feed.py --cannastream /path/to/cannastream-app
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
from collections import OrderedDict
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from enrich_market_external import enrich_countries, load_linkup_cache, load_regulation_news
from market_verified_overrides import VERIFIED_AT, VERIFIED_NOTE, apply_overrides_inline


def _extract_return_expr(source: str, func_name: str) -> str:
    marker = f"def {func_name}"
    start = source.find(marker)
    if start < 0:
        raise ValueError(f"{func_name} not found")
    ret = source.find("return ", start)
    if ret < 0:
        raise ValueError(f"return in {func_name} not found")
    i = ret + len("return ")
    depth = 0
    started = False
    for j in range(i, len(source)):
        ch = source[j]
        if ch in "([{":
            depth += 1
            started = True
        elif ch in ")]}":
            depth -= 1
            if started and depth == 0:
                return source[i : j + 1]
    raise ValueError(f"could not parse return expr for {func_name}")


def _eval_ordered_dict(expr: str) -> OrderedDict:
    ns: dict = {"OrderedDict": OrderedDict}
    return eval(expr, {"__builtins__": {}}, ns)


def _parse_eur_per_g(text: str) -> float | None:
    if not text or text.strip() in {"—", "-", ""}:
        return None
    range_m = re.search(r"€\s*([\d.,]+)\s*[–-]\s*€?\s*([\d.,]+)\s*/?\s*g", text, re.I)
    if range_m:
        lo = float(range_m.group(1).replace(",", "."))
        hi = float(range_m.group(2).replace(",", "."))
        return (lo + hi) / 2
    m = re.search(r"€\s*([\d.,]+)\s*/?\s*g", text, re.I)
    if m:
        return float(m.group(1).replace(",", "."))
    m = re.search(r"€\s*([\d.,]+)", text)
    if m:
        return float(m.group(1).replace(",", "."))
    m = re.search(r"£\s*([\d.,]+)", text)
    if m:
        return float(m.group(1).replace(",", ".")) * 1.17
    return None


def _g_to_kg(g: float) -> int:
    return int(round(g * 1000 / 50) * 50)


def derive_prices(country: str, benchmarks: dict) -> dict:
    rows = benchmarks.get(country) or []
    landed_g = None
    retail_bits: list[str] = []
    for row in rows:
        for key in ("Alis Fiyati", "Satis Fiyati"):
            val = str(row.get(key) or "")
            if val and val not in {"—", "-"}:
                retail_bits.append(val)
            g = _parse_eur_per_g(val)
            if g and key == "Alis Fiyati":
                landed_g = g
    if landed_g is None:
        for row in rows:
            g = _parse_eur_per_g(str(row.get("Satis Fiyati") or ""))
            if g:
                landed_g = g * 0.62
                break
    if landed_g is None:
        landed_g = 4.0
    gacp = _g_to_kg(landed_g)
    gmp = _g_to_kg(landed_g * 1.29)
    extract = _g_to_kg(landed_g * 1.45)
    notes = [str(r.get("Not") or "") for r in rows if r.get("Not")]
    return {
        "gacpKg": gacp,
        "gmpKg": gmp,
        "extractKg": extract,
        "retailBand": " · ".join(dict.fromkeys(retail_bits))[:140] or "—",
        "basis": notes[0] if notes else "Cannastream benchmark",
        "benchmarks": rows,
    }


def parse_market_eur_m(text: str) -> float | None:
    if not text or text.strip() in {"—", "-", ""}:
        return None
    m = re.search(r"€\s*([\d.,]+)\s*([MBmb])?", text)
    if not m:
        return None
    val = float(m.group(1).replace(",", "."))
    suffix = (m.group(2) or "M").upper()
    if suffix == "B":
        return val * 1000
    return val


def parse_patients(text: str) -> float | None:
    if not text or text.strip() in {"—", "-", ""}:
        return None
    m = re.search(r"~?\s*([\d.,]+)\s*([kKmM])?", text.replace(".", "").replace(",", ""))
    if not m:
        digits = re.sub(r"[^\d]", "", text)
        return float(digits) if digits else None
    val = float(m.group(1))
    suffix = (m.group(2) or "").upper()
    if suffix == "K":
        val *= 1000
    elif suffix == "M":
        val *= 1_000_000
    return val


def parse_growth_pct(text: str) -> float | None:
    if not text or text.strip() in {"—", "-", ""}:
        return None
    m = re.search(r"([+-]?\d+(?:[.,]\d+)?)\s*%", text)
    return float(m.group(1).replace(",", ".")) if m else None


def facility_hint(market_m: float | None, patients: float | None, outlook: str) -> dict:
    if market_m and market_m >= 500:
        preset = "faz2"
        label = "Genişleme — büyük pazar hacmi"
    elif market_m and market_m >= 150:
        preset = "yuksek"
        label = "Yüksek kapasite — orta-büyük pazar"
    elif market_m and market_m >= 50:
        preset = "dengeli"
        label = "Dengeli — orta ölçek ihracat"
    elif patients and patients >= 100_000:
        preset = "dengeli"
        label = "Dengeli — geniş hasta tabanı"
    elif outlook in {"KAPALI PAZAR", "YÜKSEK RİSK"}:
        preset = "pilot"
        label = "Pilot — kapalı veya yüksek riskli pazar"
    else:
        preset = "pilot"
        label = "Pilot — erken veya küçük pazar"
    return {"preset": preset, "label": label}


def load_sqlite_market(db_path: Path) -> dict:
    out = {"prices": [], "strains": []}
    if not db_path.is_file():
        return out
    conn = None
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        tables = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if "market_reference_price_cache" in tables:
            q = "SELECT * FROM market_reference_price_cache ORDER BY observed_at DESC LIMIT 200"
            for row in conn.execute(q):
                out["prices"].append(dict(row))
        if "market_reference_strain_cache" in tables:
            q = """
                SELECT strain, company, country, thc, cbd, profile, price_ref, source
                FROM market_reference_strain_cache
                ORDER BY observed_at DESC LIMIT 300
            """
            for row in conn.execute(q):
                out["strains"].append(dict(row))
    except sqlite3.DatabaseError:
        pass
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass
    return out


def load_cannastream_data(root: Path) -> tuple[OrderedDict, dict, dict]:
    chat_py = (root / "cannastream" / "chat.py").read_text(encoding="utf-8")
    pdf_py = (root / "cannastream" / "pdf_report.py").read_text(encoding="utf-8")

    country_expr = _extract_return_expr(chat_py, "render_country_kpi_seed_data")
    countries = _eval_ordered_dict(country_expr)

    bench_expr = None
    m = re.search(r"MARKET_PRICE_BENCHMARKS\s*=\s*(\{)", pdf_py)
    if m:
        i = m.start(1)
        depth = 0
        for j in range(i, len(pdf_py)):
            if pdf_py[j] == "{":
                depth += 1
            elif pdf_py[j] == "}":
                depth -= 1
                if depth == 0:
                    bench_expr = pdf_py[i : j + 1]
                    break
    benchmarks = eval(bench_expr, {"__builtins__": {}}) if bench_expr else {}

    db = load_sqlite_market(root / "cannastream_news_cache.db")
    return countries, benchmarks, db


def build_feed(root: Path, *, do_enrich: bool = False) -> dict:
    countries_raw, benchmarks, db = load_cannastream_data(root)

    country_sources = {
        "Türkiye": ("TMO Kenevir Yönetmelikleri", "https://www.tmo.gov.tr/Upload/Document/kenevir/kenevirYonm.pdf"),
        "Almanya": ("BfArM · Medizinal-Cannabis", "https://www.bfarm.de/DE/Bundesopiumstelle/Medizinisches-Cannabis/_node.html"),
        "İngiltere": ("UK GOV · CBPM", "https://www.gov.uk/government/calls-for-evidence/cannabis-based-products-for-medicinal-use"),
        "Hollanda": ("Dutch OMC", "https://english.cannabisbureau.nl/"),
        "İtalya": ("Ministero della Salute", "https://www.salute.gov.it/"),
        "Portekiz": ("INFARMED", "https://www.infarmed.pt/web/infarmed/substancias-controladas/canabis-para-fins-medicinais"),
        "Polonya": ("GIF", "https://www.gov.pl/web/gif"),
        "Fransa": ("ANSM", "https://ansm.sante.fr/dossiers-thematiques/cannabis-a-usage-medical"),
        "Avustralya": ("TGA", "https://www.tga.gov.au/resources/explore-topic/medicinal-cannabis-hub"),
        "Kanada": ("Health Canada", "https://www.canada.ca/en/health-canada/services/drugs-medication/cannabis.html"),
        "İsrail": ("IMCA", "https://www.gov.il/en/departments/units/cannabis_unit/govil-landing-page"),
        "İsviçre": ("Swissmedic", "https://www.swissmedic.ch/"),
        "ABD": ("FDA", "https://www.fda.gov/news-events/public-health-focus/fda-regulation-cannabis-and-cannabis-derived-products-including-cannabidiol-cbd"),
        "Fas": ("ANRAC", "https://www.anrac.ma/"),
        "Ürdün": ("JFDA", "https://www.jfda.jo/"),
    }

    countries: dict = {}
    for name, meta in countries_raw.items():
        entry = dict(meta)
        market_m = parse_market_eur_m(str(meta.get("market") or ""))
        patients = parse_patients(str(meta.get("patients") or ""))
        growth = parse_growth_pct(str(meta.get("growth") or ""))
        entry["marketMEur"] = market_m
        entry["patientsN"] = patients
        entry["growthPct"] = growth
        entry["prices"] = derive_prices(name, benchmarks)
        entry["facility"] = facility_hint(market_m, patients, str(meta.get("outlook") or ""))
        src = country_sources.get(name)
        if src:
            entry["officialSource"] = {"label": src[0], "url": src[1]}
        countries[name] = entry

    strains_by_country: dict[str, list] = {}
    for row in db.get("strains") or []:
        c = str(row.get("country") or "Global")
        strains_by_country.setdefault(c, []).append(row)

    live_prices = db.get("prices") or []
    news_db = root / "cannastream_news_cache.db"
    linkup_cache = load_linkup_cache(news_db)
    regulation_news = load_regulation_news(news_db)

    verify_summary = apply_overrides_inline(countries, facility_hint_fn=facility_hint)

    payload = {
        "version": 4,
        "updated": date.today().isoformat(),
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "source": "cannastream-app",
        "sourceUrl": "https://github.com/noprobono-can/cannastream-app",
        "streamlitUrl": "https://cannastream-app-v3.streamlit.app/",
        "refreshMinutes": 15,
        "autoSync": True,
        "integrations": ["cannastream", "linkup", "firecrawl", "verified-overrides"],
        "verification": {
            "at": VERIFIED_AT,
            "note": VERIFIED_NOTE,
            "applied": verify_summary.get("applied") or [],
            "missing": verify_summary.get("missing") or [],
        },
        "countries": countries,
        "livePrices": live_prices[:120],
        "strains": db.get("strains") or [],
        "strainsByCountry": strains_by_country,
        "benchmarks": benchmarks,
        "linkupCacheCount": len(linkup_cache),
        "newsCount": len(regulation_news),
    }

    if do_enrich or os.environ.get("ENRICH_MARKET_FEED") == "1":
        meta = enrich_countries(
            payload["countries"],
            linkup_cache=linkup_cache,
            news=regulation_news,
        )
        payload["enrichment"] = {
            "enriched": meta.get("enriched", 0),
            "hasLinkup": meta.get("hasLinkup"),
            "hasFirecrawl": meta.get("hasFirecrawl"),
            "at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        }

    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cannastream", required=True, help="Path to cannastream-app clone")
    parser.add_argument("--out", default="data/market-feed.json", help="Output JSON path")
    parser.add_argument("--enrich", action="store_true", help="Run Linkup + Firecrawl enrichment")
    args = parser.parse_args()

    root = Path(args.cannastream).resolve()
    if not (root / "cannastream" / "chat.py").is_file():
        print("cannastream/chat.py not found under", root, file=sys.stderr)
        return 1

    payload = build_feed(root, do_enrich=args.enrich)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote", out, "—", len(payload["countries"]), "countries,",
          len(payload.get("strains") or []), "strains,",
          len(payload.get("livePrices") or []), "live prices")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
