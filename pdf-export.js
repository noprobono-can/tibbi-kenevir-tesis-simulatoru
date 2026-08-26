function activePresetKey() {
  const b = document.querySelector(".presets button.active");
  return (b && b.getAttribute("data-key")) || "ozel";
}

function fileStamp() {
  const d = new Date();
  function p(n) { return (n < 10 ? "0" : "") + n; }
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

function harvestWeeksLabel(row) {
  const xs = [];
  (row || []).forEach(function (c, w) { if (c === "harvest") xs.push("H" + (w + 1)); });
  return xs.length ? xs.join(", ") : "\u2014";
}

function wrapCanvasText(ctx, text, maxW) {
  const raw = String(text == null ? "" : text);
  if (!raw) return [""];
  const words = raw.split(/\s+/);
  const lines = [];
  let cur = "";
  words.forEach(function (w) {
    const next = cur ? (cur + " " + w) : w;
    if (ctx.measureText(next).width <= maxW) cur = next;
    else {
      if (cur) lines.push(cur);
      if (ctx.measureText(w).width <= maxW) cur = w;
      else {
        let chunk = "";
        for (let i = 0; i < w.length; i++) {
          const tryC = chunk + w[i];
          if (ctx.measureText(tryC).width <= maxW) chunk = tryC;
          else {
            if (chunk) lines.push(chunk);
            chunk = w[i];
          }
        }
        cur = chunk;
      }
    }
  });
  if (cur) lines.push(cur);
  return lines;
}

function loadPlanImage(m, s) {
  return new Promise(function (resolve) {
    try {
      const markup = buildConceptSvg(m, s, week);
      const wMatch = markup.match(/\bwidth="(\d+)"/);
      const hMatch = markup.match(/\bheight="(\d+)"/);
      const W = Math.max(800, wMatch ? +wMatch[1] : 1600);
      const H = Math.max(500, hMatch ? +hMatch[1] : 900);
      const img = new Image();
      img.onload = function () { resolve({ img: img, w: W, h: H }); };
      img.onerror = function () { resolve(null); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent("<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + markup);
    } catch (e) {
      resolve(null);
    }
  });
}

function canvasJpegBytes(canvas, q) {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (blob) {
      if (!blob) {
        reject(new Error("jpeg"));
        return;
      }
      blob.arrayBuffer().then(function (buf) {
        resolve(new Uint8Array(buf));
      }, reject);
    }, "image/jpeg", q == null ? 0.86 : q);
  });
}

function u8concat(arrs) {
  let n = 0;
  arrs.forEach(function (a) { n += a.length; });
  const out = new Uint8Array(n);
  let o = 0;
  arrs.forEach(function (a) { out.set(a, o); o += a.length; });
  return out;
}

function strU8(s) {
  return new TextEncoder().encode(s);
}

function makePdfFromJpegs(jpegs) {
  const pageW = 595.28;
  const pageH = 841.89;
  const parts = [];
  const xref = [0];
  let pos = 0;
  function emit(u8) {
    parts.push(u8);
    pos += u8.length;
  }
  function emitStr(s) { emit(strU8(s)); }
  emitStr("%PDF-1.4\n%\x80\x80\x80\x80\n");
  const nPages = jpegs.length;
  const pageIds = [];
  let nextId = 3;
  for (let i = 0; i < nPages; i++) {
    pageIds.push({ page: nextId, img: nextId + 1, cont: nextId + 2 });
    nextId += 3;
  }
  xref[1] = pos;
  emitStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const kids = pageIds.map(function (p) { return p.page + " 0 R"; }).join(" ");
  xref[2] = pos;
  emitStr("2 0 obj\n<< /Type /Pages /Count " + nPages + " /Kids [" + kids + "] >>\nendobj\n");
  for (let i = 0; i < nPages; i++) {
    const ids = pageIds[i];
    const jpg = jpegs[i];
    xref[ids.page] = pos;
    emitStr(ids.page + " 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pageW + " " + pageH + "] /Resources << /XObject << /Im0 " + ids.img + " 0 R >> >> /Contents " + ids.cont + " 0 R >>\nendobj\n");
    xref[ids.img] = pos;
    emitStr(ids.img + " 0 obj\n<< /Type /XObject /Subtype /Image /Width " + jpg.w + " /Height " + jpg.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpg.bytes.length + " >>\nstream\n");
    emit(jpg.bytes);
    emitStr("\nendstream\nendobj\n");
    const cont = "q " + pageW + " 0 0 " + pageH + " 0 0 cm /Im0 Do Q";
    xref[ids.cont] = pos;
    emitStr(ids.cont + " 0 obj\n<< /Length " + cont.length + " >>\nstream\n" + cont + "\nendstream\nendobj\n");
  }
  const xrefStart = pos;
  emitStr("xref\n0 " + nextId + "\n");
  emitStr("0000000000 65535 f \n");
  for (let i = 1; i < nextId; i++) {
    const off = String(xref[i] || 0);
    emitStr(("0000000000" + off).slice(-10) + " 00000 n \n");
  }
  emitStr("trailer\n<< /Size " + nextId + " /Root 1 0 R >>\nstartxref\n" + xrefStart + "\n%%EOF");
  return new Blob([u8concat(parts)], { type: "application/pdf" });
}

function downloadBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
}

function scenarioReportBlocks(m, s, plan) {
  const L = m.layout || {};
  const ex = m.extract || {};
  const ox = m.opex || {};
  const post = m.postDry || {};
  const tSp = m.trimSpec || {};
  const pSp = m.packSpec || {};
  const soldEx = ex.productKg != null ? ex.productKg : (ex.crudeKg || 0);
  const pay = Number.isFinite(m.payback) ? fmt(m.payback, 1) + " y\u0131l" : "\u2014";
  const blocks = [];

  blocks.push({
    type: "cover",
    title: "T\u0131bbi kenevir sim\u00fclat\u00f6r\u00fc",
    sub: "Senaryo \u00f6zeti \u00b7 indoor GACP + GMP",
    scenario: activePresetLabel(),
    date: new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" }),
    kpis: [
      { k: "Y\u0131ll\u0131k bitki", v: fmt(m.plantsYear), s: fmt(m.plantsInFlower) + " hasatta \u00b7 " + fmt(m.harvestsYear, 0) + " hasat" },
      { k: "Kuru \u00e7i\u00e7ek", v: fmt(m.kgYear, 0) + " kg", s: "sat\u0131lan " + fmt(m.kgFlowerSold, 0) + " kg \u00b7 distilat " + fmt(soldEx, 0) + " kg" },
      { k: "Has\u0131lat", v: eur(m.revenue), s: "Y3+ EU-GMP \u00b7 Y1\u20132 GACP " + eur(m.revenueGacp || 0) },
      { k: "CAPEX", v: eur(m.capex), s: "marj Y3+ " + eur(m.ebitda) + " \u00b7 geri \u00f6deme " + pay },
      { k: "Kapal\u0131 alan", v: m2(m.totalBuilt), s: "GACP " + m2(m.gacpM2) + " \u00b7 GMP " + m2(m.gmpM2) },
      { k: "Kadro", v: String(m.staffBase) + " FTE", s: "hasat g\u00fcn\u00fc " + m.harvestCrew + " \u00b7 " + (((m.staff && m.staff.roles) || []).length) + " g\u00f6rev" }
    ]
  });

  blocks.push({ type: "h2", t: "Tesis kapasitesi" });
  blocks.push({
    type: "kv",
    rows: [
      ["Senaryo", activePresetLabel()],
      ["\u00c7i\u00e7ek odas\u0131", String(s.flowerRooms)],
      ["Oda alan\u0131", m2(s.roomM2)],
      ["\u00c7i\u00e7ek alan\u0131", m2(s.flowerArea)],
      ["Ortalama bitki / m\u00B2", fmt(s.plantsPerM2, 1)],
      ["Hasat / oda / y\u0131l", fmt(s.harvestsPerRoom, 1)],
      ["Y\u0131ll\u0131k bitki", fmt(m.plantsYear)],
      ["Hasattaki bitki", fmt(m.plantsInFlower)],
      ["Tesis hasad\u0131 / y\u0131l", fmt(m.harvestsYear, 0)],
      ["Kurutma odas\u0131", s.dryRooms + " (ihtiya\u00e7 " + m.drySuggest + ")"],
      ["Kurutma kat\u0131", String(s.dryTiers || 3)],
      ["Trim alan\u0131", m2(L.trimM2) + " (ihtiya\u00e7 " + (post.trimNeed || 0) + ")"],
      ["Paket alan\u0131", m2(L.packM2) + " (ihtiya\u00e7 " + (post.packNeed || 0) + ")"],
      ["\u00dcretim seviyesi", skillLabel(s.yieldSkill) + " \u00b7 " + s.yieldG + " g"]
    ]
  });

  blocks.push({ type: "h2", t: "Proses s\u00fcreleri ve fiyat" });
  blocks.push({
    type: "kv",
    rows: [
      ["K\u00f6klendirme", s.rootDays + " g\u00fcn"],
      ["Pre-veg", s.preVegDays + " g\u00fcn"],
      ["Vejetatif", s.vegDays + " g\u00fcn"],
      ["\u00c7i\u00e7eklenme", s.flowerDays + " g\u00fcn (oda a\u011f\u0131rl\u0131kl\u0131 " + ((m.stats && m.stats.flowerDays) || s.flowerDays) + ")"],
      ["Kurutma", s.dryDays + " g\u00fcn"],
      ["Kurutma temizlik", s.dryCleanDays + " g\u00fcn"],
      ["\u00c7evrim", fmt(m.cycleDays) + " g\u00fcn"],
      ["Sat\u0131labilir oran", "%" + fmt(s.saleablePct * 100, 0)],
      ["Ekstraksiyon besleme", "%" + fmt((s.extractPct || 0) * 100, 0)],
      ["\u00c7i\u00e7ek GACP (y\u0131l 1\u20132)", eur(s.priceKgGacp != null ? s.priceKgGacp : 2500) + "/kg"],
      ["\u00c7i\u00e7ek EU-GMP (y\u0131l 3+)", eur(s.priceKgGmp != null ? s.priceKgGmp : 3500) + "/kg"],
      ["Ekstrakt sat\u0131\u015f", eur(s.extractPriceKg || 0) + "/kg"],
      ["Bitki ba\u015f\u0131 verim", fmt(m.yieldUse, 0) + " g (yo\u011funluk ayarl\u0131)"],
      ["Verim / m\u00B2", fmt(m.gM2Avg || 0, 0) + " g"]
    ]
  });

  const roomHead = ["Oda", "Genetik", "THC", "/m\u00B2", "Bitki", "Hasat", "kg/hasat", "kg/y\u0131l"];
  const roomBody = (m.roomModels || []).map(function (r, i) {
    const g = r.g || {};
    return [
      "\u00c7i\u00e7ek " + (i + 1),
      g.name || "\u2014",
      g.thc || "\u2014",
      fmt(r.dens, 1),
      fmt(r.plants, 0),
      fmt(r.harvests, 0),
      fmt(r.kgHarvest, 1),
      fmt(r.kgYear, 0)
    ];
  });
  blocks.push({ type: "h2", t: "\u00c7i\u00e7ek odalar\u0131" });
  blocks.push({ type: "table", head: roomHead, body: roomBody, cols: [0.11, 0.28, 0.12, 0.09, 0.1, 0.09, 0.11, 0.1] });

  if (plan) {
    blocks.push({ type: "h2", t: "Konsept yerle\u015fim (hafta " + (week + 1) + ")" });
    blocks.push({ type: "image", img: plan.img, w: plan.w, h: plan.h });
  }

  blocks.push({ type: "h2", t: "Yerle\u015fim alanlar\u0131" });
  blocks.push({
    type: "kv",
    rows: [
      ["Ana\u00e7 \u00fcretim", m2(m.motherProd)],
      ["Ana\u00e7 bankas\u0131", m2(m.motherBank)],
      ["\u00c7elik / k\u00f6klendirme", m2(L.cuttingsM2)],
      ["Pre-veg", m2(m.preVeg)],
      ["Veg", m2(m.veg)],
      ["\u00c7i\u00e7ek", m2(s.flowerArea)],
      ["Kurutma toplam", m2(L.dryArea) + " \u00b7 oda " + m2(L.dryRoomM2) + " \u00d7 " + (L.tiers || 3) + " kat"],
      ["As\u0131 e\u015fde\u011feri", m2(L.hangEq) + " (ihtiya\u00e7 " + m2(L.hangNeed) + ")"],
      ["Trim", m2(L.trimM2) + " \u00b7 " + (tSp.stations || 0) + " ist. \u00b7 " + (tSp.kgDay || 0) + " kg/g \u00b7 kasa " + (tSp.vaultKg || 0) + " kg"],
      ["Paket", m2(L.packM2) + " \u00b7 " + (pSp.stations || 0) + " ist. \u00b7 " + (pSp.kgDay || 0) + " kg/g \u00b7 kasa " + (pSp.vaultKg || 0) + " kg"],
      ["Ekstraksiyon oda", ex.m2 ? m2(ex.m2) : "yok"],
      ["Ofis / QMS", "36 m\u00B2"],
      ["Toplam kapal\u0131", m2(m.totalBuilt)]
    ]
  });

  blocks.push({ type: "h2", t: "Trim / paket kuyru\u011fu" });
  blocks.push({
    type: "kv",
    rows: [
      ["Y\u0131ll\u0131k kuru \u00e7i\u00e7ek (hat)", fmt(post.annualKg || 0, 0) + " kg"],
      ["Tepe hasat", fmt(post.maxBatchKg || 0, 0) + " kg"],
      ["Tepe trim kuyruk", fmt(post.peakTrimQ || 0, 0) + " kg"],
      ["Tepe paket kuyruk", fmt(post.peakPackQ || 0, 0) + " kg"],
      ["Kuru odada bekleme", (post.maxHold || 0) + " g\u00fcn"],
      ["Kasa a\u015fan hasat", String(post.tooBig || 0)],
      ["\u00d6nerilen trim / paket", (post.trimNeed || 0) + " / " + (post.packNeed || 0) + " m\u00B2"]
    ]
  });

  blocks.push({ type: "h2", t: "Ekstraksiyon (scCO2)" });
  if (ex.m2) {
    blocks.push({
      type: "kv",
      rows: [
        ["Hat", ex.tier || "\u2014"],
        ["Besleme", fmt(m.extractFeed || 0, 0) + " kg/y\u0131l \u00b7 " + fmt(ex.kgDay, 1) + " kg/g"],
        ["Anma", fmt(ex.ratedKgDay, 0) + " kg \u00e7i\u00e7ek/g \u00b7 Isolute " + fmt(ex.isoluteKgDay, 0) + " kg ya\u011f/g"],
        ["Ham ya\u011f", fmt(ex.crudeKg, 0) + " kg"],
        ["Sat\u0131lan distilat", fmt(soldEx, 0) + " kg"],
        ["Ekipman CAPEX", eur(ex.capexEq)],
        ["Oda CAPEX", eur(ex.capexRoom)],
        ["\u0130\u015fletme OPEX", eur(ex.opex)]
      ]
    });
  } else {
    blocks.push({ type: "para", t: "Bu senaryoda ekstraksiyon beslemesi kapal\u0131 (hat yok)." });
  }

  blocks.push({ type: "h2", t: "Ekonomi" });
  blocks.push({
    type: "kv",
    rows: [
      ["Indoor GACP CAPEX", eur(m.gacpCapex)],
      ["GMP CAPEX", eur(m.gmpCapex)],
      ["Ekstraksiyon ekipman", eur(ex.capexEq || 0)],
      ["Ekstraksiyon oda", eur(ex.capexRoom || 0)],
      ["Stabilite", eur(m.stability)],
      ["Ofis", eur(m.officeCapex || 0)],
      ["Toplam CAPEX", eur(m.capex)],
      ["Substrate", eur(ox.substrate || 0)],
      ["Su + g\u00fcbre + asit + otomasyon", eur(ox.waterFert || 0)],
      ["\u0130\u015f\u00e7ilik", eur(ox.labor || 0)],
      ["Malzeme", eur(ox.materials || 0)],
      ["Elektrik (ayd\u0131nlatma+HVAC)", eur(ox.energy || 0)],
      ["G&A / sigorta / COA / lisans", eur(ox.ga || 0)],
      ["Ekstraksiyon i\u015fletme", eur(ox.extract || 0)],
      ["Toplam OPEX", eur(m.opexYear)],
      ["OPEX / g sat\u0131labilir", fmt(m.opexPerG, 2) + " \u20AC"],
      ["\u00c7i\u00e7ek has\u0131lat\u0131 GACP (Y1\u20132)", eur(m.flowerRevenueGacp || 0)],
      ["\u00c7i\u00e7ek has\u0131lat\u0131 EU-GMP (Y3+)", eur(m.flowerRevenueGmp || 0)],
      ["Ekstrakt has\u0131lat\u0131", eur(m.extractRevenue || 0)],
      ["Has\u0131lat / marj Y1\u20132", eur(m.revenueGacp || 0) + " / " + eur(m.ebitdaGacp || 0)],
      ["Has\u0131lat / marj Y3+", eur(m.revenueGmp || 0) + " / " + eur(m.ebitdaGmp || 0)],
      ["Toplam has\u0131lat (olgun Y3+)", eur(m.revenue)],
      ["Marj olgun (has\u0131lat \u2212 OPEX)", eur(m.ebitda)],
      ["Geri \u00f6deme (GACP\u2192GMP rampa)", pay]
    ]
  });

  blocks.push({ type: "h2", t: "Operasyon" });
  blocks.push({
    type: "kv",
    rows: [
      ["Kullan\u0131labilir \u00e7i\u00e7ek", m2(m.usableFlower)],
      ["Yo\u011funluk (model)", fmt(m.density, 1) + "/m\u00B2"],
      ["Clone / hafta", fmt(ox.clonesWeek || 0, 0)],
      ["Trim saat / y\u0131l", fmt(ox.trimH || 0, 0)],
      ["Paket saat / y\u0131l", fmt(ox.packH || 0, 0)],
      ["Taban kadro", String(m.staffBase) + " FTE"],
      ["Hasat g\u00fcn\u00fc kadro", String(m.harvestCrew) + " ki\u015fi"]
    ]
  });

  blocks.push({ type: "h2", t: "Personel g\u00f6revleri" });
  blocks.push({
    type: "kv",
    rows: ((m.staff && m.staff.roles) || []).map(function (r) {
      return [
        r.role + (r.peak ? " (tepe)" : "") + " \u00b7 " + r.fte + " FTE",
        r.zone + " \u2014 " + r.tasks
      ];
    }).concat([["Not", (m.staff && m.staff.note) || "\u2014"]])
  });

  const calLines = (m.cal && m.cal.rooms ? m.cal.rooms : []).map(function (row, i) {
    const g = m.cal.roomCultivars && m.cal.roomCultivars[i];
    const nm = g ? g.name.split(" ")[0] : "";
    return "\u00c7i\u00e7ek " + (i + 1) + (nm ? (" \u00b7 " + nm) : "") + ": " + harvestWeeksLabel(row);
  });
  blocks.push({ type: "h2", t: "Hasat takvimi (52 hafta)" });
  calLines.forEach(function (line) { blocks.push({ type: "para", t: line }); });

  const trimBusy = (m.cal.trimWeeks || []).filter(function (c) { return c === "trim"; }).length;
  const packBusy = (m.cal.packWeeks || []).filter(function (c) { return c === "pack"; }).length;
  const holdBusy = (m.cal.trimWeeks || []).filter(function (c) { return c === "hold"; }).length;
  blocks.push({
    type: "para",
    t: "Trim me\u015fgul " + trimBusy + " hafta \u00b7 paket " + packBusy + " hafta \u00b7 kuru bekleme " + holdBusy + " hafta."
  });

  blocks.push({ type: "h2", t: "Uyar\u0131lar ve model notlar\u0131" });
  (m.alerts || []).forEach(function (a) {
    blocks.push({ type: "alert", t: a.t, m: a.m });
  });
  blocks.push({
    type: "para",
    t: "Indikatif model. Enerji (LED+HVAC) ve G&A/sigorta/COA/lisans dahildir. CAPEX/OPEX yat\u0131r\u0131m tavsiyesi de\u011fildir."
  });
  return blocks;
}

function paintReportPages(blocks) {
  const W = 1240;
  const H = 1754;
  const M = 56;
  const PAPER = "#f4efe3";
  const INK = "#1c1914";
  const MUTED = "#6a6458";
  const GOLD = "#8d7040";
  const LINE = "#d4cbb8";
  const CARD = "#fffdf8";
  const pages = [];
  let canvas = null;
  let ctx = null;
  let y = 0;
  let pageNo = 0;
  const totalHolder = { n: 1 };

  function footer() {
    ctx.fillStyle = GOLD;
    ctx.fillRect(M, H - 36, W - M * 2, 1);
    ctx.fillStyle = MUTED;
    ctx.font = "11px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("T\u0131bbi kenevir sim\u00fclat\u00f6r\u00fc \u00b7 senaryo \u00f6zeti", M, H - 18);
    ctx.textAlign = "right";
    ctx.fillText(String(pageNo) + " / " + totalHolder.n, W - M, H - 18);
    ctx.textAlign = "left";
  }

  function newPage() {
    if (canvas) {
      footer();
      pages.push(canvas);
    }
    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, W, 8);
    pageNo += 1;
    y = M + 8;
  }

  function ensure(h) {
    if (y + h > H - 52) newPage();
  }

  newPage();

  blocks.forEach(function (b) {
    if (b.type === "cover") {
      ctx.fillStyle = INK;
      ctx.font = "600 28px Segoe UI, Arial, sans-serif";
      ctx.fillText(b.title, M, y + 28);
      y += 40;
      ctx.fillStyle = GOLD;
      ctx.font = "15px Segoe UI, Arial, sans-serif";
      ctx.fillText(b.sub, M, y + 16);
      y += 36;
      ctx.fillStyle = CARD;
      roundRect(ctx, M, y, W - M * 2, 54, 10);
      ctx.fill();
      ctx.strokeStyle = LINE;
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = "600 16px Segoe UI, Arial, sans-serif";
      ctx.fillText(b.scenario, M + 16, y + 24);
      ctx.fillStyle = MUTED;
      ctx.font = "13px Segoe UI, Arial, sans-serif";
      ctx.fillText(b.date, M + 16, y + 44);
      y += 74;
      const gap = 14;
      const cw = (W - M * 2 - gap * 2) / 3;
      const ch = 92;
      b.kpis.forEach(function (k, i) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        if (col === 0) ensure(ch + 16);
        const x = M + col * (cw + gap);
        const yy = y + row * (ch + gap);
        ctx.fillStyle = CARD;
        roundRect(ctx, x, yy, cw, ch, 10);
        ctx.fill();
        ctx.strokeStyle = LINE;
        ctx.stroke();
        ctx.fillStyle = MUTED;
        ctx.font = "11px Segoe UI, Arial, sans-serif";
        ctx.fillText(k.k, x + 14, yy + 22);
        ctx.fillStyle = INK;
        ctx.font = "600 20px Segoe UI, Arial, sans-serif";
        ctx.fillText(k.v, x + 14, yy + 48);
        ctx.fillStyle = MUTED;
        ctx.font = "11px Segoe UI, Arial, sans-serif";
        const sub = wrapCanvasText(ctx, k.s, cw - 28)[0];
        ctx.fillText(sub, x + 14, yy + 70);
      });
      y += Math.ceil(b.kpis.length / 3) * (ch + gap) + 8;
      return;
    }
    if (b.type === "h2") {
      ensure(48);
      y += 8;
      ctx.fillStyle = GOLD;
      ctx.fillRect(M, y, 18, 3);
      ctx.fillStyle = INK;
      ctx.font = "600 16px Segoe UI, Arial, sans-serif";
      ctx.fillText(b.t, M + 26, y + 8);
      y += 28;
      return;
    }
    if (b.type === "para") {
      ctx.font = "13px Segoe UI, Arial, sans-serif";
      const lines = wrapCanvasText(ctx, b.t, W - M * 2);
      ensure(lines.length * 18 + 8);
      ctx.fillStyle = INK;
      lines.forEach(function (ln) {
        ctx.fillText(ln, M, y + 12);
        y += 18;
      });
      y += 4;
      return;
    }
    if (b.type === "alert") {
      ctx.font = "12.5px Segoe UI, Arial, sans-serif";
      const tag = b.t === "bad" ? "KR\u0130T\u0130K" : (b.t === "warn" ? "UYARI" : "NOT");
      const col = b.t === "bad" ? "#9a3d3d" : (b.t === "warn" ? "#8a6a28" : "#3d6b42");
      const lines = wrapCanvasText(ctx, tag + "  " + b.m, W - M * 2 - 24);
      const h = lines.length * 17 + 16;
      ensure(h + 8);
      ctx.fillStyle = CARD;
      roundRect(ctx, M, y, W - M * 2, h, 8);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.stroke();
      ctx.fillStyle = INK;
      lines.forEach(function (ln, i) {
        if (i === 0) {
          ctx.fillStyle = col;
          ctx.font = "600 12.5px Segoe UI, Arial, sans-serif";
        } else {
          ctx.fillStyle = INK;
          ctx.font = "12.5px Segoe UI, Arial, sans-serif";
        }
        ctx.fillText(ln, M + 12, y + 18 + i * 17);
      });
      y += h + 8;
      return;
    }
    if (b.type === "kv") {
      const colW = (W - M * 2 - 24) / 2;
      const rowH = 28;
      for (let i = 0; i < b.rows.length; i += 2) {
        ensure(rowH + 2);
        paintKv(ctx, M, y, colW, b.rows[i]);
        if (b.rows[i + 1]) paintKv(ctx, M + colW + 24, y, colW, b.rows[i + 1]);
        y += rowH;
      }
      y += 8;
      return;
    }
    if (b.type === "table") {
      const inner = W - M * 2;
      const cols = b.cols || b.head.map(function () { return 1 / b.head.length; });
      const widths = cols.map(function (c) { return inner * c; });
      ctx.font = "600 11px Segoe UI, Arial, sans-serif";
      ensure(32);
      ctx.fillStyle = "#ebe4d4";
      ctx.fillRect(M, y, inner, 28);
      ctx.fillStyle = MUTED;
      let x = M;
      b.head.forEach(function (h, i) {
        ctx.fillText(h, x + 8, y + 18);
        x += widths[i];
      });
      y += 28;
      b.body.forEach(function (row, ri) {
        ensure(26);
        ctx.fillStyle = ri % 2 ? "#faf6ee" : CARD;
        ctx.fillRect(M, y, inner, 24);
        ctx.fillStyle = INK;
        ctx.font = "12px Segoe UI, Arial, sans-serif";
        x = M;
        row.forEach(function (cell, i) {
          const t = String(cell);
          let out = t;
          while (out.length > 3 && ctx.measureText(out).width > widths[i] - 12) out = out.slice(0, -2);
          if (out !== t) out = out.slice(0, -1) + "\u2026";
          ctx.fillText(out, x + 8, y + 16);
          x += widths[i];
        });
        y += 24;
      });
      y += 10;
      return;
    }
    if (b.type === "image" && b.img) {
      const maxW = W - M * 2;
      const maxH = 620;
      const sc = Math.min(maxW / b.w, maxH / b.h, 1);
      const dw = b.w * sc;
      const dh = b.h * sc;
      ensure(dh + 12);
      ctx.fillStyle = "#101714";
      ctx.fillRect(M, y, dw, dh);
      ctx.drawImage(b.img, M, y, dw, dh);
      y += dh + 16;
    }
  });

  footer();
  pages.push(canvas);
  totalHolder.n = pages.length;
  pages.forEach(function (pg, i) {
    const c = pg.getContext("2d");
    c.fillStyle = "#f4efe3";
    c.fillRect(W - M - 80, H - 34, 80, 20);
    c.fillStyle = MUTED;
    c.font = "11px Segoe UI, Arial, sans-serif";
    c.textAlign = "right";
    c.fillText(String(i + 1) + " / " + pages.length, W - M, H - 18);
    c.textAlign = "left";
  });
  return pages;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function paintKv(ctx, x, y, w, pair) {
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(x, y, w, 26);
  ctx.fillStyle = "#6a6458";
  ctx.font = "11px Segoe UI, Arial, sans-serif";
  ctx.fillText(pair[0], x + 8, y + 17);
  ctx.fillStyle = "#1c1914";
  ctx.font = "600 12px Segoe UI, Arial, sans-serif";
  const val = String(pair[1]);
  let out = val;
  const max = w - 16;
  ctx.textAlign = "right";
  while (out.length > 3 && ctx.measureText(out).width > max * 0.55) out = out.slice(0, -2);
  if (out !== val) out = out.slice(0, -1) + "\u2026";
  ctx.fillText(out, x + w - 8, y + 17);
  ctx.textAlign = "left";
}

function exportScenarioPdf() {
  const s = lastS || readState();
  const m = lastM || simulate(s);
  const name = "tesis-senaryo-ozeti-" + activePresetKey() + "-" + fileStamp() + ".pdf";
  const btn = el("pdfBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "PDF haz\u0131rlan\u0131yor\u2026";
  }
  return loadPlanImage(m, s).then(function (plan) {
    const blocks = scenarioReportBlocks(m, s, plan);
    const pages = paintReportPages(blocks);
    return Promise.all(pages.map(function (c) { return canvasJpegBytes(c, 0.88); })).then(function (bytesList) {
      const jpegs = bytesList.map(function (bytes, i) {
        return { w: pages[i].width, h: pages[i].height, bytes: bytes };
      });
      const blob = makePdfFromJpegs(jpegs);
      downloadBlob(blob, name);
      window.lastPdfMeta = { pages: pages.length, bytes: blob.size, name: name };
      return window.lastPdfMeta;
    });
  }).catch(function () {
    exportScenarioPdfPrint(m, s);
  }).then(function (meta) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Senaryo \u00f6zeti (PDF)";
    }
    return meta;
  });
}

function exportScenarioPdfPrint(m, s) {
  const blocks = scenarioReportBlocks(m, s, null);
  const w = window.open("", "_blank");
  if (!w) return;
  let html = "<!DOCTYPE html><html lang=\"tr\"><head><meta charset=\"utf-8\"/><title>Senaryo \u00f6zeti</title>";
  html += "<style>body{font-family:Segoe UI,Arial,sans-serif;color:#1c1914;max-width:820px;margin:24px auto;padding:0 20px}h1{font-size:22px}h2{font-size:15px;border-bottom:1px solid #d4cbb8;padding-bottom:6px}table{width:100%;border-collapse:collapse;font-size:12px}td,th{border-bottom:1px solid #eee;padding:6px 4px;text-align:left}th{color:#6a6458}@media print{@page{size:A4;margin:14mm}}</style></head><body>";
  html += "<h1>T\u0131bbi kenevir sim\u00fclat\u00f6r\u00fc \u2014 senaryo \u00f6zeti</h1>";
  html += "<p>" + xmlEsc(activePresetLabel()) + " \u00b7 " + xmlEsc(new Date().toLocaleDateString("tr-TR")) + "</p>";
  blocks.forEach(function (b) {
    if (b.type === "h2") html += "<h2>" + xmlEsc(b.t) + "</h2>";
    else if (b.type === "para") html += "<p>" + xmlEsc(b.t) + "</p>";
    else if (b.type === "alert") html += "<p><strong>" + xmlEsc(b.t) + "</strong> " + xmlEsc(b.m) + "</p>";
    else if (b.type === "kv") {
      html += "<table>";
      b.rows.forEach(function (r) { html += "<tr><th>" + xmlEsc(r[0]) + "</th><td>" + xmlEsc(r[1]) + "</td></tr>"; });
      html += "</table>";
    } else if (b.type === "table") {
      html += "<table><tr>" + b.head.map(function (h) { return "<th>" + xmlEsc(h) + "</th>"; }).join("") + "</tr>";
      b.body.forEach(function (row) {
        html += "<tr>" + row.map(function (c) { return "<td>" + xmlEsc(c) + "</td>"; }).join("") + "</tr>";
      });
      html += "</table>";
    } else if (b.type === "cover") {
      html += "<p><strong>" + xmlEsc(b.scenario) + "</strong></p>";
    }
  });
  html += "</body></html>";
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(function () { w.print(); }, 300);
}

window.addEventListener("DOMContentLoaded", function () {
  if (el("pdfBtn")) el("pdfBtn").addEventListener("click", function () { exportScenarioPdf(); });
});
