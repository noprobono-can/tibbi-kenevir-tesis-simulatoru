const PRESETS = {
  pilot: {
    plantsYear: 3060, plantsPerM2: 5, harvestsPerRoom: 4, flowerRooms: 3, roomM2: 60, flowerArea: 180,
    dryRooms: 1, flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 160, genetics: 3, priceKg: 3500, extractPriceKg: 4200, saleablePct: 80, extraction: false, dryTiers: 3
  },
  dengeli: {
    plantsYear: 5360, plantsPerM2: 4.5, harvestsPerRoom: 5, flowerRooms: 4, roomM2: 70, flowerArea: 280,
    dryRooms: 2, flowerDays: 56, vegDays: 24, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 180, genetics: 4, priceKg: 3500, extractPriceKg: 4200, saleablePct: 85, extraction: true, dryTiers: 3
  },
  yuksek: {
    plantsYear: 16320, plantsPerM2: 5, harvestsPerRoom: 6, flowerRooms: 8, roomM2: 80, flowerArea: 640,
    dryRooms: 3, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 170, genetics: 4, priceKg: 3500, extractPriceKg: 4200, saleablePct: 88, extraction: true, dryTiers: 3
  },
  faz2: {
    plantsYear: 19300, plantsPerM2: 4.5, harvestsPerRoom: 6, flowerRooms: 12, roomM2: 70, flowerArea: 840,
    dryRooms: 5, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 170, genetics: 5, priceKg: 3500, extractPriceKg: 4200, saleablePct: 88, extraction: true, dryTiers: 3
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


const CULTIVARS = [
  { id: "wc", name: "Wedding Cake", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 165, dens: 5.5, extractY: 0.12, stretch: 1.5, thc: "22-26%", origin: "US/AB", note: "8-9 hf, orta stretch" },
  { id: "km", name: "Kush Mints", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 175, dens: 6.0, extractY: 0.11, stretch: 1.4, thc: "22-25%", origin: "US/AB", note: "y\u00fcksek yo\u011funluk / verim" },
  { id: "gg4", name: "GG4", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 150, dens: 5.0, extractY: 0.12, stretch: 1.7, thc: "20-25%", origin: "US/AB", note: "stretchli, re\u00e7ine iyi" },
  { id: "gel", name: "Gelato 33 / ICC", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 155, dens: 5.5, extractY: 0.13, stretch: 1.3, thc: "22-26%", origin: "US/AB", note: "kompakt, \u00f6zk\u00fct" },
  { id: "jfg", name: "Jet Fuel Gelato", flowerDays: 67, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 150, dens: 5.5, extractY: 0.11, stretch: 1.6, thc: "24-28%", origin: "US/AB", note: "uzun \u00e7i\u00e7ek, terpen yo\u011fun" },
  { id: "pm", name: "Permanent Marker", flowerDays: 67, vegDays: 21, preVegDays: 14, rootDays: 14, yieldG: 145, dens: 5.0, extractY: 0.13, stretch: 1.5, thc: "24-28%", origin: "US/AB", note: "orta-uzun \u00e7i\u00e7ek" },
  { id: "mac1", name: "MAC1", flowerDays: 70, vegDays: 25, preVegDays: 16, rootDays: 16, yieldG: 125, dens: 3.5, extractY: 0.15, stretch: 1.2, thc: "24-29%", origin: "US/AB", note: "yava\u015f veg, y\u00fcksek re\u00e7ine" },
  { id: "jh", name: "Jack Herer (Afina)", flowerDays: 70, vegDays: 21, preVegDays: 14, rootDays: 14, yieldG: 140, dens: 4.5, extractY: 0.11, stretch: 2.0, thc: "18-25%", origin: "AB", note: "Bedrocan hatt\u0131, AB t\u0131bbi klasik, sativa stretch" },
  { id: "ww", name: "White Widow", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 170, dens: 5.5, extractY: 0.12, stretch: 1.4, thc: "18-24%", origin: "AB", note: "NL 90\u2019lar klasi\u011fi, 8-9 hf, re\u00e7ine \u00f6rt\u00fcs\u00fc" },
  { id: "amh", name: "Amnesia Haze", flowerDays: 77, vegDays: 21, preVegDays: 14, rootDays: 16, yieldG: 145, dens: 4.0, extractY: 0.10, stretch: 2.2, thc: "20-25%", origin: "AB", note: "11-12 hf, y\u00fcksek stretch, coffeeshop klasi\u011fi" },
  { id: "slh", name: "Super Lemon Haze", flowerDays: 70, vegDays: 21, preVegDays: 14, rootDays: 14, yieldG: 150, dens: 4.5, extractY: 0.11, stretch: 2.0, thc: "18-24%", origin: "AB", note: "Cup kazanan\u0131, limon terpen, 10 hf" },
  { id: "nl", name: "Northern Lights", flowerDays: 53, vegDays: 16, preVegDays: 14, rootDays: 14, yieldG: 180, dens: 6.0, extractY: 0.11, stretch: 1.2, thc: "16-21%", origin: "AB", note: "k\u0131sa \u00e7i\u00e7ek, kompakt, ticari verim" },
  { id: "crp", name: "Critical+", flowerDays: 49, vegDays: 16, preVegDays: 12, rootDays: 14, yieldG: 200, dens: 6.0, extractY: 0.10, stretch: 1.3, thc: "16-22%", origin: "AB", note: "\u0130spanya ticari omurga, 7 hf, y\u00fcksek biyok\u00fctle" },
  { id: "chs", name: "UK Cheese", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 165, dens: 5.5, extractY: 0.11, stretch: 1.4, thc: "17-22%", origin: "AB", note: "Exodus/UK hatt\u0131, 8-9 hf" },
  { id: "hk", name: "Hindu Kush", flowerDays: 52, vegDays: 16, preVegDays: 14, rootDays: 14, yieldG: 160, dens: 5.5, extractY: 0.12, stretch: 1.2, thc: "16-22%", origin: "AB", note: "indica landrace, k\u0131sa d\u00f6ng\u00fc, re\u00e7ete klasi\u011fi" },
  { id: "pk", name: "Pink Kush", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 155, dens: 5.0, extractY: 0.13, stretch: 1.3, thc: "20-26%", origin: "AB", note: "DE/CA t\u0131bbi eczane favorisi" },
  { id: "gth", name: "Ghost Train Haze", flowerDays: 77, vegDays: 21, preVegDays: 14, rootDays: 16, yieldG: 140, dens: 4.0, extractY: 0.12, stretch: 2.1, thc: "24-28%", origin: "AB", note: "Alman eczane pop\u00fcler, uzun sativa" },
  { id: "pp", name: "Power Plant", flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 185, dens: 5.5, extractY: 0.10, stretch: 1.7, thc: "16-22%", origin: "AB", note: "NL ticari sativa, h\u0131zl\u0131 ve verimli" },
  { id: "runtz", name: "Runtz", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 145, dens: 5.0, extractY: 0.13, stretch: 1.4, thc: "20-25%", origin: "K\u00fcresel", note: "Zkittlez x Gelato, 8-9 hf" },
  { id: "zkit", name: "Zkittlez", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 135, dens: 5.0, extractY: 0.12, stretch: 1.3, thc: "18-24%", origin: "K\u00fcresel", note: "terpen odakl\u0131, orta verim" },
  { id: "gsc", name: "GSC", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 140, dens: 5.0, extractY: 0.13, stretch: 1.4, thc: "20-26%", origin: "K\u00fcresel", note: "Cookies ailesi, ABD ikonu" },
  { id: "ogk", name: "OG Kush", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 150, dens: 5.0, extractY: 0.12, stretch: 1.6, thc: "20-26%", origin: "K\u00fcresel", note: "LA hatt\u0131, orta stretch" },
  { id: "sd", name: "Sour Diesel", flowerDays: 70, vegDays: 21, preVegDays: 14, rootDays: 14, yieldG: 145, dens: 4.5, extractY: 0.11, stretch: 2.0, thc: "18-24%", origin: "K\u00fcresel", note: "10 hf sativa, yak\u0131t terpen" },
  { id: "gmo", name: "GMO (Garlic Cookies)", flowerDays: 70, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 155, dens: 5.0, extractY: 0.16, stretch: 1.5, thc: "24-30%", origin: "K\u00fcresel", note: "y\u00fcksek re\u00e7ine, extract hatt\u0131" },
  { id: "dsd", name: "Do-Si-Dos", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 150, dens: 5.0, extractY: 0.13, stretch: 1.4, thc: "20-26%", origin: "K\u00fcresel", note: "OG x Cookies, 9 hf" },
  { id: "jeal", name: "Jealousy", flowerDays: 67, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 150, dens: 5.0, extractY: 0.13, stretch: 1.5, thc: "24-30%", origin: "K\u00fcresel", note: "Gelato x Sherb, AB eczanede de" },
  { id: "lcg", name: "Lemon Cherry Gelato", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 155, dens: 5.5, extractY: 0.13, stretch: 1.4, thc: "22-28%", origin: "K\u00fcresel", note: "2020\u2019ler ABD/AB pop\u00fcler" },
  { id: "apf", name: "Apple Fritter", flowerDays: 63, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 160, dens: 5.5, extractY: 0.12, stretch: 1.4, thc: "22-28%", origin: "K\u00fcresel", note: "Sour Apple x Animal Cookies" },
  { id: "bd", name: "Blue Dream", flowerDays: 67, vegDays: 21, preVegDays: 14, rootDays: 14, yieldG: 175, dens: 5.0, extractY: 0.11, stretch: 1.8, thc: "18-24%", origin: "K\u00fcresel", note: "ABD ticari omurga, y\u00fcksek verim" },
  { id: "cj", name: "Cap Junky", flowerDays: 67, vegDays: 21, preVegDays: 14, rootDays: 14, yieldG: 140, dens: 4.5, extractY: 0.15, stretch: 1.5, thc: "28-34%", origin: "K\u00fcresel", note: "\u00e7ok y\u00fcksek THC, AB t\u0131bbi pazarda da" },
  { id: "sbf", name: "Super Boof", flowerDays: 60, vegDays: 18, preVegDays: 14, rootDays: 14, yieldG: 155, dens: 5.5, extractY: 0.12, stretch: 1.4, thc: "22-27%", origin: "K\u00fcresel", note: "Black Cherry Punch x Tropicana Cookies" }
];

function flowerRoomCount() {
  return Math.max(1, Math.round(+(el("flowerRooms") && el("flowerRooms").value) || 4));
}

function refreshRoomInputMax() {
  const cap = flowerRoomCount();
  CULTIVARS.forEach(function (c) {
    const num = el("gr-" + c.id);
    if (num) num.max = String(cap);
  });
}

function readRoomCount(id) {
  const num = el("gr-" + id);
  if (!num) return 0;
  return Math.max(0, Math.round(+num.value || 0));
}

function setRoomCount(id, n) {
  const num = el("gr-" + id);
  if (!num) return;
  const cap = flowerRoomCount();
  num.value = String(Math.max(0, Math.min(cap, Math.round(n))));
}

function uniqueCultivars(list) {
  const seen = {};
  const out = [];
  (list || []).forEach(function (c) {
    if (!c || seen[c.id]) return;
    seen[c.id] = true;
    out.push(c);
  });
  return out;
}

function selectedCultivars() {
  const list = CULTIVARS.filter(function (c) {
    const n = el("g-" + c.id);
    return n && n.checked;
  });
  return list.length ? list : CULTIVARS.slice(0, 4);
}

function evenSplitRooms(ids, rooms) {
  const cap = Math.max(1, rooms);
  CULTIVARS.forEach(function (c) {
    const chk = el("g-" + c.id);
    const num = el("gr-" + c.id);
    const on = ids.indexOf(c.id) >= 0;
    if (chk) chk.checked = on;
    if (num) {
      num.disabled = !on;
      num.max = String(cap);
      num.value = "0";
    }
  });
  if (!ids.length) return;
  const base = Math.floor(cap / ids.length);
  let remnant = cap % ids.length;
  ids.forEach(function (id) {
    const v = base + (remnant > 0 ? 1 : 0);
    if (remnant > 0) remnant -= 1;
    setRoomCount(id, v);
    const num = el("gr-" + id);
    if (num) num.disabled = false;
  });
}

function applyGeneticsCount(n) {
  const take = Math.max(1, Math.min(CULTIVARS.length, Math.round(n) || 4));
  const ids = CULTIVARS.slice(0, take).map(function (c) { return c.id; });
  evenSplitRooms(ids, flowerRoomCount());
  if (el("genetics")) el("genetics").value = String(take);
}

function scaleRoomAllocation() {
  const rooms = flowerRoomCount();
  refreshRoomInputMax();
  const ids = [];
  const ns = [];
  CULTIVARS.forEach(function (c) {
    const chk = el("g-" + c.id);
    if (!chk || !chk.checked) return;
    ids.push(c.id);
    ns.push(readRoomCount(c.id));
  });
  if (!ids.length) return;
  const sum = ns.reduce(function (a, b) { return a + b; }, 0);
  if (sum === rooms) return;
  if (sum <= 0) {
    evenSplitRooms(ids, rooms);
    return;
  }
  let used = 0;
  ids.forEach(function (id, i) {
    const v = (i === ids.length - 1)
      ? Math.max(0, rooms - used)
      : Math.max(0, Math.round(ns[i] * rooms / sum));
    if (i < ids.length - 1) used += v;
    setRoomCount(id, v);
    const chk = el("g-" + id);
    const num = el("gr-" + id);
    if (chk) chk.checked = v > 0;
    if (num) num.disabled = v <= 0;
  });
}

function mixStats(list) {
  if (!list || !list.length) return null;
  const n = list.length;
  const avg = function (k) { return list.reduce(function (s, c) { return s + c[k]; }, 0) / n; };
  return {
    flowerDays: Math.round(avg("flowerDays")),
    vegDays: Math.round(avg("vegDays")),
    preVegDays: Math.round(avg("preVegDays")),
    rootDays: Math.round(avg("rootDays")),
    yieldG: Math.round(avg("yieldG")),
    dens: Math.round(avg("dens") * 10) / 10,
    extractY: Math.round(avg("extractY") * 1000) / 1000,
    stretch: Math.round(avg("stretch") * 10) / 10
  };
}

function applyMixToSliders() {
  const alloc = buildRoomMap(flowerRoomCount());
  const list = alloc.map.length ? alloc.map : selectedCultivars();
  if (!list.length) return;
  const st = mixStats(list);
  if (!st) return;
  if (el("flowerDays")) el("flowerDays").value = String(st.flowerDays);
  if (el("vegDays")) el("vegDays").value = String(st.vegDays);
  if (el("preVegDays")) el("preVegDays").value = String(st.preVegDays);
  if (el("rootDays")) el("rootDays").value = String(st.rootDays);
  if (el("yieldG")) el("yieldG").value = String(st.yieldG);
  if (el("genetics")) el("genetics").value = String(uniqueCultivars(list).length);
}

function cultivarForRoom(list, i) {
  return list[i % list.length];
}

function buildRoomMap(flowerRooms) {
  const rooms = Math.max(1, flowerRooms || flowerRoomCount());
  const rows = [];
  CULTIVARS.forEach(function (c) {
    const chk = el("g-" + c.id);
    if (!chk || !chk.checked) return;
    const n = readRoomCount(c.id);
    if (n > 0) rows.push({ c: c, rooms: n });
  });
  const assigned = rows.reduce(function (s, r) { return s + r.rooms; }, 0);
  const map = [];
  if (!rows.length) {
    const fb = selectedCultivars();
    const n = Math.max(1, fb.length);
    const base = Math.floor(rooms / n);
    let remnant = rooms % n;
    fb.forEach(function (c) {
      const k = base + (remnant > 0 ? 1 : 0);
      if (remnant > 0) remnant -= 1;
      for (let i = 0; i < k; i++) map.push(c);
    });
    return { map: map, rows: rows, assigned: assigned, match: false, empty: true, fill: false, trim: false };
  }
  rows.forEach(function (r) {
    for (let i = 0; i < r.rooms; i++) map.push(r.c);
  });
  let fill = false;
  let trim = false;
  if (map.length < rooms) {
    fill = true;
    const pad = rows[0].c;
    while (map.length < rooms) map.push(pad);
  } else if (map.length > rooms) {
    trim = true;
    map.length = rooms;
  }
  return { map: map, rows: rows, assigned: assigned, match: assigned === rooms, empty: false, fill: fill, trim: trim };
}

function syncGeneRooms(id) {
  const chk = el("g-" + id);
  const num = el("gr-" + id);
  if (!chk || !num) return;
  if (!chk.checked) {
    num.value = "0";
    num.disabled = true;
    return;
  }
  num.disabled = false;
  if (readRoomCount(id) <= 0) {
    const others = CULTIVARS.reduce(function (s, c) {
      if (c.id === id) return s;
      const n = el("g-" + c.id);
      if (!n || !n.checked) return s;
      return s + readRoomCount(c.id);
    }, 0);
    setRoomCount(id, Math.max(1, flowerRoomCount() - others));
  }
}

function onGeneRoomsInput(id) {
  const num = el("gr-" + id);
  const chk = el("g-" + id);
  if (!num || !chk) return;
  const v = Math.max(0, Math.min(flowerRoomCount(), Math.round(+num.value || 0)));
  num.value = String(v);
  if (v <= 0) {
    chk.checked = false;
    num.disabled = true;
  } else {
    chk.checked = true;
    num.disabled = false;
  }
}

function layoutFromFlower(s, stats) {

  const flowerDays = Math.max(1, (stats && stats.flowerDays) || s.flowerDays);
  const vegDays = (stats && stats.vegDays) || s.vegDays;
  const preVegDays = (stats && stats.preVegDays) || s.preVegDays;
  const rootDays = (stats && stats.rootDays) || s.rootDays;
  const nG = (s.cultivars && s.cultivars.length) || s.genetics || 4;
  const tiers = Math.max(1, Math.min(3, s.dryTiers || 3));
  const room = s.roomM2;
  const flower = s.flowerArea;
  const dryRoomM2 = Math.max(24, Math.round(room / tiers));
  const dryArea = s.dryRooms * dryRoomM2;
  const hangEq = dryRoomM2 * tiers;
  const hangNeed = Math.round(room);
  return {
    tiers: tiers,
    dryRoomM2: dryRoomM2,
    dryArea: dryArea,
    hangEq: hangEq,
    hangNeed: hangNeed,
    hangOk: hangEq + 0.01 >= hangNeed,
    motherM2: Math.max(12, Math.round(flower * 0.03 + nG * 6)),
    cuttingsM2: Math.max(16, Math.round(flower * (rootDays / flowerDays) / 2.6)),
    preVegM2: Math.max(20, Math.round(flower * (preVegDays / flowerDays) / 1.8)),
    vegM2: Math.max(28, Math.round(flower * (vegDays / flowerDays) / 1.45)),
    trimM2: Math.max(24, Math.round(room * 0.35)),
    packM2: Math.max(18, Math.round(s.flowerRooms * 6 + flower * 0.02)),
    flowerDays: flowerDays,
    vegDays: vegDays,
    preVegDays: preVegDays,
    rootDays: rootDays
  };
}

function sizeExtract(feedKg, crudeFrac) {
  if (feedKg < 1) {
    return {
      capexEq: 0, capexRoom: 0, capex: 0, m2: 0, opex: 0,
      opexSolvent: 0, opexLabor: 0, opexFixed: 0,
      kgDay: 0, crudeKg: 0, operators: 0, tier: "off", crudeFrac: 0
    };
  }
  const kgDay = feedKg / 250;
  let capexEq, m2, tier;
  if (kgDay <= 8) { capexEq = 70000 + kgDay * 3500; m2 = 48; tier = "CUP / ~15 lb-g\u00fcn"; }
  else if (kgDay <= 45) { capexEq = 165000 + (kgDay - 8) * 5200; m2 = 90 + (kgDay - 8) * 2.2; tier = "kriyo-etanol orta"; }
  else if (kgDay <= 90) { capexEq = 360000 + (kgDay - 45) * 3100; m2 = 175 + (kgDay - 45) * 1.8; tier = "100+ lb/g\u00fcn hatt\u0131"; }
  else if (kgDay <= 180) { capexEq = 500000 + (kgDay - 90) * 3900; m2 = 256 + (kgDay - 90) * 1.4; tier = "CryoEXS-400 s\u0131n\u0131f\u0131"; }
  else { capexEq = 850000 + (kgDay - 180) * 2000; m2 = 380 + (kgDay - 180) * 1.1; tier = "end\u00fcstriyel"; }
  capexEq = Math.min(2200000, capexEq) + 22000;
  m2 = Math.min(700, Math.max(40, Math.round(m2)));
  const capexRoom = m2 * 5600;
  const operators = 1 + Math.floor(kgDay / 70);
  const opexSolvent = feedKg * 9.5;
  const opexLabor = operators * 1800 * 7;
  const opexFixed = 16000;
  const frac = crudeFrac || 0.12;
  return {
    capexEq: capexEq, capexRoom: capexRoom, capex: capexEq + capexRoom, m2: m2,
    opex: opexSolvent + opexLabor + opexFixed,
    opexSolvent: opexSolvent, opexLabor: opexLabor, opexFixed: opexFixed,
    kgDay: kgDay, crudeKg: feedKg * frac, operators: operators, tier: tier, crudeFrac: frac
  };
}

function renderGeneticsUI() {
  const box = el("geneticsBox");
  if (!box || box.dataset.ready) return;
  const groups = [
    { t: "Tesis kar\u0131\u015f\u0131m\u0131", ids: ["wc", "km", "gg4", "gel", "jfg", "pm", "mac1"] },
    { t: "Avrupa / t\u0131bbi klasik", ids: ["jh", "ww", "amh", "slh", "nl", "crp", "chs", "hk", "pk", "gth", "pp"] },
    { t: "K\u00fcresel ticari", ids: ["runtz", "zkit", "gsc", "ogk", "sd", "gmo", "dsd", "jeal", "lcg", "apf", "bd", "cj", "sbf"] }
  ];
  const byId = {};
  CULTIVARS.forEach(function (c) { byId[c.id] = c; });
  function card(c, on) {
    const rooms = on ? 1 : 0;
    return "<div class=\"gene-row\">" +
      "<label class=\"check\"><input type=\"checkbox\" id=\"g-" + c.id + "\"" + (on ? " checked" : "") + " />" +
      "<span class=\"gene-body\">" + c.name +
      "<small>" + c.origin + " \u00b7 " + c.flowerDays + "g \u00e7i\u00e7ek / " + c.vegDays + "g veg / " + c.rootDays + "g k\u00f6k / " +
      c.yieldG + " g \u00b7 " + c.dens + "/m\u00B2 \u00b7 THC " + c.thc +
      "<br>" + c.note + " \u00b7 ham ya\u011f ~%" + Math.round(c.extractY * 100) + "</small></span></label>" +
      "<div class=\"gene-rooms\"><input type=\"number\" id=\"gr-" + c.id + "\" min=\"0\" max=\"30\" step=\"1\" value=\"" + rooms + "\"" + (on ? "" : " disabled") + " /><em>oda</em></div>" +
      "</div>";
  }
  const seen = {};
  let html = "";
  groups.forEach(function (g) {
    html += "<h3>" + g.t + "</h3>";
    g.ids.forEach(function (id, i) {
      const c = byId[id];
      if (!c) return;
      seen[id] = true;
      html += card(c, g === groups[0] && i < 4);
    });
  });
  CULTIVARS.forEach(function (c) {
    if (!seen[c.id]) html += card(c, false);
  });
  box.innerHTML = html;
  box.dataset.ready = "1";
  box.querySelectorAll("input[type=checkbox]").forEach(function (i) {
    i.addEventListener("input", function () {
      const id = i.id.replace(/^g-/, "");
      syncGeneRooms(id);
      customMode = true;
      cycleOverride = false;
      pinDryRooms = false;
      highlightPreset("custom");
      applyMixToSliders();
      week = 0;
      render();
    });
  });
  box.querySelectorAll("input[type=number]").forEach(function (i) {
    i.addEventListener("click", function (ev) { ev.stopPropagation(); });
    i.addEventListener("input", function () {
      const id = i.id.replace(/^gr-/, "");
      onGeneRoomsInput(id);
      customMode = true;
      cycleOverride = false;
      pinDryRooms = false;
      highlightPreset("custom");
      applyMixToSliders();
      week = 0;
      render();
    });
  });
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
  el("flowerDays").min = "35";
  if (!cycleOverride) {
    el("flowerDays").max = "84";
    return harvests;
  }
  const cap = maxFlowerDays(harvests);
  el("flowerDays").max = String(Math.max(35, cap));
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
  const alloc = buildRoomMap(flowerRooms);
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
    dryTiers: Math.max(1, Math.min(3, +el("dryTiers").value)),
    flowerRooms: flowerRooms,
    flowerDays: +el("flowerDays").value,
    vegDays: +el("vegDays").value,
    preVegDays: +el("preVegDays").value,
    rootDays: +el("rootDays").value,
    dryDays: +el("dryDays").value,
    dryCleanDays: Math.max(1, Math.min(7, +el("dryCleanDays").value)),
    yieldG: +el("yieldG").value,
    genetics: uniqueCultivars(alloc.map).length || selectedCultivars().length,
    cultivars: uniqueCultivars(alloc.map).length ? uniqueCultivars(alloc.map) : selectedCultivars(),
    roomMap: alloc.map,
    alloc: alloc,
    priceKg: +el("priceKg").value,
    extractPriceKg: el("extractPriceKg") ? +el("extractPriceKg").value : 4200,
    saleablePct: Math.max(0.8, Math.min(0.88, +el("saleablePct").value / 100)),
    extractPct: Math.max(0, Math.min(1, +el("extractPct").value / 100)),
    extraction: +el("extractPct").value > 0,
    usable: 0.85
  };
}

function highlightPreset(key) {
  document.querySelectorAll(".presets button").forEach((b) => b.classList.toggle("active", b.dataset.key === key));
}

let customMode = false;
let cycleOverride = false;

function applyPreset(key) {
  if (key === "custom") {
    customMode = true;
    highlightPreset("custom");
    week = 0;
    render();
    return;
  }
  customMode = false;
  pinDryRooms = false;
  const p = PRESETS[key];
  Object.entries(p).forEach(([k, v]) => {
    if (k === "extraction") {
      if (el("extractPct")) el("extractPct").value = v ? "20" : "0";
    } else if (k === "genetics") {
      applyGeneticsCount(v);
    } else if (el(k)) el(k).value = v;
  });
  cycleOverride = false;
  applyMixToSliders();
  highlightPreset(key);
  syncLayout("roomM2");
  syncDensity("plantsYear");
  week = 0;
  render();
}

function assignDryBatches(events, dryRooms, dryDays, cleanDays) {
  const weeks = 52;
  const days = weeks * 7;
  const dryD = Math.max(1, Math.round(dryDays));
  const cleanD = Math.max(1, Math.min(7, Math.round(cleanDays)));
  const span = dryD + cleanD;
  const ordered = events.slice().sort(function (a, b) {
    const aStart = a.w * 7;
    const bStart = b.w * 7;
    const aw = aStart + span > days ? 0 : 1;
    const bw = bStart + span > days ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return a.w - b.w || a.room - b.room;
  });

  function place(limit) {
    const occDays = Array.from({ length: limit }, function () { return Array(days).fill(null); });
    const kindDays = Array.from({ length: limit }, function () { return Array(days).fill("idle"); });
    let unassigned = 0;
    ordered.forEach(function (ev) {
      const tag = "C" + ev.room;
      const start = ev.w * 7;
      let placed = -1;
      for (let d = 0; d < limit; d++) {
        let free = true;
        for (let i = 0; i < span; i++) {
          if (occDays[d][(start + i) % days] != null) { free = false; break; }
        }
        if (free) { placed = d; break; }
      }
      if (placed < 0) {
        unassigned += 1;
        return;
      }
      for (let i = 0; i < dryD; i++) {
        const t = (start + i) % days;
        occDays[placed][t] = tag;
        kindDays[placed][t] = "gmp";
      }
      for (let i = 0; i < cleanD; i++) {
        const t = (start + dryD + i) % days;
        occDays[placed][t] = tag;
        kindDays[placed][t] = "clean";
      }
    });
    const occ = Array.from({ length: limit }, function () { return Array(weeks).fill(null); });
    const labels = Array.from({ length: limit }, function () { return Array(weeks).fill("idle"); });
    let peak = 0;
    for (let t = 0; t < days; t++) {
      let n = 0;
      for (let d = 0; d < limit; d++) if (kindDays[d][t] !== "idle") n++;
      if (n > peak) peak = n;
    }
    for (let d = 0; d < limit; d++) {
      for (let w = 0; w < weeks; w++) {
        let hasGmp = false, hasClean = false, tag = null;
        for (let i = 0; i < 7; i++) {
          const t = w * 7 + i;
          if (kindDays[d][t] === "gmp") { hasGmp = true; tag = occDays[d][t]; }
          else if (kindDays[d][t] === "clean") { hasClean = true; if (!tag) tag = occDays[d][t]; }
        }
        labels[d][w] = hasGmp ? "gmp" : hasClean ? "clean" : "idle";
        occ[d][w] = tag;
      }
    }
    return { occ: occ, labels: labels, unassigned: unassigned, peak: peak };
  }

  let drySuggest = 1;
  const cap = Math.min(40, Math.max(1, ordered.length));
  for (let n = 1; n <= cap; n++) {
    if (place(n).unassigned === 0) { drySuggest = n; break; }
    drySuggest = n;
  }
  const used = place(Math.max(1, dryRooms));
  return {
    dryOcc: used.occ,
    dryRows: used.labels,
    unassigned: used.unassigned,
    drySuggest: drySuggest,
    peakDry: used.peak,
    events: ordered
  };
}

function buildCalendar(s) {
  const weeks = 52;
  const mix = s.cultivars && s.cultivars.length ? s.cultivars : [];
  const periodW = 52 / s.harvestsPerRoom;
  const staggerW = periodW / s.flowerRooms;
  const rooms = [];
  const events = [];
  const roomCultivars = [];
  for (let r = 0; r < s.flowerRooms; r++) {
    const g = (s.roomMap && s.roomMap[r]) ? s.roomMap[r] : (mix.length ? cultivarForRoom(mix, r) : null);
    roomCultivars.push(g);
    const flowerDays = (!cycleOverride && g) ? g.flowerDays : s.flowerDays;
    const flowerW = Math.max(1, Math.round(flowerDays / 7));
    const row = Array(weeks).fill("empty");
    const offset = r * staggerW;
    const harvestAt = [];
    for (let start = offset; start < weeks; start += periodW) {
      const s0 = ((Math.round(start) % weeks) + weeks) % weeks;
      for (let w = 0; w < flowerW; w++) {
        const t = (s0 + w) % weeks;
        if (row[t] !== "harvest") row[t] = "flower";
      }
      const h = (s0 + flowerW - 1) % weeks;
      harvestAt.push(h);
      events.push({ w: h, room: r + 1, cultivar: g ? g.name : "" });
    }
    harvestAt.forEach(function (h) { row[h] = "harvest"; });
    rooms.push(row);
  }
  const unique = [];
  const seen = {};
  events.forEach(function (ev) {
    const key = ev.room + ":" + ev.w;
    if (seen[key]) return;
    seen[key] = true;
    unique.push(ev);
  });
  const assigned = assignDryBatches(unique, s.dryRooms, s.dryDays || 14, s.dryCleanDays || 7);
  const idleWeeks = Array(weeks).fill(true);
  assigned.dryRows.forEach((row) => {
    row.forEach((cell, w) => { if (cell === "gmp" || cell === "clean") idleWeeks[w] = false; });
  });
  return {
    rooms: rooms,
    roomCultivars: roomCultivars,
    dryRows: assigned.dryRows,
    dryOcc: assigned.dryOcc,
    drySuggest: assigned.drySuggest,
    peakDry: assigned.peakDry,
    unassigned: assigned.unassigned,
    gmpIdleWeeks: idleWeeks.filter(Boolean).length
  };
}

function simulate(s) {
  const roomMap = (s.roomMap && s.roomMap.length) ? s.roomMap : [];
  const mixEarly = uniqueCultivars(roomMap).length ? uniqueCultivars(roomMap) : (s.cultivars && s.cultivars.length ? s.cultivars : []);
  const statsEarly = roomMap.length ? mixStats(roomMap) : (mixEarly.length ? mixStats(mixEarly) : null);
  const flowerDaysUse = statsEarly ? statsEarly.flowerDays : s.flowerDays;
  const flowerDaysLong = (mixEarly.length && !cycleOverride)
    ? Math.max.apply(null, mixEarly.map(function (c) { return c.flowerDays; }))
    : s.flowerDays;
  const roomM2 = s.roomM2;
  const usableFlower = s.flowerArea * s.usable;
  const plantsYear = s.plantsYear;
  const plantsInFlower = plantsYear / s.harvestsPerRoom;
  const plantsPerRoom = Math.round(plantsInFlower / s.flowerRooms);
  const density = s.plantsPerM2;
  const turnaround = 7;
  const cycleFlower = 365 / s.harvestsPerRoom;
  const cyclesPerRoom = s.harvestsPerRoom;
  const staggerOk = flowerDaysLong + turnaround <= cycleFlower + 0.5;
  const harvestsYear = s.flowerRooms * s.harvestsPerRoom;
  const mix = mixEarly;
  const stats = statsEarly;
  const yieldUse = cycleOverride ? s.yieldG : (stats ? stats.yieldG : s.yieldG);
  const yieldOf = function (g) { return cycleOverride ? s.yieldG : g.yieldG; };
  let kgGross = 0;
  const kgById = {};
  if (roomMap.length) {
    roomMap.forEach(function (g) {
      const kg = (plantsYear / s.flowerRooms) * yieldOf(g) / 1000;
      kgGross += kg;
      kgById[g.id] = (kgById[g.id] || 0) + kg;
    });
  } else {
    kgGross = plantsYear * yieldUse / 1000;
  }
  const kgYear = kgGross * s.saleablePct;
  const unsaleableKg = kgGross * (1 - s.saleablePct);
  const extractFeed = kgGross * (s.extractPct || 0);
  const kgFlowerSold = Math.max(0, kgYear - Math.max(0, extractFeed - unsaleableKg));
  const crudeFrac = stats && stats.extractY ? stats.extractY : 0.12;
  const ex = sizeExtract(extractFeed, crudeFrac);
  const layout = layoutFromFlower(s, stats);
  const flowerRevenue = kgFlowerSold * s.priceKg;
  const extractRevenue = ex.crudeKg * (s.extractPriceKg || 0);
  const revenue = flowerRevenue + extractRevenue;


  const motherProd = layout.motherM2;
  const motherBank = Math.max(8, Math.round(layout.motherM2 * 0.5));
  const quarantine = 4, tissue = 8, cuttings = layout.cuttingsM2;
  const preVeg = layout.preVegM2;
  const veg = layout.vegM2;
  const gacpM2 = motherProd + motherBank + quarantine + tissue + cuttings + preVeg + veg + s.flowerArea + 40;
  const dryM2 = layout.dryArea;
  const extractM2 = ex.m2;
  const gmpM2 = dryM2 + layout.trimM2 + layout.packM2 + 30;
  const officeM2 = 36;
  const totalBuilt = gacpM2 + gmpM2 + officeM2 + extractM2;

  const lightCapex = preVeg * 220 + veg * 380 + s.flowerArea * 480;
  const gacpCapex = gacpM2 * 2800 + lightCapex;
  const gmpCapex = gmpM2 * 5600;
  const extractCapex = ex.capex;
  const stability = (mix.length || s.genetics) * 8000;
  const capex = gacpCapex + gmpCapex + officeM2 * 1400 + extractCapex + stability;
  const ox = computeOpex(s, plantsYear, harvestsYear);
  ox.extract = ex.opex;
  ox.total += ex.opex;
  const opexYear = ox.total;
  const staffBase = Math.max(2, Math.ceil(ox.laborH / 1800) + (ex.operators || 0));
  const harvestCrew = staffBase + Math.ceil(plantsPerRoom / 80);
  const ebitda = revenue - opexYear;
  const payback = ebitda > 0 ? capex / ebitda : Infinity;
  const opexPerG = kgYear > 0 ? opexYear / (kgYear * 1000) : 0;
  const cal = buildCalendar(s);
  const cycleDays = (stats && !cycleOverride)
    ? stats.rootDays + stats.preVegDays + stats.vegDays + stats.flowerDays
    : s.rootDays + s.preVegDays + s.vegDays + s.flowerDays;
  const drySuggest = cal.drySuggest;

  const alerts = [];
  if (!staggerOk) {
    const tight = (mixEarly.length && !cycleOverride)
      ? mixEarly.filter(function (c) { return c.flowerDays + turnaround > cycleFlower + 0.5; }).map(function (c) { return c.name; }).join(", ")
      : "";
    alerts.push({ t: "bad", m: fmt(s.harvestsPerRoom, 1) + " hasat/oda/y\u0131l i\u00e7in \u00e7i\u00e7eklenme en fazla " + maxFlowerDays(s.harvestsPerRoom) + " g\u00fcn olabilir" + (tight ? (" \u2014 s\u0131k\u0131\u015fan: " + tight) : "") + "." });
  } else {
    alerts.push({ t: "ok", m: "Her oda y\u0131lda " + fmt(s.harvestsPerRoom, 1) + " hasat (\u00e7evrim " + fmt(cycleFlower, 1) + " g\u00fcn)." });
  }
  if (roomM2 > 300.5) {
    alerts.push({ t: "bad", m: "Oda alan\u0131 \u00fcst s\u0131n\u0131r\u0131 300 m\u00B2." });
  }
  alerts.push({ t: "ok", m: "Kurutma kural\u0131: her \u00e7i\u00e7ek odas\u0131 hasad\u0131 kendi kurutma odas\u0131na gider. Oda " + (s.dryDays || 14) + " g\u00fcn kurur, sonra " + (s.dryCleanDays || 7) + " g\u00fcn temizlenir; bu s\u00fcrede ba\u015fka hasat giremez." });
  if (cal.unassigned > 0) {
    alerts.push({ t: "bad", m: "Kurutma yetersiz: " + s.dryRooms + " oda var, " + cal.unassigned + " hasat s\u0131rada bekliyor. " + s.flowerRooms + " \u00e7i\u00e7ek odas\u0131 i\u00e7in " + drySuggest + " kurutma odas\u0131 gerekir." });
  } else if (s.dryRooms > drySuggest + 1) {
    alerts.push({ t: "warn", m: "Kurutma odas\u0131 (" + s.dryRooms + ") ihtiyac\u0131n (" + drySuggest + ") \u00fczerinde \u2014 GMP maliyeti artar." });
  } else {
    alerts.push({ t: "ok", m: "Kurutma: " + s.dryRooms + " oda yeterli (ihtiya\u00e7 " + drySuggest + ", tepe " + cal.peakDry + ")." });
  }
  if (density > 10) {
    alerts.push({ t: "warn", m: "Yo\u011funluk " + fmt(density, 1) + " bitki/m\u00B2 \u2014 indoor i\u00e7in y\u00fcksek." });
  }
  if (stats && Math.abs(stats.dens - density) > 1) {
    alerts.push({ t: "warn", m: "Se\u00e7ilen genetik ortalama " + fmt(stats.dens, 1) + " bitki/m\u00B2 \u00f6nerir; kayd\u0131r\u0131c\u0131 " + fmt(density, 1) + "." });
  }
  if (cal.gmpIdleWeeks > 8) {
    alerts.push({ t: "warn", m: "GMP kurutma " + cal.gmpIdleWeeks + " hafta bo\u015f kal\u0131yor." });
  }
  if (!layout.hangOk) {
    alerts.push({ t: "bad", m: "Kurutma taban\u0131 yetersiz: " + layout.dryRoomM2 + " m\u00B2 \u00d7 " + layout.tiers + " kat = " + layout.hangEq + " m\u00B2 as\u0131; bir \u00e7i\u00e7ek hasad\u0131 " + layout.hangNeed + " m\u00B2 ister." });
  } else {
    alerts.push({ t: "ok", m: "Kurutma boyutu: \u00e7i\u00e7ek odas\u0131 " + Math.round(s.roomM2) + " m\u00B2 \u2192 " + layout.tiers + " katta taban " + layout.dryRoomM2 + " m\u00B2 (\u2265 oda/" + layout.tiers + "). As\u0131 e\u015fde\u011feri " + layout.hangEq + " m\u00B2." });
  }
  alerts.push({ t: "ok", m: "Yerle\u015fim: veg / pre-veg / \u00e7elik alan\u0131 = \u00e7i\u00e7ek m\u00B2 \u00d7 (a\u015fama s\u00fcresi / \u00e7i\u00e7ek s\u00fcresi) / yo\u011funluk katsay\u0131s\u0131. Ana\u00e7 genetik say\u0131s\u0131yla b\u00fcy\u00fcr." });
  if (s.alloc && s.alloc.rows && s.alloc.rows.length) {
    const dist = s.alloc.rows.map(function (r) { return r.c.name + " " + r.rooms + " oda"; }).join(", ");
    if (!s.alloc.match) {
      if (s.alloc.trim) alerts.push({ t: "warn", m: "Oda da\u011f\u0131l\u0131m\u0131 " + s.alloc.assigned + ", tesis " + s.flowerRooms + " oda. Fazlas\u0131 sim\u00fclasyonda k\u0131rp\u0131ld\u0131 (" + dist + ")." });
      else if (s.alloc.fill) alerts.push({ t: "warn", m: "Oda da\u011f\u0131l\u0131m\u0131 " + s.alloc.assigned + " / " + s.flowerRooms + ". Bo\u015f odalar " + s.alloc.rows[0].c.name + " ile dolduruldu (" + dist + ")." });
    } else {
      alerts.push({ t: "ok", m: "Oda da\u011f\u0131l\u0131m\u0131: " + dist + " (" + s.flowerRooms + "/" + s.flowerRooms + ")." });
    }
  } else if (s.alloc && s.alloc.empty) {
    alerts.push({ t: "warn", m: "Oda say\u0131s\u0131 girilmedi \u2014 se\u00e7ilen genetiklere e\u015fit da\u011f\u0131t\u0131ld\u0131." });
  }
  if (mix.length) {
    const kgBits = mix.map(function (c) {
      const kg = kgById[c.id];
      return c.name + (kg != null ? (" " + fmt(kg, 0) + " kg") : "");
    }).join(", ");
    alerts.push({ t: "ok", m: "Genetik (oda a\u011f\u0131rl\u0131kl\u0131): " + kgBits + " \u00b7 ort. \u00e7i\u00e7ek " + flowerDaysUse + " g\u00fcn / " + yieldUse + " g / ham ya\u011f %" + Math.round(((stats && stats.extractY) || 0.12) * 100) + "." });
  }
  if (extractFeed > 0) {
    alerts.push({ t: "ok", m: "Ekstraksiyon " + fmt(extractFeed, 0) + " kg/y\u0131l (~" + fmt(ex.kgDay, 1) + " kg/g\u00fcn, " + ex.tier + "), ham ya\u011f " + fmt(ex.crudeKg, 0) + " kg. Hat kapasiteye g\u00f6re \u00f6l\u00e7ekli kriyo-etanol (C1D2)." });
  }
  alerts.push({ t: "ok", m: "Has\u0131lat = sat\u0131lan \u00e7i\u00e7ek " + fmt(kgFlowerSold, 0) + " kg \u00d7 " + eur(s.priceKg) + "/kg (" + eur(flowerRevenue) + ")" + (extractFeed > 0 ? (" + ham ya\u011f " + fmt(ex.crudeKg, 0) + " kg \u00d7 " + eur(s.extractPriceKg || 0) + "/kg (" + eur(extractRevenue) + ")") : "") + "." });
  alerts.push({ t: "ok", m: "OPEX Cannactive v2 + ekstraksiyon i\u015fletme (solvent/enerji + operat\u00f6r). Sera HVAC enerjisi, G&A ve d\u0131\u015f COA bu modelde yok." });

  return {
    roomM2: roomM2, usableFlower: usableFlower, plantsPerRoom: plantsPerRoom, density: density,
    plantsYear: plantsYear, plantsInFlower: plantsInFlower, kgYear: kgYear, kgGross: kgGross, revenue: revenue,
    staggerOk: staggerOk, gacpM2: gacpM2, gmpM2: gmpM2, totalBuilt: totalBuilt, drySuggest: drySuggest,
    preVeg: preVeg, veg: veg, motherProd: motherProd, motherBank: motherBank, capex: capex,
    gacpCapex: gacpCapex, gmpCapex: gmpCapex, extractCapex: extractCapex, stability: stability,
    opexYear: opexYear, opex: ox, opexPerG: opexPerG, ebitda: ebitda, payback: payback, staffBase: staffBase, harvestCrew: harvestCrew,
    cycleDays: cycleDays, cyclesPerRoom: cyclesPerRoom, harvestsYear: harvestsYear,
    cycleFlower: cycleFlower, cal: cal, alerts: alerts,
    layout: layout, extract: ex, kgFlowerSold: kgFlowerSold, extractFeed: extractFeed, yieldUse: yieldUse,
    flowerRevenue: flowerRevenue, extractRevenue: extractRevenue, kgById: kgById,
    stats: stats, flowerDaysLong: flowerDaysLong
  };
}

function renderKpis(m, s) {
  const items = [
    ["Y\u0131ll\u0131k bitki", fmt(s.plantsYear), fmt(m.plantsInFlower, 0) + " \u00e7i\u00e7ekte \u00b7 " + fmt(s.plantsPerM2, 1) + " /m\u00B2", ""],
    ["Oda alan\u0131", m2(s.roomM2), "\u00fcst s\u0131n\u0131r 300 m\u00B2 \u00b7 toplam " + m2(s.flowerArea), s.roomM2 > 300.5 ? "warn" : ""],
    ["Kurutma", String(s.dryRooms), "ihtiya\u00e7 " + m.drySuggest + " \u00b7 tepe " + m.cal.peakDry, m.cal.unassigned ? "warn" : ""],
    ["Kuru \u00e7i\u00e7ek", fmt(m.kgYear, 0) + " kg", "sat\u0131lan " + fmt(m.kgFlowerSold, 0) + " kg \u00b7 ham ya\u011f " + fmt(m.extract ? m.extract.crudeKg : 0, 0) + " kg", ""],
    ["Has\u0131lat", eur(m.revenue), "\u00e7i\u00e7ek " + eur(m.flowerRevenue || 0) + " \u00b7 ekstrakt " + eur(m.extractRevenue || 0), ""],
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
    const g = m.cal.roomCultivars && m.cal.roomCultivars[i];
    const short = g ? g.name.split(" ")[0] : "";
    rooms.push({
      id: "\u00c7i\u00e7ek " + (i + 1),
      x: 40 + col * (flowerW + gap),
      y: flowerY0 + row * (flowerH + gap),
      w: flowerW, h: flowerH, tag: m2(m.roomM2) + (short ? (" \u00b7 " + short) : ""),
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
      tag: (kind === "clean" ? ("\u00c7" + flowerNo + " temizlik") : (kind === "gmp" ? ("\u00c7i\u00e7ek " + flowerNo) : "bo\u015f")) + " \u00b7 " + (m.layout ? m.layout.dryRoomM2 : 0) + " m\u00B2"
    });
  }
  const blocks = [
    { id: "Ofis / QMS", x: 40, y: 48, w: 130, h: 90, fill: "#c9b56a", tag: "\u0130dare" },
    { id: "GACP giri\u015f", x: 180, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Ak\u0131\u015f" },
    { id: "GMP giri\u015f", x: 258, y: 48, w: 70, h: 90, fill: "#a34a3a", tag: "Ak\u0131\u015f" },
    { id: "Trim", x: 360, y: 48, w: 120, h: 90, fill: "#4d738a", tag: m2(m.layout.trimM2) },
    { id: "Paket", x: 488, y: 48, w: 100, h: 90, fill: "#4d738a", tag: m2(m.layout.packM2) }
  ].concat(gmpDry).concat([
    { id: "Ana\u00e7 \u00fcretim", x: 40, y: 168, w: 120, h: 100, fill: "#6f9e62", tag: m2(m.motherProd) },
    { id: "Ana\u00e7 bankas\u0131", x: 168, y: 168, w: 100, h: 48, fill: "#587c4e", tag: "GACP" },
    { id: "Karantina", x: 168, y: 220, w: 48, h: 48, fill: "#8b6bb0", tag: "R&D" },
    { id: "Doku k\u00fclt.", x: 220, y: 220, w: 48, h: 48, fill: "#8b6bb0", tag: "R&D" },
    { id: "\u00c7elik", x: 276, y: 168, w: 110, h: 100, fill: "#7aa56e", tag: m2(m.layout.cuttingsM2) },
    { id: "Pre-veg", x: 394, y: 168, w: 120, h: 100, fill: "#88b57a", tag: m2(m.preVeg) },
    { id: "Veg", x: 522, y: 168, w: 150, h: 100, fill: "#88b57a", tag: m2(m.veg) },
    {
      id: (m.extract && m.extract.m2) ? "Ekstraksiyon" : "Trim at\u0131k",
      x: 980, y: 168, w: 150, h: 100,
      fill: (m.extract && m.extract.m2) ? "#8b6bb0" : "#2a332e",
      tag: (m.extract && m.extract.m2) ? (m.extract.m2 + " m\u00B2 \u00b7 " + fmt(m.extract.kgDay, 1) + " kg/g") : "\u2014"
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
    const g = m.cal.roomCultivars && m.cal.roomCultivars[i];
    const short = g ? (" \u00b7 " + g.name.split(" ")[0]) : "";
    return "<div class=\"week-row\"><b>\u00c7i\u00e7ek " + (i + 1) + short + "</b>" + row.map(function (c, w) { return cell(w, c, "H" + (w + 1) + " " + c + (g ? (" " + g.name) : "")); }).join("") + "</div>";
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
    "<tr><td>Ekstraksiyon ekipman (kriyo-etanol + k\u0131\u015flama)</td><td class=\"num\">" + eur(m.extract ? m.extract.capexEq : 0) + "</td></tr>" +
    "<tr><td>Ekstraksiyon C1D2 oda</td><td class=\"num\">" + eur(m.extract ? m.extract.capexRoom : 0) + "</td></tr>" +
    "<tr><td>Stabilite</td><td class=\"num\">" + eur(m.stability) + "</td></tr>" +
    "<tr><td><strong>Toplam CAPEX</strong></td><td class=\"num\"><strong>" + eur(m.capex) + "</strong></td></tr>" +
    "<tr><td>Substrate (pot+coco+perlit)</td><td class=\"num\">" + eur(m.opex.substrate) + "</td></tr>" +
    "<tr><td>Su + g\u00fcbre + asit + otomasyon</td><td class=\"num\">" + eur(m.opex.waterFert) + "</td></tr>" +
    "<tr><td>\u0130\u015f\u00e7ilik</td><td class=\"num\">" + eur(m.opex.labor) + "</td></tr>" +
    "<tr><td>Malzeme (IPM, dripper, kurutma)</td><td class=\"num\">" + eur(m.opex.materials) + "</td></tr>" +
    "<tr><td>Ekstraksiyon i\u015fletme</td><td class=\"num\">" + eur(m.opex.extract || 0) + "</td></tr>" +
    "<tr><td><strong>Toplam OPEX</strong></td><td class=\"num\"><strong>" + eur(m.opexYear) + "</strong></td></tr>" +
    "<tr><td>OPEX / g sat\u0131labilir</td><td class=\"num\">" + fmt(m.opexPerG, 2) + " \u20AC</td></tr>" +
    "<tr><td>\u00c7i\u00e7ek sat\u0131\u015f\u0131 (" + fmt(m.kgFlowerSold, 0) + " kg \u00d7 " + eur(s.priceKg) + ")</td><td class=\"num\">" + eur(m.flowerRevenue || 0) + "</td></tr>" +
    "<tr><td>Ekstrakt sat\u0131\u015f\u0131 (" + fmt(m.extract ? m.extract.crudeKg : 0, 0) + " kg \u00d7 " + eur(s.extractPriceKg || 0) + ")</td><td class=\"num\">" + eur(m.extractRevenue || 0) + "</td></tr>" +
    "<tr><td><strong>Toplam has\u0131lat</strong></td><td class=\"num\"><strong>" + eur(m.revenue) + "</strong></td></tr>" +
    "<tr><td>Marj (has\u0131lat \u2212 OPEX)</td><td class=\"num\">" + eur(m.ebitda) + "</td></tr></table>";

  el("ops").innerHTML =
    "<table><tr><th>Operasyon</th><th></th></tr>" +
    "<tr><td>Oda alan\u0131</td><td class=\"num\">" + m2(m.roomM2) + "</td></tr>" +
    "<tr><td>Bitki / m\u00B2</td><td class=\"num\">" + fmt(s.plantsPerM2, 1) + "</td></tr>" +
    "<tr><td>Bitki / oda</td><td class=\"num\">" + fmt(m.plantsPerRoom) + "</td></tr>" +
    "<tr><td>Hasat / oda / y\u0131l</td><td class=\"num\">" + fmt(s.harvestsPerRoom, 1) + "</td></tr>" +
    "<tr><td>Tesis hasad\u0131 / y\u0131l</td><td class=\"num\">" + fmt(m.harvestsYear, 1) + "</td></tr>" +
    "<tr><td>Veg (algoritma)</td><td class=\"num\">" + m2(m.layout ? m.layout.vegM2 : m.veg) + "</td></tr>" +
    "<tr><td>Pre-veg (algoritma)</td><td class=\"num\">" + m2(m.layout ? m.layout.preVegM2 : m.preVeg) + "</td></tr>" +
    "<tr><td>\u00c7elik / k\u00f6klendirme</td><td class=\"num\">" + m2(m.layout ? m.layout.cuttingsM2 : 0) + "</td></tr>" +
    "<tr><td>Kurutma odas\u0131</td><td class=\"num\">" + s.dryRooms + " \u00b7 ihtiya\u00e7 " + m.drySuggest + "</td></tr>" +
    "<tr><td>Kurutma taban / kat</td><td class=\"num\">" + (m.layout ? m.layout.dryRoomM2 : 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + "</td></tr>" +
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
    ["Kurutma", s.dryDays + " g\u00fcn \u00b7 temizlik " + s.dryCleanDays + " g\u00fcn \u00b7 " + s.dryRooms + " oda \u00d7 " + (s.dryTiers || 3) + " kat"]
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
    priceKg: eur(s.priceKg) + "/kg",
    extractPriceKg: eur(s.extractPriceKg || 0) + "/kg",
    saleablePct: "%" + fmt(s.saleablePct * 100, 0),
    extractPct: "%" + fmt((s.extractPct || 0) * 100, 0),
    dryTiers: String(s.dryTiers || 3) + " kat"
  };
  Object.keys(map).forEach(function (k) {
    const n = el("v-" + k);
    if (n) n.textContent = map[k];
  });
  const hint = el("capacityHint");
  if (hint && m) {
    const L = m.layout || {};
    hint.textContent = "Oda " + m2(s.roomM2) + " \u00b7 kurutma taban " + (L.dryRoomM2 || 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat \u00b7 " + fmt(s.plantsPerM2, 1) + " bitki/m\u00B2 \u00b7 kurutma ihtiyac\u0131 " + m.drySuggest;
  }
  refreshRoomInputMax();
  const mixEl = el("geneticsMix");
  if (mixEl && m && m.stats) {
    const dist = (s.alloc && s.alloc.rows && s.alloc.rows.length)
      ? s.alloc.rows.map(function (r) { return r.c.name.split(" ")[0] + " " + r.rooms; }).join(" \u00b7 ") + " \u2014 " + s.alloc.assigned + "/" + s.flowerRooms + " oda \u00b7 "
      : "";
    mixEl.textContent = dist + "oda a\u011f\u0131rl\u0131kl\u0131: \u00e7i\u00e7ek " + m.stats.flowerDays + " g\u00fcn \u00b7 veg " + m.stats.vegDays + " g\u00fcn \u00b7 k\u00f6k " + m.stats.rootDays + " g\u00fcn \u00b7 " + m.stats.yieldG + " g \u00b7 " + fmt(m.stats.dens, 1) + " /m\u00B2";
  } else if (mixEl) mixEl.textContent = "";
}

let week = 0, playing = false, timer = null, lastM = null;
let pinDryRooms = false;

function ensureDryRooms(need) {
  if (pinDryRooms) return false;
  const cur = Math.max(1, +el("dryRooms").value);
  const next = Math.min(20, Math.max(cur, need));
  if (next === cur) return false;
  el("dryRooms").value = String(next);
  return true;
}

function render() {
  let s = readState();
  let m = simulate(s);
  if (ensureDryRooms(m.drySuggest)) {
    s = readState();
    m = simulate(s);
  }
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
  renderGeneticsUI();
  document.querySelectorAll(".presets button").forEach(function (b) {
    b.addEventListener("click", function () { applyPreset(b.dataset.key); });
  });
  document.querySelectorAll("input").forEach(function (i) {
    i.addEventListener("input", function () {
      customMode = true;
      highlightPreset("custom");
      if (i.id === "dryRooms") pinDryRooms = true;
      if (i.id === "flowerDays" || i.id === "vegDays" || i.id === "preVegDays" || i.id === "rootDays" || i.id === "yieldG") cycleOverride = true;
      if (i.id && (i.id.indexOf("g-") === 0 || i.id.indexOf("gr-") === 0)) { cycleOverride = false; pinDryRooms = false; applyMixToSliders(); }
      else if (i.id === "flowerRooms") { pinDryRooms = false; scaleRoomAllocation(); }
      else if (i.id === "harvestsPerRoom" || i.id === "flowerDays" || i.id === "dryDays" || i.id === "dryCleanDays" || i.id === "dryTiers") pinDryRooms = false;
      week = 0;
      render();
    });
  });
  el("playBtn").addEventListener("click", play);
  el("exportBtn").addEventListener("click", exportJson);
  applyPreset("dengeli");
});
