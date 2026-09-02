const PRESETS = {
  pilot: {
    plantsYear: 3060, plantsPerM2: 5, harvestsPerRoom: 4, flowerRooms: 3, roomM2: 60, flowerArea: 180,
    dryRooms: 1, flowerDays: 56, vegDays: 18, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 65, yieldSkill: "starter", genetics: 3, priceKgGacp: 2500, priceKgGmp: 3500, extractPriceKg: 4200, saleablePct: 80, extraction: false, dryTiers: 3, trimM2: 24, packM2: 22
  },
  dengeli: {
    plantsYear: 5360, plantsPerM2: 4.5, harvestsPerRoom: 5, flowerRooms: 4, roomM2: 70, flowerArea: 280,
    dryRooms: 2, flowerDays: 56, vegDays: 24, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 105, yieldSkill: "mid", genetics: 4, priceKgGacp: 2500, priceKgGmp: 3500, extractPriceKg: 4200, saleablePct: 85, extraction: true, dryTiers: 3, trimM2: 24, packM2: 30
  },
  yuksek: {
    plantsYear: 16320, plantsPerM2: 5, harvestsPerRoom: 6, flowerRooms: 8, roomM2: 80, flowerArea: 640,
    dryRooms: 3, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 145, yieldSkill: "pro", genetics: 4, priceKgGacp: 2500, priceKgGmp: 3500, extractPriceKg: 4200, saleablePct: 88, extraction: true, dryTiers: 3, trimM2: 28, packM2: 61
  },
  faz2: {
    plantsYear: 19300, plantsPerM2: 4.5, harvestsPerRoom: 6, flowerRooms: 12, roomM2: 70, flowerArea: 840,
    dryRooms: 5, flowerDays: 49, vegDays: 21, preVegDays: 14, rootDays: 14,
    dryDays: 14, dryCleanDays: 7, yieldG: 145, yieldSkill: "pro", genetics: 5, priceKgGacp: 2500, priceKgGmp: 3500, extractPriceKg: 4200, saleablePct: 88, extraction: true, dryTiers: 3, trimM2: 24, packM2: 89
  }
};

const el = (id) => document.getElementById(id);
const ta = (k, p) => (window.TKTS_i18n && window.TKTS_i18n.alert(k, p)) || k;
const ti = (k, p) => (window.TKTS_i18n && window.TKTS_i18n.t(k, p)) || k;
const fmt = (n, d = 0) => Number(n).toLocaleString((window.TKTS_i18n && window.TKTS_i18n.localeTag()) || "tr-TR", { maximumFractionDigits: d, minimumFractionDigits: d });
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
  cocoEurL: 0.28, perlitEurL: 0.12, potEur: 1.5,
  wasteEurKg: 0.05, mixKgM3: 350,
  waterLPerM2Day: 8, drain: 0.2, eventsDay: 6,
  waterEurM3: 1.2, fertEurL: 0.045, autoEurEvent: 0.35,
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

const CAPEX_U = {
  // Kannaplan all-in €4–5k/m² includes LED; we price shell+HVAC+fit separately + lightCapex.
  gacpGrowM2: 2800,
  gacpSupportM2: 1600,
  gmpM2: 6500,
  officeM2: 1200,
  extractRoomM2: 3200,
  lightPre: 220,
  lightVeg: 380,
  lightFlower: 480,
  stabilityPerCultivar: 8000
};
// Sales ramp: years 1–2 GACP flower price, then EU-GMP pharmacy-grade premium.
const PRICE_RAMP = { gacpYears: 2 };
const ENERGY_U = {
  kwhPerG: 2.2,   // LED+HVAC mid of 1.5–3.5 kWh/g dry flower
  eurPerKwh: 0.10
};
const GA_U = {
  base: 28000,           // insurance, security, IT
  perFlowerRoom: 5500,   // env monitoring / calibration share
  coaPerHarvest: 480,    // external COA per harvest batch
  licenseBase: 12000,
  licensePerRoom: 1500
};

const GMP_FINISH = {
  trimM2PerSt: 6,
  packM2PerSt: 5,
  trimKgDay: 6,
  packKgDay: 8,
  workDays: 5,
  trimVaultPerM2: 1.8,
  packVaultPerM2: 3,
  trimVaultPerSt: 12,
  packVaultPerSt: 16
};

function cloneBufferFor(saleable) {
  if (saleable <= 0.82) return 0.15;
  if (saleable <= 0.86) return 0.12;
  return 0.1;
}

// Staffing: canopy ~1 FTE / 95 m2 flower (CBT ~1000 ft2; industry 800-1200 ft2).
// Trim 6 kg/vardiya/istasyon = makine destekli; el trim ~0.45 kg/kisi/vardiya.
const STAFF_RULES = {
  canopyM2PerGrower: 95,
  plantsPerHarvestHelper: 80,
  dryRoomsPerOperator: 3,
  qaCanopyM2: 450
};

function buildStaffPlan(s, ox, ex, trimSp, packSp, plantsPerRoom) {
  const flowerM2 = Math.max(0, s.flowerArea || 0);
  const dryRooms = Math.max(0, s.dryRooms || 0);
  const rooms = Math.max(1, s.flowerRooms || 1);
  const trimSt = Math.max(0, (trimSp && trimSp.stations) || 0);
  const packSt = Math.max(0, (packSp && packSp.stations) || 0);
  const extractOps = Math.max(0, (ex && ex.operators) || 0);
  const hasExtract = !!(ex && ex.m2);

  const growTech = Math.max(1, Math.ceil(flowerM2 / STAFF_RULES.canopyM2PerGrower));
  const harvestExtra = Math.max(1, Math.ceil((plantsPerRoom || 0) / STAFF_RULES.plantsPerHarvestHelper));
  const dryOps = Math.max(1, Math.ceil(dryRooms / STAFF_RULES.dryRoomsPerOperator));
  const trimOps = Math.max(trimSt, Math.ceil(((ox && ox.trimH) || 0) / 1800));
  const packOps = Math.max(packSt, Math.ceil(((ox && ox.packH) || 0) / 1800));
  const qa = 1 + (flowerM2 >= STAFF_RULES.qaCanopyM2 ? 1 : 0);
  const facility = rooms >= 6 ? 2 : 1;
  const admin = 1;

  const roles = [
    {
      role: ti("staff.prodMgr"),
      fte: 1,
      zone: ti("staff.zoneGacp"),
      tasks: ti("staff.prodMgrTasks")
    },
    {
      role: ti("staff.grower"),
      fte: growTech,
      zone: ti("staff.zoneGacp"),
      tasks: ti("staff.growerTasks")
    },
    {
      role: ti("staff.ipm"),
      fte: rooms >= 4 ? 1 : 0,
      zone: ti("staff.zoneGacp"),
      tasks: ti("staff.ipmTasks")
    },
    {
      role: ti("staff.harvest"),
      fte: harvestExtra,
      zone: ti("staff.zoneBoth"),
      tasks: ti("staff.harvestTasks"),
      peak: true
    },
    {
      role: ti("staff.dryOp"),
      fte: dryOps,
      zone: ti("staff.zoneGmp"),
      tasks: ti("staff.dryTasks")
    },
    {
      role: ti("staff.trimOp"),
      fte: Math.max(1, trimOps),
      zone: ti("staff.zoneGmp"),
      tasks: ti("staff.trimTasks")
    },
    {
      role: ti("staff.packOp"),
      fte: Math.max(1, packOps),
      zone: ti("staff.zoneGmp"),
      tasks: ti("staff.packTasks")
    },
    {
      role: ti("staff.qa"),
      fte: qa,
      zone: ti("staff.zoneGmp"),
      tasks: ti("staff.qaTasks")
    },
    {
      role: ti("staff.extractOp"),
      fte: hasExtract ? Math.max(1, extractOps) : 0,
      zone: ti("staff.zoneGmp"),
      tasks: ti("staff.extractTasks")
    },
    {
      role: ti("staff.facility"),
      fte: facility,
      zone: ti("staff.zoneShared"),
      tasks: ti("staff.facilityTasks")
    },
    {
      role: ti("staff.office"),
      fte: admin,
      zone: ti("staff.zoneAdmin"),
      tasks: ti("staff.officeTasks")
    }
  ].filter(function (r) { return r.fte > 0; });

  let baseFte = 0;
  let peakExtra = 0;
  roles.forEach(function (r) {
    if (r.peak) peakExtra += r.fte;
    else baseFte += r.fte;
  });
  return {
    roles: roles,
    baseFte: baseFte,
    peakDayFte: baseFte + peakExtra,
    peakExtra: peakExtra,
    note: ti("staff.note", { canopy: STAFF_RULES.canopyM2PerGrower, trim: GMP_FINISH.trimKgDay })
  };
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
  if (key === "custom") return ti("preset.custom");
  return ti("skill." + key) || ((YIELD_SKILL[key] || YIELD_SKILL.mid).label);
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
  // Pre-flower sizing vs flower canopy (Next Big Crop / facility zoning):
  // veg rooms ~20-30% of flower canopy total; mother ~5% of cultivation (~2.5-4% flower);
  // clone/propagation high-density trays (multi-tier), much smaller footprint than flower.
  return {
    tiers: tiers,
    dryRoomM2: dryRoomM2,
    dryArea: dryArea,
    hangEq: hangEq,
    hangNeed: hangNeed,
    hangOk: hangEq + 0.01 >= hangNeed,
    motherM2: Math.max(8, Math.round(flower * 0.025 + nG * 2.5)),
    cuttingsM2: Math.max(6, Math.round(flower * (rootDays / flowerDays) / 5.0)),
    preVegM2: Math.max(10, Math.round(flower * (preVegDays / flowerDays) / 3.2)),
    vegM2: Math.max(14, Math.round(flower * (vegDays / flowerDays) / 2.4)),
    trimM2: Math.max(18, Math.round(s.trimM2 != null ? s.trimM2 : Math.max(24, room * 0.35))),
    packM2: Math.max(12, Math.round(s.packM2 != null ? s.packM2 : Math.max(18, s.flowerRooms * 6 + flower * 0.02))),
    flowerDays: flowerDays,
    vegDays: vegDays,
    preVegDays: preVegDays,
    rootDays: rootDays
  };
}

function paybackWithRamp(capex, ebitdaEarly, ebitdaLate, earlyYears) {
  const early = Math.max(0, earlyYears || 0);
  if (!(capex > 0)) return 0;
  let cum = 0;
  for (let y = 1; y <= 40; y++) {
    const e = y <= early ? ebitdaEarly : ebitdaLate;
    const prev = cum;
    cum += e;
    if (e > 0 && cum >= capex) return (y - 1) + (capex - prev) / e;
    if (e <= 0 && y > early + 5 && cum <= prev) return Infinity;
  }
  return Infinity;
}

function sizeExtract(feedKg, crudeFrac) {
  const off = {
    capexEq: 0, capexRoom: 0, capex: 0, m2: 0, opex: 0,
    opexSolvent: 0, opexLabor: 0, opexFixed: 0, opexEnergy: 0,
    kgDay: 0, crudeKg: 0, productKg: 0, operators: 0,
    tier: "off", crudeFrac: 0, nCal: 0, nIso: 0,
    ratedKgDay: 0, isoluteKgDay: 0, overCap: false
  };
  if (feedKg < 1) return off;
  const frac = crudeFrac || 0.12;
  const OP_DAYS = 225;
  const RATED_FLOWER = 40;
  const RATED_ISO = 8;
  const CAL_EUR = 340000;
  const ISO_EUR = 110000;
  const DIST_Y = 0.72;
  const kgDay = feedKg / OP_DAYS;
  const crudeKg = feedKg * frac;
  const crudeDay = crudeKg / OP_DAYS;
  const productKg = crudeKg * DIST_Y;
  const nCal = Math.max(1, Math.ceil(kgDay / RATED_FLOWER - 1e-9));
  const nIso = Math.max(1, Math.ceil(crudeDay / RATED_ISO - 1e-9));
  const capexEq = nCal * CAL_EUR + nIso * ISO_EUR;
  const m2 = Math.round(96 + Math.max(0, nCal - 1) * 40 + Math.max(0, nIso - 1) * 22);
  const capexRoom = m2 * CAPEX_U.extractRoomM2;
  const opexEnergy = feedKg * 1.4 * 0.09 + crudeKg * 2.2 * 0.09;
  const opexSolvent = feedKg * 0.04 * 0.55;
  const opexLabor = 39000 * nCal;
  const opexFixed = capexEq * 0.035 + 3500;
  const operators = 1 + Math.max(0, nCal - 1);
  const overCap = kgDay > nCal * RATED_FLOWER + 0.05 || crudeDay > nIso * RATED_ISO + 0.05;
  const tier = (nCal === 1 && nIso === 1)
    ? "Caladrius 450 X (2\u00d730 L, 8 sa / 1 vardiya) + Isolute X (8 kg/g\u00fcn dist+kristal)"
    : (nCal + "\u00d7 Caladrius 450 X + " + nIso + "\u00d7 Isolute X");
  return {
    capexEq: capexEq, capexRoom: capexRoom, capex: capexEq + capexRoom, m2: m2,
    opex: opexEnergy + opexSolvent + opexLabor + opexFixed,
    opexSolvent: opexSolvent, opexLabor: opexLabor, opexFixed: opexFixed, opexEnergy: opexEnergy,
    kgDay: kgDay, crudeKg: crudeKg, productKg: productKg, operators: operators,
    tier: tier, crudeFrac: frac, nCal: nCal, nIso: nIso,
    ratedKgDay: nCal * RATED_FLOWER, isoluteKgDay: nIso * RATED_ISO, overCap: overCap
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
  if (window.TKTS_darkSelect) window.TKTS_darkSelect.enhanceAll(box);
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

function isPhoneView() {
  return document.documentElement.getAttribute("data-view") === "phone";
}

function readStoredView() {
  try {
    const v = localStorage.getItem("tkts-view");
    if (v === "phone" || v === "desktop") return v;
  } catch (e) {}
  return window.matchMedia("(max-width: 720px)").matches ? "phone" : "desktop";
}

function applyView(view, persist) {
  const v = view === "phone" ? "phone" : "desktop";
  document.documentElement.setAttribute("data-view", v);
  document.documentElement.classList.toggle("view-phone", v === "phone");
  document.documentElement.classList.toggle("view-desktop", v !== "phone");
  document.querySelectorAll(".view-switch [data-view]").forEach(function (b) {
    b.classList.toggle("on", b.getAttribute("data-view") === v);
  });
  if (persist !== false) {
    try { localStorage.setItem("tkts-view", v); } catch (e) {}
  }
  if (lastM && lastS) {
    renderKpis(lastM, lastS);
    renderPlan(lastM, lastS, week);
    renderCalendar(lastM);
  }
}

function bindViewSwitch() {
  document.querySelectorAll(".view-switch [data-view]").forEach(function (b) {
    b.addEventListener("click", function () { applyView(b.getAttribute("data-view")); });
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
      if (tab === "pazar" && window.TKTS_market && window.TKTS_market.onTabOpen) {
        window.TKTS_market.onTabOpen();
      }
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

function computeOpex(s, plantsYear, harvestsYear, kgGross) {
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
  const trimH = (kgGross || 0) / (GMP_FINISH.trimKgDay / 8);
  const packH = ((kgGross || 0) * (1 - (s.extractPct || 0))) / (GMP_FINISH.packKgDay / 8);
  const laborH = potPrepH + transplantH + dripperH + manualEcH + calibH + cipH + gmpH + disposalH + trimH + packH;
  const labor = potPrepH * U.junior + transplantH * U.junior + dripperH * U.junior + manualEcH * U.junior
    + calibH * U.senior + cipH * U.junior + gmpH * U.manager + disposalH * U.junior
    + trimH * U.junior + packH * U.junior;

  const dripper = pots * U.dripperPerPlant * U.dripperEur;
  const stake = pots * U.stakePerPlant * U.stakeEur;
  const ipm = harvestsYear * U.ipmEurCycle;
  const ppe = rooms * 12 * U.ppeEurRoomMonth;
  const lab = rooms * 12 * U.labEurRoomMonth;
  const drying = harvestsYear * U.dryingEurHarvest;
  const label = harvestsYear * U.labelEurHarvest;
  const materials = dripper + stake + ipm + ppe + lab + drying + label;
  const energy = (kgGross || 0) * 1000 * ENERGY_U.kwhPerG * ENERGY_U.eurPerKwh;
  const ga = GA_U.base
    + (s.flowerRooms || 0) * GA_U.perFlowerRoom
    + (harvestsYear || 0) * GA_U.coaPerHarvest
    + GA_U.licenseBase
    + (s.flowerRooms || 0) * GA_U.licensePerRoom;
  const total = substrate + waterFert + labor + materials + energy + ga;
  const buffer = cloneBufferFor(s.saleablePct);
  const clonesWeek = plantsYear * (1 + buffer) / 52;

  return {
    substrate: substrate, waterFert: waterFert, labor: labor, materials: materials,
    energy: energy, ga: ga, energyKwh: (kgGross || 0) * 1000 * ENERGY_U.kwhPerG,
    total: total,
    laborH: laborH, water: water, fert: fert, acid: acid, auto: auto,
    dripper: dripper, stake: stake, ipm: ipm, ppe: ppe, lab: lab, drying: drying, label: label,
    clonesWeek: clonesWeek, mixL: mixL, brutL: brutL,
    trimH: trimH, packH: packH
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
  const s = {
    plantsYear: Math.max(400, +el("plantsYear").value),
    plantsPerM2: plantsPerM2,
    harvestsPerRoom: harvestsPerRoom,
    flowerArea: flowerArea,
    roomM2: flowerArea / flowerRooms,
    dryRooms: Math.max(1, +el("dryRooms").value),
    dryTiers: Math.max(1, Math.min(3, +el("dryTiers").value)),
    trimM2: el("trimM2") ? Math.max(18, +el("trimM2").value) : Math.max(24, Math.round((flowerArea / flowerRooms) * 0.35)),
    packM2: el("packM2") ? Math.max(12, +el("packM2").value) : Math.max(18, Math.round(flowerRooms * 6 + flowerArea * 0.02)),
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
    priceKgGacp: el("priceKgGacp") ? +el("priceKgGacp").value : 2500,
    priceKgGmp: el("priceKgGmp") ? +el("priceKgGmp").value : (el("priceKg") ? +el("priceKg").value : 3500),
    extractPriceKg: el("extractPriceKg") ? +el("extractPriceKg").value : 4200,
    saleablePct: Math.max(0.8, Math.min(0.88, +el("saleablePct").value / 100)),
    extractPct: Math.max(0, Math.min(1, +el("extractPct").value / 100)),
    extraction: +el("extractPct").value > 0,
    usable: 0.85
  };
  if (window.TKTS_market && window.TKTS_market.patchState) {
    return window.TKTS_market.patchState(s);
  }
  return s;
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
    window.marketAutoMode = false;
    highlightPreset("custom");
    week = 0;
    render();
    return;
  }
  window.marketAutoMode = false;
  customMode = false;
  pinDryRooms = false;
  const p = PRESETS[key];
  applyFacilityParams(p, { render: true, presetKey: key });
}

function applyFacilityParams(p, opts) {
  opts = opts || {};
  if (!p) return;
  customMode = false;
  pinDryRooms = false;

  [
    "flowerRooms", "roomM2", "flowerArea", "plantsPerM2", "harvestsPerRoom", "plantsYear",
    "dryRooms", "dryTiers", "trimM2", "packM2",
    "flowerDays", "vegDays", "preVegDays", "rootDays", "dryDays", "dryCleanDays",
    "priceKgGacp", "priceKgGmp", "extractPriceKg", "saleablePct"
  ].forEach(function (k) {
    if (p[k] == null || !el(k)) return;
    el(k).value = String(p[k]);
  });

  if (el("extractPct")) {
    if (p.extractPct != null) el("extractPct").value = String(p.extractPct);
    else if (p.extraction != null) el("extractPct").value = p.extraction ? String(p.extractPct != null ? p.extractPct : 20) : "0";
  }

  if (p.yieldSkill) setYieldSkill(p.yieldSkill, true);
  else if (p.yieldG != null && el("yieldG")) el("yieldG").value = String(p.yieldG);

  if (opts.cultivarPlan && opts.cultivarPlan.length) {
    ensureRoomBoard(Math.max(1, +p.flowerRooms || flowerRoomCount()));
    opts.cultivarPlan.forEach(function (row, i) {
      if (!roomBoard[i]) return;
      roomBoard[i].cultivarId = row.id;
      if (row.dens != null) roomBoard[i].dens = row.dens;
    });
    if (el("genetics")) {
      const uniq = {};
      opts.cultivarPlan.forEach(function (r) { uniq[r.id] = true; });
      el("genetics").value = String(Object.keys(uniq).length);
    }
  } else if (opts.cultivarIds && opts.cultivarIds.length) {
    fillRoomBoardEven(opts.cultivarIds, Math.max(1, +p.flowerRooms || flowerRoomCount()));
    if (el("genetics")) el("genetics").value = String(Math.min(opts.cultivarIds.length, p.genetics || opts.cultivarIds.length));
  } else if (p.genetics) {
    applyGeneticsCount(p.genetics);
  }

  cycleOverride = false;
  densityOverride = false;
  applyMixToSliders();
  ["flowerDays", "vegDays", "preVegDays", "rootDays", "yieldG", "plantsPerM2", "harvestsPerRoom"].forEach(function (k) {
    if (p[k] != null && el(k)) el(k).value = String(p[k]);
  });
  if (opts.presetKey) highlightPreset(opts.presetKey);
  else document.querySelectorAll(".presets button").forEach(function (b) { b.classList.remove("active"); });
  syncLayout("roomM2");
  syncPlantsFromGenetics();
  week = 0;
  if (opts.render !== false) render();
}

function applyMarketFacility(renderAfter) {
  if (renderAfter === undefined) renderAfter = true;
  if (!window.TKTS_market || !window.TKTS_market.computeFacilityParams) {
    applyPreset("dengeli");
    return null;
  }
  const c = window.TKTS_market.getCountry();
  if (!c) {
    applyPreset("dengeli");
    return null;
  }
  const pack = window.TKTS_market.computeFacilityParams(c);
  if (!pack || !pack.params) return null;
  window.marketAutoMode = true;
  applyFacilityParams(pack.params, {
    cultivarPlan: pack.cultivarPlan,
    cultivarIds: (pack.cultivars || []).map(function (cv) { return cv.id; }),
    meta: pack,
    render: renderAfter
  });
  return pack;
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
    const jobs = [];
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
      jobs.push({ room: ev.room, w: ev.w, dryIdx: placed, startDay: start, dryEndDay: start + dryD });
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
    return { occ: occ, labels: labels, unassigned: unassigned, peak: peak, jobs: jobs };
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
    events: ordered,
    jobs: used.jobs || []
  };
}

function finishTrimSpec(m2) {
  const area = Math.max(12, Math.round(m2 || 0));
  const stations = Math.max(1, Math.floor(area / GMP_FINISH.trimM2PerSt));
  return {
    m2: area,
    stations: stations,
    kgDay: stations * GMP_FINISH.trimKgDay,
    vaultKg: Math.round(Math.max(stations * GMP_FINISH.trimVaultPerSt, area * GMP_FINISH.trimVaultPerM2))
  };
}

function finishPackSpec(m2) {
  const area = Math.max(12, Math.round(m2 || 0));
  const stations = Math.max(1, Math.floor(area / GMP_FINISH.packM2PerSt));
  return {
    m2: area,
    stations: stations,
    kgDay: stations * GMP_FINISH.packKgDay,
    vaultKg: Math.round(Math.max(stations * GMP_FINISH.packVaultPerSt, area * GMP_FINISH.packVaultPerM2))
  };
}

function flowerTagLabel(tag) {
  if (!tag) return "";
  return "\u00c7i\u00e7ek " + String(tag).replace(/^C/i, "");
}

function finishTrimFill(kind) {
  if (kind === "hold") return "#c17a48";
  if (kind === "trim") return "#3ea8c4";
  return "#243038";
}

function finishPackFill(kind) {
  if (kind === "pack") return "#3d9a72";
  return "#243038";
}

function dryBusyThisWeek(cal, w) {
  const rows = (cal && cal.dryRows) || [];
  for (let i = 0; i < rows.length; i++) {
    const k = rows[i] ? rows[i][w] : "idle";
    if (k === "gmp" || k === "clean") return true;
  }
  return false;
}

function simulatePostDry(jobs, trimSp, packSp) {
  const days = 364;
  const arrivals = (jobs || []).map(function (j) {
    return {
      day: ((j.dryEndDay % days) + days) % days,
      room: j.room,
      kg: Math.max(0, j.kg || 0),
      packKg: Math.max(0, j.packKg != null ? j.packKg : (j.kg || 0))
    };
  }).filter(function (a) { return a.kg > 0.01; });
  const annualKg = arrivals.reduce(function (n, a) { return n + a.kg; }, 0);
  const packAnnual = arrivals.reduce(function (n, a) { return n + a.packKg; }, 0);
  const maxBatchKg = arrivals.reduce(function (n, a) { return Math.max(n, a.kg); }, 0);
  const workFrac = GMP_FINISH.workDays / 7;
  const avgFail = trimSp.kgDay * workFrac * days + 0.01 < annualKg;
  const packAvgFail = packSp.kgDay * workFrac * days + 0.01 < packAnnual;
  let tooBig = 0;
  arrivals.forEach(function (a) {
    if (a.kg > trimSp.vaultKg + 1) tooBig += 1;
  });

  let pending = [];
  let trimQ = [];
  let packGate = [];
  let packQ = [];
  const trimKg = Array(days).fill(0);
  const packKgD = Array(days).fill(0);
  const holdN = Array(days).fill(0);
  const trimHead = Array(days).fill(null);
  const packHead = Array(days).fill(null);
  const trimLeftD = Array(days).fill(0);
  const packLeftD = Array(days).fill(0);
  let peakTrimQ = 0, peakPackQ = 0, maxHold = 0, holdLots = 0;
  let maxTrimWait = 0, maxPackWait = 0;
  const endWip = [0, 0, 0];

  function vaultTrim() {
    return trimQ.reduce(function (n, l) { return n + l.trimLeft; }, 0)
      + packGate.reduce(function (n, l) { return n + l.packLeft; }, 0);
  }
  function vaultPack() {
    return packQ.reduce(function (n, l) { return n + l.packLeft; }, 0);
  }
  function wipAll() {
    let n = vaultTrim() + vaultPack();
    pending.forEach(function (l) { n += l.kg; });
    return n;
  }

  const byDay = Array.from({ length: days }, function () { return []; });
  arrivals.forEach(function (a) { byDay[a.day].push(a); });
  const horizon = days * 3;
  for (let t = 0; t < horizon; t++) {
    const d = t % days;
    const year = Math.floor(t / days);
    const measure = year === 2;
    if (measure && d === 0) {
      peakTrimQ = 0; peakPackQ = 0; maxHold = 0; holdLots = 0; maxTrimWait = 0; maxPackWait = 0;
      for (let i = 0; i < days; i++) {
        trimKg[i] = 0; packKgD[i] = 0; holdN[i] = 0;
        trimHead[i] = null; packHead[i] = null; trimLeftD[i] = 0; packLeftD[i] = 0;
      }
    }
    const work = (t % 7) < GMP_FINISH.workDays;
    byDay[d].forEach(function (a) {
      pending.push({
        room: a.room, kg: a.kg, packKg: a.packKg,
        trimLeft: a.kg, packLeft: a.packKg,
        dryEnd: t, released: -1, trimStart: -1, trimEnd: -1, packStart: -1, packEnd: -1
      });
    });
    let i = 0;
    while (i < pending.length) {
      const l = pending[i];
      if (vaultTrim() + l.kg <= trimSp.vaultKg + 1) {
        l.released = t;
        l.holdDays = t - l.dryEnd;
        if (l.holdDays < 0) l.holdDays = 0;
        if (measure) {
          if (l.holdDays > maxHold) maxHold = l.holdDays;
          if (l.holdDays > 0) holdLots += 1;
        }
        trimQ.push(l);
        pending.splice(i, 1);
      } else {
        if (measure) holdN[d] += 1;
        i += 1;
      }
    }
    if (work) {
      let cap = trimSp.kgDay;
      while (cap > 1e-6 && trimQ.length) {
        const l = trimQ[0];
        if (l.trimStart < 0) l.trimStart = t;
        const take = Math.min(cap, l.trimLeft);
        l.trimLeft -= take;
        cap -= take;
        if (measure) {
          trimKg[d] += take;
          trimHead[d] = "C" + l.room;
        }
        if (l.trimLeft <= 1e-6) {
          l.trimLeft = 0;
          l.trimEnd = t;
          if (measure && l.trimEnd - l.dryEnd > maxTrimWait) maxTrimWait = l.trimEnd - l.dryEnd;
          trimQ.shift();
          if (l.packKg > 0.05) packGate.push(l);
          else l.packEnd = t;
        }
      }
      i = 0;
      while (i < packGate.length) {
        const l = packGate[i];
        if (vaultPack() + l.packKg <= packSp.vaultKg + 1) {
          packQ.push(l);
          packGate.splice(i, 1);
        } else i += 1;
      }
      cap = packSp.kgDay;
      while (cap > 1e-6 && packQ.length) {
        const l = packQ[0];
        if (l.packStart < 0) l.packStart = t;
        const take = Math.min(cap, l.packLeft);
        l.packLeft -= take;
        cap -= take;
        if (measure) {
          packKgD[d] += take;
          packHead[d] = "C" + l.room;
        }
        if (l.packLeft <= 1e-6) {
          l.packLeft = 0;
          l.packEnd = t;
          if (measure && l.packStart >= 0 && l.trimEnd >= 0 && l.packStart - l.trimEnd > maxPackWait) {
            maxPackWait = l.packStart - l.trimEnd;
          }
          packQ.shift();
        }
      }
    }
    if (measure) {
      if (vaultTrim() > peakTrimQ) peakTrimQ = vaultTrim();
      if (vaultPack() > peakPackQ) peakPackQ = vaultPack();
      if (trimQ.length) {
        trimHead[d] = "C" + trimQ[0].room;
        trimLeftD[d] = vaultTrim();
      } else if (packGate.length) {
        trimHead[d] = "C" + packGate[0].room;
        trimLeftD[d] = vaultTrim();
      }
      if (packQ.length) {
        packHead[d] = "C" + packQ[0].room;
        packLeftD[d] = vaultPack();
      }
    }
    if (d === days - 1) endWip[year] = wipAll();
  }

  const diverging = endWip[2] > endWip[1] + Math.max(8, annualKg * 0.05);
  function modeTag(list) {
    const counts = {};
    let best = null, n = 0;
    list.forEach(function (t) {
      if (!t) return;
      counts[t] = (counts[t] || 0) + 1;
      if (counts[t] > n) { n = counts[t]; best = t; }
    });
    return best;
  }
  const trimWeeks = [];
  const packWeeks = [];
  const trimOcc = [];
  const packOcc = [];
  const trimKgW = [];
  const packKgW = [];
  for (let w = 0; w < 52; w++) {
    let kt = 0, kp = 0, hd = 0, leftT = 0, leftP = 0;
    const headsT = [];
    const headsP = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      kt += trimKg[idx];
      kp += packKgD[idx];
      hd += holdN[idx];
      headsT.push(trimHead[idx]);
      headsP.push(packHead[idx]);
      if (trimLeftD[idx] > leftT) leftT = trimLeftD[idx];
      if (packLeftD[idx] > leftP) leftP = packLeftD[idx];
    }
    const occT = modeTag(headsT);
    const occP = modeTag(headsP);
    trimWeeks.push(kt > 0.2 ? "trim" : (hd > 0 ? "hold" : (occT ? "trim" : "idle")));
    packWeeks.push(kp > 0.2 || occP ? "pack" : "idle");
    trimOcc.push(occT);
    packOcc.push(occP);
    trimKgW.push(kt > 0.2 ? kt : leftT);
    packKgW.push(kp > 0.2 ? kp : leftP);
  }
  return {
    annualKg: annualKg,
    maxBatchKg: maxBatchKg,
    avgFail: avgFail,
    packAvgFail: packAvgFail,
    diverging: diverging,
    tooBig: tooBig,
    peakTrimQ: peakTrimQ,
    peakPackQ: peakPackQ,
    maxHold: maxHold,
    holdLots: holdLots,
    maxTrimWait: maxTrimWait,
    maxPackWait: maxPackWait,
    trimWeeks: trimWeeks,
    packWeeks: packWeeks,
    trimOcc: trimOcc,
    packOcc: packOcc,
    trimKgW: trimKgW,
    packKgW: packKgW,
    endWip: endWip[2]
  };
}

function postDryClears(r) {
  return !!(r && !r.avgFail && !r.packAvgFail && !r.diverging && !r.tooBig && r.maxHold <= 2 && r.maxPackWait <= 5);
}

function suggestFinishM2(jobs) {
  if (!jobs || !jobs.length) return { trimNeed: 24, packNeed: 18 };
  let trimNeed = 240;
  for (let m2 = 18; m2 <= 240; m2 += 6) {
    if (postDryClears(simulatePostDry(jobs, finishTrimSpec(m2), finishPackSpec(280)))) {
      trimNeed = m2;
      break;
    }
  }
  let packNeed = 200;
  for (let m2 = 12; m2 <= 200; m2 += 5) {
    if (postDryClears(simulatePostDry(jobs, finishTrimSpec(trimNeed), finishPackSpec(m2)))) {
      packNeed = m2;
      break;
    }
  }
  return { trimNeed: trimNeed, packNeed: packNeed };
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
    harvestWant: plan.want,
    jobs: assigned.jobs || []
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
  const finishJobs = (cal.jobs || []).map(function (j) {
    const spec = roomModels[j.room - 1];
    const kg = spec ? spec.kgHarvest : 0;
    return {
      room: j.room, w: j.w, dryIdx: j.dryIdx,
      startDay: j.startDay, dryEndDay: j.dryEndDay,
      kg: kg,
      packKg: kg * (1 - (s.extractPct || 0))
    };
  });
  const trimSp = finishTrimSpec(layout.trimM2);
  const packSp = finishPackSpec(layout.packM2);
  const post = simulatePostDry(finishJobs, trimSp, packSp);
  const need = suggestFinishM2(finishJobs);
  post.trimNeed = need.trimNeed;
  post.packNeed = need.packNeed;
  cal.trimWeeks = post.trimWeeks;
  cal.packWeeks = post.packWeeks;
  cal.trimOcc = post.trimOcc;
  cal.packOcc = post.packOcc;
  cal.trimKgW = post.trimKgW;
  cal.packKgW = post.packKgW;
  const flowerRevenueGacp = kgFlowerSold * (s.priceKgGacp != null ? s.priceKgGacp : 2500);
  const flowerRevenueGmp = kgFlowerSold * (s.priceKgGmp != null ? s.priceKgGmp : (s.priceKg || 3500));
  const extractSoldKg = ex.productKg != null ? ex.productKg : (ex.crudeKg || 0);
  const extractRevenue = extractSoldKg * (s.extractPriceKg || 0);
  const revenueGacp = flowerRevenueGacp + extractRevenue;
  const revenueGmp = flowerRevenueGmp + extractRevenue;
  const flowerRevenue = flowerRevenueGmp;
  const revenue = revenueGmp;


  const motherProd = layout.motherM2;
  const motherBank = Math.max(4, Math.round(layout.motherM2 * 0.35));
  const quarantine = 4, tissue = 6, cuttings = layout.cuttingsM2;
  const preVeg = layout.preVegM2;
  const veg = layout.vegM2;
  const gacpGrowM2 = motherProd + motherBank + cuttings + preVeg + veg + s.flowerArea;
  const gacpSupportM2 = quarantine + tissue + 28;
  const gacpM2 = gacpGrowM2 + gacpSupportM2;
  const dryM2 = layout.dryArea;
  const extractM2 = ex.m2;
  const gmpM2 = dryM2 + layout.trimM2 + layout.packM2 + 30;
  const officeM2 = 36;
  const totalBuilt = gacpM2 + gmpM2 + officeM2 + extractM2;

  const lightCapex = preVeg * CAPEX_U.lightPre + veg * CAPEX_U.lightVeg + s.flowerArea * CAPEX_U.lightFlower;
  const gacpCapex = gacpGrowM2 * CAPEX_U.gacpGrowM2 + gacpSupportM2 * CAPEX_U.gacpSupportM2 + lightCapex;
  const gmpCapex = gmpM2 * CAPEX_U.gmpM2;
  const officeCapex = officeM2 * CAPEX_U.officeM2;
  const extractCapex = ex.capex;
  const stability = (mix.length || s.genetics) * CAPEX_U.stabilityPerCultivar;
  const capex = gacpCapex + gmpCapex + officeCapex + extractCapex + stability;
  const ox = computeOpex(s, plantsYear, harvestsYear, kgGross);
  ox.extract = ex.opex;
  ox.total += ex.opex;
  const opexYear = ox.total;
  const staff = buildStaffPlan(s, ox, ex, trimSp, packSp, plantsPerRoom);
  const staffBase = staff.baseFte;
  const harvestCrew = staff.peakDayFte;
  const ebitdaGacp = revenueGacp - opexYear;
  const ebitdaGmp = revenueGmp - opexYear;
  const ebitda = ebitdaGmp;
  const payback = paybackWithRamp(capex, ebitdaGacp, ebitdaGmp, PRICE_RAMP.gacpYears);
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
    alerts.push({ t: "bad", m: ta("harvestBad", { harvests: harvestsInt, max: maxFlowerDays(harvestsInt), tight: tight }) });
  } else {
    alerts.push({ t: "ok", m: ta("harvestOk", { harvests: harvestsInt, cycle: fmt(cycleFlower, 1) }) });
  }
  if (cal.harvestWant && cal.harvestsByRoom && cal.harvestsByRoom.some(function (n) { return n < cal.harvestWant; })) {
    alerts.push({ t: "warn", m: ta("harvestConflict", { want: cal.harvestWant }) });
  }
  if (roomM2 > 300.5) {
    alerts.push({ t: "bad", m: ta("roomMax") });
  }
  alerts.push({ t: "ok", m: ta("dryRule", { dry: s.dryDays || 14, clean: s.dryCleanDays || 7 }) });
  if (cal.unassigned > 0) {
    alerts.push({ t: "bad", m: ta("dryBad", { rooms: s.dryRooms, wait: cal.unassigned, flower: s.flowerRooms, need: drySuggest }) });
  } else if (s.dryRooms > drySuggest + 1) {
    alerts.push({ t: "warn", m: ta("dryWarn", { rooms: s.dryRooms, need: drySuggest }) });
  } else {
    alerts.push({ t: "ok", m: ta("dryOk", { rooms: s.dryRooms, need: drySuggest, peak: cal.peakDry }) });
  }
  alerts.push({
    t: "ok",
    m: ta("gacpVeg", {
      pct: Math.round(100 * (preVeg + veg) / Math.max(1, s.flowerArea)),
      m2: Math.round(motherProd + motherBank + cuttings)
    })
  });
  if (density > 10) {
    alerts.push({ t: "warn", m: ta("densityHigh", { d: fmt(density, 1) }) });
  }
  alerts.push({ t: "ok", m: ta("yieldLevel", { skill: skillLabel(s.yieldSkill), ref: fmt(yieldRef, 0), use: fmt(yieldUse, 0), gm2: fmt(gM2Avg, 0) }) });
  if (densityOverride && stats && Math.abs(stats.dens - density) > 1) {
    alerts.push({ t: "warn", m: ta("geneticsDensity", { gen: fmt(stats.dens, 1), cur: fmt(density, 1) }) });
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
      bits.push(nm + " " + x.n + " " + ti("unit.rooms") + " · " + fmt(x.r.dens, 1) + "/m² · " + x.r.plants + " × " + x.r.harvests + " " + ti("unit.harvest"));
    });
    alerts.push({ t: "ok", m: ta("roomModel", { bits: bits.join(" · "), plants: fmt(plantsYear) }) });
  }
  if (cal.gmpIdleWeeks > 8) {
    alerts.push({ t: "warn", m: ta("gmpIdle", { w: cal.gmpIdleWeeks }) });
  }
  if (!layout.hangOk) {
    alerts.push({ t: "bad", m: ta("hangBad", { base: layout.dryRoomM2, tiers: layout.tiers, eq: layout.hangEq, need: layout.hangNeed }) });
  } else {
    alerts.push({ t: "ok", m: ta("hangOk", { room: Math.round(s.roomM2), tiers: layout.tiers, base: layout.dryRoomM2, eq: layout.hangEq }) });
  }
  alerts.push({ t: "ok", m: ta("trimFlow", { ts: trimSp.stations, tkg: trimSp.kgDay, tv: trimSp.vaultKg, ps: packSp.stations, pkg: packSp.kgDay, pv: packSp.vaultKg }) });
  if (post.tooBig) {
    alerts.push({ t: "bad", m: ta("batchBig", { kg: fmt(post.maxBatchKg, 0), vault: trimSp.vaultKg, need: post.trimNeed }) });
  } else if (post.avgFail || post.packAvgFail || post.diverging) {
    alerts.push({ t: "bad", m: ta("throughputBad", { kg: fmt(post.annualKg, 0), trim: fmt(trimSp.kgDay * 5 / 7, 1), pack: fmt(packSp.kgDay * 5 / 7, 1), trimM2: post.trimNeed, packM2: post.packNeed }) });
  } else if (post.maxHold > 3) {
    alerts.push({ t: "bad", m: ta("vaultHold", { days: post.maxHold, trim: layout.trimM2, pack: layout.packM2, trimNeed: post.trimNeed, packNeed: post.packNeed }) });
  } else if (layout.trimM2 < post.trimNeed - 1 || layout.packM2 < post.packNeed - 1) {
    alerts.push({ t: "warn", m: ta("trimTight", { trim: layout.trimM2, pack: layout.packM2, tq: fmt(post.peakTrimQ, 0), pq: fmt(post.peakPackQ, 0), trimNeed: post.trimNeed, packNeed: post.packNeed }) });
  } else {
    alerts.push({ t: "ok", m: ta("trimOk", { tq: fmt(post.peakTrimQ, 0), pq: fmt(post.peakPackQ, 0) }) });
  }
  alerts.push({ t: "ok", m: ta("layoutRule") });
  if (s.alloc && s.alloc.rows && s.alloc.rows.length) {
    const dist = s.alloc.rows.map(function (r) { return r.c.name + " " + r.rooms + " " + ti("unit.room"); }).join(", ");
    if (!s.alloc.match) {
      if (s.alloc.trim) alerts.push({ t: "warn", m: ta("allocTrim", { assigned: s.alloc.assigned, total: s.flowerRooms, dist: dist }) });
      else if (s.alloc.fill) alerts.push({ t: "warn", m: ta("allocFill", { assigned: s.alloc.assigned, total: s.flowerRooms, name: s.alloc.rows[0].c.name, dist: dist }) });
    } else {
      alerts.push({ t: "ok", m: ta("allocOk", { dist: dist, total: s.flowerRooms }) });
    }
  } else if (s.alloc && s.alloc.empty) {
    alerts.push({ t: "warn", m: ta("allocEmpty") });
  }
  if (mix.length) {
    const kgBits = mix.map(function (c) {
      const kg = kgById[c.id];
      return c.name + (kg != null ? (" " + fmt(kg, 0) + " kg") : "");
    }).join(", ");
    alerts.push({ t: "ok", m: ta("geneticsMix", { bits: kgBits, flower: flowerDaysUse, yield: fmt(yieldUse, 0), oil: Math.round(((stats && stats.extractY) || 0.12) * 100) }) });
  }
  if (extractFeed > 0) {
    alerts.push({ t: ex.overCap ? "warn" : "ok", m: ta("extractLine", { feed: fmt(extractFeed, 0), day: fmt(ex.kgDay, 1), rated: fmt(ex.ratedKgDay, 0), crude: fmt(ex.crudeKg, 0), product: fmt(ex.productKg, 0), capex: eur(ex.capexEq) }) });
    if (ex.overCap) alerts.push({ t: "bad", m: ta("extractOver") });
  }
  alerts.push({
    t: "ok",
    m: ta("salesRamp", {
      gacpY: PRICE_RAMP.gacpYears,
      gacpP: eur(s.priceKgGacp != null ? s.priceKgGacp : 2500),
      gacpR: eur(flowerRevenueGacp),
      gmpY: PRICE_RAMP.gacpYears + 1,
      gmpP: eur(s.priceKgGmp != null ? s.priceKgGmp : 3500),
      gmpR: eur(flowerRevenueGmp),
      ex: extractFeed > 0 ? (fmt(extractSoldKg, 0) + " kg × " + eur(s.extractPriceKg || 0) + "/kg") : ""
    })
  });
  alerts.push({ t: "ok", m: ta("opexV3") });
  alerts.push({
    t: "ok",
    m: ta("staffModel", { base: staffBase, peak: staff.peakExtra, total: harvestCrew, note: staff.note })
  });

  return {
    roomM2: roomM2, usableFlower: usableFlower, plantsPerRoom: plantsPerRoom, density: density,
    plantsYear: plantsYear, plantsInFlower: plantsInFlower, kgYear: kgYear, kgGross: kgGross, revenue: revenue,
    staggerOk: staggerOk, gacpM2: gacpM2, gmpM2: gmpM2, totalBuilt: totalBuilt, drySuggest: drySuggest,
    preVeg: preVeg, veg: veg, motherProd: motherProd, motherBank: motherBank, capex: capex,
    gacpCapex: gacpCapex, gmpCapex: gmpCapex, officeCapex: officeCapex, extractCapex: extractCapex, stability: stability,
    opexYear: opexYear, opex: ox, opexPerG: opexPerG, ebitda: ebitda, payback: payback, staffBase: staffBase, harvestCrew: harvestCrew,
    staff: staff,
    cycleDays: cycleDays, cyclesPerRoom: cyclesPerRoom, harvestsYear: harvestsYear,
    cycleFlower: cycleFlower, cal: cal, alerts: alerts,
    layout: layout, extract: ex, kgFlowerSold: kgFlowerSold, extractFeed: extractFeed, yieldUse: yieldUse,
    flowerRevenue: flowerRevenue, flowerRevenueGacp: flowerRevenueGacp, flowerRevenueGmp: flowerRevenueGmp,
    extractRevenue: extractRevenue, revenueGacp: revenueGacp, revenueGmp: revenueGmp,
    ebitdaGacp: ebitdaGacp, ebitdaGmp: ebitdaGmp, kgById: kgById,
    stats: stats, flowerDaysLong: flowerDaysLong, roomModels: roomModels, gM2Avg: gM2Avg, yieldRef: yieldRef,
    postDry: post, trimSpec: trimSp, packSpec: packSp
  };
}

function kpiMain(num, unit, euro) {
  return (euro ? "<span class=\"kpi-cur\">\u20AC</span>" : "") +
    "<span class=\"kpi-num\">" + num + "</span>" +
    (unit ? "<span class=\"kpi-unit\">" + unit + "</span>" : "");
}

function renderKpis(m, s) {
  const soldEx = m.extract ? (m.extract.productKg != null ? m.extract.productKg : m.extract.crudeKg) : 0;
  const paybackTxt = Number.isFinite(m.payback) ? fmt(m.payback, 1) + " " + ti("unit.year") : "\u2014";
  const countryName = (m.market && m.market.country && window.TKTS_i18n)
    ? window.TKTS_i18n.countryDisplay(m.market.country) : (m.market && m.market.country) || "";
  const items = [
    [ti("kpi.plantsYear"), kpiMain(fmt(m.plantsYear), ""), ti("kpi.inFlower", { n: fmt(m.plantsInFlower, 0), h: fmt(m.harvestsYear, 0) }), ""],
    [ti("kpi.roomArea"), kpiMain(fmt(s.roomM2, 0), "m\u00B2"), ti("kpi.roomCap", { area: m2(s.flowerArea) }), s.roomM2 > 300.5 ? "warn" : ""],
    [ti("kpi.drying"), kpiMain(String(s.dryRooms), ""), ti("kpi.drySub", { need: m.drySuggest, q: fmt((m.postDry && m.postDry.peakTrimQ) || 0, 0), trim: (m.postDry && m.postDry.trimNeed) || 0, pack: (m.postDry && m.postDry.packNeed) || 0 }),
      (m.cal.unassigned || (m.postDry && (m.postDry.tooBig || m.postDry.avgFail || m.postDry.diverging || (m.postDry.maxHold > 3)))) ? "warn" : ""],
    [ti("kpi.dryFlower"), kpiMain(fmt(m.kgYear, 0), "kg"), ti("kpi.dryFlowerSub", { gm2: fmt(m.gM2Avg || 0, 0), sold: fmt(m.kgFlowerSold, 0), ex: fmt(soldEx, 0) }), ""],
    [ti("kpi.revenue"), kpiMain(fmt(m.revenue), "", true), ti("kpi.revenueSub", { gacp: eur(m.revenueGacp || 0) }), ""],
    [ti("kpi.capex"), kpiMain(fmt(m.capex), "", true), ti("kpi.capexSub", { ebitda: eur(m.ebitda), payback: paybackTxt }), m.payback < 5 ? "good" : m.payback < 8 ? "warn" : ""],
    [ti("kpi.staff"), kpiMain(String(m.staffBase), "FTE"), ti("kpi.staffSub", { crew: m.harvestCrew, roles: ((m.staff && m.staff.roles) ? m.staff.roles.length : 0) }), ""]
  ];
  if (m.market && m.market.projection && m.market.projection.sharePct != null) {
    items.splice(4, 0, [ti("kpi.share"), kpiMain(pct(m.market.projection.sharePct), ""), ti("kpi.shareSub", { country: countryName, kg: fmt(m.market.projection.demandKg, 0) }), m.market.projection.sharePct > 8 ? "warn" : m.market.projection.sharePct < 0.05 ? "warn" : "good"]);
  }
  el("kpis").innerHTML = items.map(function (row) {
    return "<article class=\"kpi " + row[3] + "\"><div class=\"label\">" + row[0] + "</div><div class=\"value\">" + row[1] + "</div><div class=\"sub\">" + row[2] + "</div></article>";
  }).join("");
}

function pct(n) {
  return "%" + fmt(n, 1);
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
  return ti("preset." + (key || "custom"));
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

  const office = mSize(36, 1.35);
  const air = mSize(10, 2.4);
  const mech = mSize(Math.max(18, Math.round((m.totalBuilt || 400) * 0.025)), 1.15);
  const staff = mSize(14, 1.4);
  const store = mSize(16, 1.3);
  const mother = mSize(m.motherProd || L.motherM2 || 12, 1.25);
  const bank = mSize(m.motherBank || 6, 1.6);
  const cut = mSize(L.cuttingsM2 || 8, 1.2);
  const prev = mSize(m.preVeg || L.preVegM2 || 12, 1.3);
  const veg = mSize(m.veg || L.vegM2 || 16, 1.35);
  const flower = mSize(s.roomM2, 1.32);
  const dry = mSize(L.dryRoomM2 || 24, 1.15);
  const trim = mSize(L.trimM2 || 24, 1.5);
  const pack = mSize(L.packM2 || 18, 1.35);
  const ext = hasEx ? mSize(ex.m2, 1.6) : null;

  const gap = 0.5;
  const hall = 2.2;
  let x = 0;
  let y = 0;
  add("GACP giri\u015f", x, y, Math.max(5.2, air.w), 3.2, "#a34a3a", "hava kilit", "gacp");
  y = 3.2 + gap;
  const propY = y;
  const propH = Math.max(mother.h, cut.h, prev.h, veg.h, bank.h + 3.6);
  add("Ana\u00e7 \u00fcretim", x, y, mother.w, propH, "#6f9e62", Math.round(m.motherProd || mother.a) + " m\u00B2", "gacp");
  x += mother.w + gap;
  const bankW = Math.max(bank.w, 6.6);
  const bankH = Math.min(bank.h, propH * 0.48);
  add("Ana\u00e7 bankas\u0131", x, y, bankW, bankH, "#587c4e", "GACP", "gacp");
  add("Karantina", x, y + bankH + 0.35, bankW * 0.48, propH - bankH - 0.35, "#8b6bb0", "R&D", "rd");
  add("Doku k\u00fclt.", x + bankW * 0.52, y + bankH + 0.35, bankW * 0.48, propH - bankH - 0.35, "#8b6bb0", "R&D", "rd");
  x += bankW + gap;
  add("\u00c7elik", x, y, cut.w, propH, "#7aa56e", Math.round(L.cuttingsM2 || cut.a) + " m\u00B2", "gacp");
  x += cut.w + gap;
  add("Pre-veg", x, y, prev.w, propH, "#88b57a", Math.round(m.preVeg || prev.a) + " m\u00B2", "gacp");
  x += prev.w + gap;
  add("Veg", x, y, veg.w, propH, "#88b57a", Math.round(m.veg || veg.a) + " m\u00B2", "gacp");
  x += veg.w;
  const propW = x;
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
  const gacpW = Math.max(propW, flowerW);
  const gmpX = gacpW + hall;
  const gmpY = 3.2 + gap;
  add("GMP giri\u015f", gmpX, 0, Math.max(5.2, air.w), 3.2, "#8a3a42", "hava kilit", "gmp");
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
  const twC = (m.cal && m.cal.trimWeeks && m.cal.trimWeeks[currentWeek]) || "idle";
  const pwC = (m.cal && m.cal.packWeeks && m.cal.packWeeks[currentWeek]) || "idle";
  const tWho = flowerTagLabel(m.cal && m.cal.trimOcc && m.cal.trimOcc[currentWeek]);
  const pWho = flowerTagLabel(m.cal && m.cal.packOcc && m.cal.packOcc[currentWeek]);
  const tKg = (m.cal && m.cal.trimKgW && m.cal.trimKgW[currentWeek]) || 0;
  const pKg = (m.cal && m.cal.packKgW && m.cal.packKgW[currentWeek]) || 0;
  add(
    "Trim",
    gmpX, py, trim.w, trim.h,
    finishTrimFill(twC),
    (tWho ? (tWho + " \u00b7 " + fmt(tKg, 0) + " kg") : (Math.round(L.trimM2 || trim.a) + " m\u00B2")) + (twC === "hold" ? " \u00b7 bekler" : (twC === "trim" ? " \u00b7 i\u015fleniyor" : "")),
    "gmp"
  );
  add(
    "Paket",
    gmpX + trim.w + gap, py, pack.w, pack.h,
    finishPackFill(pwC),
    (pWho ? (pWho + " \u00b7 " + fmt(pKg, 0) + " kg") : (Math.round(L.packM2 || pack.a) + " m\u00B2")) + (pwC === "pack" ? " \u00b7 i\u015fleniyor" : ""),
    "gmp"
  );
  py += Math.max(trim.h, pack.h) + gap;
  if (hasEx) {
    add("Ekstraksiyon", gmpX, py, Math.max(ext.w, dryW), ext.h, "#8b6bb0", Math.round(ex.m2) + " m\u00B2 \u00b7 " + fmt(ex.kgDay, 1) + " kg/g", "ext");
    py += ext.h;
  }

  const gmpW = Math.max(dryW, trim.w + gap + pack.w, hasEx ? Math.max(ext.w, dryW) : 0, Math.max(5.2, air.w));
  const gmpH = py;
  const officeX = gmpX + gmpW + hall;
  const colW = Math.max(office.w, mech.w, staff.w, store.w, 8);
  add("Ofis / QMS", officeX, 0, colW, office.h, "#c9b56a", "36 m\u00B2 \u00b7 idare", "idare");
  let oy = office.h + gap;
  add("Mekanik / HVAC", officeX, oy, colW, mech.h, "#4a5550", Math.round(mech.a) + " m\u00B2", "mek");
  oy += mech.h + gap;
  add("Personel", officeX, oy, colW, staff.h, "#b8a56a", Math.round(staff.a) + " m\u00B2", "idare");
  oy += staff.h + gap;
  add("Depo / at\u0131k", officeX, oy, colW, store.h, "#7a846c", Math.round(store.a) + " m\u00B2", "idare");
  oy += store.h;
  const officeW = colW;
  const officeH = oy;
  const innerW = officeX + officeW;
  const innerH = Math.max(flowerY + flowerH, gmpH, officeH);

  const padL = 40, padT = 86, padR = 220, padB = 72;
  const W = Math.round(padL + innerW * PPM + padR);
  const H = Math.round(padT + innerH * PPM + padB);

  function X(mtr) { return Math.round(padL + mtr * PPM); }
  function Y(mtr) { return Math.round(padT + mtr * PPM); }
  function S(mtr) { return Math.max(8, Math.round(mtr * PPM)); }

  const gacpX0 = X(0), gacpY0 = Y(0);
  const gacpZoneW = S(gacpW);
  const gacpZoneH = S(innerH);
  const gmpX0 = X(gmpX - hall * 0.15);
  const gmpY0 = Y(0);
  const gmpZoneW = S(gmpW + hall * 0.3);
  const gmpZoneH = S(innerH);
  const officeX0 = X(officeX - hall * 0.15);
  const officeY0 = Y(0);
  const officeZoneW = S(officeW + hall * 0.15);
  const officeZoneH = S(innerH);

  let svg = "";
  svg += "<rect x=\"0\" y=\"0\" width=\"" + W + "\" height=\"" + H + "\" fill=\"#0c1210\"/>";
  svg += "<rect x=\"18\" y=\"18\" width=\"" + (W - 36) + "\" height=\"" + (H - 36) + "\" rx=\"6\" fill=\"#101714\" stroke=\"#d4c49a\" stroke-width=\"1.2\"/>";
  svg += "<rect x=\"18\" y=\"18\" width=\"" + (W - 36) + "\" height=\"52\" fill=\"#161d1a\" stroke=\"#d4c49a\" stroke-width=\"1.2\"/>";
  svg += "<text x=\"36\" y=\"40\" fill=\"#d4c49a\" font-size=\"15\" font-weight=\"700\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.4\">TIBB\u0130 KENEV\u0130R TES\u0130S\u0130 \u00b7 KONSEPT D\u0130ZAYN</text>";
  svg += "<text x=\"36\" y=\"58\" fill=\"#cfc6a8\" font-size=\"11\" font-family=\"Segoe UI, Arial, sans-serif\">Indoor GACP \u00fcretim + GMP i\u015fleme \u00b7 Senaryo: " + xmlEsc(activePresetLabel()) + " \u00b7 Hafta " + (currentWeek + 1) + " \u00b7 " + s.flowerRooms + " \u00e7i\u00e7ek odas\u0131 \u00b7 " + s.dryRooms + " kurutma \u00b7 toplam " + Math.round(m.totalBuilt) + " m\u00B2</text>";

  svg += "<circle cx=\"" + (W - 48) + "\" cy=\"44\" r=\"14\" fill=\"none\" stroke=\"#d4c49a\" stroke-width=\"1.2\"/>";
  svg += "<polygon points=\"" + (W - 48) + ",28 " + (W - 53) + ",46 " + (W - 43) + ",46\" fill=\"#d4c49a\"/>";
  svg += "<text x=\"" + (W - 48) + "\" y=\"62\" text-anchor=\"middle\" fill=\"#d4c49a\" font-size=\"9\" font-family=\"Segoe UI, Arial, sans-serif\">K</text>";

  svg += "<rect x=\"" + gacpX0 + "\" y=\"" + gacpY0 + "\" width=\"" + gacpZoneW + "\" height=\"" + gacpZoneH + "\" fill=\"rgba(111,158,98,0.08)\" stroke=\"rgba(111,158,98,0.35)\" stroke-dasharray=\"4 3\"/>";
  svg += "<text x=\"" + (gacpX0 + 8) + "\" y=\"" + (gacpY0 + 16) + "\" fill=\"#8fbf84\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.2\">GACP \u00dcRET\u0130M</text>";
  svg += "<rect x=\"" + gmpX0 + "\" y=\"" + gmpY0 + "\" width=\"" + gmpZoneW + "\" height=\"" + gmpZoneH + "\" fill=\"rgba(91,138,168,0.08)\" stroke=\"rgba(91,138,168,0.4)\" stroke-dasharray=\"4 3\"/>";
  svg += "<text x=\"" + (gmpX0 + 8) + "\" y=\"" + (gmpY0 + 16) + "\" fill=\"#8eb4c8\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.2\">GMP \u0130\u015eLEME</text>";
  svg += "<rect x=\"" + officeX0 + "\" y=\"" + officeY0 + "\" width=\"" + officeZoneW + "\" height=\"" + officeZoneH + "\" fill=\"rgba(201,181,106,0.08)\" stroke=\"rgba(201,181,106,0.4)\" stroke-dasharray=\"4 3\"/>";
  svg += "<text x=\"" + (officeX0 + 8) + "\" y=\"" + (officeY0 + 16) + "\" fill=\"#d4c49a\" font-size=\"10\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1.2\">\u0130DARE / D\u0130\u011eER</text>";

  rooms.forEach(function (b, ri) {
    const rx = X(b.x), ry = Y(b.y), rw = S(b.w), rh = S(b.h);
    const ink = inkForFill(b.fill);
    const padB = 6;
    const innerW = Math.max(10, rw - padB * 2);
    const fs = rw < 70 ? 9 : 11;
    const subFs = Math.max(7, fs - 2);
    svg += "<clipPath id=\"cr" + ri + "\"><rect x=\"" + rx + "\" y=\"" + ry + "\" width=\"" + rw + "\" height=\"" + rh + "\"/></clipPath>";
    svg += "<g clip-path=\"url(#cr" + ri + ")\">";
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
    let ty = ry + padB + fs;
    const limit = ry + rh - 4;
    wrapPlanText(b.name, innerW, fs).slice(0, rh < 36 ? 1 : 2).forEach(function (ln) {
      if (ty > limit) return;
      svg += "<text x=\"" + (rx + padB) + "\" y=\"" + ty + "\" fill=\"" + ink + "\" font-size=\"" + fs + "\" font-weight=\"700\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(ln) + "</text>";
      ty += fs + 2;
    });
    if (rh > 28 && b.tag) {
      wrapPlanText(b.tag, innerW, subFs).forEach(function (ln) {
        if (ty + subFs - 1 > limit) return;
        svg += "<text x=\"" + (rx + padB) + "\" y=\"" + ty + "\" fill=\"" + ink + "\" font-size=\"" + subFs + "\" opacity=\"0.78\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(ln) + "</text>";
        ty += subFs + 2;
      });
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

  const lx = W - 210, ly = padT;
  svg += "<text x=\"" + lx + "\" y=\"" + ly + "\" fill=\"#d4c49a\" font-size=\"11\" font-weight=\"700\" font-family=\"Segoe UI, Arial, sans-serif\" letter-spacing=\"1\">KONSEPT D\u0130ZAYN</text>";
  const lines = [
    "\u00c7i\u00e7ek odas\u0131: " + s.flowerRooms + " \u00d7 " + Math.round(s.roomM2) + " m\u00B2",
    "Kurutma: " + s.dryRooms + " \u00d7 " + Math.round(L.dryRoomM2 || 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat",
    "Veg / pre-veg: " + Math.round(m.veg || 0) + " / " + Math.round(m.preVeg || 0) + " m\u00B2",
    "Ana\u00e7: " + Math.round((m.motherProd || 0) + (m.motherBank || 0)) + " m\u00B2",
    "Trim / paket: " + Math.round(L.trimM2 || 0) + " / " + Math.round(L.packM2 || 0) + " m\u00B2 (ihtiya\u00e7 " + ((m.postDry && m.postDry.trimNeed) || 0) + " / " + ((m.postDry && m.postDry.packNeed) || 0) + ")",
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

function ellipsize(str, n) {
  const t = String(str == null ? "" : str);
  if (n < 2) return "";
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "\u2026";
}

function charsFit(widthPx, fontSize) {
  return Math.max(3, Math.floor(Math.max(8, widthPx) / (fontSize * 0.58)));
}

function wrapPlanText(str, widthPx, fontSize) {
  const maxC = charsFit(widthPx, fontSize);
  const words = String(str || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  words.forEach(function (w) {
    const next = cur ? (cur + " " + w) : w;
    if (next.length <= maxC) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length <= maxC ? w : ellipsize(w, maxC);
    }
  });
  if (cur) lines.push(cur);
  return lines;
}

function inkForFill(fill) {
  const dark = { "#4a5550": 1, "#2e3c42": 1, "#243038": 1, "#2a332e": 1, "#3a2c24": 1, "#6a4634": 1, "#2a4a58": 1, "#a34a3a": 1, "#8a3a42": 1, "#a56a4a": 1, "#5d8a9c": 1, "#3d7a6a": 1, "#c17a48": 1, "#3ea8c4": 1, "#3d9a72": 1 };
  return dark[fill] ? "#eef3ec" : "#0c1210";
}

function splitRow(total, weights, gap) {
  const n = weights.length;
  const sum = weights.reduce(function (a, b) { return a + b; }, 0) || n;
  const avail = Math.max(n * 28, total - gap * Math.max(0, n - 1));
  const out = [];
  let used = 0;
  for (let i = 0; i < n; i++) {
    const w = (i === n - 1) ? Math.max(28, avail - used) : Math.max(28, Math.round(avail * weights[i] / sum));
    out.push(w);
    used += w;
  }
  return out;
}

function renderPlan(m, s, currentWeek) {
  const phone = isPhoneView();
  const W = phone ? 392 : 1240;
  const pad = phone ? 12 : 18;
  const zoneGap = phone ? 10 : 12;
  const boxGap = 8;
  const innerW = W - pad * 2;
  const gacpW = phone ? innerW : Math.round(innerW * 0.46);
  const gmpW = phone ? innerW : Math.round(innerW * 0.32);
  const officeW = phone ? innerW : (innerW - gacpW - gmpW - zoneGap * 2);
  const gacpX = pad;
  const gmpX = phone ? pad : (gacpX + gacpW + zoneGap);
  const officeX = phone ? pad : (gmpX + gmpW + zoneGap);
  const titleY = phone ? 22 : 28;
  const zoneY = phone ? 32 : 40;
  const labelH = 16;
  const zonePad = phone ? 8 : 10;
  const row1H = phone ? 52 : 56;
  const row2H = phone ? 64 : 72;
  const L = m.layout || {};
  const fCount = Math.max(1, s.flowerRooms);
  const gacpInnerX = gacpX + zonePad;
  const gacpInnerW = gacpW - zonePad * 2;
  const gmpInnerX = gmpX + zonePad;
  const gmpInnerW = gmpW - zonePad * 2;
  const officeInnerX = officeX + zonePad;
  const officeInnerW = officeW - zonePad * 2;
  const gacpTop = zoneY;
  const gacpY0 = gacpTop + labelH;
  const fCols = Math.min(fCount, Math.max(1, Math.floor((gacpInnerW + boxGap) / ((phone ? 78 : 88) + boxGap))));
  const flowerW = Math.floor((gacpInnerW - (fCols - 1) * boxGap) / fCols);
  const flowerH = Math.max(phone ? 64 : 70, Math.min(92, Math.round(flowerW * 0.9)));
  const fRows = Math.ceil(fCount / fCols);
  const flowerY = gacpY0 + row1H + boxGap + row2H + boxGap;
  const gacpH = flowerY + fRows * (flowerH + boxGap) - boxGap + zonePad - gacpTop;
  const gmpTop = phone ? (gacpTop + gacpH + zoneGap) : zoneY;
  const gmpY0 = gmpTop + labelH;
  const dCount = Math.max(0, s.dryRooms);
  const dCols = Math.max(1, Math.min(Math.max(1, dCount), Math.max(1, Math.floor((gmpInnerW + boxGap) / (72 + boxGap)))));
  const dryW = dCount ? Math.floor((gmpInnerW - (dCols - 1) * boxGap) / dCols) : gmpInnerW;
  const dryH = 58;
  const dRows = dCount ? Math.ceil(dCount / dCols) : 0;
  const dryY = gmpY0 + 44 + boxGap;
  const afterDry = dCount ? (dryY + dRows * (dryH + boxGap) - boxGap) : (gmpY0 + 44);
  const gmpH = afterDry + boxGap + row2H + boxGap + row2H + zonePad - gmpTop;
  const officeBoxH = phone ? 62 : 70;
  const officeH = 4 * officeBoxH + 3 * boxGap + zonePad + labelH;
  const officeTop = phone ? (gmpTop + gmpH + zoneGap) : zoneY;
  const officeY0 = officeTop + labelH;
  const contentH = phone ? (officeTop + officeH - zoneY) : Math.max(gacpH, gmpH, officeH);
  const H = zoneY + contentH + pad;

  const blocks = [];
  function rowBoxes(x, y, width, height, specs) {
    const ws = splitRow(width, specs.map(function (q) { return q.flex || 1; }), boxGap);
    let x0 = x;
    specs.forEach(function (q, i) {
      blocks.push({
        id: q.id, line2: q.line2 || "", line3: q.line3 || "", fill: q.fill,
        x: x0, y: y, w: ws[i], h: height, i: q.i, on: q.on, flow: q.flow, flowCls: q.flowCls
      });
      x0 += ws[i] + boxGap;
    });
  }

  rowBoxes(gacpInnerX, gacpY0, gacpInnerW, row1H, [
    { id: "GACP giri\u015f", line2: "Hava kilit", fill: "#a34a3a", flex: 0.9 },
    { id: "Ana\u00e7 \u00fcretim", line2: m2(m.motherProd), fill: "#6f9e62", flex: 1.2 },
    { id: "Ana\u00e7 bankas\u0131", line2: m2(m.motherBank), fill: "#587c4e", flex: 1 }
  ]);
  rowBoxes(gacpInnerX, gacpY0 + row1H + boxGap, gacpInnerW, row2H, [
    { id: "Karantina", line2: "R&D", fill: "#8b6bb0", flex: 0.85 },
    { id: "Doku k\u00fclt.", line2: "R&D", fill: "#8b6bb0", flex: 0.85 },
    { id: "\u00c7elik", line2: m2(L.cuttingsM2), fill: "#7aa56e", flex: 1 },
    { id: "Pre-veg", line2: m2(m.preVeg), fill: "#88b57a", flex: 1.05 },
    { id: "Veg", line2: m2(m.veg), fill: "#88b57a", flex: 1.15 }
  ]);
  for (let i = 0; i < fCount; i++) {
    const st = m.cal.rooms[i] ? m.cal.rooms[i][currentWeek] : "empty";
    const col = i % fCols;
    const row = Math.floor(i / fCols);
    const g = m.cal.roomCultivars && m.cal.roomCultivars[i];
    const spec = (m.roomModels && m.roomModels[i]) || null;
    const short = g ? g.name.split(" ")[0] : "";
    const dens = spec ? spec.dens : s.plantsPerM2;
    const plants = spec ? spec.plants : Math.round(s.roomM2 * 0.85 * dens);
    const hv = spec && spec.harvests != null ? spec.harvests : plannedHarvests(s.harvestsPerRoom);
    blocks.push({
      i: i,
      on: i === selectedRoom,
      id: "\u00c7i\u00e7ek " + (i + 1),
      x: gacpInnerX + col * (flowerW + boxGap),
      y: flowerY + row * (flowerH + boxGap),
      w: flowerW, h: flowerH,
      line2: m2(s.roomM2) + (short ? (" \u00b7 " + short) : ""),
      line3: fmt(dens, 1) + "/m\u00B2 \u00b7 " + plants + " b \u00b7 " + hv + " h",
      fill: st === "harvest" ? "#d4c49a" : st === "flower" ? "#d4783a" : "#3a2c24"
    });
  }

  rowBoxes(gmpInnerX, gmpY0, gmpInnerW, 44, [
    { id: "GMP giri\u015f", line2: "Hava kilit", fill: "#8a3a42", flex: 1 }
  ]);
  for (let i = 0; i < dCount; i++) {
    const batch = m.cal.dryOcc[i] ? m.cal.dryOcc[i][currentWeek] : null;
    const kind = m.cal.dryRows[i] ? m.cal.dryRows[i][currentWeek] : "idle";
    const col = i % dCols;
    const row = Math.floor(i / dCols);
    const flowerNo = batch ? String(batch).replace("C", "") : "";
    const status = kind === "clean" ? ("\u00c7" + flowerNo + " temizlik") : (kind === "gmp" ? ("\u00c7i\u00e7ek " + flowerNo) : "bo\u015f");
    blocks.push({
      id: "Kurutma " + (i + 1),
      x: gmpInnerX + col * (dryW + boxGap),
      y: dryY + row * (dryH + boxGap),
      w: dryW, h: dryH,
      fill: kind === "gmp" ? "#5b8aa8" : kind === "clean" ? "#8aaeb8" : "#243038",
      line2: status,
      line3: (L.dryRoomM2 || 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat",
      flow: kind === "gmp" || kind === "clean"
    });
  }
  const gmpLowY = afterDry + boxGap;
  const tw = (m.cal.trimWeeks && m.cal.trimWeeks[currentWeek]) || "idle";
  const pw = (m.cal.packWeeks && m.cal.packWeeks[currentWeek]) || "idle";
  const tSp = m.trimSpec || finishTrimSpec(L.trimM2);
  const pSp = m.packSpec || finishPackSpec(L.packM2);
  const tOcc = (m.cal.trimOcc && m.cal.trimOcc[currentWeek]) || null;
  const pOcc = (m.cal.packOcc && m.cal.packOcc[currentWeek]) || null;
  const tKg = (m.cal.trimKgW && m.cal.trimKgW[currentWeek]) || 0;
  const pKg = (m.cal.packKgW && m.cal.packKgW[currentWeek]) || 0;
  const tWho = flowerTagLabel(tOcc);
  const pWho = flowerTagLabel(pOcc);
  const tpW = splitRow(gmpInnerW, [1, 0.9], boxGap);
  const trimX = gmpInnerX;
  const packX = gmpInnerX + tpW[0] + boxGap;
  rowBoxes(gmpInnerX, gmpLowY, gmpInnerW, row2H, [
    {
      id: "Trim",
      line2: tWho ? (tWho + " \u00b7 " + fmt(tKg, 0) + " kg") : (m2(L.trimM2) + " \u00b7 " + tSp.kgDay + " kg/g"),
      line3: tw === "trim" ? "kurutmadan i\u015fleniyor" : (tw === "hold" ? "kuru oda bekler" : "bo\u015f"),
      fill: finishTrimFill(tw),
      flow: tw !== "idle",
      flowCls: tw === "hold" ? "flow-hold" : (tw === "trim" ? "flow-trim" : ""),
      flex: 1
    },
    {
      id: "Paket",
      line2: pWho ? (pWho + " \u00b7 " + fmt(pKg, 0) + " kg") : (m2(L.packM2) + " \u00b7 " + pSp.kgDay + " kg/g"),
      line3: pw === "pack" ? "trimden i\u015fleniyor" : "bo\u015f",
      fill: finishPackFill(pw),
      flow: pw !== "idle",
      flowCls: pw === "pack" ? "flow-pack" : "",
      flex: 0.9
    }
  ]);
  const hasEx = !!(m.extract && m.extract.m2);
  rowBoxes(gmpInnerX, gmpLowY + row2H + boxGap, gmpInnerW, row2H, [
    hasEx
      ? { id: "Ekstraksiyon", line2: m.extract.m2 + " m\u00B2", line3: fmt(m.extract.kgDay, 1) + " kg/g \u00b7 scCO2", fill: "#8b6bb0", flex: 1 }
      : { id: "Bekleme / CIP", line2: "GMP ara", fill: "#2a4a58", flex: 1 }
  ]);

  const officeSpecs = [
    { id: "Ofis / QMS", line2: "36 m\u00B2 \u00b7 idare", fill: "#c9b56a" },
    { id: "Mekanik / HVAC", line2: m2(Math.max(18, Math.round((m.totalBuilt || 400) * 0.025))), fill: "#4a5550" },
    { id: "Personel", line2: "Soyunma / mola", fill: "#b8a56a" },
    { id: "Depo / at\u0131k", line2: "Lojistik", fill: "#7a846c" }
  ];
  officeSpecs.forEach(function (q, i) {
    blocks.push({
      id: q.id, line2: q.line2, fill: q.fill,
      x: officeInnerX,
      y: officeY0 + i * (officeBoxH + boxGap),
      w: officeInnerW, h: officeBoxH
    });
  });

  const deskH = Math.max(gacpH, gmpH, officeH);
  let svg = "";
  svg += "<rect x=\"" + (phone ? 8 : 12) + "\" y=\"" + (phone ? 8 : 12) + "\" width=\"" + (W - (phone ? 16 : 24)) + "\" height=\"" + (H - (phone ? 16 : 24)) + "\" rx=\"" + (phone ? 12 : 16) + "\" fill=\"#101714\" stroke=\"rgba(212,196,154,0.2)\"/>";
  svg += "<text x=\"" + pad + "\" y=\"" + titleY + "\" fill=\"#d4c49a\" font-size=\"" + (phone ? 10 : 12) + "\" letter-spacing=\"1.4\" font-family=\"Segoe UI, Arial, sans-serif\">INDOOR YERLE\u015e\u0130M \u00b7 HAFTA " + (currentWeek + 1) + "</text>";
  function zoneFrame(x, y, w, h, fill, stroke, label, lx) {
    svg += "<rect x=\"" + x + "\" y=\"" + y + "\" width=\"" + w + "\" height=\"" + h + "\" rx=\"12\" fill=\"" + fill + "\" stroke=\"" + stroke + "\" stroke-dasharray=\"4 3\"/>";
    svg += "<text x=\"" + (x + 10) + "\" y=\"" + (y + 14) + "\" fill=\"" + lx + "\" font-size=\"10\" letter-spacing=\"1.1\" font-family=\"Segoe UI, Arial, sans-serif\">" + label + "</text>";
  }
  zoneFrame(gacpX, gacpTop, gacpW, phone ? gacpH : deskH, "rgba(111,158,98,0.08)", "rgba(111,158,98,0.4)", "GACP \u00dcRET\u0130M", "#8fbf84");
  zoneFrame(gmpX, gmpTop, gmpW, phone ? gmpH : deskH, "rgba(91,138,168,0.08)", "rgba(91,138,168,0.45)", "GMP \u0130\u015eLEME", "#8eb4c8");
  zoneFrame(officeX, officeTop, officeW, phone ? officeH : deskH, "rgba(201,181,106,0.08)", "rgba(201,181,106,0.4)", "\u0130DARE / D\u0130\u011eER", "#d4c49a");
  const defs = "<defs>" +
    "<marker id=\"arrF\" markerWidth=\"8\" markerHeight=\"8\" refX=\"6\" refY=\"3\" orient=\"auto\"><path d=\"M0,0 L6,3 L0,6 Z\" fill=\"#d4c49a\"/></marker>" +
    blocks.map(function (b, i) {
    return "<clipPath id=\"pb" + i + "\"><rect x=\"" + b.x + "\" y=\"" + b.y + "\" width=\"" + b.w + "\" height=\"" + b.h + "\" rx=\"10\"/></clipPath>";
  }).join("") + "</defs>";
  const dryOn = dryBusyThisWeek(m.cal, currentWeek);
  const trimOn = tw !== "idle";
  const packOn = pw !== "idle";
  let flowSvg = "<g class=\"flow-links\" pointer-events=\"none\">";
  function flowLink(x1, y1, x2, y2, color, on) {
    flowSvg += "<line x1=\"" + x1 + "\" y1=\"" + y1 + "\" x2=\"" + x2 + "\" y2=\"" + y2 + "\" stroke=\"" + color + "\" stroke-width=\"" + (on ? 2.8 : 1.2) + "\" opacity=\"" + (on ? 0.95 : 0.28) + "\" marker-end=\"url(#arrF)\"/>";
  }
  const dryCx = gmpInnerX + gmpInnerW / 2;
  const trimCx = trimX + tpW[0] / 2;
  flowLink(dryCx, afterDry + 1, trimCx, gmpLowY - 1, trimOn ? "#3ea8c4" : "#5b8aa8", dryOn || trimOn);
  flowLink(trimX + tpW[0] + 1, gmpLowY + row2H / 2, packX - 1, gmpLowY + row2H / 2, packOn ? "#3d9a72" : "#3ea8c4", trimOn || packOn);
  flowSvg += "</g>";
  const body = blocks.map(function (b, i) {
    const clip = "pb" + i;
    const padB = Math.max(5, Math.min(9, Math.round(Math.min(b.w, b.h) * 0.08)));
    const innerWB = Math.max(10, b.w - padB * 2);
    const ink = inkForFill(b.fill);
    const titleFs = b.h < 34 ? 8 : (b.w < 58 ? 9 : (b.h < 48 ? 10 : 11));
    const subFs = Math.max(7, titleFs - 2);
    const limit = b.y + b.h - padB;
    let y = b.y + padB + titleFs;
    const titleLines = wrapPlanText(b.id, innerWB, titleFs).slice(0, b.h < 40 ? 1 : 2);
    const di = (typeof b.i === "number") ? (" data-i=\"" + b.i + "\"") : "";
    const on = b.on ? " on" : "";
    const flow = (b.flow ? " flow-on" : "") + (b.flowCls ? (" " + b.flowCls) : "");
    let out = "<g class=\"room" + on + flow + "\"" + di + " clip-path=\"url(#" + clip + ")\">";
    out += "<rect class=\"hit\" x=\"" + b.x + "\" y=\"" + b.y + "\" width=\"" + b.w + "\" height=\"" + b.h + "\" rx=\"10\" fill=\"" + b.fill + "\" opacity=\"0.92\"/>";
    titleLines.forEach(function (ln) {
      if (y > limit) return;
      out += "<text x=\"" + (b.x + padB) + "\" y=\"" + y + "\" fill=\"" + ink + "\" font-size=\"" + titleFs + "\" font-weight=\"600\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(ln) + "</text>";
      y += titleFs + 2;
    });
    const subs = [];
    if (b.line2) wrapPlanText(b.line2, innerWB, subFs).forEach(function (ln) { subs.push(ln); });
    if (b.line3) wrapPlanText(b.line3, innerWB, subFs).forEach(function (ln) { subs.push(ln); });
    subs.forEach(function (ln) {
      if (y + subFs - 1 > limit) return;
      out += "<text x=\"" + (b.x + padB) + "\" y=\"" + y + "\" fill=\"" + ink + "\" font-size=\"" + subFs + "\" opacity=\"0.78\" font-family=\"Segoe UI, Arial, sans-serif\">" + xmlEsc(ln) + "</text>";
      y += subFs + 2;
    });
    out += "</g>";
    return out;
  }).join("");
  el("plan").innerHTML =
    "<svg class=\"plan\" viewBox=\"0 0 " + W + " " + H + "\" xmlns=\"http://www.w3.org/2000/svg\">" +
    defs + svg + body + flowSvg + "</svg>";
}

function renderCalendar(m) {
  const u = function (k) { return ti("unit." + k); };
  const cell = function (w, cls, title) {
    const now = w === week ? " now" : "";
    const on = w === week ? " outline:1px solid #d4c49a;" : "";
    return "<div class=\"cell " + cls + now + "\" style=\"" + on + "\" title=\"" + title + "\"></div>";
  };
  const head = "<div class=\"week-row\"><b></b>" + Array.from({ length: 52 }, function (_, i) { return cell(i, "", "H" + (i + 1)); }).join("") + "</div>";
  const rows = m.cal.rooms.map(function (row, i) {
    const g = m.cal.roomCultivars && m.cal.roomCultivars[i];
    const short = g ? (" \u00b7 " + g.name.split(" ")[0]) : "";
    return "<div class=\"week-row\"><b>" + ti("cal.flower") + " " + (i + 1) + short + "</b>" + row.map(function (c, w) { return cell(w, c, "H" + (w + 1) + " " + c + (g ? (" " + g.name) : "")); }).join("") + "</div>";
  }).join("");
  const dry = m.cal.dryRows.map(function (row, i) {
    return "<div class=\"week-row\"><b>" + ti("cal.dry") + " " + (i + 1) + "</b>" + row.map(function (c, w) {
      const batch = m.cal.dryOcc[i][w] || "";
      const who = batch ? (" " + ti("cal.flower") + " " + String(batch).replace("C", "")) : " " + u("empty");
      return cell(w, c, "H" + (w + 1) + who + (c === "clean" ? " " + u("clean") : ""));
    }).join("") + "</div>";
  }).join("");
  const trimRow = (m.cal.trimWeeks || Array(52).fill("idle")).map(function (c, w) {
    const who = flowerTagLabel(m.cal.trimOcc && m.cal.trimOcc[w]);
    const kg = (m.cal.trimKgW && m.cal.trimKgW[w]) || 0;
    const extra = who ? (" " + who + (kg ? (" " + fmt(kg, 0) + " kg") : "")) : "";
    return cell(w, c, "H" + (w + 1) + extra + (c === "trim" ? " trim" : c === "hold" ? " " + u("hold") : " " + u("empty")));
  }).join("");
  const packRow = (m.cal.packWeeks || Array(52).fill("idle")).map(function (c, w) {
    const who = flowerTagLabel(m.cal.packOcc && m.cal.packOcc[w]);
    const kg = (m.cal.packKgW && m.cal.packKgW[w]) || 0;
    const extra = who ? (" " + who + (kg ? (" " + fmt(kg, 0) + " kg") : "")) : "";
    return cell(w, c, "H" + (w + 1) + extra + (c === "pack" ? " " + u("pack") : " " + u("empty")));
  }).join("");
  el("calendar").innerHTML = "<div class=\"cal-grid\">" + head + rows + dry +
    "<div class=\"week-row\"><b>" + ti("cal.trim") + "</b>" + trimRow + "</div>" +
    "<div class=\"week-row\"><b>" + ti("cal.pack") + "</b>" + packRow + "</div></div>";
}

function renderTables(m, s) {
  const exKg = m.extract ? (m.extract.productKg != null ? m.extract.productKg : m.extract.crudeKg) : 0;
  el("econ").innerHTML =
    "<table><tr><th>" + ti("table.item") + "</th><th></th></tr>" +
    "<tr><td>" + ti("table.indoorGacp") + "</td><td class=\"num\">" + eur(m.gacpCapex) + "</td></tr>" +
    "<tr><td>" + ti("table.gmp") + "</td><td class=\"num\">" + eur(m.gmpCapex) + "</td></tr>" +
    "<tr><td>" + ti("table.extractEq") + "</td><td class=\"num\">" + eur(m.extract ? m.extract.capexEq : 0) + "</td></tr>" +
    "<tr><td>" + ti("table.extractRoom") + "</td><td class=\"num\">" + eur(m.extract ? m.extract.capexRoom : 0) + "</td></tr>" +
    "<tr><td>" + ti("table.stability") + "</td><td class=\"num\">" + eur(m.stability) + "</td></tr>" +
    "<tr><td>" + ti("table.office") + "</td><td class=\"num\">" + eur(m.officeCapex) + "</td></tr>" +
    "<tr><td><strong>" + ti("table.totalCapex") + "</strong></td><td class=\"num\"><strong>" + eur(m.capex) + "</strong></td></tr>" +
    "<tr><td>" + ti("table.substrate") + "</td><td class=\"num\">" + eur(m.opex.substrate) + "</td></tr>" +
    "<tr><td>" + ti("table.waterFert") + "</td><td class=\"num\">" + eur(m.opex.waterFert) + "</td></tr>" +
    "<tr><td>" + ti("table.labor") + "</td><td class=\"num\">" + eur(m.opex.labor) + "</td></tr>" +
    "<tr><td>" + ti("table.materials") + "</td><td class=\"num\">" + eur(m.opex.materials) + "</td></tr>" +
    "<tr><td>" + ti("table.energy") + "</td><td class=\"num\">" + eur(m.opex.energy || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.ga") + "</td><td class=\"num\">" + eur(m.opex.ga || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.extractOps") + "</td><td class=\"num\">" + eur(m.opex.extract || 0) + "</td></tr>" +
    "<tr><td><strong>" + ti("table.totalOpex") + "</strong></td><td class=\"num\"><strong>" + eur(m.opexYear) + "</strong></td></tr>" +
    "<tr><td>" + ti("table.opexPerG") + "</td><td class=\"num\">" + fmt(m.opexPerG, 2) + " \u20AC</td></tr>" +
    "<tr><td>" + ti("table.flowerGacp", { kg: fmt(m.kgFlowerSold, 0), price: eur(s.priceKgGacp != null ? s.priceKgGacp : 2500) }) + "</td><td class=\"num\">" + eur(m.flowerRevenueGacp || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.flowerGmp", { kg: fmt(m.kgFlowerSold, 0), price: eur(s.priceKgGmp != null ? s.priceKgGmp : 3500) }) + "</td><td class=\"num\">" + eur(m.flowerRevenueGmp || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.extractSales", { kg: fmt(exKg, 0), price: eur(s.extractPriceKg || 0) }) + "</td><td class=\"num\">" + eur(m.extractRevenue || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.revGacp") + "</td><td class=\"num\">" + eur(m.revenueGacp || 0) + " / " + eur(m.ebitdaGacp || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.revGmp") + "</td><td class=\"num\">" + eur(m.revenueGmp || 0) + " / " + eur(m.ebitdaGmp || 0) + "</td></tr>" +
    "<tr><td><strong>" + ti("table.totalRev") + "</strong></td><td class=\"num\"><strong>" + eur(m.revenue) + "</strong></td></tr>" +
    "<tr><td>" + ti("table.ebitda") + "</td><td class=\"num\">" + eur(m.ebitda) + "</td></tr>" +
    "<tr><td>" + ti("table.payback") + "</td><td class=\"num\">" + (Number.isFinite(m.payback) ? fmt(m.payback, 1) + " " + ti("unit.year") : "\u2014") + "</td></tr></table>";

  el("ops").innerHTML =
    "<table><tr><th>" + ti("table.operation") + "</th><th></th></tr>" +
    "<tr><td>" + ti("table.roomArea") + "</td><td class=\"num\">" + m2(m.roomM2) + "</td></tr>" +
    "<tr><td>" + ti("table.density") + "</td><td class=\"num\">" + fmt(m.density, 1) + "</td></tr>" +
    "<tr><td>" + ti("table.yieldLevel") + "</td><td class=\"num\">" + skillLabel(s.yieldSkill) + " \u00b7 " + s.yieldG + " g</td></tr>" +
    "<tr><td>" + ti("table.yieldPlant") + "</td><td class=\"num\">" + fmt(m.yieldUse, 0) + " g</td></tr>" +
    "<tr><td>" + ti("table.yieldM2") + "</td><td class=\"num\">" + fmt(m.gM2Avg || 0, 0) + " g</td></tr>" +
    "<tr><td>" + ti("table.plantsHarvest") + "</td><td class=\"num\">" + fmt(m.plantsInFlower) + "</td></tr>" +
    "<tr><td>" + ti("table.harvestRoom") + "</td><td class=\"num\">" + fmt(m.cyclesPerRoom, 1) + "</td></tr>" +
    "<tr><td>" + ti("table.harvestFacility") + "</td><td class=\"num\">" + fmt(m.harvestsYear, 0) + "</td></tr>" +
    "<tr><td>" + ti("table.plantsYear") + "</td><td class=\"num\">" + fmt(m.plantsYear) + "</td></tr>" +
    "<tr><td>" + ti("table.vegAlgo") + "</td><td class=\"num\">" + m2(m.layout ? m.layout.vegM2 : m.veg) + "</td></tr>" +
    "<tr><td>" + ti("table.preVegAlgo") + "</td><td class=\"num\">" + m2(m.layout ? m.layout.preVegM2 : m.preVeg) + "</td></tr>" +
    "<tr><td>" + ti("table.cuttings") + "</td><td class=\"num\">" + m2(m.layout ? m.layout.cuttingsM2 : 0) + "</td></tr>" +
    "<tr><td>" + ti("table.dryRoom") + "</td><td class=\"num\">" + s.dryRooms + ti("table.dryNeed") + m.drySuggest + "</td></tr>" +
    "<tr><td>" + ti("table.dryTier") + "</td><td class=\"num\">" + (m.layout ? m.layout.dryRoomM2 : 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + "</td></tr>" +
    "<tr><td>" + ti("table.trimArea") + "</td><td class=\"num\">" + (m.layout ? m.layout.trimM2 : 0) + " m\u00B2 \u00b7 " + ((m.trimSpec && m.trimSpec.stations) || 0) + ti("table.stations") + ((m.trimSpec && m.trimSpec.kgDay) || 0) + ti("table.kgDay") + ((m.trimSpec && m.trimSpec.vaultKg) || 0) + ti("table.kgVault") + ((m.postDry && m.postDry.trimNeed) || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.packArea") + "</td><td class=\"num\">" + (m.layout ? m.layout.packM2 : 0) + " m\u00B2 \u00b7 " + ((m.packSpec && m.packSpec.stations) || 0) + ti("table.stations") + ((m.packSpec && m.packSpec.kgDay) || 0) + ti("table.kgDay") + ((m.packSpec && m.packSpec.vaultKg) || 0) + ti("table.kgVault") + ((m.postDry && m.postDry.packNeed) || 0) + "</td></tr>" +
    "<tr><td>" + ti("table.trimQueue") + "</td><td class=\"num\">" + fmt((m.postDry && m.postDry.peakTrimQ) || 0, 0) + ti("table.trimPeak") + ((m.postDry && m.postDry.maxHold) || 0) + ti("table.trimHold") + "</td></tr>" +
    "<tr><td>" + ti("table.cycle") + "</td><td class=\"num\">" + fmt(m.cycleDays) + " " + ti("unit.days") + "</td></tr>" +
    "<tr><td>" + ti("table.fte") + "</td><td class=\"num\">" + m.staffBase + " / " + m.harvestCrew + "</td></tr>" +
    "<tr><td>" + ti("table.laborH") + "</td><td class=\"num\">" + fmt(m.opex.laborH, 0) + "</td></tr>" +
    "<tr><td>" + ti("table.clones") + "</td><td class=\"num\">" + fmt(m.opex.clonesWeek, 0) + "</td></tr>" +
    "<tr><td>" + ti("table.extractLine") + "</td><td class=\"num\">" + (m.extract && m.extract.m2 ? (m.extract.nCal + "\u00d7 Caladrius \u00b7 " + fmt(m.extract.kgDay, 1) + " / " + fmt(m.extract.ratedKgDay, 0) + " kg/g") : ti("table.none")) + "</td></tr>" +
    "<tr><td>" + ti("table.indoorTotal") + "</td><td class=\"num\">" + m2(m.totalBuilt) + "</td></tr></table>";

  const staffRows = ((m.staff && m.staff.roles) || []).map(function (r) {
    return "<tr><td><strong>" + r.role + "</strong> <span class=\"muted\">" + r.zone + "</span><div class=\"hint\" style=\"margin:4px 0 0\">" + r.tasks + (r.peak ? ti("staff.peakDay") : "") + "</div></td><td class=\"num\">" + r.fte + (r.peak ? " *" : "") + "</td></tr>";
  }).join("");
  el("ops").innerHTML +=
    "<table style=\"margin-top:14px\"><tr><th>" + ti("staff.rolesHead") + "</th><th>FTE</th></tr>" +
    staffRows +
    "<tr><td><strong>" + ti("staff.baseStaff") + "</strong></td><td class=\"num\"><strong>" + m.staffBase + "</strong></td></tr>" +
    "<tr><td><strong>" + ti("staff.harvestTotal") + "</strong></td><td class=\"num\"><strong>" + m.harvestCrew + "</strong></td></tr></table>" +
    "<p class=\"hint\">" + ((m.staff && m.staff.note) || "") + " " + ti("staff.peakNote") + "</p>";

  el("alerts").innerHTML = m.alerts.map(function (a) { return "<div class=\"alert " + a.t + "\">" + a.m + "</div>"; }).join("");
  renderProcessFlow(m, s, week);
}

function renderProcessFlow(m, s, currentWeek) {
  const host = el("flow");
  if (!host || !m) return;
  s = s || lastS || readState();
  currentWeek = currentWeek == null ? week : currentWeek;
  const tw = (m.cal && m.cal.trimWeeks && m.cal.trimWeeks[currentWeek]) || "idle";
  const pw = (m.cal && m.cal.packWeeks && m.cal.packWeeks[currentWeek]) || "idle";
  const dryOn = dryBusyThisWeek(m.cal, currentWeek);
  const tWho = flowerTagLabel(m.cal && m.cal.trimOcc && m.cal.trimOcc[currentWeek]);
  const pWho = flowerTagLabel(m.cal && m.cal.packOcc && m.cal.packOcc[currentWeek]);
  const tKg = (m.cal && m.cal.trimKgW && m.cal.trimKgW[currentWeek]) || 0;
  const pKg = (m.cal && m.cal.packKgW && m.cal.packKgW[currentWeek]) || 0;
  const trimSub = tWho
    ? (tWho + " \u00b7 " + fmt(tKg, 0) + " kg")
    : ((m.layout ? m.layout.trimM2 : 0) + " m\u00B2 \u00b7 " + ((m.trimSpec && m.trimSpec.kgDay) || 0) + " kg/g");
  const packSub = pWho
    ? (pWho + " \u00b7 " + fmt(pKg, 0) + " kg")
    : ((m.layout ? m.layout.packM2 : 0) + " m\u00B2 \u00b7 " + ((m.packSpec && m.packSpec.kgDay) || 0) + " kg/g");
  const nodes = [
    { name: ti("flow.mother"), sub: (m.motherProd + m.motherBank) + " m\u00B2", cls: "" },
    { name: ti("flow.cutting"), sub: s.rootDays + " " + ti("unit.days"), cls: "" },
    { name: ti("flow.preVeg"), sub: s.preVegDays + " " + ti("unit.days"), cls: "" },
    { name: ti("flow.veg"), sub: s.vegDays + " " + ti("unit.days"), cls: "" },
    { name: ti("flow.flower"), sub: s.flowerDays + " " + ti("unit.days") + " \u00b7 " + s.flowerRooms + " " + ti("unit.rooms"), cls: "" },
    { name: ti("flow.harvest"), sub: fmt(m.cyclesPerRoom, 0) + " / " + ti("unit.room") + " / " + ti("unit.year"), cls: "" },
    { name: ti("flow.dry"), sub: s.dryDays + " " + ti("unit.days") + " \u00b7 " + ti("unit.clean") + " " + s.dryCleanDays + " \u00b7 " + s.dryRooms + " \u00d7 " + (s.dryTiers || 3) + " " + ti("unit.tiers"), cls: dryOn ? " live-dry" : "" },
    { name: ti("flow.trim"), sub: trimSub + (tw === "hold" ? " \u00b7 " + ti("flow.wait") : ""), cls: tw === "hold" ? " live-hold" : (tw === "trim" ? " live-trim" : "") },
    { name: ti("flow.pack"), sub: packSub, cls: pw === "pack" ? " live-pack" : "" }
  ];
  host.innerHTML = nodes.map(function (n, i) {
    return (i ? "<span class=\"arrow\">\u2192</span>" : "") + "<div class=\"node" + n.cls + "\"><strong>" + n.name + "</strong><span>" + n.sub + "</span></div>";
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
    flowerDays: s.flowerDays + " " + ti("unit.days"),
    vegDays: s.vegDays + " " + ti("unit.days"),
    preVegDays: s.preVegDays + " " + ti("unit.days"),
    rootDays: s.rootDays + " " + ti("unit.days"),
    dryDays: s.dryDays + " " + ti("unit.days"),
    dryCleanDays: s.dryCleanDays + " " + ti("unit.days"),
    yieldG: (m && m.yieldUse != null ? fmt(m.yieldUse, 0) : String(s.yieldG)) + " g",
    yieldSkill: skillLabel(s.yieldSkill) + " \u00b7 " + s.yieldG + " g",
    genetics: String(s.genetics),
    priceKgGacp: eur(s.priceKgGacp != null ? s.priceKgGacp : 2500) + "/kg",
    priceKgGmp: eur(s.priceKgGmp != null ? s.priceKgGmp : 3500) + "/kg",
    extractPriceKg: eur(s.extractPriceKg || 0) + "/kg",
    saleablePct: "%" + fmt(s.saleablePct * 100, 0),
    extractPct: "%" + fmt((s.extractPct || 0) * 100, 0),
    dryTiers: String(s.dryTiers || 3) + " " + ti("unit.tiers"),
    trimM2: m2(s.trimM2 != null ? s.trimM2 : (m && m.layout ? m.layout.trimM2 : 24)),
    packM2: m2(s.packM2 != null ? s.packM2 : (m && m.layout ? m.layout.packM2 : 18))
  };
  Object.keys(map).forEach(function (k) {
    const n = el("v-" + k);
    if (n) n.textContent = map[k];
  });
  const hint = el("capacityHint");
  if (hint && m) {
    const L = m.layout || {};
    hint.textContent = "Y\u0131ll\u0131k bitki " + fmt(m.plantsYear) + " = hasattaki " + fmt(m.plantsInFlower) + " \u00d7 takvim hasad\u0131. Verim " + fmt(m.yieldUse, 0) + " g/bitki \u00b7 " + fmt(m.gM2Avg || 0, 0) + " g/m\u00B2 (yo\u011funluk doyumu). Oda " + m2(s.roomM2) + " \u00b7 kurutma taban " + (L.dryRoomM2 || 0) + " m\u00B2 \u00d7 " + (s.dryTiers || 3) + " kat \u00b7 kurutma ihtiyac\u0131 " + m.drySuggest + " \u00b7 trim/paket " + (L.trimM2 || 0) + "/" + (L.packM2 || 0) + " m\u00B2 (ihtiya\u00e7 " + ((m.postDry && m.postDry.trimNeed) || 0) + "/" + ((m.postDry && m.postDry.packNeed) || 0) + ")";
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
let playPulseAt = 0;

function syncPlayPulse() {
  if (!playing) {
    document.documentElement.classList.remove("playing");
    document.documentElement.style.removeProperty("--play-pulse");
    return;
  }
  document.documentElement.classList.add("playing");
  const ms = 900;
  const t0 = playPulseAt || Date.now();
  document.documentElement.style.setProperty("--play-pulse", (-((Date.now() - t0) % ms)) + "ms");
}
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
  if (window.TKTS_market && window.TKTS_market.enrichResult) {
    window.TKTS_market.enrichResult(s, m);
  }
  if (window.TKTS_market && window.TKTS_market.mergeMarketAlerts) {
    window.TKTS_market.mergeMarketAlerts(m);
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
  el("weekLabel").textContent = ti("dom.week") + " " + (week + 1);
  const pb = el("playBtn");
  if (pb) pb.textContent = playing ? ti("dom.btn.stop") : ti("dom.btn.play");
}

function play() {
  playing = !playing;
  el("playBtn").textContent = playing ? ti("dom.btn.stop") : ti("dom.btn.play");
  if (timer) clearInterval(timer);
  if (playing) {
    playPulseAt = Date.now();
    syncPlayPulse();
    if (lastM) {
      renderPlan(lastM, lastS || readState(), week);
      renderCalendar(lastM);
      renderProcessFlow(lastM, lastS, week);
    }
    timer = setInterval(function () {
      week = (week + 1) % 52;
      syncPlayPulse();
      if (lastM) {
        renderPlan(lastM, lastS || readState(), week);
        renderCalendar(lastM);
        renderProcessFlow(lastM, lastS, week);
        el("weekLabel").textContent = ti("dom.week") + " " + (week + 1);
      }
    }, 220);
  } else {
    syncPlayPulse();
  }
}

function exportJson() {
  const payload = { state: readState(), result: lastM };
  if (window.TKTS_market && window.TKTS_market.getSelected) {
    payload.market = {
      country: window.TKTS_market.getSelected(),
      feed: window.TKTS_market.getFeed() ? window.TKTS_market.getFeed().updated : null,
      source: "cannastream-app",
      projection: lastM && lastM.market ? lastM.market.projection : null
    };
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (window.TKTS_i18n && window.TKTS_i18n.getLocale() === "en") ? "facility-scenario.json" : "tesis-senaryo.json";
  a.click();
}
window.exportJson = exportJson;
window.render = render;
window.applyPreset = applyPreset;
window.applyMarketFacility = applyMarketFacility;
window.applyFacilityParams = applyFacilityParams;
window.marketAutoMode = true;
window.ensureRoomBoard = ensureRoomBoard;
window.flowerRoomCount = flowerRoomCount;
window.PRICE_RAMP = PRICE_RAMP;
window.CULTIVARS = CULTIVARS;
Object.defineProperty(window, "roomBoard", {
  get: function () { return roomBoard; },
  set: function (v) { roomBoard = v; }
});

window.addEventListener("DOMContentLoaded", function () {
  applyView(readStoredView(), false);
  bindViewSwitch();
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
      window.marketAutoMode = false;
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
  function bootSimulator() {
    if (window.applyMarketFacility) window.applyMarketFacility(false);
    else applyPreset("dengeli");
  }
  if (window.TKTS_market && window.TKTS_market.ready) {
    window.TKTS_market.ready.then(bootSimulator).catch(bootSimulator);
  } else {
    document.addEventListener("tkts-market-ready", bootSimulator, { once: true });
    setTimeout(bootSimulator, 1200);
  }
  window.addEventListener("tkts-locale-change", function () {
    if (typeof render === "function") render();
    if (window.TKTS_market && window.TKTS_market.refreshPanel) window.TKTS_market.refreshPanel();
  });
});
