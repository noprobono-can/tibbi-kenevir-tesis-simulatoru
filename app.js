const PRESETS = {
  pilot: {
    plantsYear: 3060, plantsPerM2: 5, harvestsPerRoom: 4, flowerRooms: 3, roomM2: 60, flowerArea: 180,
    dryRooms: 1, flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 160, genetics: 3, priceKg: 3500, saleablePct: 80, extraction: false
  },
  dengeli: {
    plantsYear: 5360, plantsPerM2: 4.5, harvestsPerRoom: 5, flowerRooms: 4, roomM2: 70, flowerArea: 280,
    dryRooms: 2, flowerDays: 56, vegDays: 24, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 180, genetics: 4, priceKg: 3500, saleablePct: 85, extraction: true
  },
  yuksek: {
    plantsYear: 16320, plantsPerM2: 5, harvestsPerRoom: 6, flowerRooms: 8, roomM2: 80, flowerArea: 640,
    dryRooms: 2, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 170, genetics: 4, priceKg: 3500, saleablePct: 88, extraction: true
  },
  faz2: {
    plantsYear: 19300, plantsPerM2: 4.5, harvestsPerRoom: 6, flowerRooms: 12, roomM2: 70, flowerArea: 840,
    dryRooms: 3, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 170, genetics: 5, priceKg: 3500, saleablePct: 88, extraction: true
  }
};

const el = (id) => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d, minimumFractionDigits: d });
const eur = (n) => "\u20AC" + fmt(n, 0);
const m2 = (n) => fmt(n, 0) + " m\u00B2";
const round1 = (n) => Math.round(n * 10) / 10;

const OPEX_U = {
  potL: 12, cocoShare: 0.7, perlitShare: 0.3,
  cocoEurL: 0.225, perlitEurL: 0.12, potEur: 1.2,
  wasteEurKg: 0.05, mixKgM3: 350,
  waterLPerM2Day: 8, drain: 0.2, eventsDay: 6,
  waterEurM3: 1.2, fertEurL: 0.08, autoEurEvent: 0.35,
  hno3EurL: 1.5, alk: 7.5, acidFactor: 0.0014,
  junior: 4, senior: 7, manager: 11,
  potPrepH: 0.05, transplantH: 0.033,
  dripperHRoomDay: 0.5, calibHRoomWeek: 0.5,
  disposalHM3: 0.5, cipHRoomWeek: 1, gmpHHarvest: 1.5,
  hasEcSensor: 1, manualEcHRoomDay: 0.5,
  dripperEur: 0.5, dripperPerPlant: 1,
  stakeEur: 0.15, stakePerPlant: 1.5,
  ipmEurCycle: 150, ppeEurRoomMonth: 50, labEurRoomMonth: 30,
  dryingEurHarvest: 200, labelEurHarvest: 20,
  activeRatio: 0.85
};

function cloneBufferFor(saleable) {
  if (saleable <= 0.82) return 0.15;
  if (saleable <= 0.86) return 0.12;
  return 0.1;
}

function computeOpex(s, plantsYear, harvestsYear) {
  const U = OPEX_U;
  const rooms = s.flowerRooms;
  const area = s.flowerArea;
  const activeDays = 52 * 7 * U.activeRatio;
  const pots = plantsYear;
  const mixL = pots * U.potL;
  const cocoL = mixL * U.cocoShare;
  const perlitL = mixL * U.perlitShare;
  const wasteKg = mixL * U.mixKgM3 / 1000;
  const substrate = cocoL * U.cocoEurL + perlitL * U.perlitEurL + pots * U.potEur + wasteKg * U.wasteEurKg;

  const netL = U.waterLPerM2Day * area * activeDays;
  const brutL = netL * (1 + U.drain);
  const water = (brutL / 1000) * U.waterEurM3;
  const fert = brutL * U.fertEurL;
  const acid = brutL * U.alk * U.acidFactor / 1000 * U.hno3EurL;
  const auto = U.eventsDay * activeDays * rooms * U.autoEurEvent;
  const waterFert = water + fert + acid + auto;

  const potPrepH = pots * U.potPrepH;
  const transplantH = pots * U.transplantH;
  const dripperH = activeDays * U.dripperHRoomDay * rooms;
  const manualEcH = (1 - U.hasEcSensor) * activeDays * U.manualEcHRoomDay * rooms;
  const calibH = 52 * U.calibHRoomWeek * rooms;
  const cipH = 52 * U.cipHRoomWeek * rooms;
  const gmpH = harvestsYear * U.gmpHHarvest;
  const disposalH = (mixL / 1000) * U.disposalHM3;
  const laborH = potPrepH + transplantH + dripperH + manualEcH + calibH + cipH + gmpH + disposalH;
  const labor = potPrepH * U.junior + transplantH * U.junior + dripperH * U.junior + manualEcH * U.junior
    + calibH * U.senior + cipH * U.junior + gmpH * U.manager + disposalH * U.junior;

  const dripper = pots * U.dripperPerPlant * U.dripperEur;
  const stake = pots * U.stakePerPlant * U.stakeEur;
  const ipm = harvestsYear * U.ipmEurCycle;
  const ppe = rooms * 12 * U.ppeEurRoomMonth;
  const lab = rooms * 12 * U.labEurRoomMonth;
  const drying = harvestsYear * U.dryingEurHarvest;
  const label = harvestsYear * U.labelEurHarvest;
  const materials = dripper + stake + ipm + ppe + lab + drying + label;
  const total = substrate + waterFert + labor + materials;
  const buffer = cloneBufferFor(s.saleablePct);
  const clonesWeek = plantsYear * (1 + buffer) / 52;

  return {
    substrate: substrate, waterFert: waterFert, labor: labor, materials: materials, total: total,
    laborH: laborH, water: water, fert: fert, acid: acid, auto: auto,
    dripper: dripper, stake: stake, ipm: ipm, ppe: ppe, lab: lab, drying: drying, label: label,
    clonesWeek: clonesWeek, mixL: mixL, brutL: brutL
  };
}

function maxFlowerDays(harvests) {
  return Math.floor(365 / harvests) - 7;
}

function clampHarvests() {
  const harvests = round1(Math.min(7, Math.max(4, +el("harvestsPerRoom").value)));
  el("harvestsPerRoom").value = String(harvests);
  const cap = maxFlowerDays(harvests);
  el("flowerDays").max = String(Math.max(35, cap));
  el("flowerDays").min = "35";
  if (+el("flowerDays").value > cap) el("flowerDays").value = String(cap);
  return harvests;
}

function syncLayout(source) {
  const rooms = Math.max(1, Math.min(30, +el("flowerRooms").value));
  el("flowerRooms").value = String(rooms);
  clampHarvests();
  el("flowerArea").min = String(rooms * 50);
  el("flowerArea").max = String(rooms * 300);
  let roomM2 = Math.min(300, Math.max(50, +el("roomM2").value));
  let flowerArea = +el("flowerArea").value;
  if (source === "roomM2" || source === "flowerRooms") {
    flowerArea = rooms * roomM2;
  } else if (source === "flowerArea") {
    roomM2 = Math.min(300, Math.max(50, flowerArea / rooms));
    flowerArea = rooms * roomM2;
  }
  flowerArea = Math.min(rooms * 300, Math.max(rooms * 50, flowerArea));
  roomM2 = flowerArea / rooms;
  el("flowerArea").value = String(Math.round(flowerArea));
  el("roomM2").value = String(Math.round(roomM2));
}

function syncDensity(source) {
  const flowerArea = +el("flowerArea").value;
  const harvests = +el("harvestsPerRoom").value;
  const usable = flowerArea * 0.85;
  let density = round1(Math.min(12, Math.max(2, +el("plantsPerM2").value)));
  let plantsYear = +el("plantsYear").value;
  if (source === "plantsYear") {
    density = plantsYear / harvests / usable;
    density = round1(Math.min(12, Math.max(2, density)));
    plantsYear = Math.round(density * usable * harvests);
  } else {
    plantsYear = Math.round(density * usable * harvests);
  }
  plantsYear = Math.min(100000, Math.max(400, plantsYear));
  if (plantsYear >= 100000 && usable * harvests > 0) {
    density = round1(Math.min(12, plantsYear / harvests / usable));
  }
  el("plantsPerM2").value = String(density);
  el("plantsYear").value = String(plantsYear);
}

function readState() {
  const ae = document.activeElement && document.activeElement.id;
  clampHarvests();
  if (ae === "flowerArea" || ae === "roomM2" || ae === "flowerRooms") {
    syncLayout(ae);
    syncDensity("keepDensity");
  } else if (ae === "plantsYear") {
    syncDensity("plantsYear");
  } else if (ae === "plantsPerM2" || ae === "harvestsPerRoom") {
    syncDensity("keepDensity");
  }
  const flowerRooms = Math.max(1, +el("flowerRooms").value);
  const harvestsPerRoom = round1(+el("harvestsPerRoom").value);
  const flowerArea = +el("flowerArea").value;
  const plantsPerM2 = +el("plantsPerM2").value;
  return {
    plantsYear: Math.max(400, +el("plantsYear").value),
    plantsPerM2: plantsPerM2,
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
    dryCleanDays: +el("dryCleanDays").value,
    yieldG: +el("yieldG").value,
    genetics: +el("genetics").value,
    priceKg: +el("priceKg").value,
    saleablePct: Math.max(0.8, Math.min(0.88, +el("saleablePct").value / 100)),
    extraction: el("extraction").checked,
    usable: 0.85
  };
}

function highlightPreset(key) {
  document.querySelectorAll(".presets button").forEach((b) => b.classList.toggle("active", b.dataset.key === key));
}

let customMode = false;

function applyPreset(key) {
  if (key === "custom") {
    customMode = true;
    highlightPreset("custom");
    week = 0;
    render();
    return;
  }
  customMode = false;
  const p = PRESETS[key];
  Object.entries(p).forEach(([k, v]) => {
    if (k === "extraction") el("extraction").checked = v;
    else if (el(k)) el(k).value = v;
  });
  highlightPreset(key);
  syncLayout("roomM2");
  syncDensity("plantsYear");
  week = 0;
  render();
}

function assignDryBatches(rooms, dryRooms, dryW, cleanW) {
  const weeks = 52;
  const span = Math.max(1, dryW + cleanW);
  const events = [];
  rooms.forEach(function (row, r) {
    row.forEach(function (cell, w) {
      if (cell === "harvest") events.push({ w: w, room: r + 1 });
    });
  });
  events.sort(function (a, b) { return a.w - b.w || a.room - b.room; });

  function place(limit) {
    const occ = Array.from({ length: limit }, function () { return Array(weeks).fill(null); });
    const labels = Array.from({ length: limit }, function () { return Array(weeks).fill("idle"); });
    let unassigned = 0;
    events.forEach(function (ev) {
      const tag = "C" + ev.room;
      let placed = -1;
      for (let d = 0; d < limit; d++) {
        let free = true;
        for (let i = 0; i < span; i++) {
          if (occ[d][(ev.w + i) % weeks] != null) { free = false; break; }
        }
        if (free) { placed = d; break; }
      }
      if (placed < 0) {
        unassigned += 1;
        return;
      }
      for (let i = 0; i < dryW; i++) {
        const t = (ev.w + i) % weeks;
        occ[placed][t] = tag;
        labels[placed][t] = "gmp";
      }
      for (let i = 0; i < cleanW; i++) {
        const t = (ev.w + dryW + i) % weeks;
        occ[placed][t] = tag;
        labels[placed][t] = "clean";
      }
    });
    let peak = 0;
    for (let w = 0; w < weeks; w++) {
      let n = 0;
      for (let d = 0; d < limit; d++) if (labels[d][w] === "gmp" || labels[d][w] === "clean") n++;
      if (n > peak) peak = n;
    }
    return { occ: occ, labels: labels, unassigned: unassigned, peak: peak };
  }

  const needed = place(40);
  let drySuggest = 1;
  for (let d = 0; d < needed.occ.length; d++) {
    if (needed.occ[d].some(function (x) { return x != null; })) drySuggest = d + 1;
  }
  const used = place(Math.max(1, dryRooms));
  return {
    dryOcc: used.occ,
    dryRows: used.labels,
    unassigned: used.unassigned,
    drySuggest: drySuggest,
    peakDry: used.peak,
    events: events
  };
}

function buildCalendar(s) {
  const weeks = 52;
  const flowerW = Math.max(1, Math.round(s.flowerDays / 7));
  const dryW = Math.max(1, Math.round(s.dryDays / 7));
  const cleanW = Math.max(0, Math.round((s.dryCleanDays || 7) / 7));
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
  const assigned = assignDryBatches(rooms, s.dryRooms, dryW, cleanW);
  const idleWeeks = Array(weeks).fill(true);
  assigned.dryRows.forEach((row) => {
    row.forEach((cell, w) => { if (cell === "gmp" || cell === "clean") idleWeeks[w] = false; });
  });
  return {
    rooms: rooms,
    dryRows: assigned.dryRows,
    dryOcc: assigned.dryOcc,
    drySuggest: assigned.drySuggest,
    peakDry: assigned.peakDry,
    unassigned: assigned.unassigned,
    gmpIdleWeeks: idleWeeks.filter(Boolean).length
  };
}

function simulate(s) {
  const roomM2 = s.roomM2;
  const usableFlower = s.flowerArea * s.usable;
  const plantsYear = s.plantsYear;
  const plantsInFlower = plantsYear / s.harvestsPerRoom;
  const plantsPerRoom = Math.round(plantsInFlower / s.flowerRooms);
  const density = s.plantsPerM2;
  const turnaround = 7;
  const cycleFlower = 365 / s.harvestsPerRoom;
  const cyclesPerRoom = s.harvestsPerRoom;
  const staggerOk = s.flowerDays + turnaround <= cycleFlower + 0.5;
  const harvestsYear = s.flowerRooms * s.harvestsPerRoom;
  const kgGross = plantsYear * s.yieldG / 1000;
  const kgYear = kgGross * s.saleablePct;
  const revenue = kgYear * s.priceKg;

  const motherProd = 18, motherBank = 12, quarantine = 4, tissue = 8, cuttings = 16;
  const preVeg = Math.max(20, Math.round(plantsPerRoom * 0.05));
  const veg = Math.max(28, Math.round(plantsPerRoom * 0.12));
  const gacpM2 = motherProd + motherBank + quarantine + tissue + cuttings + preVeg + veg + s.flowerArea + 40;
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
  const ox = computeOpex(s, plantsYear, harvestsYear);
  const opexYear = ox.total;
  const staffBase = Math.max(2, Math.ceil(ox.laborH / 1800));
  const harvestCrew = staffBase + Math.ceil(plantsPerRoom / 80);
  const ebitda = revenue - opexYear;
  const payback = ebitda > 0 ? capex / ebitda : Infinity;
  const opexPerG = kgYear > 0 ? opexYear / (kgYear * 1000) : 0;
  const cal = buildCalendar(s);
  const cycleDays = s.rootDays + s.preVegDays + s.vegDays + s.flowerDays;
  const drySuggest = cal.drySuggest;

  const alerts = [];
  if (!staggerOk) {
    alerts.push({ t: "bad", m: fmt(s.harvestsPerRoom, 1) + " hasat/oda/y\u0131l i\u00e7in \u00e7i\u00e7eklenme en fazla " + maxFlowerDays(s.harvestsPerRoom) + " g\u00fcn olabilir." });
  } else {
    alerts.push({ t: "ok", m: "Her oda y\u0131lda " + fmt(s.harvestsPerRoom, 1) + " hasat (\u00e7evrim " + fmt(cycleFlower, 1) + " g\u00fcn)." });
  }
  if (roomM2 > 300.5) {
    alerts.push({ t: "bad", m: "Oda alan\u0131 \u00fcst s\u0131n\u0131r\u0131 300 m\u00B2." });
  }
  alerts.push({ t: "ok", m: "Kurutma kural\u0131: her \u00e7i\u00e7ek odas\u0131 hasad\u0131 kendi kurutma odas\u0131na gider. Oda " + (s.dryDays || 14) + " g\u00fcn kurur, sonra " + (s.dryCleanDays || 7) + " g\u00fcn temizlenir; bu s\u00fcrede ba\u015fka hasat giremez." });
  if (cal.unassigned > 0) {
    alerts.push({ t: "bad", m: cal.unassigned + " \u00e7i\u00e7ek odas\u0131 hasad\u0131 kurutmaya s\u0131\u011fmad\u0131. Her hasat ayr\u0131 oda ister \u2014 en az " + drySuggest + " kurutma odas\u0131 gerekir." });
  } else if (s.dryRooms > drySuggest + 1) {
    alerts.push({ t: "warn", m: "Kurutma odas\u0131 (" + s.dryRooms + ") ihtiyac\u0131n (" + drySuggest + ") \u00fczerinde \u2014 GMP maliyeti artar." });
  } else {
    alerts.push({ t: "ok", m: "Kurutma: " + s.dryRooms + " oda yeterli (ihtiya\u00e7 " + drySuggest + ", tepe " + cal.peakDry + ")." });
  }
  if (density > 10) {
    alerts.push({ t: "warn", m: "Yo\u011funluk " + fmt(density, 1) + " bitki/m\u00B2 \u2014 indoor i\u00e7in y\u00fcksek." });
  }
  if (cal.gmpIdleWeeks > 8) {
    alerts.push({ t: "warn", m: "GMP kurutma " + cal.gmpIdleWeeks + " hafta bo\u015f kal\u0131yor." });
  }
  alerts.push({ t: "ok", m: "OPEX Cannactive v2: substrate, su/g\u00fcbre, i\u015f\u00e7ilik, malzeme. Enerji/HVAC, G&A ve d\u0131\u015f COA bu modelde yok." });

  return {
    roomM2: roomM2, usableFlower: usableFlower, plantsPerRoom: plantsPerRoom, density: density,
    plantsYear: plantsYear, plantsInFlower: plantsInFlower, kgYear: kgYear, kgGross: kgGross, revenue: revenue,
    staggerOk: staggerOk, gacpM2: gacpM2, gmpM2: gmpM2, totalBuilt: totalBuilt, drySuggest: drySuggest,
    preVeg: preVeg, veg: veg, motherProd: motherProd, motherBank: motherBank, capex: capex,
    gacpCapex: gacpCapex, gmpCapex: gmpCapex, extractCapex: extractCapex, stability: stability,
    opexYear: opexYear, opex: ox, opexPerG: opexPerG, ebitda: ebitda, payback: payback, staffBase: staffBase, harvestCrew: harvestCrew,
    cycleDays: cycleDays, cyclesPerRoom: cyclesPerRoom, harvestsYear: harvestsYear,
    cycleFlower: cycleFlower, cal: cal, alerts: alerts
  };
}

function renderKpis(m, s) {
  const items = [
    ["Y\u0131ll\u0131k bitki", fmt(s.plantsYear), fmt(m.plantsInFlower, 0) + " \u00e7i\u00e7ekte \u00b7 " + fmt(s.plantsPerM2, 1) + " /m\u00B2", ""],
    ["Oda alan\u0131", m2(s.roomM2), "\u00fcst s\u0131n\u0131r 300 m\u00B2 \u00b7 toplam " + m2(s.flowerArea), s.roomM2 > 300.5 ? "warn" : ""],
    ["Kurutma", String(s.dryRooms), "ihtiya\u00e7 " + m.drySuggest + " \u00b7 tepe " + m.cal.peakDry, m.cal.unassigned ? "warn" : ""],
    ["Kuru \u00e7i\u00e7ek", fmt(m.kgYear, 0) + " kg", "sat\u0131labilir " + fmt(s.saleablePct * 100, 0) + "% \u00b7 br\u00fct " + fmt(m.kgGross, 0) + " kg", ""],
    ["Has\u0131lat", eur(m.revenue), eur(s.priceKg) + "/kg \u00b7 OPEX " + eur(m.opexYear), ""],
    ["CAPEX", eur(m.capex), "marj " + eur(m.ebitda) + " \u00b7 " + (Number.isFinite(m.payback) ? fmt(m.payback, 1) + " y\u0131l" : "\u2014"), m.payback < 5 ? "good" : m.payback < 8 ? "warn" : ""]
  ];
  el("kpis").innerHTML = items.map(([label, value, sub, cls]) =>
    "<article class=\"kpi " + cls + "\"><div class=\"label\">" + label + "</div><div class=\"value\">" + value + "</div><div class=\"sub\">" + sub + "</div></article>"
  ).join("");
}

function renderPlan(m, s, currentWeek) {
  const W = 1180;
  const gap = 8;
  const fCols = Math.min(10, s.flowerRooms);
  const fRows = Math.ceil(s.flowerRooms / fCols);
  const flowerW = Math.min(108, 1100 / fCols - gap);
  const flowerH = 88;
  const flowerY0 = 280;
  const H = flowerY0 + fRows * (flowerH + gap) + 28;
  const rooms = [];
  for (let i = 0; i < s.flowerRooms; i++) {
    const st = m.cal.rooms[i] ? m.cal.rooms[i][currentWeek] : "empty";
    const col = i % fCols;
    const row = Math.floor(i / fCols);
    rooms.push({
      id: "\u00c7i\u00e7ek " + (i + 1),
      x: 40 + col * (flowerW + gap),
      y: flowerY0 + row * (flowerH + gap),
      w: flowerW, h: flowerH, tag: m2(m.roomM2),
      fill: st === "harvest" ? "#d4c49a" : st === "flower" ? "#d4783a" : "#3a2c24"
    });
  }
  const gmpDry = [];
  const dCols = 6;
  for (let i = 0; i < s.dryRooms; i++) {
    const batch = m.cal.dryOcc[i] ? m.cal.dryOcc[i][currentWeek] : null;
    const kind = m.cal.dryRows[i] ? m.cal.dryRows[i][currentWeek] : "idle";
    const col = i % dCols;
    const row = Math.floor(i / dCols);
    const flowerNo = batch ? String(batch).replace("C", "") : "";
    gmpDry.push({
      id: "Kurutma " + (i + 1),
      x: 640 + col * 88,
      y: 48 + row * 50,
      w: 82, h: 44,
      fill: kind === "gmp" ? "#5b8aa8" : kind === "clean" ? "#8aaeb8" : "#243038",
      tag: kind === "clean" ? ("\u00c7" + flowerNo + " temizlik") : (kind === "gmp" ? ("\u00c7i\u00e7ek " + flowerNo) : "bo\u015f")
    });
  }
  const blocks = [
    { id: "Ofis / QMS", x: 40, y: 48, w: 130, h: 90, fill: "#c9b56a", tag: "\u0130dare" },
    { id: "GACP giri\u015f", x: 180, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Ak\u0131\u015f" },
    { id: "GMP giri\u015f", x: 258, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Ak\u0131\u015f" },
    { id: "Trim", x: 360, y: 48, w: 120, h: 90, fill: "#4d738a", tag: "GMP" },
    { id: "Paket", x: 488, y: 48, w: 100, h: 90, fill: "#4d738a", tag: "GMP" }
  ].concat(gmpDry).concat([
    { id: "Ana\u00e7 \u00fcretim", x: 40, y: 168, w: 120, h: 100, fill: "#6f9e62", tag: "GACP" },
    { id: "Ana\u00e7 bankas\u0131", x: 168, y: 168, w: 100, h: 48, fill: "#587c4e", tag: "GACP" },
    { id: "Karantina", x: 168, y: 220, w: 48, h: 48, fill: "#8b6bb0", tag: "R&D" },
    { id: "Doku k\u00fclt.", x: 220, y: 220, w: 48, h: 48, fill: "#8b6bb0", tag: "R&D" },
    { id: "\u00c7elik", x: 276, y: 168, w: 110, h: 100, fill: "#7aa56e", tag: "GACP" },
    { id: "Pre-veg", x: 394, y: 168, w: 120, h: 100, fill: "#88b57a", tag: m2(m.preVeg) },
    { id: "Veg", x: 522, y: 168, w: 150, h: 100, fill: "#88b57a", tag: m2(m.veg) },
    {
      id: s.extraction ? "Ekstraksiyon" : "Trim at\u0131k",
      x: 980, y: 168, w: 150, h: 100,
      fill: s.extraction ? "#8b6bb0" : "#2a332e",
      tag: s.extraction ? "pilot" : "\u2014"
    }
  ]).concat(rooms);
  const drawn = blocks;
  const svg = drawn.map((b) =>
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
  const dry = m.cal.dryRows.map(function (row, i) {
    return "<div class=\"week-row\"><b>Kurutma " + (i + 1) + "</b>" + row.map(function (c, w) {
      const batch = m.cal.dryOcc[i][w] || "";
      const who = batch ? (" \u00c7i\u00e7ek " + String(batch).replace("C", "")) : " bo\u015f";
      return cell(w, c, "H" + (w + 1) + who + (c === "clean" ? " temizlik" : ""));
    }).join("") + "</div>";
  }).join("");
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
    "<tr><td>Substrate (pot+coco+perlit)</td><td class=\"num\">" + eur(m.opex.substrate) + "</td></tr>" +
    "<tr><td>Su + g\u00fcbre + asit + otomasyon</td><td class=\"num\">" + eur(m.opex.waterFert) + "</td></tr>" +
    "<tr><td>\u0130\u015f\u00e7ilik</td><td class=\"num\">" + eur(m.opex.labor) + "</td></tr>" +
    "<tr><td>Malzeme (IPM, dripper, kurutma)</td><td class=\"num\">" + eur(m.opex.materials) + "</td></tr>" +
    "<tr><td><strong>Toplam OPEX</strong></td><td class=\"num\"><strong>" + eur(m.opexYear) + "</strong></td></tr>" +
    "<tr><td>OPEX / g sat\u0131labilir</td><td class=\"num\">" + fmt(m.opexPerG, 2) + " \u20AC</td></tr>" +
    "<tr><td>Has\u0131lat</td><td class=\"num\">" + eur(m.revenue) + "</td></tr>" +
    "<tr><td>Marj (has\u0131lat \u2212 OPEX)</td><td class=\"num\">" + eur(m.ebitda) + "</td></tr></table>";

  el("ops").innerHTML =
    "<table><tr><th>Operasyon</th><th></th></tr>" +
    "<tr><td>Oda alan\u0131</td><td class=\"num\">" + m2(m.roomM2) + "</td></tr>" +
    "<tr><td>Bitki / m\u00B2</td><td class=\"num\">" + fmt(s.plantsPerM2, 1) + "</td></tr>" +
    "<tr><td>Bitki / oda</td><td class=\"num\">" + fmt(m.plantsPerRoom) + "</td></tr>" +
    "<tr><td>Hasat / oda / y\u0131l</td><td class=\"num\">" + fmt(s.harvestsPerRoom, 1) + "</td></tr>" +
    "<tr><td>Tesis hasad\u0131 / y\u0131l</td><td class=\"num\">" + fmt(m.harvestsYear, 1) + "</td></tr>" +
    "<tr><td>Kurutma odas\u0131</td><td class=\"num\">" + s.dryRooms + " \u00b7 ihtiya\u00e7 " + m.drySuggest + "</td></tr>" +
    "<tr><td>\u00c7evrim s\u00fcresi</td><td class=\"num\">" + fmt(m.cycleDays) + " g\u00fcn</td></tr>" +
    "<tr><td>Kadro (FTE / hasat g\u00fcn\u00fc)</td><td class=\"num\">" + m.staffBase + " / " + m.harvestCrew + "</td></tr>" +
    "<tr><td>\u0130\u015f\u00e7ilik saat / y\u0131l</td><td class=\"num\">" + fmt(m.opex.laborH, 0) + "</td></tr>" +
    "<tr><td>Clone / hafta (bufferli)</td><td class=\"num\">" + fmt(m.opex.clonesWeek, 0) + "</td></tr>" +
    "<tr><td>Indoor kapal\u0131 alan</td><td class=\"num\">" + m2(m.totalBuilt) + "</td></tr></table>";

  el("alerts").innerHTML = m.alerts.map(function (a) { return "<div class=\"alert " + a.t + "\">" + a.m + "</div>"; }).join("");
  const nodes = [
    ["Ana\u00e7", (m.motherProd + m.motherBank) + " m\u00B2"],
    ["\u00c7elik", s.rootDays + " g\u00fcn"],
    ["Pre-veg", s.preVegDays + " g\u00fcn"],
    ["Veg", s.vegDays + " g\u00fcn"],
    ["\u00c7i\u00e7ek", s.flowerDays + " g\u00fcn \u00b7 " + s.flowerRooms + " oda"],
    ["Hasat", fmt(s.harvestsPerRoom, 1) + " / oda / y\u0131l"],
    ["Kurutma", s.dryDays + " g\u00fcn \u00b7 temizlik " + s.dryCleanDays + " g\u00fcn \u00b7 " + s.dryRooms + " oda"]
  ];
  el("flow").innerHTML = nodes.map(function (pair, i) {
    return (i ? "<span class=\"arrow\">\u2192</span>" : "") + "<div class=\"node\"><strong>" + pair[0] + "</strong><span>" + pair[1] + "</span></div>";
  }).join("");
}

function renderLabels(s, m) {
  const map = {
    plantsYear: fmt(s.plantsYear),
    plantsPerM2: fmt(s.plantsPerM2, 1),
    harvestsPerRoom: fmt(s.harvestsPerRoom, 1),
    flowerArea: m2(s.flowerArea),
    roomM2: m2(s.roomM2),
    dryRooms: String(s.dryRooms),
    flowerRooms: String(s.flowerRooms),
    flowerDays: s.flowerDays + " g\u00fcn",
    vegDays: s.vegDays + " g\u00fcn",
    preVegDays: s.preVegDays + " g\u00fcn",
    rootDays: s.rootDays + " g\u00fcn",
    dryDays: s.dryDays + " g\u00fcn",
    dryCleanDays: s.dryCleanDays + " g\u00fcn",
    yieldG: s.yieldG + " g",
    genetics: String(s.genetics),
    priceKg: eur(s.priceKg),
    saleablePct: "%" + fmt(s.saleablePct * 100, 0)
  };
  Object.keys(map).forEach(function (k) {
    const n = el("v-" + k);
    if (n) n.textContent = map[k];
  });
  const hint = el("capacityHint");
  if (hint && m) {
    hint.textContent = "Oda " + m2(s.roomM2) + " \u00b7 " + fmt(s.plantsPerM2, 1) + " bitki/m\u00B2 \u00b7 " + fmt(m.plantsPerRoom) + " bitki/oda \u00b7 her \u00e7i\u00e7ek hasad\u0131 ayr\u0131 kurutma";
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
    i.addEventListener("input", function () {
      customMode = true;
      highlightPreset("custom");
      week = 0;
      render();
    });
  });
  el("playBtn").addEventListener("click", play);
  el("exportBtn").addEventListener("click", exportJson);
  applyPreset("dengeli");
});
