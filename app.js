const PRESETS = {
  pilot: {
    plantsYear: 3060, plantsPerM2: 5, harvestsPerRoom: 4, flowerRooms: 3, roomM2: 60, flowerArea: 180,
    dryRooms: 1, flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 65, yieldSkill: "starter", genetics: 3, priceKg: 3500, extractPriceKg: 4200, saleablePct: 80, extraction: false, dryTiers: 3
  },
  dengeli: {
    plantsYear: 5360, plantsPerM2: 4.5, harvestsPerRoom: 5, flowerRooms: 4, roomM2: 70, flowerArea: 280,
    dryRooms: 2, flowerDays: 56, vegDays: 24, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 105, yieldSkill: "mid", genetics: 4, priceKg: 3500, extractPriceKg: 4200, saleablePct: 85, extraction: true, dryTiers: 3
  },
  yuksek: {
    plantsYear: 16320, plantsPerM2: 5, harvestsPerRoom: 6, flowerRooms: 8, roomM2: 80, flowerArea: 640,
    dryRooms: 3, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 145, yieldSkill: "pro", genetics: 4, priceKg: 3500, extractPriceKg: 4200, saleablePct: 88, extraction: true, dryTiers: 3
  },
  faz2: {
    plantsYear: 19300, plantsPerM2: 4.5, harvestsPerRoom: 6, flowerRooms: 12, roomM2: 70, flowerArea: 840,
    dryRooms: 5, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 145, yieldSkill: "pro", genetics: 5, priceKg: 3500, extractPriceKg: 4200, saleablePct: 88, extraction: true, dryTiers: 3
  }
};

const el = (id) => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d, minimumFractionDigits: d });
const eur = (n) => "\u20AC" + fmt(n, 0);
const m2 = (n) => fmt(n, 0) + " m\u00B2";
const round1 = (n) => Math.round(n * 10) / 10;

const YIELD_SKILL = {
  starter: { g: 65, label: "Ba\u015flang\u0131\u00e7" },
  mid: { g: 105, label: "Orta" },
  pro: { g: 145, label: "Profesyonel" }
};
const YIELD_SKILL_DENS = 5.5;

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

const CULTIVAR_BY_ID = {};
CULTIVARS.forEach(function (c) { CULTIVAR_BY_ID[c.id] = c; });
const CULTIVAR_YIELD_MEAN = CULTIVARS.reduce(function (n, c) { return n + c.yieldG; }, 0) / CULTIVARS.length;
let roomBoard = [];
let selectedRoom = 0;
let yieldSkill = "mid";

function cultivarOf(id) {
  return CULTIVAR_BY_ID[id] || CULTIVARS[0];
}

function flowerRoomCount() {
  return Math.max(1, Math.round(+(el("flowerRooms") && el("flowerRooms").value) || 4));
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

function fillRoomBoardEven(ids, n) {
  n = Math.max(1, n);
  ids = (ids && ids.length) ? ids : CULTIVARS.slice(0, 4).map(function (c) { return c.id; });
  roomBoard = [];
  const base = Math.floor(n / ids.length);
  let rem = n % ids.length;
  ids.forEach(function (id) {
    const k = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
    for (let i = 0; i < k; i++) roomBoard.push({ cultivarId: id, dens: null });
  });
  while (roomBoard.length < n) roomBoard.push({ cultivarId: ids[0], dens: null });
  roomBoard.length = n;
  if (selectedRoom >= n) selectedRoom = Math.max(0, n - 1);
}

function ensureRoomBoard(n) {
  n = Math.max(1, n);
  if (!roomBoard.length) {
    fillRoomBoardEven(CULTIVARS.slice(0, 4).map(function (c) { return c.id; }), n);
    return;
  }
  const ids = uniqueCultivars(roomBoard.map(function (r) { return cultivarOf(r.cultivarId); })).map(function (c) { return c.id; });
  while (roomBoard.length < n) {
    const i = roomBoard.length;
    const id = ids.length ? ids[i % ids.length] : CULTIVARS[0].id;
    roomBoard.push({ cultivarId: id, dens: null });
  }
  if (roomBoard.length > n) roomBoard.length = n;
  if (selectedRoom >= n) selectedRoom = Math.max(0, n - 1);
}

function selectedCultivars() {
  ensureRoomBoard(flowerRoomCount());
  const list = uniqueCultivars(roomBoard.map(function (r) { return cultivarOf(r.cultivarId); }));
  return list.length ? list : CULTIVARS.slice(0, 4);
}

function applyGeneticsCount(n) {
  const take = Math.max(1, Math.min(CULTIVARS.length, Math.round(n) || 4));
  fillRoomBoardEven(CULTIVARS.slice(0, take).map(function (c) { return c.id; }), flowerRoomCount());
  if (el("genetics")) el("genetics").value = String(take);
}

function scaleRoomAllocation() {
  ensureRoomBoard(flowerRoomCount());
}

function applyGlobalDensToRooms(d) {
  const v = Math.max(2, Math.min(12, +d || 5));
  ensureRoomBoard(flowerRoomCount());
  roomBoard.forEach(function (row) { row.dens = v; });
}

function densOfRoom(i, g, fallback) {
  const row = roomBoard[i];
  if (row && row.dens != null && row.dens > 0) return row.dens;
  const d = g && g.dens;
  return (d && d > 0) ? d : fallback;
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

let densityOverride = false;

function densOf(g, fallback) {
  const d = g && g.dens;
  return (d && d > 0) ? d : fallback;
}

function yieldOfCultivar(g, fallback) {
  if (cycleOverride) return fallback;
  const y = g && g.yieldG;
  return (y && y > 0) ? y : fallback;
}

function densRefOf(g, fallback) {
  const d = g && g.dens;
  return (d && d > 0) ? d : (fallback || 5);
}

function skillGrams() {
  if (cycleOverride && el("yieldG")) return Math.max(40, +el("yieldG").value || 105);
  const sk = YIELD_SKILL[yieldSkill] || YIELD_SKILL.mid;
  return sk.g;
}

function skillLabel(key) {
  if (key === "custom") return "\u00d6zel";
  const sk = YIELD_SKILL[key] || YIELD_SKILL.mid;
  return sk.label;
}

function cultivarYieldRel(g) {
  const cat = (g && g.yieldG) || CULTIVAR_YIELD_MEAN;
  const rel = cat / CULTIVAR_YIELD_MEAN;
  return Math.max(0.82, Math.min(1.18, rel));
}

function yieldAtDensity(gRef, dRef, dens) {
  const y0 = Math.max(20, +gRef || 105);
  const d0 = Math.max(2, +dRef || YIELD_SKILL_DENS);
  const d = Math.max(1.5, +dens || d0);
  const gPlant = y0 * (d0 + d0) / (d + d0);
  const gM2 = d * gPlant;
  return { gPlant: gPlant, gM2: gM2, gRef: y0, dRef: d0 };
}

function roomYield(g, dens, fallbackY) {
  const skillG = Math.max(40, fallbackY || skillGrams());
  const rel = cycleOverride ? 1 : cultivarYieldRel(g);
  return yieldAtDensity(skillG * rel, YIELD_SKILL_DENS, dens);
}

function plannedHarvests(h) {
  return Math.max(1, Math.round(h == null ? 5 : h));
}

function cultivarAtRoom(s, r) {
  if (s.roomMap && s.roomMap[r]) return s.roomMap[r];
  const mix = s.cultivars && s.cultivars.length ? s.cultivars : [];
  return mix.length ? cultivarForRoom(mix, r) : null;
}

function harvestPlan(s) {
  const weeks = 52;
  const nRooms = Math.max(1, s.flowerRooms || 1);
  const want = plannedHarvests(s.harvestsPerRoom);
  const periodW = weeks / want;
  const staggerW = periodW / nRooms;
  const byRoom = [];
  const events = [];
  for (let r = 0; r < nRooms; r++) {
    const g = cultivarAtRoom(s, r);
    const flowerDays = (!cycleOverride && g) ? g.flowerDays : s.flowerDays;
    const flowerW = Math.max(1, Math.round((flowerDays || 56) / 7));
    const offset = r * staggerW;
    const used = {};
    let n = 0;
    for (let k = 0; k < want; k++) {
      const s0 = ((Math.round(offset + k * periodW) % weeks) + weeks) % weeks;
      const h = (s0 + flowerW - 1) % weeks;
      if (used[h]) continue;
      used[h] = true;
      n += 1;
      events.push({
        w: h,
        room: r + 1,
        cultivar: g ? g.name : "",
        s0: s0,
        flowerW: flowerW
      });
    }
    byRoom.push(n);
  }
  events.sort(function (a, b) { return a.w - b.w || a.room - b.room; });
  return { byRoom: byRoom, events: events, want: want };
}

function harvestPlanFromUi() {
  const rooms = flowerRoomCount();
  ensureRoomBoard(rooms);
  const alloc = buildRoomMap(rooms);
  return harvestPlan({
    flowerRooms: rooms,
    harvestsPerRoom: el("harvestsPerRoom") ? +el("harvestsPerRoom").value : 5,
    flowerDays: el("flowerDays") ? +el("flowerDays").value : 56,
    cultivars: uniqueCultivars(alloc.map),
    roomMap: alloc.map
  });
}

function buildRoomModels(s, harvestsByRoom) {
  const n = Math.max(1, s.flowerRooms || 1);
  const usable = Math.max(1, (s.roomM2 || 70) * (s.usable || 0.85));
  const map = (s.roomMap && s.roomMap.length) ? s.roomMap : [];
  const fbDens = s.plantsPerM2 || 5;
  const fbYield = s.yieldG || 105;
  const rooms = [];
  for (let i = 0; i < n; i++) {
    const g = map[i] || null;
    const dens = densOfRoom(i, g, fbDens);
    const plants = Math.max(1, Math.round(usable * dens));
    const yldAdj = roomYield(g, dens, fbYield);
    const kgHarvest = plants * yldAdj.gPlant / 1000;
    const nH = Math.max(1, (harvestsByRoom && harvestsByRoom[i] != null)
      ? harvestsByRoom[i]
      : plannedHarvests(s.harvestsPerRoom));
    rooms.push({
      i: i + 1,
      g: g,
      name: g ? g.name : ("Oda " + (i + 1)),
      dens: dens,
      plants: plants,
      harvests: nH,
      plantsYear: plants * nH,
      yieldG: yldAdj.gPlant,
      yieldRef: yldAdj.gRef,
      densRef: yldAdj.dRef,
      gM2: yldAdj.gM2,
      kgHarvest: kgHarvest,
      kgYear: kgHarvest * nH,
      m2: s.roomM2,
      usable: usable
    });
  }
  return rooms;
}

function syncPlantsFromGenetics() {
  if (!el("plantsYear") || !el("plantsPerM2") || !el("roomM2")) return;
  const rooms = flowerRoomCount();
  ensureRoomBoard(rooms);
  const alloc = buildRoomMap(rooms);
  const roomM2 = Math.max(50, +el("roomM2").value || 70);
  const usable = roomM2 * 0.85;
  const plan = harvestPlanFromUi();
  const fb = +el("plantsPerM2").value || 5;
  let plants = 0;
  let year = 0;
  for (let i = 0; i < rooms; i++) {
    const g = alloc.map[i];
    const d = densOfRoom(i, g, fb);
    const n = Math.max(1, Math.round(usable * d));
    const nH = (plan.byRoom[i] != null) ? plan.byRoom[i] : plan.want;
    plants += n;
    year += n * nH;
  }
  el("plantsYear").value = String(Math.min(100000, Math.max(400, year)));
  const avg = plants / Math.max(1, rooms * usable);
  el("plantsPerM2").value = String(round1(Math.min(12, Math.max(2, avg))));
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
  if (el("yieldG") && !cycleOverride) el("yieldG").value = String(skillGrams());
  if (el("genetics")) el("genetics").value = String(uniqueCultivars(list).length);
  syncPlantsFromGenetics();
}

function cultivarForRoom(list, i) {
  return list[i % list.length];
}

function buildRoomMap(flowerRooms) {
  const rooms = Math.max(1, flowerRooms || flowerRoomCount());
  ensureRoomBoard(rooms);
  const map = [];
  const counts = {};
  for (let i = 0; i < rooms; i++) {
    const g = cultivarOf(roomBoard[i].cultivarId);
    map.push(g);
    counts[g.id] = (counts[g.id] || 0) + 1;
  }
  const rows = Object.keys(counts).map(function (id) {
    return { c: cultivarOf(id), rooms: counts[id] };
  });
  return { map: map, rows: rows, assigned: map.length, match: true, empty: false, fill: false, trim: false };
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

function cultivarOptions(selectedId) {
  return CULTIVARS.map(function (c) {
    const sel = c.id === selectedId ? " selected" : "";
    return "<option value=\"" + c.id + "\"" + sel + ">" + c.name + " \u00b7 " + c.dens.toFixed(1) + "/m\u00B2</option>";
  }).join("");
}

function roomPlantStats(r) {
  const nH = r.harvests != null ? r.harvests : 0;
  const py = r.plantsYear != null ? r.plantsYear : (r.plants * nH);
  const gPlant = r.yieldG != null ? r.yieldG : 0;
  const gM2 = r.gM2 != null ? r.gM2 : (gPlant * (r.dens || 0));
  return "<span><strong>" + r.plants + "</strong> hasatta</span>" +
    "<span><strong>" + nH + "</strong> hasat/y\u0131l</span>" +
    "<span><strong>" + py + "</strong> bitki/y\u0131l</span>" +
    "<span><strong>" + fmt(gPlant, 0) + "</strong> g/bitki</span>" +
    "<span><strong>" + fmt(gM2, 0) + "</strong> g/m\u00B2</span>" +
    "<span><strong>" + fmt(r.kgHarvest, 1) + "</strong> kg/hasat</span>";
}

function renderRoomCards(m, s) {
  const box = el("roomCards");
  if (!box) return;
  ensureRoomBoard(s.flowerRooms);
  const models = (m && m.roomModels) || [];
  const ae = document.activeElement;
  const dragging = ae && box.contains(ae) && ae.classList.contains("room-dens");
  if (dragging) {
    models.forEach(function (r, i) {
      const card = box.querySelector('[data-room="' + i + '"]');
      if (!card) return;
      const st = card.querySelector(".stats");
      if (st) st.innerHTML = roomPlantStats(r);
      const lab = card.querySelector(".dens-lab");
      if (lab) lab.textContent = fmt(r.dens, 1) + "/m\u00B2";
      card.classList.toggle("on", i === selectedRoom);
    });
    return;
  }
  let html = "";
  for (let i = 0; i < roomBoard.length; i++) {
    const row = roomBoard[i];
    const g = cultivarOf(row.cultivarId);
    const spec = models[i] || null;
    const dens = spec ? spec.dens : densOfRoom(i, g, s.plantsPerM2);
    const plants = spec ? spec.plants : Math.max(1, Math.round((s.roomM2 || 70) * 0.85 * dens));
    const yldAdj = spec
      ? { gPlant: spec.yieldG, gM2: spec.gM2, gRef: spec.yieldRef }
      : roomYield(g, dens, s.yieldG || 105);
    const yld = yldAdj.gPlant;
    const kg = spec ? spec.kgHarvest : plants * yld / 1000;
    const nH = spec && spec.harvests != null ? spec.harvests : plannedHarvests(s.harvestsPerRoom);
    const py = spec && spec.plantsYear != null ? spec.plantsYear : plants * nH;
    const on = i === selectedRoom ? " on" : "";
    const custom = row.dens != null ? " \u00b7 \u00f6zel" : "";
    html += "<article class=\"room-card" + on + "\" data-room=\"" + i + "\">" +
      "<header><b>\u00c7i\u00e7ek " + (i + 1) + "</b><span>" + m2(s.roomM2) + custom + "</span></header>" +
      "<select class=\"room-cultivar\" data-room=\"" + i + "\">" + cultivarOptions(g.id) + "</select>" +
      "<header><span>Bitki / m\u00B2</span><span class=\"dens-lab\">" + fmt(dens, 1) + "/m\u00B2</span></header>" +
      "<input class=\"room-dens\" data-room=\"" + i + "\" type=\"range\" min=\"2\" max=\"12\" step=\"0.1\" value=\"" + dens + "\" />" +
      "<div class=\"stats\">" + roomPlantStats({ plants: plants, harvests: nH, plantsYear: py, kgHarvest: kg, yieldG: yld, gM2: yldAdj.gM2, dens: dens }) + "</div>" +
      "</article>";
  }
  box.innerHTML = html;
}

function bindRoomCards() {
  const box = el("roomCards");
  if (!box || box.dataset.ready) return;
  box.dataset.ready = "1";
  box.addEventListener("input", function (ev) {
    const t = ev.target;
    const i = +t.getAttribute("data-room");
    if (isNaN(i) || i < 0) return;
    ensureRoomBoard(flowerRoomCount());
    if (!roomBoard[i]) return;
    selectedRoom = i;
    customMode = true;
    highlightPreset("custom");
    if (t.classList.contains("room-cultivar")) {
      roomBoard[i].cultivarId = t.value;
      roomBoard[i].dens = null;
      cycleOverride = false;
      densityOverride = false;
      pinDryRooms = false;
      applyMixToSliders();
    } else if (t.classList.contains("room-dens")) {
      roomBoard[i].dens = Math.max(2, Math.min(12, +t.value || 5));
      densityOverride = false;
    }
    week = 0;
    render();
  });
  box.addEventListener("click", function (ev) {
    const card = ev.target.closest("[data-room]");
    if (!card || !box.contains(card)) return;
    selectedRoom = +card.getAttribute("data-room");
    box.querySelectorAll(".room-card").forEach(function (c) {
      c.classList.toggle("on", +c.getAttribute("data-room") === selectedRoom);
    });
    const plan = el("plan");
    if (plan) {
      plan.querySelectorAll("[data-i]").forEach(function (n) {
        n.classList.toggle("on", +n.getAttribute("data-i") === selectedRoom);
      });
    }
  });
}

function bindPlanClicks() {
  const wrap = el("plan");
  if (!wrap || wrap.dataset.ready) return;
  wrap.dataset.ready = "1";
  wrap.addEventListener("click", function (ev) {
    const n = ev.target.closest("[data-i]");
    if (!n || !wrap.contains(n)) return;
    selectedRoom = +n.getAttribute("data-i");
    wrap.querySelectorAll("[data-i]").forEach(function (g) {
      g.classList.toggle("on", +g.getAttribute("data-i") === selectedRoom);
    });
    const box = el("roomCards");
    if (box) {
      box.querySelectorAll(".room-card").forEach(function (c) {
        c.classList.toggle("on", +c.getAttribute("data-room") === selectedRoom);
      });
      const card = box.querySelector('[data-room="' + selectedRoom + '"]');
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

function bindSideTabs() {
  const tabs = document.querySelectorAll(".side-tabs [data-tab]");
  if (!tabs.length) return;
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const tab = btn.getAttribute("data-tab");
      tabs.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === tab); });
      document.querySelectorAll("[data-panel]").forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== tab;
      });
    });
  });
}

function resetRoomDens() {
  ensureRoomBoard(flowerRoomCount());
  roomBoard.forEach(function (r) { r.dens = null; });
  densityOverride = false;
  customMode = true;
  highlightPreset("custom");
  week = 0;
  render();
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
  const harvests = plannedHarvests(+el("harvestsPerRoom").value);
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
  ensureRoomBoard(flowerRoomCount());
  if (ae === "flowerArea" || ae === "roomM2" || ae === "flowerRooms") {
    syncLayout(ae);
    syncPlantsFromGenetics();
  } else if (ae === "plantsYear") {
    densityOverride = true;
    syncDensity("plantsYear");
    applyGlobalDensToRooms(+el("plantsPerM2").value);
  } else if (ae === "plantsPerM2") {
    densityOverride = true;
    syncDensity("keepDensity");
    applyGlobalDensToRooms(+el("plantsPerM2").value);
  } else if (ae === "harvestsPerRoom") {
    syncPlantsFromGenetics();
  } else {
    syncPlantsFromGenetics();
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
    yieldG: skillGrams(),
    yieldSkill: cycleOverride ? "custom" : yieldSkill,
    genetics: uniqueCultivars(alloc.map).length || selectedCultivars().length,
    cultivars: uniqueCultivars(alloc.map).length ? uniqueCultivars(alloc.map) : selectedCultivars(),
    roomMap: alloc.map,
    alloc: alloc,
    roomBoard: roomBoard.map(function (r) { return { cultivarId: r.cultivarId, dens: r.dens }; }),
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

function highlightYieldSkill(key) {
  document.querySelectorAll(".yield-skill [data-skill]").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-skill") === key);
  });
}

function setYieldSkill(key, fromPreset) {
  const sk = YIELD_SKILL[key];
  if (!sk) return;
  yieldSkill = key;
  cycleOverride = false;
  if (el("yieldG")) el("yieldG").value = String(sk.g);
  highlightYieldSkill(key);
  if (!fromPreset) {
    customMode = true;
    highlightPreset("custom");
    week = 0;
    render();
  }
}

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
    } else if (k === "yieldSkill") {
      setYieldSkill(v, true);
    } else if (k === "yieldG") {
      if (el("yieldG")) el("yieldG").value = v;
    } else if (el(k)) el(k).value = v;
  });
  cycleOverride = false;
  densityOverride = false;
  applyMixToSliders();
  highlightPreset(key);
  syncLayout("roomM2");
  syncPlantsFromGenetics();
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
  const plan = harvestPlan(s);
  const rooms = [];
  const roomCultivars = [];
  for (let r = 0; r < s.flowerRooms; r++) {
    roomCultivars.push(cultivarAtRoom(s, r));
    rooms.push(Array(weeks).fill("empty"));
  }
  plan.events.forEach(function (ev) {
    const row = rooms[ev.room - 1];
    if (!row) return;
    for (let w = 0; w < ev.flowerW; w++) {
      const t = (ev.s0 + w) % weeks;
      if (row[t] !== "harvest") row[t] = "flower";
    }
    row[ev.w] = "harvest";
  });
  const assigned = assignDryBatches(plan.events, s.dryRooms, s.dryDays || 14, s.dryCleanDays || 7);
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
    gmpIdleWeeks: idleWeeks.filter(Boolean).length,
    harvestsByRoom: plan.byRoom,
    harvestEvents: plan.events.length,
    harvestWant: plan.want
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
  const cal = buildCalendar(s);
  const roomModels = buildRoomModels(s, cal.harvestsByRoom);
  const plantsInFlower = roomModels.reduce(function (n, r) { return n + r.plants; }, 0);
  const plantsYear = roomModels.reduce(function (n, r) { return n + r.plantsYear; }, 0);
  const plantsPerRoom = Math.round(plantsInFlower / Math.max(1, s.flowerRooms));
  const density = plantsInFlower / Math.max(1, usableFlower);
  const turnaround = 7;
  const harvestsInt = cal.harvestWant || plannedHarvests(s.harvestsPerRoom);
  const cycleFlower = 365 / harvestsInt;
  const harvestsYear = cal.harvestEvents || roomModels.reduce(function (n, r) { return n + r.harvests; }, 0);
  const cyclesPerRoom = harvestsYear / Math.max(1, s.flowerRooms);
  const staggerOk = flowerDaysLong + turnaround <= cycleFlower + 0.5;
  const mix = mixEarly;
  const stats = statsEarly;
  const yieldRef = s.yieldG || 105;
  const yieldUse = roomModels.length
    ? roomModels.reduce(function (n, r) { return n + r.yieldG; }, 0) / roomModels.length
    : yieldRef;
  const gM2Avg = roomModels.length
    ? roomModels.reduce(function (n, r) { return n + r.gM2; }, 0) / roomModels.length
    : 0;
  let kgGross = 0;
  const kgById = {};
  roomModels.forEach(function (r) {
    kgGross += r.kgYear;
    if (r.g) kgById[r.g.id] = (kgById[r.g.id] || 0) + r.kgYear;
  });
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
  const cycleDays = (stats && !cycleOverride)
    ? stats.rootDays + stats.preVegDays + stats.vegDays + stats.flowerDays
    : s.rootDays + s.preVegDays + s.vegDays + s.flowerDays;
  const drySuggest = cal.drySuggest;

  const alerts = [];
  if (!staggerOk) {
    const tight = (mixEarly.length && !cycleOverride)
      ? mixEarly.filter(function (c) { return c.flowerDays + turnaround > cycleFlower + 0.5; }).map(function (c) { return c.name; }).join(", ")
      : "";
    alerts.push({ t: "bad", m: harvestsInt + " hasat/oda/y\u0131l i\u00e7in \u00e7i\u00e7eklenme en fazla " + maxFlowerDays(harvestsInt) + " g\u00fcn olabilir" + (tight ? (" \u2014 s\u0131k\u0131\u015fan: " + tight) : "") + "." });
  } else {
    alerts.push({ t: "ok", m: "Her oda y\u0131lda " + harvestsInt + " hasat (\u00e7evrim " + fmt(cycleFlower, 1) + " g\u00fcn). Y\u0131ll\u0131k bitki = hasattaki bitki \u00d7 takvim hasad\u0131." });
  }
  if (cal.harvestWant && cal.harvestsByRoom && cal.harvestsByRoom.some(function (n) { return n < cal.harvestWant; })) {
    alerts.push({ t: "warn", m: "Takvimde hasat haftalar\u0131 \u00e7ak\u0131\u015ft\u0131\u011f\u0131 i\u00e7in baz\u0131 odalarda " + cal.harvestWant + " yerine daha az hasat say\u0131ld\u0131. Y\u0131ll\u0131k bitki ger\u00e7ek hasat adedine g\u00f6re." });
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
    alerts.push({ t: "warn", m: "Yo\u011funluk " + fmt(density, 1) + " bitki/m\u00B2 \u2014 indoor ticari aral\u0131k genelde 7\u201311 /m\u00B2. Bitki ba\u015f\u0131 verim d\u00fc\u015fer; kanopi hastal\u0131k ve tekd\u00fczelik riski artar." });
  }
  alerts.push({ t: "ok", m: "\u00dcretim seviyesi " + skillLabel(s.yieldSkill) + " \u2014 " + fmt(yieldRef, 0) + " g/bitki (5,5 /m\u00B2). Genetik katalog \u00b1%18 sapar. Yo\u011funluk art\u0131nca bitki ba\u015f\u0131 d\u00fc\u015fer, m\u00B2 doyarak artar (\u015fimdi ort. " + fmt(yieldUse, 0) + " g/bitki \u00b7 " + fmt(gM2Avg, 0) + " g/m\u00B2)." });
  if (densityOverride && stats && Math.abs(stats.dens - density) > 1) {
    alerts.push({ t: "warn", m: "Se\u00e7ilen genetik ortalama " + fmt(stats.dens, 1) + " bitki/m\u00B2 \u00f6nerir; kayd\u0131r\u0131c\u0131 " + fmt(density, 1) + " (manuel yo\u011funluk)." });
  }
  if (!densityOverride && roomModels.length) {
    const seenR = {};
    const bits = [];
    roomModels.forEach(function (r) {
      const id = r.g ? r.g.id : "?";
      if (seenR[id]) { seenR[id].n += 1; return; }
      seenR[id] = { n: 1, r: r };
    });
    Object.keys(seenR).forEach(function (id) {
      const x = seenR[id];
      const nm = x.r.g ? x.r.g.name.split(" ")[0] : "Oda";
      bits.push(nm + " " + x.n + " oda \u00b7 " + fmt(x.r.dens, 1) + "/m\u00B2 \u00b7 " + x.r.plants + " hasatta \u00d7 " + x.r.harvests + " hasat");
    });
    alerts.push({ t: "ok", m: "Oda modeli genetik bitki/m\u00B2 ile: " + bits.join(" \u00b7 ") + ". Y\u0131ll\u0131k bitki " + fmt(plantsYear) + " (hasattaki bitki \u00d7 y\u0131ll\u0131k hasat)." });
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
    alerts.push({ t: "ok", m: "Genetik (oda a\u011f\u0131rl\u0131kl\u0131): " + kgBits + " \u00b7 ort. \u00e7i\u00e7ek " + flowerDaysUse + " g\u00fcn / yo\u011funluk ayarl\u0131 " + fmt(yieldUse, 0) + " g/bitki / ham ya\u011f %" + Math.round(((stats && stats.extractY) || 0.12) * 100) + "." });
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
    stats: stats, flowerDaysLong: flowerDaysLong, roomModels: roomModels, gM2Avg: gM2Avg, yieldRef: yieldRef
  };
}

function renderKpis(m, s) {
  const items = [
    ["Y\u0131ll\u0131k bitki", fmt(m.plantsYear), fmt(m.plantsInFlower, 0) + " hasatta \u00b7 " + fmt(m.harvestsYear, 0) + " hasat/y\u0131l", ""],
    ["Oda alan\u0131", m2(s.roomM2), "\u00fcst s\u0131n\u0131r 300 m\u00B2 \u00b7 toplam " + m2(s.flowerArea), s.roomM2 > 300.5 ? "warn" : ""],
    ["Kurutma", String(s.dryRooms), "ihtiya\u00e7 " + m.drySuggest + " \u00b7 tepe " + m.cal.peakDry, m.cal.unassigned ? "warn" : ""],
    ["Kuru \u00e7i\u00e7ek", fmt(m.kgYear, 0) + " kg", fmt(m.gM2Avg || 0, 0) + " g/m\u00B2 \u00b7 sat\u0131lan " + fmt(m.kgFlowerSold, 0) + " kg \u00b7 ham ya\u011f " + fmt(m.extract ? m.extract.crudeKg : 0, 0) + " kg", ""],
    ["Has\u0131lat", eur(m.revenue), "\u00e7i\u00e7ek " + eur(m.flowerRevenue || 0) + " \u00b7 ekstrakt " + eur(m.extractRevenue || 0), ""],
    ["CAPEX", eur(m.capex), "marj " + eur(m.ebitda) + " \u00b7 " + (Number.isFinite(m.payback) ? fmt(m.payback, 1) + " y\u0131l" : "\u2014"), m.payback < 5 ? "good" : m.payback < 8 ? "warn" : ""]
  ];
  el("kpis").innerHTML = items.map(([label, value, sub, cls]) =>
    "<article class=\"kpi " + cls + "\"><div class=\"label\">" + label + "</div><div class=\"value\">" + value + "</div><div class=\"sub\">" + sub + "</div></article>"
  ).join("");
}


function xmlEsc(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mSize(area, aspect) {
  const a = Math.max(6, Number(area) || 6);
  const ratio = aspect || 1.25;
  const w = Math.sqrt(a * ratio);
  const h = a / w;
  return { w: w, h: h, a: a };
}

function activePresetLabel() {
  const b = document.querySelector(".presets button.active");
  const key = b && b.getAttribute("data-key");
  const names = {
    pilot: "Pilot", dengeli: "Dengeli", yuksek: "Y\u00fcksek kapasite",
    faz2: "Geni\u015fleme", custom: "\u00d6zel"
  };
  return names[key] || "\u00d6zel";
}

function buildConceptSvg(m, s, currentWeek) {
  const PPM = 12;
  const L = m.layout || {};
  const ex = m.extract || {};
  const hasEx = !!(ex.m2 && ex.m2 > 0);
  const rooms = [];

  function add(name, xm, ym, wm, hm, fill, tag, zone) {
    rooms.push({
      name: name, x: xm, y: ym, w: wm, h: hm,
      fill: fill, tag: tag || "", zone: zone || ""
    });
  }

  const office = mSize(36, 1.8);
  const air = mSize(10, 0.65);
  const mech = mSize(Math.max(18, Math.round((m.totalBuilt || 400) * 0.025)), 1.4);
  const mother = mSize(m.motherProd || L.motherM2 || 18, 1.25);
  const bank = mSize(m.motherBank || 10, 1.6);
  const cut = mSize(L.cuttingsM2 || 16, 1.2);
  const prev = mSize(m.preVeg || L.preVegM2 || 20, 1.3);
  const veg = mSize(m.veg || L.vegM2 || 28, 1.35);
  const flower = mSize(s.roomM2, 1.32);
  const dry = mSize(L.dryRoomM2 || 24, 1.15);
  const trim = mSize(L.trimM2 || 24, 1.5);
  const pack = mSize(L.packM2 || 18, 1.35);
  const ext = hasEx ? mSize(ex.m2, 1.6) : null;

  const gap = 0.55;
  const hall = 2.4;
  let x = 0;
  let y = 0;
  const staffH = Math.max(7.2, office.h, air.h, mech.h);

  add("Ofis / QMS", x, y, office.w, staffH, "#c9b56a", "36 m\u00B2 \u00b7 idare", "idare");
  x += office.w + gap;
  add("GACP giri\u015f", x, y, Math.max(4.2, air.w), staffH, "#a34a3a", "hava kilit", "akisi");
  x += Math.max(4.2, air.w) + gap;
  add("GMP giri\u015f", x, y, Math.max(4.2, air.w), staffH, "#8a3a42", "hava kilit", "akisi");
  x += Math.max(4.2, air.w) + gap;
  add("Mekanik / HVAC", x, y, mech.w, staffH, "#4a5550", Math.round(mech.a) + " m\u00B2", "mek");
  const staffW = x + mech.w;

  y = staffH + hall;
  x = 0;
  const propH = Math.max(mother.h, bank.h + 3.6, cut.h, prev.h, veg.h);
  add("Ana\u00e7 \u00fcretim", x, y, mother.w, propH, "#6f9e62", Math.round(m.motherProd || mother.a) + " m\u00B2", "gacp");
  x += mother.w + gap;
  const bankH = Math.min(bank.h, propH * 0.52);
  add("Ana\u00e7 bankas\u0131", x, y, Math.max(bank.w, 6.5), bankH, "#587c4e", "GACP", "gacp");
  add("Karantina", x, y + bankH + 0.4, 4.2, propH - bankH - 0.4, "#8b6bb0", "R&D", "rd");
  add("Doku k\u00fclt.", x + 4.4, y + bankH + 0.4, Math.max(4.2, Math.max(bank.w, 6.5) - 4.4), propH - bankH - 0.4, "#8b6bb0", "R&D", "rd");
  x += Math.max(bank.w, 6.5) + gap;
  add("\u00c7elik", x, y, cut.w, propH, "#7aa56e", Math.round(L.cuttingsM2 || cut.a) + " m\u00B2", "gacp");
  x += cut.w + gap;
  add("Pre-veg", x, y, prev.w, propH, "#88b57a", Math.round(m.preVeg || prev.a) + " m\u00B2", "gacp");
  x += prev.w + gap;
  add("Veg", x, y, veg.w, propH, "#88b57a", Math.round(m.veg || veg.a) + " m\u00B2", "gacp");
  x += veg.w;
  const propW = x;
  const propY = y;
  const propBottom = y + propH;

  const fCount = Math.max(1, s.flowerRooms);
  const fCols = Math.min(fCount, fCount <= 4 ? fCount : fCount <= 8 ? 4 : fCount <= 12 ? 6 : 8);
  const fRows = Math.ceil(fCount / fCols);
  y = propBottom + hall;
  const flowerY = y;
  const cultivars = (m.cal && (m.cal.roomCultivars || m.cal.roomCultivars)) || [];
  const calRooms = (m.cal && m.cal.rooms) || [];
  for (let i = 0; i < fCount; i++) {
    const col = i % fCols;
    const row = Math.floor(i / fCols);
    const g = cultivars[i];
    const st = calRooms[i] ? calRooms[i][currentWeek] : "empty";
    const fill = st === "harvest" ? "#d4c49a" : st === "flower" ? "#d4783a" : "#6a4634";
    const short = g && g.name ? g.name.split(" ")[0] : "";
    const spec = (m.roomModels && m.roomModels[i]) || null;
    const tag = spec
      ? (Math.round(spec.m2) + " m\u00B2 \u00b7 " + fmt(spec.dens, 1) + "/m\u00B2 \u00b7 " + spec.plants + " bitki" + (short ? (" \u00b7 " + short) : ""))
      : (Math.round(s.roomM2) + " m\u00B2" + (short ? (" \u00b7 " + short) : ""));
    add(
      "\u00c7i\u00e7ek " + (i + 1),
      col * (flower.w + gap + 0.45),
      y + row * (flower.h + gap + 0.45),
      flower.w,
      flower.h,
      fill,
      tag,
      "cicek"
    );
    if (spec) {
      const last = rooms[rooms.length - 1];
      last.dens = spec.dens;
      last.plants = spec.plants;
    }
  }
  const flowerW = fCols * flower.w + (fCols - 1) * (gap + 0.45);
  const flowerH = fRows * flower.h + (fRows - 1) * (gap + 0.45);

  const dCount = Math.max(1, s.dryRooms);
  const dCols = Math.min(dCount, dCount <= 3 ? dCount : 3);
  const dRows = Math.ceil(dCount / dCols);
  const gmpX = Math.max(staffW, propW, flowerW) + hall;
  const gmpY = staffH + hall;
  const dryOcc = (m.cal && (m.cal.dryOcc || m.cal.dryOcc)) || [];
  const dryRows = (m.cal && (m.cal.dryRows || m.cal.dryRows)) || [];
  for (let i = 0; i < dCount; i++) {
    const col = i % dCols;
    const row = Math.floor(i / dCols);
    const kind = dryRows[i] ? dryRows[i][currentWeek] : "idle";
    const fill = kind === "gmp" ? "#5b8aa8" : kind === "clean" ? "#8aaeb8" : "#2e3c42";
    const batch = dryOcc[i] ? dryOcc[i][currentWeek] : null;
    const who = batch ? (" \u00b7 \u00c7" + String(batch).replace("C", "")) : "";
    add(
      "Kurutma " + (i + 1),
      gmpX + col * (dry.w + gap),
      gmpY + row * (dry.h + gap),
      dry.w,
      dry.h,
      fill,
      Math.round(L.dryRoomM2 || dry.a) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat" + who,
      "gmp"
    );
  }
  const dryW = dCols * dry.w + (dCols - 1) * gap;
  const dryH = dRows * dry.h + (dRows - 1) * gap;
  let py = gmpY + dryH + gap;
  add("Trim", gmpX, py, trim.w, trim.h, "#4d738a", Math.round(L.trimM2 || trim.a) + " m\u00B2", "gmp");
  add("Paket", gmpX + trim.w + gap, py, pack.w, pack.h, "#4d738a", Math.round(L.packM2 || pack.a) + " m\u00B2", "gmp");
  py += Math.max(trim.h, pack.h) + gap;
  if (hasEx) {
    add("Ekstraksiyon", gmpX, py, Math.max(ext.w, dryW), ext.h, "#8b6bb0", Math.round(ex.m2) + " m\u00B2 \u00b7 " + fmt(ex.kgDay, 1) + " kg/g", "ext");
    py += ext.h;
  }

  const innerW = Math.max(staffW, propW, flowerW, gmpX + Math.max(dryW, trim.w + gap + pack.w));
  const innerH = Math.max(flowerY + flowerH, py);

  const padL = 40, padT = 86, padR = 268, padB = 96;
  const W = Math.round(padL + innerW * PPM + padR);
  const H = Math.round(padT + innerH * PPM + padB);

  function X(mtr) { return Math.round(padL + mtr * PPM); }
  function Y(mtr) { return Math.round(padT + mtr * PPM); }
  function S(mtr) { return Math.max(8, Math.round(mtr * PPM)); }

  const gacpX0 = X(0), gacpY0 = Y(staffH + hall * 0.35);
  const gacpW = S(Math.max(propW, flowerW));
  const gacpH = S(innerH - staffH - hall * 0.35);
  const gmpX0 = X(gmpX - hall * 0.35);
  const gmpY0 = Y(staffH + hall * 0.2);
  const gmpW = S(innerW - gmpX + hall * 0.35);
  const gmpH = S(innerH - staffH - hall * 0.2);

  let svg = "";
  svg += "<rect x=\"0\" y=\"0\" width=\"" + W + "\" height=\"" + H + "\" fill=\"#0c1210\"/>";
  svg += "<rect x=\"18\" y=\"18\" width=\"" + (W - 36) + "\" height=\"" + (H - 36) + "\" rx=\"6\" fill=\"#101714\" stroke=\"#d4c49a\" stroke-width=\"1.2\"/>";
  svg += "<rect x=\"18\" y=\"18\" width=\"" + (W - 36) + "\" height=\"52\" fill=\"#161d1a\" stroke=\"#d4c49a\" stroke-width=\"1.2\"/>";
  svg += "<text x=\"36\" y=\"40\" fill=\"#d4c49a\" font-size=\"15\" font-weight=\"700\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.4\">TIBB\u0130 KENEV\u0130R TES\u0130S\u0130 \u00b7 KONSEPT D\u0130ZAYN</text>";
  svg += "<text x=\"36\" y=\"58\" fill=\"#cfc6a8\" font-size=\"11\" font-family=\"Segoe UI, Arial, sans-serif\">Indoor GACP \u00fcretim + GMP i\u015fleme \u00b7 Senaryo: " + xmlEsc(activePresetLabel()) + " \u00b7 Hafta " + (currentWeek + 1) + " \u00b7 " + s.flowerRooms + " \u00e7i\u00e7ek odas\u0131 \u00b7 " + s.dryRooms + " kurutma \u00b7 toplam " + Math.round(m.totalBuilt) + " m\u00B2</text>";

  svg += "<circle cx=\"" + (W - 48) + "\" cy=\"44\" r=\"14\" fill=\"none\" stroke=\"#d4c49a\" stroke-width=\"1.2\"/>";
  svg += "<polygon points=\"" + (W - 48) + ",28 " + (W - 53) + ",46 " + (W - 43) + ",46\" fill=\"#d4c49a\"/>";
  svg += "<text x=\"" + (W - 48) + "\" y=\"62\" text-anchor=\"middle\" fill=\"#d4c49a\" font-size=\"9\" font-family=\"Segoe UI, Arial, sans-serif\">K</text>";

  svg += "<rect x=\"" + gacpX0 + "\" y=\"" + gacpY0 + "\" width=\"" + gacpW + "\" height=\"" + gacpH + "\" fill=\"rgba(111,158,98,0.08)\" stroke=\"rgba(111,158,98,0.35)\" stroke-dasharray=\"4 3\"/>";
  svg += "<text x=\"" + (gacpX0 + 8) + "\" y=\"" + (gacpY0 + 16) + "\" fill=\"#8fbf84\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.2\">GACP \u00dcRET\u0130M</text>";
  svg += "<rect x=\"" + gmpX0 + "\" y=\"" + gmpY0 + "\" width=\"" + gmpW + "\" height=\"" + gmpH + "\" fill=\"rgba(91,138,168,0.08)\" stroke=\"rgba(91,138,168,0.4)\" stroke-dasharray=\"4 3\"/>";
  svg += "<text x=\"" + (gmpX0 + 8) + "\" y=\"" + (gmpY0 + 16) + "\" fill=\"#8eb4c8\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.2\">GMP \u0130\u015eLEME</text>";

  rooms.forEach(function (b) {
    const rx = X(b.x), ry = Y(b.y), rw = S(b.w), rh = S(b.h);
    svg += "<g>";
    svg += "<rect x=\"" + rx + "\" y=\"" + ry + "\" width=\"" + rw + "\" height=\"" + rh + "\" fill=\"" + b.fill + "\" stroke=\"#0c1210\" stroke-width=\"1.4\" opacity=\"0.94\"/>";
    if (b.dens && rh > 44 && rw > 48) {
      const pitch = Math.max(4.5, Math.min(11, PPM / Math.sqrt(b.dens)));
      const x0 = rx + 6, y0 = ry + 36, iw = rw - 12, ih = rh - 42;
      const colsN = Math.max(1, Math.floor(iw / pitch));
      const rowsN = Math.max(1, Math.floor(ih / pitch));
      const rad = Math.max(1.1, Math.min(2.3, pitch * 0.22));
      const ox = x0 + (iw - colsN * pitch) / 2 + pitch / 2;
      const oy = y0 + (ih - rowsN * pitch) / 2 + pitch / 2;
      for (let jj = 0; jj < rowsN; jj++) {
        for (let ii = 0; ii < colsN; ii++) {
          svg += "<circle cx=\"" + (ox + ii * pitch).toFixed(1) + "\" cy=\"" + (oy + jj * pitch).toFixed(1) + "\" r=\"" + rad.toFixed(1) + "\" fill=\"#0c1210\" opacity=\"0.28\"/>";
        }
      }
    }
    const fs = rw < 70 ? 9 : 11;
    svg += "<text x=\"" + (rx + 7) + "\" y=\"" + (ry + 16) + "\" fill=\"#0c1210\" font-size=\"" + fs + "\" font-weight=\"700\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(b.name) + "</text>";
    if (rh > 28) {
      svg += "<text x=\"" + (rx + 7) + "\" y=\"" + (ry + 30) + "\" fill=\"#0c1210\" font-size=\"10\" opacity=\"0.78\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(b.tag) + "</text>";
    }
    svg += "</g>";
  });

  const ax = X(propW - veg.w * 0.5);
  const ay = Y(propY + propH);
  const bx = X(flowerW * 0.5);
  const by = Y(flowerY);
  svg += "<line x1=\"" + ax + "\" y1=\"" + ay + "\" x2=\"" + bx + "\" y2=\"" + by + "\" stroke=\"#d4c49a\" stroke-width=\"1.4\" marker-end=\"url(#arr)\"/>";
  const cx = X(flowerW);
  const cy = Y(flowerY + flowerH * 0.45);
  const dx = X(gmpX);
  const dy = Y(gmpY + dryH * 0.45);
  svg += "<line x1=\"" + cx + "\" y1=\"" + cy + "\" x2=\"" + dx + "\" y2=\"" + dy + "\" stroke=\"#d4c49a\" stroke-width=\"1.4\" marker-end=\"url(#arr)\"/>";

  const barM = 10;
  const barX = 36, barY = H - 48;
  svg += "<rect x=\"" + barX + "\" y=\"" + barY + "\" width=\"" + (barM * PPM) + "\" height=\"5\" fill=\"#d4c49a\"/>";
  svg += "<text x=\"" + barX + "\" y=\"" + (barY - 6) + "\" fill=\"#d4c49a\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\">\u00d6L\u00c7EK  \u00b7  10 m = " + (barM * PPM) + " px  \u00b7  1 m = " + PPM + " px</text>";
  svg += "<text x=\"" + barX + "\" y=\"" + (barY + 22) + "\" fill=\"#8b9a90\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\">Konsept dizayn \u00b7 in\u015faat projesi de\u011fildir \u00b7 odalar genetik bitki/m\u00B2 ile modellendi</text>";

  const lx = W - 250, ly = padT;
  svg += "<text x=\"" + lx + "\" y=\"" + ly + "\" fill=\"#d4c49a\" font-size=\"11\" font-weight=\"700\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1\">KONSEPT D\u0130ZAYN</text>";
  const lines = [
    "\u00c7i\u00e7ek odas\u0131: " + s.flowerRooms + " \u00d7 " + Math.round(s.roomM2) + " m\u00B2",
    "Kurutma: " + s.dryRooms + " \u00d7 " + Math.round(L.dryRoomM2 || 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat",
    "Veg / pre-veg: " + Math.round(m.veg || 0) + " / " + Math.round(m.preVeg || 0) + " m\u00B2",
    "Ana\u00e7: " + Math.round((m.motherProd || 0) + (m.motherBank || 0)) + " m\u00B2",
    "Trim / paket: " + Math.round(L.trimM2 || 0) + " / " + Math.round(L.packM2 || 0) + " m\u00B2",
    hasEx ? ("Ekstraksiyon: " + Math.round(ex.m2) + " m\u00B2") : "Ekstraksiyon: yok",
    "GACP / GMP: " + Math.round(m.gacpM2) + " / " + Math.round(m.gmpM2) + " m\u00B2",
    "Toplam kapal\u0131: " + Math.round(m.totalBuilt) + " m\u00B2",
    "Y\u0131ll\u0131k bitki: " + fmt(m.plantsYear) + " (" + fmt(m.plantsInFlower) + " hasatta \u00d7 takvim)",
    "CAPEX: " + eur(m.capex)
  ];
  if (m.roomModels && m.roomModels.length) {
    lines.push("Oda modeli:");
    const seenG = {};
    m.roomModels.forEach(function (r) {
      const id = r.g ? r.g.id : "?";
      if (seenG[id]) { seenG[id].n += 1; return; }
      seenG[id] = { n: 1, r: r };
    });
    Object.keys(seenG).forEach(function (id) {
      const x = seenG[id];
      const nm = x.r.g ? x.r.g.name.split(" ")[0] : "Oda";
      lines.push("  " + nm + " \u00d7" + x.n + " \u00b7 " + fmt(x.r.dens, 1) + "/m\u00B2 \u00b7 " + x.r.plants + "b \u00d7 " + x.r.harvests + "h");
    });
  } else if (s.alloc && s.alloc.rows && s.alloc.rows.length) {
    lines.push("Genetik:");
    s.alloc.rows.forEach(function (r) {
      lines.push("  " + r.c.name.split(" ")[0] + " \u00b7 " + r.rooms + " oda");
    });
  }
  lines.forEach(function (line, i) {
    svg += "<text x=\"" + lx + "\" y=\"" + (ly + 18 + i * 15) + "\" fill=\"#cfc6a8\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(line) + "</text>";
  });

  const defs = "<defs><marker id=\"arr\" markerWidth=\"8\" markerHeight=\"8\" refX=\"6\" refY=\"3\" orient=\"auto\"><path d=\"M0,0 L6,3 L0,6 Z\" fill=\"#d4c49a\"/></marker></defs>";
  return "<svg class=\"plan\" xmlns=\"http://www.w3.org/2000/svg\" width=\"" + W + "\" height=\"" + H + "\" viewBox=\"0 0 " + W + " " + H + "\">" + defs + svg + "</svg>";
}

function downloadConceptPng() {
  const s = lastS || readState();
  const m = lastM || simulate(s);
  const markup = buildConceptSvg(m, s, week);
  const wMatch = markup.match(/\bwidth="(\d+)"/);
  const hMatch = markup.match(/\bheight="(\d+)"/);
  const W = Math.max(800, wMatch ? +wMatch[1] : 1600);
  const H = Math.max(500, hMatch ? +hMatch[1] : 900);
  const xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + markup;
  const img = new Image();
  img.onload = function () {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0c1210";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function (blob) {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tesis-konsept-dizayn.png";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2500);
    }, "image/png");
  };
  img.onerror = function () {
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tesis-konsept-dizayn.svg";
    a.click();
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
}

function renderPlan(m, s, currentWeek) {
  const W = 1180;
  const gap = 16;
  const fCount = Math.max(1, s.flowerRooms);
  const fCols = Math.min(10, fCount);
  const fRows = Math.ceil(fCount / fCols);
  const flowerW = Math.min(108, 1100 / fCols - gap);
  const flowerH = 102;
  const flowerY0 = 280;
  const H = flowerY0 + fRows * (flowerH + gap) + 28;
  const rooms = [];
  for (let i = 0; i < fCount; i++) {
    const st = m.cal.rooms[i] ? m.cal.rooms[i][currentWeek] : "empty";
    const col = i % fCols;
    const row = Math.floor(i / fCols);
    const g = m.cal.roomCultivars && m.cal.roomCultivars[i];
    const spec = (m.roomModels && m.roomModels[i]) || null;
    const short = g ? g.name.split(" ")[0] : "";
    const dens = spec ? spec.dens : s.plantsPerM2;
    const plants = spec ? spec.plants : Math.round(s.roomM2 * 0.85 * dens);
    rooms.push({
      i: i,
      id: "\u00c7i\u00e7ek " + (i + 1),
      x: 40 + col * (flowerW + gap),
      y: flowerY0 + row * (flowerH + gap),
      w: flowerW, h: flowerH,
      line2: m2(s.roomM2) + (short ? (" \u00b7 " + short) : ""),
      line3: fmt(dens, 1) + "/m\u00B2 \u00b7 " + plants + " hasatta \u00b7 " + (spec && spec.harvests != null ? spec.harvests : plannedHarvests(s.harvestsPerRoom)) + " hasat",
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
      line2: (kind === "clean" ? ("\u00c7" + flowerNo + " temizlik") : (kind === "gmp" ? ("\u00c7i\u00e7ek " + flowerNo) : "bo\u015f")) + " \u00b7 " + (m.layout ? m.layout.dryRoomM2 : 0) + " m\u00B2"
    });
  }
  const blocks = [
    { id: "Ofis / QMS", x: 40, y: 48, w: 130, h: 90, fill: "#c9b56a", line2: "\u0130dare" },
    { id: "GACP giri\u015f", x: 180, y: 48, w: 70, h: 90, fill: "#a34a3a", line2: "Ak\u0131\u015f" },
    { id: "GMP giri\u015f", x: 258, y: 48, w: 70, h: 90, fill: "#a34a3a", line2: "Ak\u0131\u015f" },
    { id: "Trim", x: 360, y: 48, w: 120, h: 90, fill: "#4d738a", line2: m2(m.layout.trimM2) },
    { id: "Paket", x: 488, y: 48, w: 100, h: 90, fill: "#4d738a", line2: m2(m.layout.packM2) }
  ].concat(gmpDry).concat([
    { id: "Ana\u00e7 \u00fcretim", x: 40, y: 168, w: 120, h: 100, fill: "#6f9e62", line2: m2(m.motherProd) },
    { id: "Ana\u00e7 bankas\u0131", x: 168, y: 168, w: 100, h: 48, fill: "#587c4e", line2: "GACP" },
    { id: "Karantina", x: 168, y: 220, w: 48, h: 48, fill: "#8b6bb0", line2: "R&D" },
    { id: "Doku k\u00fclt.", x: 220, y: 220, w: 48, h: 48, fill: "#8b6bb0", line2: "R&D" },
    { id: "\u00c7elik", x: 276, y: 168, w: 110, h: 100, fill: "#7aa56e", line2: m2(m.layout.cuttingsM2) },
    { id: "Pre-veg", x: 394, y: 168, w: 120, h: 100, fill: "#88b57a", line2: m2(m.preVeg) },
    { id: "Veg", x: 522, y: 168, w: 150, h: 100, fill: "#88b57a", line2: m2(m.veg) },
    {
      id: (m.extract && m.extract.m2) ? "Ekstraksiyon" : "Trim at\u0131k",
      x: 980, y: 168, w: 150, h: 100,
      fill: (m.extract && m.extract.m2) ? "#8b6bb0" : "#2a332e",
      line2: (m.extract && m.extract.m2) ? (m.extract.m2 + " m\u00B2 \u00b7 " + fmt(m.extract.kgDay, 1) + " kg/g") : "\u2014"
    }
  ]).concat(rooms);
  const svg = blocks.map(function (b) {
    const di = (typeof b.i === "number") ? (" data-i=\"" + b.i + "\"") : "";
    const on = (typeof b.i === "number" && b.i === selectedRoom) ? " on" : "";
    return "<g class=\"room" + on + "\"" + di + "><rect class=\"hit\" x=\"" + b.x + "\" y=\"" + b.y + "\" width=\"" + b.w + "\" height=\"" + b.h + "\" rx=\"10\" fill=\"" + b.fill + "\" opacity=\"0.92\"/>" +
      "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 22) + "\" fill=\"#0c1210\" font-size=\"12\" font-weight=\"600\">" + xmlEsc(b.id) + "</text>" +
      "<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 40) + "\" fill=\"#0c1210\" font-size=\"11\" opacity=\"0.75\">" + xmlEsc(b.line2 || "") + "</text>" +
      (b.line3 ? ("<text x=\"" + (b.x + 10) + "\" y=\"" + (b.y + 56) + "\" fill=\"#0c1210\" font-size=\"10\" opacity=\"0.7\">" + xmlEsc(b.line3) + "</text>") : "") +
      "</g>";
  }).join("");
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
    "<tr><td>Bitki / m\u00B2 (oda modeli)</td><td class=\"num\">" + fmt(m.density, 1) + "</td></tr>" +
    "<tr><td>\u00dcretim seviyesi</td><td class=\"num\">" + skillLabel(s.yieldSkill) + " \u00b7 " + s.yieldG + " g</td></tr>" +
    "<tr><td>Bitki ba\u015f\u0131 verim (yo\u011funluk ayarl\u0131)</td><td class=\"num\">" + fmt(m.yieldUse, 0) + " g</td></tr>" +
    "<tr><td>Verim / m\u00B2 (kullan\u0131labilir)</td><td class=\"num\">" + fmt(m.gM2Avg || 0, 0) + " g</td></tr>" +
    "<tr><td>Bitki / hasat (\u00e7i\u00e7ekte)</td><td class=\"num\">" + fmt(m.plantsInFlower) + "</td></tr>" +
    "<tr><td>Hasat / oda / y\u0131l (takvim)</td><td class=\"num\">" + fmt(m.cyclesPerRoom, 1) + "</td></tr>" +
    "<tr><td>Tesis hasad\u0131 / y\u0131l</td><td class=\"num\">" + fmt(m.harvestsYear, 0) + "</td></tr>" +
    "<tr><td>Y\u0131ll\u0131k bitki (hasat bitkisi \u00d7 hasat)</td><td class=\"num\">" + fmt(m.plantsYear) + "</td></tr>" +
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
    ["Hasat", fmt(m.cyclesPerRoom, 0) + " / oda / y\u0131l"],
    ["Kurutma", s.dryDays + " g\u00fcn \u00b7 temizlik " + s.dryCleanDays + " g\u00fcn \u00b7 " + s.dryRooms + " oda \u00d7 " + (s.dryTiers || 3) + " kat"]
  ];
  el("flow").innerHTML = nodes.map(function (pair, i) {
    return (i ? "<span class=\"arrow\">\u2192</span>" : "") + "<div class=\"node\"><strong>" + pair[0] + "</strong><span>" + pair[1] + "</span></div>";
  }).join("");
}

function renderLabels(s, m) {
  const map = {
    plantsYear: fmt(m && m.plantsYear != null ? m.plantsYear : s.plantsYear),
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
    yieldG: (m && m.yieldUse != null ? fmt(m.yieldUse, 0) : String(s.yieldG)) + " g",
    yieldSkill: skillLabel(s.yieldSkill) + " \u00b7 " + s.yieldG + " g",
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
    hint.textContent = "Y\u0131ll\u0131k bitki " + fmt(m.plantsYear) + " = hasattaki " + fmt(m.plantsInFlower) + " \u00d7 takvim hasad\u0131. Verim " + fmt(m.yieldUse, 0) + " g/bitki \u00b7 " + fmt(m.gM2Avg || 0, 0) + " g/m\u00B2 (yo\u011funluk doyumu). Oda " + m2(s.roomM2) + " \u00b7 kurutma taban " + (L.dryRoomM2 || 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat \u00b7 kurutma ihtiyac\u0131 " + m.drySuggest;
  }
  const mixEl = el("geneticsMix");
  if (mixEl && m && m.stats) {
    const dist = (s.alloc && s.alloc.rows && s.alloc.rows.length)
      ? s.alloc.rows.map(function (r) { return r.c.name.split(" ")[0] + " " + r.rooms; }).join(" \u00b7 ") + " \u2014 " + s.alloc.assigned + "/" + s.flowerRooms + " oda \u00b7 "
      : "";
    const densBits = (m.roomModels || []).reduce(function (acc, r) {
      if (!r.g) return acc;
      if (acc.seen[r.g.id]) return acc;
      acc.seen[r.g.id] = true;
      acc.parts.push(r.g.name.split(" ")[0] + " " + fmt(r.dens, 1) + "/m\u00B2 " + r.plants + "b \u00d7 " + r.harvests + "h");
      return acc;
    }, { seen: {}, parts: [] }).parts.join(" \u00b7 ");
    mixEl.textContent = dist + (densBits ? densBits + " \u2014 " : "") + "oda a\u011f\u0131rl\u0131kl\u0131: \u00e7i\u00e7ek " + m.stats.flowerDays + " g\u00fcn \u00b7 veg " + m.stats.vegDays + " g\u00fcn \u00b7 k\u00f6k " + m.stats.rootDays + " g\u00fcn \u00b7 yo\u011funluk ayarl\u0131 " + fmt(m.yieldUse, 0) + " g/bitki \u00b7 " + fmt(m.gM2Avg || 0, 0) + " g/m\u00B2";
  } else if (mixEl) mixEl.textContent = "";
}

let week = 0, playing = false, timer = null, lastM = null, lastS = null;
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
  lastS = s;
  const py = el("plantsYear");
  if (py && document.activeElement !== py) {
    py.value = String(Math.min(100000, Math.max(400, m.plantsYear)));
    s.plantsYear = m.plantsYear;
  }
  highlightYieldSkill(cycleOverride ? "" : yieldSkill);
  renderLabels(s, m);
  renderKpis(m, s);
  renderPlan(m, s, week);
  renderRoomCards(m, s);
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
        renderPlan(lastM, lastS || readState(), week);
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
  bindSideTabs();
  bindRoomCards();
  bindPlanClicks();
  if (el("resetDensBtn")) el("resetDensBtn").addEventListener("click", resetRoomDens);
  document.querySelectorAll(".presets button").forEach(function (b) {
    b.addEventListener("click", function () { applyPreset(b.dataset.key); });
  });
  document.querySelectorAll(".yield-skill [data-skill]").forEach(function (b) {
    b.addEventListener("click", function () { setYieldSkill(b.getAttribute("data-skill"), false); });
  });
  document.querySelectorAll("input").forEach(function (i) {
    i.addEventListener("input", function () {
      if (i.classList && (i.classList.contains("room-dens") || i.classList.contains("room-cultivar"))) return;
      customMode = true;
      highlightPreset("custom");
      if (i.id === "dryRooms") pinDryRooms = true;
      if (i.id === "flowerDays" || i.id === "vegDays" || i.id === "preVegDays" || i.id === "rootDays" || i.id === "yieldG") cycleOverride = true;
      if (i.id === "yieldG") highlightYieldSkill("");
      if (i.id === "plantsYear" || i.id === "plantsPerM2") densityOverride = true;
      else if (i.id === "flowerRooms") { pinDryRooms = false; scaleRoomAllocation(); }
      else if (i.id === "harvestsPerRoom" || i.id === "flowerDays" || i.id === "dryDays" || i.id === "dryCleanDays" || i.id === "dryTiers") pinDryRooms = false;
      week = 0;
      render();
    });
  });
  el("playBtn").addEventListener("click", play);
  el("exportBtn").addEventListener("click", exportJson);
  if (el("conceptBtn")) el("conceptBtn").addEventListener("click", downloadConceptPng);
  applyPreset("dengeli");
});
