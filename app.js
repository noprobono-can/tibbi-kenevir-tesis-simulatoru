const PRESETS = {
  pilot: {
    plantsYear: 3060, harvestsPerRoom: 4, flowerRooms: 3, roomM2: 60, flowerArea: 180,
    dryRooms: 1, flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 160, genetics: 3, extraIndoor: 0, extraction: false
  },
  dengeli: {
    plantsYear: 5360, harvestsPerRoom: 5, flowerRooms: 4, roomM2: 70, flowerArea: 280,
    dryRooms: 2, flowerDays: 56, vegDays: 24, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 180, genetics: 4, extraIndoor: 0, extraction: true
  },
  yuksek: {
    plantsYear: 16320, harvestsPerRoom: 6, flowerRooms: 8, roomM2: 80, flowerArea: 640,
    dryRooms: 2, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 170, genetics: 4, extraIndoor: 0, extraction: true
  },
  faz2: {
    plantsYear: 19300, harvestsPerRoom: 6, flowerRooms: 12, roomM2: 70, flowerArea: 840,
    dryRooms: 3, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, yieldG: 170, genetics: 5, extraIndoor: 400, extraction: true
  }
};

const el = (id) => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d, minimumFractionDigits: d });
const eur = (n) => "\u20AC" + fmt(n, 0);
const m2 = (n) => fmt(n, 0) + " m\u00B2";

function maxFlowerDays(harvests) {
  return Math.floor(365 / harvests) - 7;
}

function suggestedDryRooms(flowerRooms) {
  if (flowerRooms <= 3) return 1;
  if (flowerRooms <= 9) return 2;
  return 1 + Math.ceil((flowerRooms - 3) / 6);
}

function syncLayout(source) {
  const rooms = Math.max(1, +el("flowerRooms").value);
  const harvests = Math.min(7, Math.max(4, +el("harvestsPerRoom").value));
  el("harvestsPerRoom").value = String(harvests);
  el("flowerArea").min = String(rooms * 50);
  el("flowerArea").max = String(rooms * 300);
  let roomM2 = Math.min(300, Math.max(50, +el("roomM2").value));
  let flowerArea = +el("flowerArea").value;
  if (source === "roomM2" || source === "flowerRooms") {
    flowerArea = rooms * roomM2;
  } else if (source === "flowerArea") {
    roomM2 = Math.min(300, Math.max(50, flowerArea / rooms));
    flowerArea = rooms * roomM2;
  } else {
    flowerArea = rooms * roomM2;
  }
  flowerArea = Math.min(rooms * 300, Math.max(rooms * 50, flowerArea));
  roomM2 = flowerArea / rooms;
  el("flowerArea").value = String(Math.round(flowerArea));
  el("roomM2").value = String(Math.round(roomM2));
  const cap = maxFlowerDays(harvests);
  el("flowerDays").max = String(Math.max(35, cap));
  el("flowerDays").min = "35";
  if (+el("flowerDays").value > cap) el("flowerDays").value = String(cap);
}

function readState() {
  const ae = document.activeElement && document.activeElement.id;
  const src = ae === "flowerArea" ? "flowerArea" : (ae === "roomM2" ? "roomM2" : (ae === "flowerRooms" ? "flowerRooms" : ""));
  syncLayout(src);
  const flowerRooms = Math.max(1, +el("flowerRooms").value);
  const harvestsPerRoom = Math.min(7, Math.max(4, +el("harvestsPerRoom").value));
  const flowerArea = +el("flowerArea").value;
  return {
    plantsYear: Math.max(flowerRooms * harvestsPerRoom, +el("plantsYear").value),
    harvestsPerRoom: harvestsPerRoom,
    flowerArea: flowerArea,
    roomM2: flowerArea / flowerRooms,
    dryRooms: Math.max(1, +el("dryRooms").value),
    flowerRooms: flowerRooms,
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
  syncLayout("roomM2");
  week = 0;
  render();
}

function buildCalendar(s) {
  const weeks = 52;
  const flowerW = Math.max(1, Math.round(s.flowerDays / 7));
  const dryW = Math.max(1, Math.round(s.dryDays / 7));
  const periodW = 52 / s.harvestsPerRoom;
  const staggerW = periodW / s.flowerRooms;
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
    row.forEach((cell, w) => {
      if (cell === "harvest") {
        for (let d = 0; d < dryW && w + d < weeks; d++) dryLoad[w + d] += 1;
      }
    });
  });
  const dryRow = dryLoad.map((n) => (n > 0 ? "gmp" : "idle"));
  const peakDry = Math.max.apply(null, dryLoad.concat([0]));
  return {
    rooms: rooms,
    dryLoad: dryLoad,
    dryRow: dryRow,
    peakDry: peakDry,
    gmpIdleWeeks: dryRow.filter((x) => x === "idle").length
  };
}

function simulate(s) {
  const roomM2 = s.roomM2;
  const usableFlower = s.flowerArea * s.usable;
  const plantsYear = s.plantsYear;
  const plantsInFlower = plantsYear / s.harvestsPerRoom;
  const plantsPerRoom = Math.round(plantsInFlower / s.flowerRooms);
  const density = usableFlower > 0 ? plantsInFlower / usableFlower : 0;
  const turnaround = 7;
  const cycleFlower = 365 / s.harvestsPerRoom;
  const cyclesPerRoom = s.harvestsPerRoom;
  const staggerOk = s.flowerDays + turnaround <= cycleFlower + 0.5;
  const harvestsYear = s.flowerRooms * s.harvestsPerRoom;
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
  if (!staggerOk) {
    alerts.push({ t: "bad", m: s.harvestsPerRoom + " hasat/oda/y\u0131l i\u00e7in \u00e7i\u00e7eklenme en fazla " + maxFlowerDays(s.harvestsPerRoom) + " g\u00fcn olabilir." });
  } else {
    alerts.push({ t: "ok", m: "Her oda y\u0131lda " + s.harvestsPerRoom + " hasat (\u00e7evrim " + fmt(cycleFlower, 0) + " g\u00fcn)." });
  }
  if (roomM2 > 300.5) {
    alerts.push({ t: "bad", m: "Oda alan\u0131 \u00fcst s\u0131n\u0131r\u0131 300 m\u00B2." });
  }
  if (cal.peakDry > s.dryRooms) {
    alerts.push({ t: "bad", m: "Kurutma yetersiz: tepe y\u00fck " + cal.peakDry + " oda, se\u00e7ilen " + s.dryRooms + "." });
  } else if (s.dryRooms > drySuggest + 1) {
    alerts.push({ t: "warn", m: "Kurutma odas\u0131 (" + s.dryRooms + ") \u00f6nerilenin (" + drySuggest + ") \u00fczerinde \u2014 GMP maliyeti artar." });
  } else {
    alerts.push({ t: "ok", m: "Kurutma: " + s.dryRooms + " oda \u00b7 tepe e\u015fzamanl\u0131 y\u00fck " + cal.peakDry + "." });
  }
  if (density > 10) {
    alerts.push({ t: "warn", m: "Yo\u011funluk " + fmt(density, 1) + " bitki/m\u00B2 \u2014 indoor i\u00e7in y\u00fcksek." });
  }
  if (cal.gmpIdleWeeks > 8) {
    alerts.push({ t: "warn", m: "GMP kurutma " + cal.gmpIdleWeeks + " hafta bo\u015f kal\u0131yor." });
  }

  return {
    roomM2: roomM2, usableFlower: usableFlower, plantsPerRoom: plantsPerRoom, density: density,
    plantsYear: plantsYear, plantsInFlower: plantsInFlower, kgYear: kgYear, revenue: revenue,
    staggerOk: staggerOk, gacpM2: gacpM2, gmpM2: gmpM2, totalBuilt: totalBuilt, drySuggest: drySuggest,
    preVeg: preVeg, veg: veg, motherProd: motherProd, motherBank: motherBank, capex: capex,
    gacpCapex: gacpCapex, gmpCapex: gmpCapex, extractCapex: extractCapex, stability: stability,
    opexYear: opexYear, ebitda: ebitda, payback: payback, staffBase: staffBase, harvestCrew: harvestCrew,
    cycleDays: cycleDays, cyclesPerRoom: cyclesPerRoom, harvestsYear: harvestsYear,
    cycleFlower: cycleFlower, cal: cal, extra: extra, alerts: alerts
  };
}

function renderKpis(m, s) {
  const items = [
    ["Y\u0131ll\u0131k bitki", fmt(s.plantsYear), fmt(m.plantsInFlower, 0) + " \u00e7i\u00e7ekte \u00b7 " + s.harvestsPerRoom + " hasat/oda", ""],
    ["Oda alan\u0131", m2(s.roomM2), "\u00fcst s\u0131n\u0131r 300 m\u00B2 \u00b7 toplam " + m2(s.flowerArea), s.roomM2 > 300.5 ? "warn" : ""],
    ["Kurutma", String(s.dryRooms), "tepe " + m.cal.peakDry + " \u00b7 \u00f6neri " + m.drySuggest, m.cal.peakDry > s.dryRooms ? "warn" : ""],
    ["Kuru \u00e7i\u00e7ek", fmt(m.kgYear, 0) + " kg", fmt(s.yieldG) + " g/bitki", ""],
    ["Has\u0131lat", eur(m.revenue), eur(s.priceKg) + "/kg", ""],
    ["CAPEX", eur(m.capex), "geri \u00f6deme " + (Number.isFinite(m.payback) ? fmt(m.payback, 1) + " y\u0131l" : "\u2014"), m.payback < 5 ? "good" : m.payback < 8 ? "warn" : ""]
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
      id: "\u00c7i\u00e7ek " + (i + 1),
      x: 40 + i * (flowerW + gap),
      y: 330, w: flowerW, h: 150, tag: m2(m.roomM2),
      fill: st === "harvest" ? "#d4c49a" : st === "flower" ? "#d4783a" : "#3a2c24"
    });
  }
  const gmpDry = [];
  for (let i = 0; i < s.dryRooms; i++) {
    const busy = (m.cal.dryLoad[currentWeek] || 0) > i;
    gmpDry.push({ id: "Kurutma " + (i + 1), x: 640 + i * 118, y: 48, w: 108, h: 90, fill: busy ? "#5b8aa8" : "#243038", tag: "GMP" });
  }
  const blocks = [
    { id: "Ofis / QMS", x: 40, y: 48, w: 130, h: 90, fill: "#c9b56a", tag: "\u0130dare" },
    { id: "GACP giri\u015f", x: 180, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Ak\u0131\u015f" },
    { id: "GMP giri\u015f", x: 258, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Ak\u0131\u015f" },
    { id: "Trim", x: 360, y: 48, w: 120, h: 90, fill: "#4d738a", tag: "GMP" },
    { id: "Paket", x: 488, y: 48, w: 100, h: 90, fill: "#4d738a", tag: "GMP" }
  ].concat(gmpDry).concat([
    { id: "Ana\u00e7 \u00fcretim", x: 40, y: 168, w: 120, h: 120, fill: "#6f9e62", tag: "GACP" },
    { id: "Ana\u00e7 bankas\u0131", x: 168, y: 168, w: 100, h: 56, fill: "#587c4e", tag: "GACP" },
    { id: "Karantina", x: 168, y: 232, w: 48, h: 56, fill: "#8b6bb0", tag: "R&D" },
    { id: "Doku k\u00fclt.", x: 220, y: 232, w: 48, h: 56, fill: "#8b6bb0", tag: "R&D" },
    { id: "\u00c7elik", x: 276, y: 168, w: 110, h: 120, fill: "#7aa56e", tag: "GACP" },
    { id: "Pre-veg", x: 394, y: 168, w: 120, h: 120, fill: "#88b57a", tag: m2(m.preVeg) },
    { id: "Veg", x: 522, y: 168, w: 150, h: 120, fill: "#88b57a", tag: m2(m.veg) },
    { id: s.extraction ? "Ekstraksiyon" : "Trim at\u0131k", x: 980, y: 168, w: 150, h: 120, fill: s.extraction ? "#8b6bb0" : "#2a332e", tag: s.extraction ? "pilot" : "\u2014" }
  ]).concat(rooms);
  if (s.extraIndoor > 0) {
    blocks.push({ id: "Yedek indoor +" + s.extraIndoor + " m\u00B2", x: 40, y: 500, w: 420, h: 40, fill: "#2f4a34", tag: "mod\u00fcl" });
  }
  const svg = blocks.map((b) =>
    "<g class=\"room\"><rect class=\"hit\" x=\"" + b.x + "\" y=\"" + b.y + "\" width=\"" + b.w + "\" height=\"" + b.h + "\" rx=\"10\" fill=\"" + b.fill + "\" opacity=\"0.92\"/>" +
    "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 22) + "\" fill=\"#0c1210\" font-size=\"12\" font-weight=\"600\">" + b.id + "</text>" +
    "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 40) + "\" fill=\"#0c1210\" font-size=\"11\" opacity=\"0.75\">" + b.tag + "</text></g>"
  ).join("");
  el("plan").innerHTML =
    "<svg class=\"plan\" viewBox=\"0 0 " + W + " " + H + "\" xmlns=\"http://www.w3.org/2000/svg\">" +
    "<rect x=\"16\" y=\"16\" width=\"" + (W - 32) + "\" height=\"" + (H - 32) + "\" rx=\"18\" fill=\"#101714\" stroke=\"rgba(212,196,154,0.2)\"/>" +
    "<text x=\"40\" y=\"40\" fill=\"#d4c49a\" font-size=\"12\" letter-spacing=\"2\">INDOOR YERLE\u015e\u0130M \u00b7 HAFTA " + (currentWeek + 1) + "</text>" +
    svg + "</svg>";
}

function renderCalendar(m) {
  const cell = function (w, cls, title) {
    const on = w === week ? " outline:1px solid #d4c49a;" : "";
    return "<div class=\"cell " + cls + "\" style=\"" + on + "\" title=\"" + title + "\"></div>";
  };
  const head = "<div class=\"week-row\"><b></b>" + Array.from({ length: 52 }, function (_, i) { return cell(i, "", "H" + (i + 1)); }).join("") + "</div>";
  const rows = m.cal.rooms.map(function (row, i) {
    return "<div class=\"week-row\"><b>\u00c7i\u00e7ek " + (i + 1) + "</b>" + row.map(function (c, w) { return cell(w, c, "H" + (w + 1) + " " + c); }).join("") + "</div>";
  }).join("");
  const dry = "<div class=\"week-row\"><b>Kurutma</b>" + m.cal.dryRow.map(function (c, w) { return cell(w, c, "H" + (w + 1) + " y\u00fck " + m.cal.dryLoad[w]); }).join("") + "</div>";
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
    "<tr><td>Y\u0131ll\u0131k OPEX (taslak)</td><td class=\"num\">" + eur(m.opexYear) + "</td></tr>" +
    "<tr><td>Has\u0131lat</td><td class=\"num\">" + eur(m.revenue) + "</td></tr>" +
    "<tr><td>EBITDA</td><td class=\"num\">" + eur(m.ebitda) + "</td></tr></table>";

  el("ops").innerHTML =
    "<table><tr><th>Operasyon</th><th></th></tr>" +
    "<tr><td>Oda alan\u0131</td><td class=\"num\">" + m2(m.roomM2) + "</td></tr>" +
    "<tr><td>Bitki / oda</td><td class=\"num\">" + fmt(m.plantsPerRoom) + "</td></tr>" +
    "<tr><td>Yo\u011funluk</td><td class=\"num\">" + fmt(m.density, 1) + " /m\u00B2</td></tr>" +
    "<tr><td>Hasat / oda / y\u0131l</td><td class=\"num\">" + s.harvestsPerRoom + "</td></tr>" +
    "<tr><td>Tesis hasad\u0131 / y\u0131l</td><td class=\"num\">" + fmt(m.harvestsYear) + "</td></tr>" +
    "<tr><td>Kurutma odas\u0131</td><td class=\"num\">" + s.dryRooms + " \u00b7 tepe " + m.cal.peakDry + "</td></tr>" +
    "<tr><td>\u00c7evrim s\u00fcresi</td><td class=\"num\">" + fmt(m.cycleDays) + " g\u00fcn</td></tr>" +
    "<tr><td>Kadro / hasat g\u00fcn\u00fc</td><td class=\"num\">" + m.staffBase + " / " + m.harvestCrew + "</td></tr>" +
    "<tr><td>Indoor kapal\u0131 alan</td><td class=\"num\">" + m2(m.totalBuilt) + "</td></tr></table>";

  el("alerts").innerHTML = m.alerts.map(function (a) { return "<div class=\"alert " + a.t + "\">" + a.m + "</div>"; }).join("");
  const nodes = [
    ["Ana\u00e7", (m.motherProd + m.motherBank) + " m\u00B2"],
    ["\u00c7elik", s.rootDays + " g\u00fcn"],
    ["Pre-veg", s.preVegDays + " g\u00fcn"],
    ["Veg", s.vegDays + " g\u00fcn"],
    ["\u00c7i\u00e7ek", s.flowerDays + " g\u00fcn \u00b7 " + s.flowerRooms + " oda"],
    ["Hasat", s.harvestsPerRoom + " / oda / y\u0131l"],
    ["Kurutma", s.dryDays + " g\u00fcn \u00b7 " + s.dryRooms + " oda"]
  ];
  el("flow").innerHTML = nodes.map(function (pair, i) {
    return (i ? "<span class=\"arrow\">\u2192</span>" : "") + "<div class=\"node\"><strong>" + pair[0] + "</strong><span>" + pair[1] + "</span></div>";
  }).join("");
}

function renderLabels(s, m) {
  const map = {
    plantsYear: fmt(s.plantsYear),
    harvestsPerRoom: String(s.harvestsPerRoom),
    flowerArea: m2(s.flowerArea),
    roomM2: m2(s.roomM2),
    dryRooms: String(s.dryRooms),
    flowerRooms: String(s.flowerRooms),
    flowerDays: s.flowerDays + " g\u00fcn",
    vegDays: s.vegDays + " g\u00fcn",
    preVegDays: s.preVegDays + " g\u00fcn",
    rootDays: s.rootDays + " g\u00fcn",
    dryDays: s.dryDays + " g\u00fcn",
    yieldG: s.yieldG + " g",
    genetics: String(s.genetics),
    extraIndoor: m2(s.extraIndoor),
    priceKg: eur(s.priceKg)
  };
  Object.keys(map).forEach(function (k) {
    const n = el("v-" + k);
    if (n) n.textContent = map[k];
  });
  const hint = el("capacityHint");
  if (hint && m) {
    hint.textContent = "Oda " + m2(s.roomM2) + " (max 300) \u00b7 " + fmt(m.plantsPerRoom) + " bitki/oda \u00b7 " + s.harvestsPerRoom + " hasat/oda/y\u0131l \u00b7 \u00e7evrim " + fmt(365 / s.harvestsPerRoom, 0) + " g\u00fcn";
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
  el("playBtn").textContent = playing ? "Durdur" : "Y\u0131l\u0131 oynat";
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
