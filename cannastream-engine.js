(function () {
  const STORAGE_KEY = "tkts-market-country";
  const CACHE_VERSION = 50;
  const FEED_URLS = [
    "data/market-feed.json",
    "https://raw.githubusercontent.com/noprobono-can/tibbi-kenevir-tesis-simulatoru/main/data/market-feed.json"
  ];

  let feed = null;
  let selectedCountry = null;
  let refreshTimer = null;
  let lastFeedUpdated = null;
  let syncingDom = false;
  let panelDirty = true;

  function fmt(n, d) {
    return Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d });
  }

  function eur(n) {
    return "\u20AC" + fmt(n, 0);
  }

  function pct(n) {
    return "%" + fmt(n, 1);
  }

  function loadStoredCountry() {
    try { return localStorage.getItem(STORAGE_KEY) || ""; } catch (e) { return ""; }
  }

  function storeCountry(name) {
    try {
      if (name) localStorage.setItem(STORAGE_KEY, name);
    } catch (e) {}
  }

  function getCountry(name) {
    return feed && feed.countries ? feed.countries[name || selectedCountry] : null;
  }

  function countryNames() {
    return feed && feed.countries ? Object.keys(feed.countries) : [];
  }

  function normStr(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9\u00c0-\u024f]+/gi, " ").trim();
  }

  function matchCultivars(countryName, limit) {
    limit = limit || 5;
    if (!window.CULTIVARS) return [];
    const c = getCountry(countryName);
    const hints = [];
    (feed && feed.strains || []).forEach(function (st) {
      hints.push(normStr(st.strain));
    });
    if (c && c.prices && c.prices.benchmarks) {
      c.prices.benchmarks.forEach(function (b) {
        hints.push(normStr(b["Urun Formu"]));
      });
    }
    const scored = window.CULTIVARS.map(function (cv) {
      const n = normStr(cv.name);
      let score = 0;
      hints.forEach(function (h) {
        if (!h) return;
        if (n.indexOf(h) >= 0 || h.indexOf(n.split(" ")[0]) >= 0) score += 3;
      });
      if (cv.origin && cv.origin.indexOf("AB") >= 0 && countryName !== "Türkiye") score += 1;
      if (countryName === "Almanya" && (cv.note || "").toLowerCase().indexOf("eczane") >= 0) score += 2;
      return { cv: cv, score: score };
    }).filter(function (x) { return x.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score; });
    const out = [];
    const seen = {};
    scored.forEach(function (x) {
      if (out.length >= limit || seen[x.cv.id]) return;
      seen[x.cv.id] = true;
      out.push(x.cv);
    });
    return out.length ? out : window.CULTIVARS.slice(0, Math.min(limit, 4));
  }

  function estimateMarketDemandKg(c) {
    if (!c) return null;
    let kg = null;
    if (c.patientsN) kg = c.patientsN * 0.28;
    if (c.marketMEur) {
      const fromMarket = c.marketMEur * 180;
      kg = kg ? (kg + fromMarket) / 2 : fromMarket;
    }
    return kg ? Math.round(kg) : null;
  }

  function clampNum(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerpNum(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpInt(a, b, t) {
    return Math.round(lerpNum(a, b, t));
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function marketWidthScore(c) {
    if (!c) return 0.35;
    const scores = [];
    if (c.marketMEur != null && c.marketMEur > 0) {
      const logM = (Math.log10(Math.max(8, c.marketMEur)) - Math.log10(8)) / (Math.log10(900) - Math.log10(8));
      scores.push(clampNum(logM, 0, 1));
    }
    if (c.patientsN != null && c.patientsN > 0) {
      scores.push(clampNum(c.patientsN / 280000, 0, 1));
    }
    const demand = estimateMarketDemandKg(c);
    if (demand) scores.push(clampNum(demand / 180000, 0, 1));

    let t = scores.length ? scores.reduce(function (a, b) { return a + b; }, 0) / scores.length : 0.22;
    const outlook = String(c.outlook || "");
    if (outlook.indexOf("KAPALI") >= 0 || outlook.indexOf("R\u0130SK") >= 0) t *= 0.22;
    else if (outlook.indexOf("MEVZUAT") >= 0 || outlook.indexOf("NETLE") >= 0) t *= 0.52;
    else if (outlook.indexOf("G\u00dc\u00c7L\u00dc") >= 0 || outlook.indexOf("B\u00dcY\u00dcME") >= 0) t = Math.min(1, t * 1.08);

    if (c.growthPct != null) {
      if (c.growthPct > 80) t = Math.min(1, t + 0.06);
      else if (c.growthPct < 0) t *= 0.85;
    }
    const status = String(c.status || "");
    if (/kapal\u0131|yasak|s\u0131k\u0131 kontroll\u00fc/i.test(status) && !c.marketMEur) t = Math.min(t, 0.38);
    if (/tam legal/i.test(status)) t = Math.min(1, t + 0.05);
    return clampNum(t, 0.06, 1);
  }

  function countryWantsExtract(c) {
    const bits = [c.products, c.notes, c.import_export];
    (c.prices && c.prices.benchmarks || []).forEach(function (b) {
      bits.push(b["Urun Formu"], b.Not);
    });
    return /ekstrakt|extract|magistral|API|distilat|ya\u011f/i.test(bits.join(" "));
  }

  function facilityTierLabel(t) {
    if (t <= 0.2) return "Mikro pilot \u2014 kapal\u0131 veya erken pazar";
    if (t <= 0.4) return "K\u00fc\u00e7\u00fck \u00f6l\u00e7ek \u2014 ni\u015f ihracat";
    if (t <= 0.6) return "Dengeli \u2014 orta pazar pay\u0131";
    if (t <= 0.8) return "Y\u00fcksek kapasite \u2014 geni\u015f pazar";
    return "Geni\u015fleme faz\u0131 \u2014 lider pazar hacmi";
  }

  function estimateKgPerRoom(params) {
    return params.roomM2 * 0.85 * params.plantsPerM2 * (params.yieldG / 1000) * params.harvestsPerRoom;
  }

  function computeFacilityParams(c) {
    const t = marketWidthScore(c);
    const demandKg = estimateMarketDemandKg(c);
    const targetSharePct = lerpNum(0.15, 1.2, t);
    const prices = (c && c.prices) || {};
    const wantsExtract = countryWantsExtract(c);

    const params = {
      plantsPerM2: round1(lerpNum(5, 4.5, t)),
      harvestsPerRoom: round1(lerpNum(4, 6, t)),
      roomM2: lerpInt(60, 80, t),
      flowerDays: t >= 0.55 ? 49 : 56,
      vegDays: lerpInt(18, 24, t),
      preVegDays: 14,
      rootDays: 14,
      dryDays: 14,
      dryCleanDays: t >= 0.65 ? 5 : 7,
      dryTiers: t >= 0.4 ? 3 : 2,
      yieldSkill: t < 0.22 ? "starter" : t < 0.58 ? "mid" : "pro",
      yieldG: t < 0.22 ? 65 : t < 0.58 ? 105 : 145,
      genetics: lerpInt(3, 5, t),
      saleablePct: lerpInt(80, 88, t),
      extraction: t >= 0.28 && (wantsExtract || t >= 0.45),
      extractPct: 0,
      priceKgGacp: prices.gacpKg || lerpInt(2200, 4800, 1 - t),
      priceKgGmp: prices.gmpKg || lerpInt(3200, 6200, 1 - t),
      extractPriceKg: prices.extractKg || lerpInt(3800, 7500, t)
    };
    params.extractPct = params.extraction ? lerpInt(10, 28, t) : 0;

    let flowerRooms = lerpInt(3, 12, t);
    if (demandKg && demandKg > 0) {
      const targetKg = demandKg * (targetSharePct / 100);
      const kgPerRoom = estimateKgPerRoom(params);
      if (kgPerRoom > 0) flowerRooms = clampNum(Math.ceil(targetKg / kgPerRoom), 1, 30);
    }
    params.flowerRooms = flowerRooms;
    params.flowerArea = flowerRooms * params.roomM2;
    params.plantsYear = Math.round(params.flowerArea * 0.85 * params.plantsPerM2 * params.harvestsPerRoom);
    params.dryRooms = clampNum(Math.ceil(flowerRooms / (t > 0.55 ? 2.2 : 2.8)), 1, 20);

    const kgEst = params.plantsYear * params.yieldG / 1000 * (params.saleablePct / 100);
    params.trimM2 = clampNum(Math.round(lerpNum(20, 36, t) + flowerRooms * 2 + kgEst / 800), 18, 240);
    params.packM2 = clampNum(Math.round(lerpNum(18, 55, t) + flowerRooms * 4 + kgEst / 600), 12, 200);

    return {
      params: params,
      score: t,
      demandKg: demandKg,
      targetSharePct: targetSharePct,
      label: facilityTierLabel(t),
      country: selectedCountry
    };
  }

  function applyCountryFacilityFromMarket() {
    if (typeof window.applyMarketFacility === "function") {
      window.marketAutoMode = true;
      return window.applyMarketFacility(false);
    }
    return null;
  }

  function computeSalesProjection(s, m, c) {
    const demandKg = estimateMarketDemandKg(c);
    const soldKg = m.kgFlowerSold || 0;
    const sharePct = demandKg ? (soldKg / demandKg) * 100 : null;
    const growth = c && c.growthPct != null ? Math.min(80, Math.max(-5, c.growthPct * 0.15)) : 12;
    const gacpY = (window.PRICE_RAMP && window.PRICE_RAMP.gacpYears) ? window.PRICE_RAMP.gacpYears : 2;
    const pGacp = s.priceKgGacp != null ? s.priceKgGacp : 2500;
    const pGmp = s.priceKgGmp != null ? s.priceKgGmp : 3500;
    const pEx = s.extractPriceKg || 0;
    const exKg = m.extract ? (m.extract.productKg != null ? m.extract.productKg : m.extract.crudeKg) : 0;
    const years = [];
    let cum = 0;
    for (let y = 1; y <= 5; y++) {
      const ramp = y <= gacpY ? 0.72 + (y / gacpY) * 0.28 : 1;
      const flowerP = y <= gacpY ? pGacp : pGmp;
      const vol = soldKg * ramp * Math.pow(1 + growth / 100, y - 1);
      const rev = vol * flowerP + exKg * pEx * ramp;
      const ebitda = rev - (m.opexYear || 0) * (0.9 + y * 0.02);
      cum += Math.max(0, ebitda);
      years.push({ y: y, kg: vol, revenue: rev, ebitda: ebitda, price: flowerP });
    }
    return { demandKg: demandKg, soldKg: soldKg, sharePct: sharePct, growthPct: growth, years: years, cumulativeEbitda: cum };
  }

  function getLivePrices() {
    const c = getCountry();
    return c && c.prices ? c.prices : null;
  }

  function syncDomPrices(prices) {
    if (!prices || syncingDom) return;
    syncingDom = true;
    const gacp = document.getElementById("priceKgGacp");
    const gmp = document.getElementById("priceKgGmp");
    const ext = document.getElementById("extractPriceKg");
    if (gacp && prices.gacpKg) gacp.value = String(prices.gacpKg);
    if (gmp && prices.gmpKg) gmp.value = String(prices.gmpKg);
    if (ext && prices.extractKg) ext.value = String(prices.extractKg);
    syncingDom = false;
  }

  function patchState(s) {
    const prices = getLivePrices();
    if (!prices || !s) return s;
    s.priceKgGacp = prices.gacpKg;
    s.priceKgGmp = prices.gmpKg;
    s.extractPriceKg = prices.extractKg;
    s.marketCountry = selectedCountry;
    s.marketFeedUpdated = lastFeedUpdated;
    syncDomPrices(prices);
    return s;
  }

  function updateSyncChip(status) {
    const chip = document.getElementById("marketSyncChip");
    if (!chip) return;
    if (status === "loading") {
      chip.textContent = "Cannastream: yükleniyor…";
      chip.classList.remove("on", "warn");
      return;
    }
    if (status === "error") {
      chip.textContent = "Cannastream: bağlantı yok";
      chip.classList.add("warn");
      chip.classList.remove("on");
      return;
    }
    chip.textContent = feed && feed.updated
      ? "Cannastream · " + feed.updated
      : "Cannastream · canlı";
    chip.classList.add("on");
    chip.classList.remove("warn");
  }

  function fillCountrySelects(preserve) {
    const names = countryNames();
    if (!names.length) return;
    const stored = loadStoredCountry();
    const sidebar = document.getElementById("marketCountry");
    const cur = preserve ? (selectedCountry || (sidebar && sidebar.value) || "") : "";
    const value = (cur && names.indexOf(cur) >= 0)
      ? cur
      : (stored && names.indexOf(stored) >= 0)
        ? stored
        : (names.indexOf("Almanya") >= 0 ? "Almanya" : names[0]);
    selectedCountry = value;
    ["marketCountry", "marketCountryHeader"].forEach(function (id) {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = names.map(function (n) {
        return '<option value="' + n.replace(/"/g, "&quot;") + '">' + n + "</option>";
      }).join("");
      sel.value = value;
      sel.disabled = false;
    });
    if (window.TKTS_darkSelect) window.TKTS_darkSelect.enhanceAll();
  }

  function onCountryChange(fromId) {
    const src = document.getElementById(fromId || "marketCountry");
    if (!src) return;
    selectedCountry = src.value;
    storeCountry(selectedCountry);
    ["marketCountry", "marketCountryHeader"].forEach(function (id) {
      const sel = document.getElementById(id);
      if (sel && sel !== src) sel.value = selectedCountry;
    });
    panelDirty = true;
    syncDomPrices(getLivePrices());
    renderMarketPanel(false);
    applyCountryFacilityFromMarket();
    if (typeof window.render === "function") window.render();
  }

  function renderIntelligence(c) {
    const intel = c && c.intelligence;
    if (!intel || (!intel.linkup && !intel.firecrawl && !intel.news && !intel.regulation)) return "";
    let html = '<div class="market-intel"><div class="market-intel-tags">';
    if (intel.linkup) html += '<span>Linkup</span>';
    if (intel.firecrawl) html += '<span>Firecrawl</span>';
    if (intel.news) html += '<span>Cannastream haber</span>';
    if (intel.regulation) html += '<span>Regülasyon</span>';
    html += "</div>";
    if (intel.linkup && intel.linkup.snippets && intel.linkup.snippets.length) {
      html += "<h4>Canlı pazar taraması</h4><ul>";
      intel.linkup.snippets.slice(0, 3).forEach(function (s) {
        html += "<li>" + String(s).replace(/</g, "&lt;").slice(0, 220) + "…</li>";
      });
      html += "</ul>";
      if (intel.linkup.sources && intel.linkup.sources.length) {
        html += '<p class="hint">';
        intel.linkup.sources.slice(0, 3).forEach(function (src, i) {
          if (src.url) html += (i ? " · " : "") + '<a href="' + src.url + '" target="_blank" rel="noopener">' + (src.name || "Kaynak") + "</a>";
        });
        html += "</p>";
      }
    }
    if (intel.regulation && intel.regulation.items && intel.regulation.items.length) {
      html += "<h4>Regülasyon sinyalleri</h4><ul>";
      intel.regulation.items.forEach(function (it) {
        html += "<li>" + (it.url ? '<a href="' + it.url + '" target="_blank" rel="noopener">' : "") + String(it.title || it.snippet || "").replace(/</g, "&lt;").slice(0, 120) + (it.url ? "</a>" : "") + "</li>";
      });
      html += "</ul>";
    }
    if (intel.firecrawl && intel.firecrawl.excerpt) {
      html += "<h4>Resmi kaynak (Firecrawl)</h4><p class=\"hint\">" + String(intel.firecrawl.excerpt).replace(/</g, "&lt;").slice(0, 360) + "…</p>";
    }
    if (intel.news && intel.news.length) {
      html += "<h4>İlgili haberler</h4><ul>";
      intel.news.forEach(function (n) {
        html += "<li>" + (n.link ? '<a href="' + n.link + '" target="_blank" rel="noopener">' : "") + String(n.title || "").replace(/</g, "&lt;") + (n.link ? "</a>" : "") + "</li>";
      });
      html += "</ul>";
    }
    html += "</div>";
    return html;
  }

  function renderMarketPanel(triggerRender) {
    const box = document.getElementById("marketContext");
    const side = document.getElementById("marketSideNote");
    const c = getCountry();
    if (!box) return;
    if (!c) {
      box.innerHTML = '<p class="hint">Cannastream verisi henüz yüklenmedi.</p>';
      return;
    }
    if (!panelDirty && box.childElementCount > 1) return;
    panelDirty = false;

    const p = c.prices || {};
    const facPack = computeFacilityParams(c);
    const fac = facPack || { label: (c.facility && c.facility.label) || "", params: {} };
    const strains = matchCultivars(selectedCountry, 4);
    const strainHtml = strains.length
      ? '<div class="market-strains"><small>Pazar genetiği (otomatik öneri)</small><div class="market-strain-list">' +
        strains.map(function (cv) {
          return '<button type="button" class="market-strain" data-id="' + cv.id + '">' + cv.name.split(" ")[0] + "<small>" + cv.thc + "</small></button>";
        }).join("") + "</div></div>"
      : "";

    box.innerHTML =
      '<div class="market-head">' +
        '<span class="market-badge" style="--mc:' + (c.outlook_color || "#d29922") + '">' + (c.status || "") + "</span>" +
        '<span class="market-outlook">' + (c.outlook || "") + "</span>" +
      "</div>" +
      '<div class="market-grid">' +
        '<div><small>Hasta</small><strong>' + (c.patients || "—") + "</strong></div>" +
        '<div><small>Pazar</small><strong>' + (c.market || "—") + "</strong></div>" +
        '<div><small>Büyüme</small><strong>' + (c.growth || "—") + "</strong></div>" +
        '<div><small>Otorite</small><strong>' + (c.authority || "—") + "</strong></div>" +
      "</div>" +
      '<p class="market-notes">' + (c.notes || "") + "</p>" +
      '<div class="market-prices">' +
        '<div><span>GACP (arka plan)</span><strong>' + eur(p.gacpKg || 0) + "/kg</strong></div>" +
        '<div><span>EU-GMP (arka plan)</span><strong>' + eur(p.gmpKg || 0) + "/kg</strong></div>" +
        '<div><span>Ekstrakt (arka plan)</span><strong>' + eur(p.extractKg || 0) + "/kg</strong></div>" +
      "</div>" +
      '<p class="hint market-basis">' + (p.basis || "") + (p.retailBand ? " · " + p.retailBand : "") + "</p>" +
      '<div class="market-facility">' +
        '<span>Pazar genişliği algoritması</span>' +
        '<strong>' + fac.label + "</strong>" +
        '<p class="hint market-facility-meta">Skor %' + fmt(facPack.score * 100, 0) +
          " · hedef pay ~%" + fmt(facPack.targetSharePct, 2) +
          (facPack.demandKg ? " · talep ~" + fmt(facPack.demandKg, 0) + " kg/yıl" : "") +
          " · " + facPack.params.flowerRooms + " oda · " + fmt(facPack.params.plantsYear, 0) + " bitki/yıl · " +
          facPack.params.dryRooms + " kurutma · ekstrakt %" + facPack.params.extractPct + "</p>" +
        '<button type="button" id="marketApplyPreset" class="secondary">Tüm tesis parametrelerini uygula</button>' +
      "</div>" +
      strainHtml +
      renderIntelligence(c) +
      (c.officialSource && c.officialSource.url
        ? '<p class="hint"><a href="' + c.officialSource.url + '" target="_blank" rel="noopener">' + (c.officialSource.label || "Resmi kaynak") + " ↗</a></p>"
        : "");

    if (side) side.textContent = (c.import_export || "") + (c.key_players ? " · " + c.key_players : "");
    const updated = document.getElementById("marketUpdated");
    if (updated && feed) updated.textContent = "Otomatik senkron · " + (feed.updated || "—") + " · yenileme " + (feed.refreshMinutes || 15) + " dk";

    bindPanelActions();
    if (triggerRender && typeof window.render === "function") window.render();
  }

  function renderSalesPanel(projection) {
    const sales = document.getElementById("marketSales");
    if (!sales || !projection) return;
    const shareLine = projection.sharePct != null
      ? "<tr><td>Pazar payı (çiçek kg)</td><td class=\"num\">" + pct(projection.sharePct) + " · talep ~" + fmt(projection.demandKg, 0) + " kg/yıl</td></tr>"
      : "<tr><td>Pazar talebi</td><td class=\"num\">Veri yetersiz</td></tr>";
    const yearRows = projection.years.map(function (y) {
      return "<tr><td>Yıl " + y.y + " · " + fmt(y.kg, 0) + " kg · " + eur(y.price) + "/kg</td><td class=\"num\">" + eur(y.revenue) + " · EBITDA " + eur(y.ebitda) + "</td></tr>";
    }).join("");
    sales.innerHTML =
      "<h3>Arka plan satış simülasyonu · " + selectedCountry + "</h3>" +
      "<table><tr><th>Kalem</th><th>Değer</th></tr>" + shareLine +
      "<tr><td>Tesis satılabilir çiçek</td><td class=\"num\">" + fmt(projection.soldKg, 0) + " kg/yıl</td></tr>" +
      "<tr><td>Pazar büyüme</td><td class=\"num\">" + pct(projection.growthPct) + "/yıl</td></tr>" +
      yearRows +
      "<tr><td><strong>5 yıl kümülatif EBITDA</strong></td><td class=\"num\"><strong>" + eur(projection.cumulativeEbitda) + "</strong></td></tr></table>";
  }

  function enrichResult(s, m) {
    const c = getCountry();
    if (!c || !m) return;
    const projection = computeSalesProjection(s, m, c);
    m.market = {
      country: selectedCountry,
      countryMeta: c,
      projection: projection,
      prices: c.prices,
      facility: c.facility,
      updated: feed ? feed.updated : null,
      auto: true
    };
    const alerts = [];
    if (projection.sharePct != null) {
      if (projection.sharePct < 0.05) {
        alerts.push({ t: "warn", m: selectedCountry + " pazarında üretim payınız ~%" + fmt(projection.sharePct, 2) + " — kapasite pazar için küçük kalıyor." });
      } else if (projection.sharePct > 8) {
        alerts.push({ t: "warn", m: selectedCountry + " pazarında ~%" + fmt(projection.sharePct, 1) + " pay — agresif hedef." });
      } else {
        alerts.push({ t: "ok", m: "Cannastream hedef pazar " + selectedCountry + ": ~%" + fmt(projection.sharePct, 2) + " pay · talep ~" + fmt(projection.demandKg, 0) + " kg/yıl." });
      }
    }
    if (c.outlook === "KAPALI PAZAR" || c.outlook === "YÜKSEK RİSK") {
      alerts.push({ t: "bad", m: c.outlook + ": " + selectedCountry + " ihracat/satış modeli yüksek regülasyon riski." });
    }
    if (c.prices) {
      alerts.push({ t: "ok", m: "Arka plan fiyat (Cannastream): GACP " + eur(c.prices.gacpKg) + "/kg · GMP " + eur(c.prices.gmpKg) + "/kg." });
    }
    m.marketAlerts = alerts;
    renderSalesPanel(projection);
  }

  function mergeMarketAlerts(m) {
    if (!m || !m.marketAlerts || !m.alerts) return;
    m.marketAlerts.forEach(function (a) { m.alerts.unshift(a); });
  }

  function bindPanelActions() {
    const presetBtn = document.getElementById("marketApplyPreset");
    if (presetBtn && !presetBtn._bound) {
      presetBtn._bound = true;
      presetBtn.addEventListener("click", function () {
        applyCountryFacilityFromMarket();
        if (typeof window.render === "function") window.render();
      });
    }
    document.querySelectorAll(".market-strain").forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-id");
        if (!id || !window.roomBoard) return;
        window.ensureRoomBoard(window.flowerRoomCount());
        window.roomBoard.forEach(function (r) { r.cultivarId = id; });
        if (typeof window.render === "function") window.render();
      });
    });
  }

  function bindMarketUi() {
    if (document.documentElement.dataset.marketUiBound === "1") return;
    document.documentElement.dataset.marketUiBound = "1";
    document.addEventListener("change", function (e) {
      const t = e.target;
      if (!t || !t.id) return;
      if (t.id === "marketCountry" || t.id === "marketCountryHeader") {
        onCountryChange(t.id);
      }
    });
  }

  function onTabOpen() {
    if (!feed) {
      loadFeed(false);
      return;
    }
    fillCountrySelects(true);
    panelDirty = true;
    renderMarketPanel(false);
    if (typeof window.render === "function") window.render();
  }

  function scheduleRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    const mins = (feed && feed.refreshMinutes) || 15;
    refreshTimer = setInterval(function () { loadFeed(true); }, mins * 60 * 1000);
  }

  function fetchFeedJson() {
    let chain = Promise.reject(new Error("no url"));
    FEED_URLS.forEach(function (url) {
      chain = chain.catch(function () {
        return fetch(url + "?v=" + CACHE_VERSION + "&t=" + Date.now()).then(function (r) {
          if (!r.ok) throw new Error("feed");
          return r.json();
        });
      });
    });
    return chain;
  }

  function applyFeed(data, isRefresh) {
    const prev = lastFeedUpdated;
    feed = data;
    lastFeedUpdated = data.updated || null;
    fillCountrySelects(!!isRefresh || !!selectedCountry);
    syncDomPrices(getLivePrices());
    panelDirty = true;
    renderMarketPanel(false);
    bindMarketUi();
    scheduleRefresh();
    updateSyncChip("ok");
    if (isRefresh && window.marketAutoMode !== false && typeof window.applyMarketFacility === "function") {
      window.applyMarketFacility(false);
    }
    if (isRefresh && prev !== lastFeedUpdated && typeof window.render === "function") {
      window.render();
    }
    document.dispatchEvent(new CustomEvent("tkts-market-ready", { detail: { updated: lastFeedUpdated, refresh: !!isRefresh } }));
  }

  function loadFeed(isRefresh) {
    if (!isRefresh) updateSyncChip("loading");
    return fetchFeedJson()
      .then(function (data) {
        applyFeed(data, isRefresh);
        return data;
      })
      .catch(function () {
        updateSyncChip("error");
        const box = document.getElementById("marketContext");
        if (box && !feed) {
          box.innerHTML = '<p class="hint">Cannastream verisi yüklenemedi. GitHub Actions senkronu veya yerel export bekleniyor.</p>';
        }
        throw new Error("feed load failed");
      });
  }

  const ready = fetchFeedJson()
    .then(function (data) {
      feed = data;
      lastFeedUpdated = data.updated || null;
      return data;
    })
    .catch(function () {
      return null;
    });

  function initDom() {
    bindMarketUi();
    if (window.TKTS_darkSelect) window.TKTS_darkSelect.enhanceAll();
    ready.then(function () {
      if (feed) {
        fillCountrySelects(false);
        syncDomPrices(getLivePrices());
        renderMarketPanel(false);
        scheduleRefresh();
        updateSyncChip("ok");
      } else {
        loadFeed(false);
      }
      document.dispatchEvent(new CustomEvent("tkts-market-ready", { detail: { updated: lastFeedUpdated } }));
    });
  }

  window.TKTS_market = {
    ready: ready,
    getFeed: function () { return feed; },
    getCountry: getCountry,
    getSelected: function () { return selectedCountry; },
    getLivePrices: getLivePrices,
    patchState: patchState,
    enrichResult: enrichResult,
    mergeMarketAlerts: mergeMarketAlerts,
    refresh: function () { return loadFeed(true); },
    matchCultivars: matchCultivars,
    onTabOpen: onTabOpen,
    computeFacilityParams: computeFacilityParams,
    marketWidthScore: marketWidthScore,
    applyCountryFacility: applyCountryFacilityFromMarket
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDom);
  } else {
    initDom();
  }

  setInterval(function () { loadFeed(true); }, 15 * 60 * 1000);
})();
