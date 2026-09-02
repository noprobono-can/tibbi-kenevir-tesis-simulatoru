(function () {
  const STORAGE_KEY = "tkts-market-country";
  const CACHE_VERSION = 44;
  const feedUrl = "data/market-feed.json";

  let feed = null;
  let selectedCountry = null;
  let autoSync = true;
  let refreshTimer = null;
  let lastSyncAt = null;

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
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function getCountry(name) {
    return feed && feed.countries ? feed.countries[name || selectedCountry] : null;
  }

  function countryNames() {
    if (!feed || !feed.countries) return [];
    return Object.keys(feed.countries);
  }

  function parsePriceRef(ref) {
    if (!ref) return null;
    const m = String(ref).match(/([\d.,]+)\s*€?\s*\/?\s*1?\s*g/i);
    if (!m) return null;
    return Math.round(parseFloat(m[1].replace(",", ".")) * 1000);
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
      if (st.country && st.country !== countryName && st.country !== "Almanya" && countryName !== "Almanya") return;
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
        n.split(" ").forEach(function (w) {
          if (w.length > 3 && h.indexOf(w) >= 0) score += 1;
        });
      });
      if (cv.origin && cv.origin.indexOf("AB") >= 0 && countryName !== "Türkiye") score += 1;
      if (countryName === "Almanya" && (cv.note || "").toLowerCase().indexOf("eczane") >= 0) score += 2;
      if (countryName === "Hollanda" && cv.name.indexOf("Herer") >= 0) score += 2;
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
    if (!out.length) {
      return window.CULTIVARS.slice(0, Math.min(limit, 4));
    }
    return out;
  }

  function estimateMarketDemandKg(c) {
    if (!c) return null;
    let kg = null;
    if (c.patientsN) {
      kg = c.patientsN * 0.28;
    }
    if (c.marketMEur) {
      const fromMarket = c.marketMEur * 180;
      kg = kg ? (kg + fromMarket) / 2 : fromMarket;
    }
    return kg ? Math.round(kg) : null;
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
    return {
      demandKg: demandKg,
      soldKg: soldKg,
      sharePct: sharePct,
      growthPct: growth,
      years: years,
      cumulativeEbitda: cum
    };
  }

  function applyMarketPrices(silent) {
    const c = getCountry();
    if (!c || !c.prices) return false;
    const gacp = document.getElementById("priceKgGacp");
    const gmp = document.getElementById("priceKgGmp");
    const ext = document.getElementById("extractPriceKg");
    if (gacp && c.prices.gacpKg) gacp.value = String(c.prices.gacpKg);
    if (gmp && c.prices.gmpKg) gmp.value = String(c.prices.gmpKg);
    if (ext && c.prices.extractKg) ext.value = String(c.prices.extractKg);
    lastSyncAt = Date.now();
    updateSyncChip();
    if (!silent && typeof window.render === "function") window.render();
    return true;
  }

  function renderMarketPanel() {
    const box = document.getElementById("marketContext");
    const sales = document.getElementById("marketSales");
    const side = document.getElementById("marketSideNote");
    const c = getCountry();
    if (!box) return;
    if (!c) {
      box.innerHTML = '<p class="hint">Pazar verisi yüklenemedi.</p>';
      if (sales) sales.innerHTML = "";
      return;
    }
    const p = c.prices || {};
    const fac = c.facility || {};
    const strains = matchCultivars(selectedCountry, 4);
    const strainHtml = strains.length
      ? '<div class="market-strains"><small>Pazar genetiği önerisi</small><div class="market-strain-list">' +
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
        '<div><span>GACP (canlı)</span><strong>' + eur(p.gacpKg || 0) + "/kg</strong></div>" +
        '<div><span>EU-GMP (canlı)</span><strong>' + eur(p.gmpKg || 0) + "/kg</strong></div>" +
        '<div><span>Ekstrakt (canlı)</span><strong>' + eur(p.extractKg || 0) + "/kg</strong></div>" +
      "</div>" +
      '<p class="hint market-basis">' + (p.basis || "") + (p.retailBand ? " · " + p.retailBand : "") + "</p>" +
      (fac.label ? '<div class="market-facility"><span>Tesis önerisi</span><strong>' + fac.label + '</strong><button type="button" id="marketApplyPreset" class="secondary" data-preset="' + (fac.preset || "dengeli") + '">Senaryoyu uygula</button></div>' : "") +
      strainHtml +
      (c.officialSource && c.officialSource.url
        ? '<p class="hint"><a href="' + c.officialSource.url + '" target="_blank" rel="noopener">' + (c.officialSource.label || "Resmi kaynak") + " ↗</a></p>"
        : "");

    if (side) {
      side.textContent = (c.import_export || "") + (c.key_players ? " · " + c.key_players : "");
    }

    const updated = document.getElementById("marketUpdated");
    if (updated && feed) {
      updated.textContent = "Cannastream · " + (feed.updated || "—") + (autoSync ? " · canlı senkron" : "");
    }

    bindPanelActions();
    if (typeof window.render === "function") window.render();
  }

  function renderSalesPanel(projection) {
    const sales = document.getElementById("marketSales");
    if (!sales || !projection) return;
    const c = getCountry();
    if (!c) { sales.innerHTML = ""; return; }

    const shareLine = projection.sharePct != null
      ? "<tr><td>Pazar payı (çiçek kg)</td><td class=\"num\">" + pct(projection.sharePct) + " · talep ~" + fmt(projection.demandKg, 0) + " kg/yıl</td></tr>"
      : "<tr><td>Pazar talebi</td><td class=\"num\">Veri yetersiz — hasta/pazar KPI eksik</td></tr>";

    const yearRows = projection.years.map(function (y) {
      return "<tr><td>Yıl " + y.y + " · " + fmt(y.kg, 0) + " kg · " + eur(y.price) + "/kg</td><td class=\"num\">" + eur(y.revenue) + " · EBITDA " + eur(y.ebitda) + "</td></tr>";
    }).join("");

    sales.innerHTML =
      "<h3>Canlı satış simülasyonu · " + selectedCountry + "</h3>" +
      "<table><tr><th>Kalem</th><th>Değer</th></tr>" +
      shareLine +
      "<tr><td>Tesis satılabilir çiçek</td><td class=\"num\">" + fmt(projection.soldKg, 0) + " kg/yıl</td></tr>" +
      "<tr><td>Pazar büyüme varsayımı</td><td class=\"num\">" + pct(projection.growthPct) + "/yıl (Cannastream KPI)</td></tr>" +
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
      updated: feed ? feed.updated : null
    };

    const alerts = [];
    if (projection.sharePct != null) {
      if (projection.sharePct < 0.05) {
        alerts.push({ t: "warn", m: selectedCountry + " pazarında üretim payınız ~%" + fmt(projection.sharePct, 2) + " — kapasite pazar için çok küçük veya hedef pazar geniş." });
      } else if (projection.sharePct > 8) {
        alerts.push({ t: "warn", m: selectedCountry + " pazarında ~%" + fmt(projection.sharePct, 1) + " pay — agresif pazar payı; tedarik rekabeti ve regülasyon baskısı artar." });
      } else {
        alerts.push({ t: "ok", m: "Hedef pazar " + selectedCountry + ": ~%" + fmt(projection.sharePct, 2) + " çiçek payı · talep ~" + fmt(projection.demandKg, 0) + " kg/yıl (Cannastream KPI)." });
      }
    }
    if (c.outlook === "KAPALI PAZAR" || c.outlook === "YÜKSEK RİSK") {
      alerts.push({ t: "bad", m: c.outlook + ": " + selectedCountry + " için ihracat/satış modeli yüksek regülasyon riski taşır." });
    } else if (c.outlook === "MEVZUAT NETLEŞİYOR") {
      alerts.push({ t: "warn", m: selectedCountry + ": mevzuat netleşiyor — fiyat ve lisans varsayımlarını Cannastream regülasyon akışıyla güncel tutun." });
    }
    if (autoSync && c.prices) {
      alerts.push({ t: "ok", m: "Cannastream canlı fiyat: GACP " + eur(c.prices.gacpKg) + "/kg · GMP " + eur(c.prices.gmpKg) + "/kg · ekstrakt " + eur(c.prices.extractKg) + "/kg." });
    }
    m.marketAlerts = alerts;
    renderSalesPanel(projection);
  }

  function mergeMarketAlerts(m) {
    if (!m || !m.marketAlerts || !m.alerts) return;
    m.marketAlerts.forEach(function (a) {
      m.alerts.unshift(a);
    });
  }

  function updateSyncChip() {
    const chip = document.getElementById("marketSyncChip");
    if (!chip) return;
    chip.textContent = autoSync ? "Canlı fiyat: açık" : "Canlı fiyat: kapalı";
    chip.classList.toggle("on", autoSync);
  }

  function setSelectOptions() {
    const sel = document.getElementById("marketCountry");
    if (!sel || !feed) return;
    const names = countryNames();
    const stored = loadStoredCountry();
    sel.innerHTML = names.map(function (n) {
      return '<option value="' + n.replace(/"/g, "&quot;") + '">' + n + "</option>";
    }).join("");
    if (stored && names.indexOf(stored) >= 0) sel.value = stored;
    else if (names.indexOf("Almanya") >= 0) sel.value = "Almanya";
    selectedCountry = sel.value;
  }

  function onCountryChange() {
    const sel = document.getElementById("marketCountry");
    if (sel) selectedCountry = sel.value;
    storeCountry(selectedCountry);
    if (autoSync) applyMarketPrices(true);
    renderMarketPanel();
  }

  function bindPanelActions() {
    const presetBtn = document.getElementById("marketApplyPreset");
    if (presetBtn && !presetBtn._bound) {
      presetBtn._bound = true;
      presetBtn.addEventListener("click", function () {
        const key = presetBtn.getAttribute("data-preset") || "dengeli";
        if (typeof window.applyPreset === "function") window.applyPreset(key);
        if (autoSync) applyMarketPrices(true);
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
    const sel = document.getElementById("marketCountry");
    const syncBtn = document.getElementById("marketAutoSync");
    const refreshBtn = document.getElementById("marketRefreshBtn");

    if (sel && !sel._bound) {
      sel._bound = true;
      sel.addEventListener("change", onCountryChange);
    }
    if syncBtn && !syncBtn._bound) {
      syncBtn._bound = true;
      syncBtn.addEventListener("click", function () {
        autoSync = !autoSync;
        try { localStorage.setItem("tkts-market-autosync", autoSync ? "1" : "0"); } catch (e) {}
        syncBtn.textContent = autoSync ? "Canlı senkron: açık" : "Canlı senkron: kapalı";
        syncBtn.classList.toggle("on", autoSync);
        updateSyncChip();
        if (autoSync) applyMarketPrices(false);
      });
    }
    if (refreshBtn && !refreshBtn._bound) {
      refreshBtn._bound = true;
      refreshBtn.addEventListener("click", function () {
        loadFeed(true);
      });
    }
  }

  function scheduleRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    const mins = (feed && feed.refreshMinutes) || 15;
    refreshTimer = setInterval(function () { loadFeed(true); }, mins * 60 * 1000);
  }

  function loadFeed(isRefresh) {
    return fetch(feedUrl + "?v=" + CACHE_VERSION + "&t=" + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error("feed");
        return r.json();
      })
      .then(function (data) {
        feed = data;
        if (!selectedCountry) setSelectOptions();
        if (autoSync) applyMarketPrices(true);
        renderMarketPanel();
        bindMarketUi();
        scheduleRefresh();
        if (isRefresh && typeof window.render === "function") window.render();
      })
      .catch(function () {
        const box = document.getElementById("marketContext");
        if (box) {
          box.innerHTML = '<p class="hint">Cannastream verisi yüklenemedi. Yerel <code>data/market-feed.json</code> dosyasını kontrol edin veya export script çalıştırın.</p>';
        }
        bindMarketUi();
      });
  }

  function initMarketFeed() {
    try {
      autoSync = localStorage.getItem("tkts-market-autosync") !== "0";
    } catch (e) {}
    const syncBtn = document.getElementById("marketAutoSync");
    if (syncBtn) {
      syncBtn.textContent = autoSync ? "Canlı senkron: açık" : "Canlı senkron: kapalı";
      syncBtn.classList.toggle("on", autoSync);
    }
    bindMarketUi();
    updateSyncChip();
    loadFeed(false).then(function () {
      if (autoSync) applyMarketPrices(false);
    });
  }

  window.TKTS_market = {
    getFeed: function () { return feed; },
    getCountry: getCountry,
    getSelected: function () { return selectedCountry; },
    applyPrices: applyMarketPrices,
    enrichResult: enrichResult,
    mergeMarketAlerts: mergeMarketAlerts,
    refresh: function () { return loadFeed(true); },
    matchCultivars: matchCultivars
  };

  window.addEventListener("DOMContentLoaded", initMarketFeed);
})();
