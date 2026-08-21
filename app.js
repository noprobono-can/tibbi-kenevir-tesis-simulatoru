const PRESETS = {
  pilot: {
    flowerRooms: 3, roomM2: 60, density: 5, harvestDays: 21, flowerDays: 56,
    vegDays: 18, preVegDays: 14, rootDays: 14, dryDays: 14, yieldG: 160,
    genetics: 3, extraGh: 0, extraction: false, usable: 0.85
  },
  dengeli: {
    flowerRooms: 4, roomM2: 70, density: 4.5, harvestDays: 21, flowerDays: 56,
    vegDays: 24, preVegDays: 14, rootDays: 14, dryDays: 14, yieldG: 180,
    genetics: 4, extraGh: 0, extraction: true, usable: 0.85
  },
  yuksek: {
    flowerRooms: 8, roomM2: 80, density: 5, harvestDays: 14, flowerDays: 56,
    vegDays: 21, preVegDays: 14, rootDays: 14, dryDays: 14, yieldG: 170,
    genetics: 4, extraGh: 0, extraction: true, usable: 0.85
  },
  faz2: {
    flowerRooms: 12, roomM2: 70, density: 4.5, harvestDays: 14, flowerDays: 56,
    vegDays: 21, preVegDays: 14, rootDays: 14, dryDays: 14, yieldG: 170,
    genetics: 5, extraGh: 500, extraction: true, usable: 0.85
  }
};

const el = (id) => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d, minimumFractionDigits: d });
const eur = (n) => "€" + fmt(n, 0);

function readState() {
  return {
    flowerRooms: +el("flowerRooms").value,
    roomM2: +el("roomM2").value,
    density: +el("density").value,
    harvestDays: +el("harvestDays").value,
    flowerDays: +el("flowerDays").value,
    vegDays: +el("vegDays").value,
    preVegDays: +el("preVegDays").value,
    rootDays: +el("rootDays").value,
    dryDays: +el("dryDays").value,
    yieldG: +el("yieldG").value,
    genetics: +el("genetics").value,
    extraGh: +el("extraGh").value,
    priceKg: +el("priceKg").value,
    extraction: el("extraction").checked,
    usable: 0.85
  };
}

function applyPreset(key) {
  const p = PRESETS[key];
  Object.entries(p).forEach(([k, v]) => {
    if (k === "usable") return;
    if (k === "extraction") el("extraction").checked = v;
    else if (el(k)) el(k).value = v;
  });
  document.querySelectorAll(".presets button").forEach((b) => b.classList.toggle("active", b.dataset.key === key));
  week = 0;
  render();
}

function dryingRoomsNeeded(s) {
  if (s.flowerRooms <= 3) return 1;
  if (s.flowerRooms <= 9) return 2;
  return 1 + Math.ceil((s.flowerRooms - 3) / 6);
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
    rooms,
    dryRow,
    dryLoad,
    peakDry: Math.max(0, ...dryLoad),
    gmpIdleWeeks: dryRow.filter((x) => x === "idle").length
  };
}

function simulate(s) {
  const flowerCanopy = s.flowerRooms * s.roomM2;
  const usableFlower = flowerCanopy * s.usable;
  const plantsPerRoom = Math.round(s.roomM2 * s.usable * s.density);
  const plantsInFlower = plantsPerRoom * s.flowerRooms;
  const turnaround = 7;
  const cycleFlower = s.flowerDays + turnaround;
  const cyclesPerRoom = 365 / cycleFlower;
  const packedPlantsYear = Math.round(plantsPerRoom * s.flowerRooms * cyclesPerRoom);
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
  const extra = s.extraGh;
  const gacpM2 = motherProd + motherBank + quarantine + tissue + cuttings + preVeg + veg + flowerCanopy + 40 + extra;
  const dryRoomsNeeded = dryingRoomsNeeded(s);
  const dryM2 = dryRoomsNeeded * 28;
  const extractM2 = s.extraction ? 24 : 0;
  const gmpM2 = dryM2 + 24 + 20 + 30;
  const officeM2 = 36;
  const totalBuilt = gacpM2 + gmpM2 + officeM2 + extractM2;

  const lightCapex = preVeg * 150 + veg * 280 + flowerCanopy * 210;
  const gacpCapex = gacpM2 * 1750 + lightCapex;
  const gmpCapex = gmpM2 * 5600;
  const extractCapex = s.extraction ? 120000 : 0;
  const stability = s.genetics * 8000;
  const capex = gacpCapex + gmpCapex + officeM2 * 1400 + extractCapex + stability;
  const staffBase = 4 + Math.ceil(flowerCanopy / 120);
  const harvestCrew = staffBase + Math.ceil(plantsPerRoom / 80);
  const opexYear = staffBase * 28000 + flowerCanopy * 220 + (s.extraction ? 18000 : 0) + 24000;
  const ebitda = revenue - opexYear;
  const payback = ebitda > 0 ? capex / ebitda : Infinity;
  const cal = buildCalendar(s);
  const cycleDays = s.rootDays + s.preVegDays + s.vegDays + s.flowerDays;

  const alerts = [];
  if (roomsIdle) {
    alerts.push({ t: "warn", m: "Hasat her " + s.harvestDays + " gün — odalar doğal aralıktan (" + naturalHarvestDays + " gün) yavaş dönüyor." });
  }
  if (scheduledPlantsYear < packedPlantsYear && staggerOk) {
    alerts.push({ t: "warn", m: "Takvim çıktısı " + fmt(scheduledPlantsYear) + " bitki; dolu oda kapasitesi " + fmt(packedPlantsYear) + ". Aralığı ~" + naturalHarvestDays + " güne çekin." });
  }
  if (!staggerOk) {
    alerts.push({ t: "bad", m: s.harvestDays + " günde bir hasat için en az " + requiredRooms + " çiçek odası gerekir." });
  }
  if (cal.peakDry > dryRoomsNeeded) {
    alerts.push({ t: "bad", m: "Kurutma çakışması: tepe " + cal.peakDry + " oda, plan " + dryRoomsNeeded + "." });
  } else {
    alerts.push({ t: "ok", m: "Kurutma: " + dryRoomsNeeded + " oda yeterli (tepe eşzamanlı yük " + cal.peakDry + ")." });
  }
  if (cal.gmpIdleWeeks > 8) {
    alerts.push({ t: "warn", m: "GMP kurutma " + cal.gmpIdleWeeks + " hafta boş kalıyor." });
  }

  return {
    flowerCanopy, usableFlower, plantsPerRoom, plantsInFlower, plantsYear, kgYear, revenue,
    requiredRooms, staggerOk, gacpM2, gmpM2, totalBuilt, dryRoomsNeeded, preVeg, veg,
    motherProd, motherBank, capex, gacpCapex, gmpCapex, extractCapex, stability, opexYear,
    ebitda, payback, staffBase, harvestCrew, cycleDays, cyclesPerRoom, harvestsYear,
    naturalHarvestDays, cal, extra
  };
}

function renderKpis(m, s) {
  const items = [
    ["Yıllık bitki", fmt(m.plantsYear), fmt(m.plantsInFlower) + " aynı anda çiçekte", ""],
    ["Çiçek alanı", fmt(m.usableFlower, 0) + " m²", fmt(m.flowerCanopy, 0) + " m² oda tabanı", ""],
    ["Kuru çiçek", fmt(m.kgYear, 0) + " kg", fmt(s.yieldG) + " g/bitki", ""],
    ["Hasılat", eur(m.revenue), eur(s.priceKg) + "/kg", ""],
    ["CAPEX", eur(m.capex), "GMP " + eur(m.gmpCapex), ""],
    ["Geri ödeme", Number.isFinite(m.payback) ? fmt(m.payback, 1) + " yıl" : "\u2014", "EBITDA " + eur(m.ebitda), m.payback < 5 ? "good" : m.payback < 8 ? "warn" : ""]
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
      y: 330, w: flowerW, h: 150, tag: "GACP",
      fill: st === "harvest" ? "#d4c49a" : st === "flower" ? "#d4783a" : "#3a2c24"
    });
  }
  const gmpDry = [];
  for (let i = 0; i < m.dryRoomsNeeded; i++) {
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
  if (s.extraGh > 0) {
    blocks.push({ id: "Ekstra sera +" + s.extraGh + " m²", x: 40, y: 500, w: 420, h: 40, fill: "#2f4a34", tag: "modül" });
  }
  const svg = blocks.map((b) =>
    "<g class=\"room\"><rect class=\"hit\" x=\"" + b.x + "\" y=\"" + b.y + "\" width=\"" + b.w + "\" height=\"" + b.h + "\" rx=\"10\" fill=\"" + b.fill + "\" opacity=\"0.92\"/>" +
    "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 22) + "\" fill=\"#0c1210\" font-size=\"12\" font-weight=\"600\">" + b.id + "</text>" +
    "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 40) + "\" fill=\"#0c1210\" font-size=\"11\" opacity=\"0.75\">" + b.tag + "</text></g>"
  ).join("");
  el("plan").innerHTML =
    "<svg class=\"plan\" viewBox=\"0 0 " + W + " " + H + "\" xmlns=\"http://www.w3.org/2000/svg\">" +
    "<rect x=\"16\" y=\"16\" width=\"" + (W - 32) + "\" height=\"" + (H - 32) + "\" rx=\"18\" fill=\"#101714\" stroke=\"rgba(212,196,154,0.2)\"/>" +
    "<text x=\"40\" y=\"40\" fill=\"#d4c49a\" font-size=\"12\" letter-spacing=\"2\">YERLEŞİM · HAFTA " + (currentWeek + 1) + "</text>" +
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
    "<tr><td>GACP</td><td class=\"num\">" + eur(m.gacpCapex) + "</td></tr>" +
    "<tr><td>GMP</td><td class=\"num\">" + eur(m.gmpCapex) + "</td></tr>" +
    "<tr><td>Pilot ekstraksiyon</td><td class=\"num\">" + eur(m.extractCapex) + "</td></tr>" +
    "<tr><td>Stabilite</td><td class=\"num\">" + eur(m.stability) + "</td></tr>" +
    "<tr><td><strong>Toplam CAPEX</strong></td><td class=\"num\"><strong>" + eur(m.capex) + "</strong></td></tr>" +
    "<tr><td>Yıllık OPEX</td><td class=\"num\">" + eur(m.opexYear) + "</td></tr>" +
    "<tr><td>Hasılat</td><td class=\"num\">" + eur(m.revenue) + "</td></tr>" +
    "<tr><td>EBITDA</td><td class=\"num\">" + eur(m.ebitda) + "</td></tr></table>";

  el("ops").innerHTML =
    "<table><tr><th>Operasyon</th><th></th></tr>" +
    "<tr><td>Bitki / oda</td><td class=\"num\">" + fmt(m.plantsPerRoom) + "</td></tr>" +
    "<tr><td>Aynı anda çiçekte</td><td class=\"num\">" + fmt(m.plantsInFlower) + "</td></tr>" +
    "<tr><td>Oda çevrimi / yıl</td><td class=\"num\">" + fmt(m.cyclesPerRoom, 1) + "</td></tr>" +
    "<tr><td>Hasat / yıl</td><td class=\"num\">" + fmt(m.harvestsYear) + "</td></tr>" +
    "<tr><td>Doğal hasat aralığı</td><td class=\"num\">" + m.naturalHarvestDays + " gün</td></tr>" +
    "<tr><td>Çevrim süresi</td><td class=\"num\">" + fmt(m.cycleDays) + " gün</td></tr>" +
    "<tr><td>Kurutma odası</td><td class=\"num\">" + m.dryRoomsNeeded + " · tepe " + m.cal.peakDry + "</td></tr>" +
    "<tr><td>Kadro / hasat günü</td><td class=\"num\">" + m.staffBase + " / " + m.harvestCrew + "</td></tr>" +
    "<tr><td>Kapalı alan</td><td class=\"num\">" + fmt(m.totalBuilt, 0) + " m²</td></tr></table>";

  el("alerts").innerHTML = m.alerts.map(function (a) { return "<div class=\"alert " + a.t + "\">" + a.m + "</div>"; }).join("");
  const nodes = [
    ["Anaç", (m.motherProd + m.motherBank) + " m²"],
    ["Çelik", s.rootDays + " gün"],
    ["Pre-veg", s.preVegDays + " gün"],
    ["Veg", s.vegDays + " gün"],
    ["Çiçek", s.flowerDays + " gün · " + s.flowerRooms + " oda"],
    ["Hasat", "her " + s.harvestDays + " gün"],
    ["Kurutma", s.dryDays + " gün"]
  ];
  el("flow").innerHTML = nodes.map(function (pair, i) {
    return (i ? "<span class=\"arrow\">→</span>" : "") + "<div class=\"node\"><strong>" + pair[0] + "</strong><span>" + pair[1] + "</span></div>";
  }).join("");
}

function renderLabels(s) {
  const map = {
    flowerRooms: String(s.flowerRooms),
    roomM2: s.roomM2 + " m²",
    density: fmt(s.density, 1) + " /m²",
    harvestDays: s.harvestDays + " gün",
    flowerDays: s.flowerDays + " gün",
    vegDays: s.vegDays + " gün",
    preVegDays: s.preVegDays + " gün",
    rootDays: s.rootDays + " gün",
    dryDays: s.dryDays + " gün",
    yieldG: s.yieldG + " g",
    genetics: String(s.genetics),
    extraGh: s.extraGh + " m²",
    priceKg: eur(s.priceKg)
  };
  Object.keys(map).forEach(function (k) {
    const n = el("v-" + k);
    if (n) n.textContent = map[k];
  });
}

let week = 0, playing = false, timer = null, lastM = null;

function render() {
  const s = readState();
  renderLabels(s);
  const m = simulate(s);
  lastM = m;
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
