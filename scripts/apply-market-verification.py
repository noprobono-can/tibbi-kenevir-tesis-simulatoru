#!/usr/bin/env python3
"""Apply verified market overrides to data/market-feed.json (no Cannastream clone needed)."""
from __future__ import annotations

import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from market_verified_overrides import VERIFIED_AT, VERIFIED_NOTE, apply_overrides_inline


def facility_hint(market_m, patients, outlook: str) -> dict:
    if market_m and market_m >= 500:
        return {"preset": "faz2", "label": "Genişleme — büyük pazar hacmi"}
    if market_m and market_m >= 150:
        return {"preset": "yuksek", "label": "Yüksek kapasite — orta-büyük pazar"}
    if market_m and market_m >= 50:
        return {"preset": "dengeli", "label": "Dengeli — orta ölçek ihracat"}
    if patients and patients >= 100_000:
        return {"preset": "dengeli", "label": "Dengeli — geniş hasta tabanı"}
    if outlook in {"KAPALI PAZAR", "YÜKSEK RİSK"}:
        return {"preset": "pilot", "label": "Pilot — kapalı veya yüksek riskli pazar"}
    return {"preset": "pilot", "label": "Pilot — erken veya küçük pazar"}


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    path = root / "data" / "market-feed.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    countries = data.get("countries") or {}
    summary = apply_overrides_inline(countries, facility_hint_fn=facility_hint)
    data["version"] = max(4, int(data.get("version") or 3))
    data["updated"] = date.today().isoformat()
    data["generatedAt"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    integrations = list(data.get("integrations") or [])
    if "verified-overrides" not in integrations:
        integrations.append("verified-overrides")
    data["integrations"] = integrations
    data["verification"] = {
        "at": VERIFIED_AT,
        "note": VERIFIED_NOTE,
        "applied": summary.get("applied") or [],
        "missing": summary.get("missing") or [],
    }
    data["countries"] = countries
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Verified", len(summary["applied"]), "countries ->", path)
    for name in summary["applied"]:
        c = countries[name]
        p = c.get("prices") or {}
        print(
            f"  {name}: pts={c.get('patients')} mkt={c.get('market')} "
            f"gacp={p.get('gacpKg')} gmp={p.get('gmpKg')} status={(c.get('verification') or {}).get('status')}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
