const PRESETS = {
  pilot: {
    flowerArea: 180, plantsInFlower: 540, dryRooms: 1, flowerRooms: 3,
    harvestDays: 21, flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 160, genetics: 3, extraIndoor: 0, extraction: false
  },
  dengeli: {
    flowerArea: 280, plantsInFlower: 1070, dryRooms: 2, flowerRooms: 4,
    harvestDays: 21, flowerDays: 56, vegDays: 24, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 180, genetics: 4, extraIndoor: 0, extraction: true
  },
  yuksek: {
    flowerArea: 640, plantsInFlower: 2720, dryRooms: 2, flowerRooms: 8,
    harvestDays: 14, flowerDays: 56, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 170, genetics: 4, extraIndoor: 0, extraction: true
  },
  faz2: {
    flowerArea: 840, plantsInFlower: 3210, dryRooms: 3, flowerRooms: 12,
    harvestDays: 14, flowerDays: 56, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 170, genetics: 5, extraIndoor: 400, extraction: true
  }
};

const el = (id) => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d, minimumFractionDigits: d });
const eur = (n) => "€" + fmt(n, 0);

function suggestedDryRooms(flowerRooms) {
  if (flowerRooms <= 3) return 1;
  if (flowerRooms <= 9) return 2;
  return 1 + Math.ceil((flowerRooms - 3) / 6);
}

function readState() {
  const flowerRooms = Math.max(1, +el("flowerRooms").value);
  const flowerArea = Math.max(10, +el("flowerArea").value);
  return {
    flowerArea: flowerArea,
    plantsInFlower: Math.max(flowerRooms, +el("plantsInFlower").value),
    dryRooms: Math.max(1, +el("dryRooms").value),
    flowerRooms: flowerRooms,
    harvestDays: +el("harvestDays").value,
    flowerDays: +el("flowerDays").value,
    vegDays: +el("vegDays").value,
    preVegDays: +el("preVegDays").value,
    rootDays: +el("rootDays").value,
    dryDays: +el("dryDays").value,
    yieldG: +el("yieldG").value,
    genetics: +el("genetics").value,
    extraIndoor: +el("extraIndoor").value,
    priceKg: +el("priceKg").value,
    extraction: el("extraction").checked,
    usable: 0.85
  };
}

function applyPreset(key) {
  const p = PRESETS[key];
  Object.entries(p).forEach(([k, v]) => {
    if (k === "extraction") el("extraction").checked = v;
    else if (el(k)) el(k).value = v;
  });
  document.querySelectorAll(".presets button").forEach((b) => b.classList.toggle("active", b.dataset.key === key));
  week = 0;
  render();
}

function buildCalendar(s) {
  const weeks = 52;
  const flowerW = Math.max(1, Math.round(s.flowerDays / 7));
  const dryW = Math.max(1, Math.round(s.dryDays / 7));
  const staggerW = Math.max(1, s.harvestDays / 7);
  const periodW = Math.max(flowerW, staggerW * s.flowerRooms);
  const rooms = [];
  for (let r = 0; r < s.flowerRooms; r++) {
    const row = Array(weeks).fill("empty");
    const offset = r * staggerW;
    for (let start = offset; start < weeks; start += periodW) {
      const s0 = Math.round(start);
      for (let w = 0; w < flowerW && s0 + w < weeks; w++) row[s0 + w] = "flower";
      const h = s0 + flowerW - 1;
      if (h < weeks) row[h] = "harvest";
    }
    rooms.push(row);
  }
  const dryLoad = Array(weeks).fill(0);
  rooms.forEach((row) => {
    row.forEach((v, w) => {
      if (v === "harvest") {
        for (let d = 0; d < dryW && w + d < weeks; d++) dryLoad[w + d] += 1;
      }
    });
  });
  const dryRow = dryLoad.map((n) => (n ? "dry" : "idle"));
  return {
    rooms: rooms,
    dryRow: dryRow,
    dryLoad: dryLoad,
    peakDry: Math.max(0, ...dryLoad),
    gmpIdleWeeks: dryRow.filter((x) => x === "idle").length
  };
}

function simulate(s) {
  const roomM2 = s.flowerArea / s.flowerRooms;
  const usableFlower = s.flowerArea * s.usable;
  const plantsPerRoom = Math.round(s.plantsInFlower / s.flowerRooms);
  const density = usableFlower > 0 ? s.plantsInFlower / usableFlower : 0;
  const turnaround = 7;
  const cycleFlower = s.flowerDays + turnaround;
  const cyclesPerRoom = 365 / cycleFlower;
  const packedPlantsYear = Math.round(s.plantsInFlower * cyclesPerRoom);
  const naturalHarvestDays = Math.round(cycleFlower / s.flowerRooms);
  const requiredRooms = Math.ceil(s.flowerDays / s.harvestDays);
  const staggerOk = s.flowerRooms >= requiredRooms;
  const harvestsYear = Math.round(365 / s.harvestDays);
  const scheduledPlantsYear = Math.round(harvestsYear * plantsPerRoom);
  const roomsIdle = s.harvestDays > naturalHarvestDays + 2;
  const plantsYear = staggerOk ? Math.min(packedPlantsYear, scheduledPlantsYear) : packedPlantsYear;
  const kgYear = plantsYear * s.yieldG / 1000;
  const revenue = kgYear * s.priceKg;

  const motherProd = 18, motherBank = 12, quarantine = 4, tissue = 8, cuttings = 16;
  const preVeg = Math.max(20, Math.round(plantsPerRoom * 0.05));
  const veg = Math.max(28, Math.round(plantsPerRoom * 0.12));
  const extra = s.extraIndoor;
  const gacpM2 = motherProd + motherBank + quarantine + tissue + cuttings + preVeg + veg + s.flowerArea + 40 + extra;
  const dryM2 = s.dryRooms * 28;
  const extractM2 = s.extraction ? 24 : 0;
  const gmpM2 = dryM2 + 24 + 20 + 30;
  const officeM2 = 36;
  const totalBuilt = gacpM2 + gmpM2 + officeM2 + extractM2;

  const lightCapex = preVeg * 220 + veg * 380 + s.flowerArea * 480;
  const gacpCapex = gacpM2 * 2800 + lightCapex;
  const gmpCapex = gmpM2 * 5600;
  const extractCapex = s.extraction ? 120000 : 0;
  const stability = s.genetics * 8000;
  const capex = gacpCapex + gmpCapex + officeM2 * 1400 + extractCapex + stability;
  const staffBase = 4 + Math.ceil(s.flowerArea / 120);
  const harvestCrew = staffBase + Math.ceil(plantsPerRoom / 80);
  const opexYear = staffBase * 28000 + s.flowerArea * 380 + (s.extraction ? 18000 : 0) + 24000;
  const ebitda = revenue - opexYear;
  const payback = ebitda > 0 ? capex / ebitda : Infinity;
  const cal = buildCalendar(s);
  const cycleDays = s.rootDays + s.preVegDays + s.vegDays + s.flowerDays;
  const drySuggest = suggestedDryRooms(s.flowerRooms);

  const alerts = [];
  if (roomsIdle) {
    alerts.push({ t: "warn", m: "Hasat her " + s.harvestDays + " gün — odalar doğal aralıktan (" + naturalHarvestDays + " gün) yavaş dönüyor." });
  }
  if (scheduledPlantsYear < packedPlantsYear && staggerOk) {
    alerts.push({ t: "warn", m: "Takvim çıktısı " + fmt(scheduledPlantsYear) + " bitki; dolu oda kapasitesi " + fmt(packedPlantsYear) + "." });
  }
  if (!staggerOk) {
    alerts.push({ t: "bad", m: s.harvestDays + " günde bir hasat için en az " + requiredRooms + " çiçek odası gerekir." });
  }
  if (cal.peakDry > s.dryRooms) {
    alerts.push({ t: "bad", m: "Kurutma yetersiz: tepe yük " + cal.peakDry + " oda, seçilen " + s.dryRooms + "." });
  } else if (s.dryRooms > drySuggest + 1) {
    alerts.push({ t: "warn", m: "Kurutma odası (" + s.dryRooms + ") önerilenin (" + drySuggest + ") üzerinde — GMP maliyeti artar." });
  } else {
    alerts.push({ t: "ok", m: "Kurutma: " + s.dryRooms + " oda · tepe eşzamanlı yük " + cal.peakDry + "." });
  }
  if (density > 10) {
    alerts.push({ t: "warn", m: "Yoğunluk " + fmt(density, 1) + " bitki/m² — indoor için yüksek." });
  }
  if (cal.gmpIdleWeeks > 8) {
    alerts.push({ t: "warn", m: "GMP kurutma " + cal.gmpIdleWeeks + " hafta boş kalıyor." });
  }

  return {
    roomM2: roomM2, usableFlower: usableFlower, plantsPerRoom: plantsPerRoom, density: density,
    plantsYear: plantsYear, kgYear: kgYear, revenue: revenue, requiredRooms: requiredRooms,
    staggerOk: staggerOk, gacpM2: gacpM2, gmpM2: gmpM2, totalBuilt: totalBuilt, drySuggest: drySuggest,
    preVeg: preVeg, veg: veg, motherProd: motherProd, motherBank: motherBank, capex: capex,
    gacpCapex: gacpCapex, gmpCapex: gmpCapex, extractCapex: extractCapex, stability: stability,
    opexYear: opexYear, ebitda: ebitda, payback: payback, staffBase: staffBase, harvestCrew: harvestCrew,
    cycleDays: cycleDays, cyclesPerRoom: cyclesPerRoom, harvestsYear: harvestsYear,
    naturalHarvestDays: naturalHarvestDays, cal: cal, extra: extra
  };
}

function renderKpis(m, s) {
  const items = [
    ["Çiçekte bitki", fmt(s.plantsInFlower), fmt(m.plantsPerRoom) + " / oda · " + fmt(m.density, 1) + " /m²", ""],
    ["Çiçek alanı", fmt(s.flowerArea, 0) + " m²", fmt(m.roomM2, 0) + " m² / indoor oda", ""],
    ["Kurutma", String(s.dryRooms), "tepe yük " + m.cal.peakDry + " · öneri " + m.drySuggest, m.cal.peakDry > s.dryRooms ? "warn" : ""],
    ["Kuru çiçek", fmt(m.kgYear, 0) + " kg", fmt(s.yieldG) + " g/bitki · " + fmt(m.plantsYear) + " / yıl", ""],
    ["Hasılat", eur(m.revenue), eur(s.priceKg) + "/kg", ""],
    ["CAPEX", eur(m.capex), "geri ödeme " + (Number.isFinite(m.payback) ? fmt(m.payback, 1) + " yıl" : "\u2014"), m.payback < 5 ? "good" : m.payback < 8 ? "warn" : ""]
  ];
  el("kpis").innerHTML = items.map(([label, value, sub, cls]) =>
    "<article class=\"kpi " + cls + "\"><div class=\"label\">" + label + "</div><div class=\"value\">" + value + "</div><div class=\"sub\">" + sub + "</div></article>"
  ).join("");
}

function renderPlan(m, s, currentWeek) {
  const W = 1180, H = 560;
  const gap = 8;
  const flowerW = Math.min(150, 720 / s.flowerRooms - gap);
  const rooms = [];
  for (let i = 0; i < s.flowerRooms; i++) {
    const st = m.cal.rooms[i] ? m.cal.rooms[i][currentWeek] : "empty";
    rooms.push({
      id: "Çiçek " + (i + 1),
      x: 40 + i * (flowerW + gap),
      y: 330, w: flowerW, h: 150, tag: fmt(m.roomM2, 0) + " m²",
      fill: st === "harvest" ? "#d4c49a" : st === "flower" ? "#d4783a" : "#3a2c24"
    });
  }
  const gmpDry = [];
  for (let i = 0; i < s.dryRooms; i++) {
    const busy = (m.cal.dryLoad[currentWeek] || 0) > i;
    gmpDry.push({ id: "Kurutma " + (i + 1), x: 640 + i * 118, y: 48, w: 108, h: 90, fill: busy ? "#5b8aa8" : "#243038", tag: "GMP" });
  }
  const blocks = [
    { id: "Ofis / QMS", x: 40, y: 48, w: 130, h: 90, fill: "#c9b56a", tag: "İdare" },
    { id: "GACP giriş", x: 180, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Akış" },
    { id: "GMP giriş", x: 258, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Akış" },
    { id: "Trim", x: 360, y: 48, w: 120, h: 90, fill: "#4d738a", tag: "GMP" },
    { id: "Paket", x: 488, y: 48, w: 100, h: 90, fill: "#4d738a", tag: "GMP" }
  ].concat(gmpDry).concat([
    { id: "Anaç üretim", x: 40, y: 168, w: 120, h: 120, fill: "#6f9e62", tag: "GACP" },
    { id: "Anaç bankası", x: 168, y: 168, w: 100, h: 56, fill: "#587c4e", tag: "GACP" },
    { id: "Karantina", x: 168, y: 232, w: 48, h: 56, fill: "#8b6bb0", tag: "R&D" },
    { id: "Doku kült.", x: 220, y: 232, w: 48, h: 56, fill: "#8b6bb0", tag: "R&D" },
    { id: "Çelik", x: 276, y: 168, w: 110, h: 120, fill: "#7aa56e", tag: "GACP" },
    { id: "Pre-veg", x: 394, y: 168, w: 120, h: 120, fill: "#88b57a", tag: m.preVeg + " m²" },
    { id: "Veg", x: 522, y: 168, w: 150, h: 120, fill: "#88b57a", tag: m.veg + " m²" },
    { id: s.extraction ? "Ekstraksiyon" : "Trim atık", x: 980, y: 168, w: 150, h: 120, fill: s.extraction ? "#8b6bb0" : "#2a332e", tag: s.extraction ? "pilot" : "\u2014" }
  ]).concat(rooms);
  if (s.extraIndoor > 0) {
    blocks.push({ id: "Yedek indoor +" + s.extraIndoor + " m²", x: 40, y: 500, w: 420, h: 40, fill: "#2f4a34", tag: "modül" });
  }
  const svg = blocks.map((b) =>
    "<g class=\"room\"><rect class=\"hit\" x=\"" + b.x + "\" y=\"" + b.y + "\" width=\"" + b.w + "\" height=\"" + b.h + "\" rx=\"10\" fill=\"" + b.fill + "\" opacity=\"0.92\"/>" +
    "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 22) + "\" fill=\"#0c1210\" font-size=\"12\" font-weight=\"600\">" + b.id + "</text>" +
    "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 40) + "\" fill=\"#0c1210\" font-size=\"11\" opacity=\"0.75\">" + b.tag + "</text></g>"
  ).join("");
  el("plan").innerHTML =
    "<svg class=\"plan\" viewBox=\"0 0 " + W + " " + H + "\" xmlns=\"http://www.w3.org/2000/svg\">" +
    "<rect x=\"16\" y=\"16\" width=\"" + (W - 32) + "\" height=\"" + (H - 32) + "\" rx=\"18\" fill=\"#101714\" stroke=\"rgba(212,196,154,0.2)\"/>" +
    "<text x=\"40\" y=\"40\" fill=\"#d4c49a\" font-size=\"12\" letter-spacing=\"2\">INDOOR YERLEŞİM · HAFTA " + (currentWeek + 1) + "</text>" +
    svg + "</svg>";
}

function renderCalendar(m) {
  const cell = function (w, cls, title) {
    const on = w === week ? " outline:1px solid #d4c49a;" : "";
    return "<div class=\"cell " + cls + "\" style=\"" + on + "\" title=\"" + title + "\"></div>";
  };
  const head = "<div class=\"week-row\"><b></b>" + Array.from({ length: 52 }, function (_, i) { return cell(i, "", "H" + (i + 1)); }).join("") + "</div>";
  const rows = m.cal.rooms.map(function (row, i) {
    return "<div class=\"week-row\"><b>Çiçek " + (i + 1) + "</b>" + row.map(function (c, w) { return cell(w, c, "H" + (w + 1) + " " + c); }).join("") + "</div>";
  }).join("");
  const dry = "<div class=\"week-row\"><b>Kurutma</b>" + m.cal.dryRow.map(function (c, w) { return cell(w, c, "H" + (w + 1) + " yük " + m.cal.dryLoad[w]); }).join("") + "</div>";
  el("calendar").innerHTML = "<div class=\"cal-grid\">" + head + rows + dry + "</div>";
}

function renderTables(m, s) {
  el("econ").innerHTML =
    "<table><tr><th>Kalem</th><th></th></tr>" +
    "<tr><td>Indoor GACP</td><td class=\"num\">" + eur(m.gacpCapex) + "</td></tr>" +
    "<tr><td>GMP</td><td class=\"num\">" + eur(m.gmpCapex) + "</td></tr>" +
    "<tr><td>Pilot ekstraksiyon</td><td class=\"num\">" + eur(m.extractCapex) + "</td></tr>" +
    "<tr><td>Stabilite</td><td class=\"num\">" + eur(m.stability) + "</td></tr>" +
    "<tr><td><strong>Toplam CAPEX</strong></td><td class=\"num\"><strong>" + eur(m.capex) + "</strong></td></tr>" +
    "<tr><td>Yıllık OPEX (taslak)</td><td class=\"num\">" + eur(m.opexYear) + "</td></tr>" +
    "<tr><td>Hasılat</td><td class=\"num\">" + eur(m.revenue) + "</td></tr>" +
    "<tr><td>EBITDA</td><td class=\"num\">" + eur(m.ebitda) + "</td></tr></table>";

  el("ops").innerHTML =
    "<table><tr><th>Operasyon</th><th></th></tr>" +
    "<tr><td>Oda alanı</td><td class=\"num\">" + fmt(m.roomM2, 0) + " m²</td></tr>" +
    "<tr><td>Bitki / oda</td><td class=\"num\">" + fmt(m.plantsPerRoom) + "</td></tr>" +
    "<tr><td>Yoğunluk</td><td class=\"num\">" + fmt(m.density, 1) + " /m²</td></tr>" +
    "<tr><td>Oda çevrimi / yıl</td><td class=\"num\">" + fmt(m.cyclesPerRoom, 1) + "</td></tr>" +
    "<tr><td>Hasat / yıl</td><td class=\"num\">" + fmt(m.harvestsYear) + "</td></tr>" +
    "<tr><td>Kurutma odası</td><td class=\"num\">" + s.dryRooms + " · tepe " + m.cal.peakDry + "</td></tr>" +
    "<tr><td>Çevrim süresi</td><td class=\"num\">" + fmt(m.cycleDays) + " gün</td></tr>" +
    "<tr><td>Kadro / hasat günü</td><td class=\"num\">" + m.staffBase + " / " + m.harvestCrew + "</td></tr>" +
    "<tr><td>Indoor kapalı alan</td><td class=\"num\">" + fmt(m.totalBuilt, 0) + " m²</td></tr></table>";

  el("alerts").innerHTML = m.alerts.map(function (a) { return "<div class=\"alert " + a.t + "\">" + a.m + "</div>"; }).join("");
  const nodes = [
    ["Anaç", (m.motherProd + m.motherBank) + " m²"],
    ["Çelik", s.rootDays + " gün"],
    ["Pre-veg", s.preVegDays + " gün"],
    ["Veg", s.vegDays + " gün"],
    ["Çiçek", s.flowerDays + " gün · " + s.flowerRooms + " oda"],
    ["Hasat", "her " + s.harvestDays + " gün"],
    ["Kurutma", s.dryDays + " gün · " + s.dryRooms + " oda"]
  ];
  el("flow").innerHTML = nodes.map(function (pair, i) {
    return (i ? "<span class=\"arrow\">→</span>" : "") + "<div class=\"node\"><strong>" + pair[0] + "</strong><span>" + pair[1] + "</span></div>";
  }).join("");
}

function renderLabels(s, m) {
  const map = {
    flowerArea: fmt(s.flowerArea, 0) + " m²",
    plantsInFlower: fmt(s.plantsInFlower),
    dryRooms: String(s.dryRooms),
    flowerRooms: String(s.flowerRooms),
    harvestDays: s.harvestDays + " gün",
    flowerDays: s.flowerDays + " gün",
    vegDays: s.vegDays + " gün",
    preVegDays: s.preVegDays + " gün",
    rootDays: s.rootDays + " gün",
    dryDays: s.dryDays + " gün",
    yieldG: s.yieldG + " g",
    genetics: String(s.genetics),
    extraIndoor: s.extraIndoor + " m²",
    priceKg: eur(s.priceKg)
  };
  Object.keys(map).forEach(function (k) {
    const n = el("v-" + k);
    if (n) n.textContent = map[k];
  });
  const hint = el("capacityHint");
  if (hint && m) {
    hint.textContent = "Oda " + fmt(m.roomM2, 0) + " m² · " + fmt(m.plantsPerRoom) + " bitki/oda · yoğunluk " + fmt(m.density, 1) + " /m² · önerilen kurutma " + m.drySuggest;
  }
}

let week = 0, playing = false, timer = null, lastM = null;

function render() {
  const s = readState();
  const m = simulate(s);
  lastM = m;
  renderLabels(s, m);
  renderKpis(m, s);
  renderPlan(m, s, week);
  renderCalendar(m);
  renderTables(m, s);
  el("weekLabel").textContent = "Hafta " + (week + 1);
}

function play() {
  playing = !playing;
  el("playBtn").textContent = playing ? "Durdur" : "Yılı oynat";
  if (timer) clearInterval(timer);
  if (playing) {
    timer = setInterval(function () {
      week = (week + 1) % 52;
      if (lastM) {
        renderPlan(lastM, readState(), week);
        renderCalendar(lastM);
        el("weekLabel").textContent = "Hafta " + (week + 1);
      }
    }, 220);
  }
}

function exportJson() {
  const blob = new Blob([JSON.stringify({ state: readState(), result: lastM }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tesis-senaryo.json";
  a.click();
}

window.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".presets button").forEach(function (b) {
    b.addEventListener("click", function () { applyPreset(b.dataset.key); });
  });
  document.querySelectorAll("input").forEach(function (i) {
    i.addEventListener("input", function () { week = 0; render(); });
  });
  el("playBtn").addEventListener("click", play);
  el("exportBtn").addEventListener("click", exportJson);
  applyPreset("dengeli");
});
