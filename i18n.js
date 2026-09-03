(function () {
  "use strict";

  var LANG_KEY = "tkts-lang";
  var locale = "tr";

  var COUNTRY_EN = {
    "Türkiye": "Turkey",
    "Almanya": "Germany",
    "İngiltere": "United Kingdom",
    "Hollanda": "Netherlands",
    "Portekiz": "Portugal",
    "Polonya": "Poland",
    "İtalya": "Italy",
    "Fransa": "France",
    "Kanada": "Canada",
    "Avustralya": "Australia",
    "İsrail": "Israel",
    "İsviçre": "Switzerland",
    "ABD": "USA",
    "Fas": "Morocco",
    "Ürdün": "Jordan",
    "BAE": "UAE",
    "Suudi Arabistan": "Saudi Arabia",
    "Katar": "Qatar"
  };

  function pickLocale() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "en" || q === "tr") return q;
    } catch (e) {}
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "tr") return stored;
    } catch (e2) {}
    try {
      if ((navigator.language || "").toLowerCase().indexOf("en") === 0) return "en";
    } catch (e3) {}
    return "tr";
  }

  function deepGet(obj, path) {
    var parts = String(path || "").split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  // Resolve paths that mix nested objects with flat dotted keys
  // e.g. pack.dom["brand.title"] via "dom.brand.title"
  function resolve(obj, path) {
    var direct = deepGet(obj, path);
    if (direct != null) return direct;
    var raw = String(path || "");
    var parts = raw.split(".");
    if (parts.length < 2) return undefined;
    for (var cut = 1; cut < parts.length; cut++) {
      var section = deepGet(obj, parts.slice(0, cut).join("."));
      if (section == null || typeof section !== "object") continue;
      var rest = parts.slice(cut).join(".");
      if (Object.prototype.hasOwnProperty.call(section, rest)) return section[rest];
    }
    return undefined;
  }

  function interpolate(str, params) {
    if (!params) return str;
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      return params[k] != null ? params[k] : "";
    });
  }

  var PACK = {
    tr: {
      meta: {
        title: "Tıbbi Kenevir Simülatörü",
        description: "Tam indoor GACP üretim ve GMP işleme tesis simülatörü — Cannastream pazar verisi ile."
      },
      dom: {
        "gate.title": "Tıbbi kenevir simülatörü",
        "gate.lead": "Simülatöre girmek için size verilen erişim kodunu yazın.",
        "gate.label": "Erişim kodu",
        "gate.submit": "Giriş yap",
        "view.label": "Görünüm",
        "view.desktop": "Masaüstü",
        "view.phone": "Telefon",
        "brand.title": "Tıbbi kenevir simülatörü",
        "brand.sub": "Tam indoor GACP üretim ve GMP işleme",
        "header.market": "Hedef pazar",
        "header.logout": "Çıkış",
        "tab.tesis": "Tesis",
        "tab.proses": "Proses",
        "tab.pazar": "Pazar",
        "panel.scenarios": "Senaryolar",
        "panel.capacity": "Kapasite",
        "panel.process": "Üretim parametreleri",
        "panel.marketAuto": "Hedef pazar · otomatik",
        "panel.marketLive": "Pazar bağlamı · canlı",
        "panel.layout": "Tesis yerleşimi",
        "panel.rooms": "Çiçek odaları",
        "panel.calendar": "52 haftalık parti takvimi",
        "panel.flow": "Proses akışı",
        "panel.alerts": "Uyarılar",
        "panel.econ": "Ekonomi (OPEX v3)",
        "panel.ops": "Operasyon",
        "ctrl.plantsYear": "Yıllık bitki (türev)",
        "ctrl.plantsPerM2": "Ortalama bitki / m²",
        "ctrl.harvestsPerRoom": "Hasat / oda / yıl",
        "ctrl.flowerRooms": "Çiçek odası",
        "ctrl.roomM2": "Oda alanı",
        "ctrl.flowerArea": "Çiçek alanı",
        "ctrl.dryRooms": "Kurutma odası",
        "ctrl.dryTiers": "Kurutma katı",
        "ctrl.trimM2": "Trim alanı",
        "ctrl.packM2": "Paket alanı",
        "hint.capacity": "Yıllık bitki = her odanın hasattaki bitkisi × o odanın yıldaki hasat sayısı. Bitki/m² oda kartında ayrıdır. Bu kaydırıcılar tesis ortalamasını tüm odalara yazar. Kurutma katı ası katmanıdır; veg alanları çiçek m² × genetik süre oranından gelir. Trim ve paket, kurutmadan çıkan partiyi FIFO kuyruk ve oda kasasıyla işler; küçük oda tepe hasadı alamaz.",
        "ctrl.flowerDays": "Çiçeklenme",
        "ctrl.vegDays": "Vejetatif süre",
        "ctrl.preVegDays": "Pre-veg",
        "ctrl.rootDays": "Köklendirme",
        "ctrl.dryDays": "Kurutma süresi",
        "ctrl.dryCleanDays": "Kurutma temizlik",
        "ctrl.yieldSkill": "Üretim seviyesi",
        "ctrl.yieldG": "Özel g/bitki",
        "ctrl.priceGacp": "Çiçek GACP fiyatı (yıl 1–2)",
        "ctrl.priceGmp": "Çiçek EU-GMP fiyatı (yıl 3+)",
        "ctrl.extractPrice": "Ekstrakt satış fiyatı (kg başına)",
        "ctrl.saleablePct": "Satılabilir oran",
        "ctrl.extractPct": "Ekstraksiyon besleme",
        "hint.process": "İlk 2 yıl GACP çiçek satışı, sonraki yıllar EU-GMP (daha yüksek €/kg). Hasılat = satılan kuru çiçek × ilgili yıl fiyatı + distilat × ekstrakt fiyatı. Geri ödeme bu rampa ile hesaplanır. Besleme 0 ise scCO₂ hat yoktur.",
        "hint.market": "Cannastream verisi arka planda çalışır: ülke seçildiğinde pazar genişliğine göre tüm tesis parametreleri (kapasite, proses, fiyat, genetik) otomatik güncellenir.",
        "ctrl.marketCountry": "İhracat / hedef ülke",
        "market.sync": "Otomatik senkron",
        "hint.layout": "Sol GACP üretim, orta GMP işleme, sağ idare ve diğer alanlar. Odaya tıklayın; genetik ve bitki/m² karttan değişir. Konsept kat planı PNG olarak iner. Senaryo özeti PDF, ekrandaki tüm kapasite, oda, ekonomi, uyarı ve takvim detayını indirir. Yılı oynat: kurutmadan çıkan parti trimde camgöbeği, pakette yeşil yanar; kasa dolunca turuncu bekler.",
        "legend.flower": "Çiçek indoor",
        "legend.mother": "Anaç / veg",
        "legend.dry": "GMP kurutma",
        "legend.clean": "Kurutma temizlik",
        "legend.trim": "Trim (kurutmadan)",
        "legend.pack": "Paket (trimden)",
        "legend.hold": "Kuru bekleme",
        "legend.quarantine": "Karantina / R&D",
        "legend.office": "Ofis",
        "btn.play": "Yılı oynat",
        "btn.stop": "Durdur",
        "btn.pdf": "Senaryo özeti (PDF)",
        "btn.json": "JSON",
        "btn.concept": "Konsept dizaynı indir",
        "btn.resetDens": "Genetik bitki/m²",
        "week": "Hafta",
        "preset.pilot": "Pilot",
        "preset.pilotSub": "3 oda · 4 hasat/yıl · 3.060 bitki",
        "preset.dengeli": "Dengeli",
        "preset.dengeliSub": "4 oda · 5 hasat/yıl · 5.360 bitki",
        "preset.yuksek": "Yüksek kapasite",
        "preset.yuksekSub": "8 oda · 6 hasat/yıl · 16.320 bitki",
        "preset.faz2": "Genişleme",
        "preset.faz2Sub": "12 oda · 6 hasat/yıl · 19.300 bitki",
        "preset.custom": "Özel",
        "preset.customSub": "Kaydırıcılarla kendin ayarla",
        "skill.starter": "Başlangıç",
        "skill.starterSub": "65 g/bitki",
        "skill.mid": "Orta",
        "skill.midSub": "105 g/bitki",
        "skill.pro": "Profesyonel",
        "skill.proSub": "145 g/bitki",
        "market.loading": "Cannastream verisi yükleniyor…"
      },
      gate: {
        session: "Davetli oturum",
        noCodes: "gate-config.js içinde accessCodes tanımlayın.",
        badCode: "Erişim kodu hatalı."
      },
      skill: { starter: "Başlangıç", mid: "Orta", pro: "Profesyonel" },
      preset: { pilot: "Pilot", dengeli: "Dengeli", yuksek: "Yüksek kapasite", faz2: "Genişleme", custom: "Özel" },
      unit: { days: "gün", tiers: "kat", room: "oda", rooms: "oda", harvest: "hasat", year: "yıl", empty: "boş", clean: "temizlik", hold: "kuru bekler", pack: "paket" },
      cal: { flower: "Çiçek", dry: "Kurutma", trim: "Trim", pack: "Paket" },
      flow: { mother: "Anaç", cutting: "Çelik", preVeg: "Pre-veg", veg: "Veg", flower: "Çiçek", harvest: "Hasat", dry: "Kurutma", trim: "Trim", pack: "Paket", wait: "bekler" },
      market: {
        loading: "CS…",
        error: "CS · yok",
        live: "CS · canlı",
        liveShort: "CS · {d}",
        notLoaded: "Cannastream verisi henüz yüklenmedi.",
        patients: "Hasta",
        market: "Pazar",
        growth: "Büyüme",
        authority: "Otorite",
        gacpBg: "GACP (arka plan)",
        gmpBg: "EU-GMP (arka plan)",
        extractBg: "Ekstrakt (arka plan)",
        algo: "Pazar genişliği algoritması",
        applyAll: "Tüm tesis parametrelerini uygula",
        genetics: "Pazar genetiği (otomatik öneri)",
        sync: "Otomatik senkron · {updated} · yenileme {mins} dk",
        salesTitle: "Arka plan satış simülasyonu · {country}",
        colItem: "Kalem",
        colValue: "Değer",
        share: "Pazar payı (çiçek kg)",
        demand: "Pazar talebi",
        demandShort: "talep ~{kg} kg/yıl",
        insufficient: "Veri yetersiz",
        soldFlower: "Tesis satılabilir çiçek",
        marketGrowth: "Pazar büyüme",
        yearRow: "Yıl {y} · {kg} kg · {price}/kg",
        cumEbitda: "5 yıl kümülatif EBITDA",
        intelScan: "Canlı pazar taraması",
        intelReg: "Regülasyon sinyalleri",
        intelNews: "İlgili haberler",
        intelOfficial: "Resmi kaynak (Firecrawl)",
        source: "Kaynak",
        officialLink: "Resmi kaynak",
        tier0: "Mikro pilot — kapalı veya erken pazar",
        tier1: "Küçük ölçek — niş ihracat",
        tier2: "Dengeli — orta pazar payı",
        tier3: "Yüksek kapasite — geniş pazar",
        tier4: "Genişleme fazı — lider pazar hacmi",
        metaScore: "Skor {score}% · hedef pay ~{share}%{demand} · {rooms}×{roomM2} m² oda · {plants} bitki/yıl · ~{kg} kg satılabilir · {dry} kurutma/{tiers} kat · trim/paket {trim}/{pack} m² · ekstrakt {extract}% · genetik {strains}"
      },
      staff: {
        prodMgr: "Üretim müdürü",
        grower: "Yetiştirici teknisyen",
        ipm: "IPM / iklim teknisyeni",
        harvest: "Hasat ekibi (tepe gün)",
        dryOp: "Kurutma operatörü",
        trimOp: "Trim operatörü",
        packOp: "Paket / etiket",
        qa: "QA / dokümantasyon",
        extractOp: "Ekstraksiyon operatörü",
        facility: "Tesis / sanitasyon",
        office: "Ofis / QMS",
        zoneGacp: "GACP",
        zoneGmp: "GMP",
        zoneBoth: "GACP→GMP",
        zoneShared: "Ortak",
        zoneAdmin: "İdare",
        prodMgrTasks: "Genetik seçimi, IPM/besleme stratejisi, vardiya planı, seed-to-sale, hasat kalitesi",
        growerTasks: "Oda turu, budama/defoliasyon, sulama kontrolü, scouting, transplant, kayıt",
        ipmTasks: "Zararlı izleme, tuzak/biopreparat, sensör kalibrasyonu, HVAC set-point kontrolü",
        harvestTasks: "Kesim, taşıma, asma, oda CIP; yalnızca hasat günü ekstra",
        dryTasks: "Asma/alma, T/RH kaydı, parti transferi, kurutma odası temizliği",
        trimTasks: "Kuru trim, kalite ayıklama, istasyon sanitasyonu, kasa stok",
        packTasks: "Tartım, etiket, birincil ambalaj, lot kaydı, kasa çıkış",
        qaTasks: "Görsel QC, numune, batch record, sapma/CAPA, serbest bırakma",
        extractTasks: "scCO₂ hat çalıştırma, seperatör, distilasyon, CIP, proses kaydı",
        facilityTasks: "Hava kilit, zemin/duvar CIP, atık, PPE stok, bakım koordinasyonu",
        officeTasks: "SOP, eğitim kaydı, tedarikçi, izin/izlenebilirlik, raporlama",
        note: "Kanopi kuralı ~1 yetiştirici / {canopy} m² çiçek (sektör 74–111 m²). Trim {trim} kg/vardiya/istasyon makine destekli varsayım.",
        rolesHead: "Görev / personel",
        baseStaff: "Taban kadro",
        harvestTotal: "Hasat günü toplam",
        peakNote: "* tepe gün ekstra.",
        peakDay: " · tepe gün"
      },
      kpi: {
        plantsYear: "Yıllık bitki",
        inFlower: "{n} hasatta · {h} hasat/yıl",
        roomArea: "Oda alanı",
        roomCap: "üst sınır 300 m² · toplam {area}",
        drying: "Kurutma",
        drySub: "ihtiyaç {need} · trim kuyruk {q} kg · trim/paket {trim}/{pack} m²",
        dryFlower: "Kuru çiçek",
        dryFlowerSub: "{gm2} g/m² · satılan {sold} kg · distilat {ex} kg",
        revenue: "Hasılat",
        revenueSub: "Y3+ EU-GMP · Y1–2 GACP {gacp}",
        capex: "CAPEX",
        capexSub: "marj Y3+ {ebitda} · geri ödeme {payback} (rampa)",
        staff: "Kadro",
        staffSub: "hasat günü {crew} · {roles} görev hattı",
        share: "Pazar payı",
        shareSub: "{country} · talep ~{kg} kg"
      },
      table: {
        item: "Kalem",
        operation: "Operasyon",
        indoorGacp: "Indoor GACP",
        gmp: "GMP",
        extractEq: "Ekstraksiyon ekipman (Caladrius 450 X + Isolute X, KDV hariç)",
        extractRoom: "Ekstraksiyon GMP oda (scCO₂)",
        stability: "Stabilite",
        office: "Ofis",
        totalCapex: "Toplam CAPEX",
        substrate: "Substrate (pot+coco+perlit)",
        waterFert: "Su + gübre + asit + otomasyon",
        labor: "İşçilik",
        materials: "Malzeme (IPM, dripper, kurutma)",
        energy: "Elektrik (aydınlatma+HVAC)",
        ga: "G&A / sigorta / COA / lisans",
        extractOps: "Ekstraksiyon işletme",
        totalOpex: "Toplam OPEX",
        opexPerG: "OPEX / g satılabilir",
        flowerGacp: "Çiçek GACP yıl 1–2 ({kg} kg × {price})",
        flowerGmp: "Çiçek EU-GMP yıl 3+ ({kg} kg × {price})",
        extractSales: "Ekstrakt satışı ({kg} kg × {price})",
        revGacp: "Hasılat / marj yıl 1–2 (GACP)",
        revGmp: "Hasılat / marj yıl 3+ (EU-GMP)",
        totalRev: "Toplam hasılat (olgun Y3+)",
        ebitda: "Marj olgun (hasılat − OPEX)",
        payback: "Geri ödeme (GACP→GMP rampa)",
        roomArea: "Oda alanı",
        density: "Bitki / m² (oda modeli)",
        yieldLevel: "Üretim seviyesi",
        yieldPlant: "Bitki başı verim (yoğunluk ayarlı)",
        yieldM2: "Verim / m² (kullanılabilir)",
        plantsHarvest: "Bitki / hasat (çiçekte)",
        harvestRoom: "Hasat / oda / yıl (takvim)",
        harvestFacility: "Tesis hasadı / yıl",
        plantsYear: "Yıllık bitki (hasat bitkisi × hasat)",
        vegAlgo: "Veg (algoritma)",
        preVegAlgo: "Pre-veg (algoritma)",
        cuttings: "Çelik / köklendirme",
        dryRoom: "Kurutma odası",
        dryNeed: " · ihtiyaç ",
        dryTier: "Kurutma taban / kat",
        trimArea: "Trim alanı",
        packArea: "Paket alanı",
        trimQueue: "Trim kuyruk / bekleme",
        trimPeak: " kg tepe · ",
        trimHold: " gün kuru odada",
        cycle: "Çevrim süresi",
        fte: "Kadro (FTE / hasat günü)",
        laborH: "İşçilik saat / yıl",
        clones: "Clone / hafta (bufferli)",
        extractLine: "Ekstraksiyon hattı",
        none: "yok",
        indoorTotal: "Indoor kapalı alan",
        stations: " ist. · ",
        kgDay: " kg/g · kasa ",
        kgVault: " kg · ihtiyaç "
      },
      alerts: {
        harvestBad: function (p) {
          return p.harvests + " hasat/oda/yıl için çiçeklenme en fazla " + p.max + " gün olabilir" + (p.tight ? (" — sıkışan: " + p.tight) : "") + ".";
        },
        harvestOk: function (p) { return "Her oda yılda " + p.harvests + " hasat (çevrim " + p.cycle + " gün). Yıllık bitki = hasattaki bitki × takvim hasadı."; },
        harvestConflict: function (p) { return "Takvimde hasat haftaları çakıştığı için bazı odalarda " + p.want + " yerine daha az hasat sayıldı. Yıllık bitki gerçek hasat adedine göre."; },
        roomMax: function () { return "Oda alanı üst sınırı 300 m²."; },
        dryRule: function (p) { return "Kurutma kuralı: her çiçek odası hasadı kendi kurutma odasına gider. Oda " + p.dry + " gün kurur, sonra " + p.clean + " gün temizlenir; bu sürede başka hasat giremez."; },
        dryBad: function (p) { return "Kurutma yetersiz: " + p.rooms + " oda var, " + p.wait + " hasat sırada bekliyor. " + p.flower + " çiçek odası için " + p.need + " kurutma odası gerekir."; },
        dryWarn: function (p) { return "Kurutma odası (" + p.rooms + ") ihtiyacın (" + p.need + ") üzerinde — GMP maliyeti artar."; },
        dryOk: function (p) { return "Kurutma: " + p.rooms + " oda yeterli (ihtiyaç " + p.need + ", tepe " + p.peak + ")."; },
        gacpVeg: function (p) { return "GACP çiçek öncesi: veg+pre-veg ~%" + p.pct + " çiçek kanopisi (hedef %20–30); anaç+banka+çelik " + p.m2 + " m² (yoğun çelik / anaç ~%2,5 kanopi)."; },
        densityHigh: function (p) { return "Yoğunluk " + p.d + " bitki/m² — ticari bench genelde ~7–11 /m²; SOG daha yüksek. Bitki başı verim düşer; kanopi hastalık ve tekdüzelik riski artar."; },
        yieldLevel: function (p) { return "Üretim seviyesi " + p.skill + " — " + p.ref + " g/bitki (5,5 /m²). Genetik katalog ±%18 sapar. Yoğunluk artınca bitki başı düşer, m² doyarak artar (şimdi ort. " + p.use + " g/bitki · " + p.gm2 + " g/m²)."; },
        geneticsDensity: function (p) { return "Seçilen genetik ortalama " + p.gen + " bitki/m² önerir; kaydırıcı " + p.cur + " (manuel yoğunluk)."; },
        roomModel: function (p) { return "Oda modeli genetik bitki/m² ile: " + p.bits + ". Yıllık bitki " + p.plants + " (hasattaki bitki × yıllık hasat)."; },
        gmpIdle: function (p) { return "GMP kurutma " + p.w + " hafta boş kalıyor."; },
        hangBad: function (p) { return "Kurutma tabanı yetersiz: " + p.base + " m² × " + p.tiers + " kat = " + p.eq + " m² ası; bir çiçek hasadı " + p.need + " m² ister."; },
        hangOk: function (p) { return "Kurutma boyutu: çiçek odası " + p.room + " m² → " + p.tiers + " katta taban " + p.base + " m² (≥ oda/" + p.tiers + "). Ası eşdeğeri " + p.eq + " m²."; },
        trimFlow: function (p) { return "Kurutma çıkışı trim → paket kuyruğuna gider (FIFO, 5 gün/hafta). Trim " + p.ts + " istasyon × " + p.tkg + " kg/vardiya, kasa " + p.tv + " kg. Paket " + p.ps + " istasyon × " + p.pkg + " kg/vardiya, kasa " + p.pv + " kg. Ekstrakt payı paketlemeye girmez."; },
        batchBig: function (p) { return "Bir çiçek hasadı " + p.kg + " kg; trim kasası yalnız " + p.vault + " kg. Bu kadar ürün küçük trim odasına sığmaz. Trim en az " + p.need + " m² olmalı."; },
        throughputBad: function (p) { return "Yıllık " + p.kg + " kg kuru çiçek bu hattan geçemez (trim " + p.trim + " / paket " + p.pack + " kg/takvim günü). Önerilen trim " + p.trimM2 + " m², paket " + p.packM2 + " m²."; },
        vaultHold: function (p) { return "Kurutma bitti ama trim/paket kasası dolu — ürün kuru odada tepe " + p.days + " gün bekler. Temizlik gecikir, sonraki hasat kilitlenir. Trim " + p.trim + " / paket " + p.pack + " m² yetersiz; önerilen " + p.trimNeed + " / " + p.packNeed + " m²."; },
        trimTight: function (p) { return "Trim " + p.trim + " m² / paket " + p.pack + " m² tepe yüke dar (kuyruk " + p.tq + " / " + p.pq + " kg). Rahat akış: trim " + p.trimNeed + " m², paket " + p.packNeed + " m²."; },
        trimOk: function (p) { return "Trim/paket yeterli: tepe kuyruk " + p.tq + " kg trim / " + p.pq + " kg paket. Kurutma çıkışı bekletmeden alınıyor."; },
        layoutRule: function () { return "Yerleşim: veg / pre-veg / çelik alanı = çiçek m² × (aşama süresi / çiçek süresi) / yoğunluk katsayısı. Anaç genetik sayısıyla büyür."; },
        allocTrim: function (p) { return "Oda dağılımı " + p.assigned + ", tesis " + p.total + " oda. Fazlası simülasyonda kırpıldı (" + p.dist + ")."; },
        allocFill: function (p) { return "Oda dağılımı " + p.assigned + " / " + p.total + ". Boş odalar " + p.name + " ile dolduruldu (" + p.dist + ")."; },
        allocOk: function (p) { return "Oda dağılımı: " + p.dist + " (" + p.total + "/" + p.total + ")."; },
        allocEmpty: function () { return "Oda sayısı girilmedi — seçilen genetiklere eşit dağıtıldı."; },
        geneticsMix: function (p) { return "Genetik (oda ağırlıklı): " + p.bits + " · ort. çiçek " + p.flower + " gün / yoğunluk ayarlı " + p.yield + " g/bitki / ham yağ %" + p.oil + "."; },
        extractLine: function (p) { return "Ekstraksiyon scCO₂ (TR indikatif, KDV hariç): " + p.feed + " kg kuru çiçek/yıl (~" + p.day + " / " + p.rated + " kg/gün). Ham yağ " + p.crude + " kg → satılan distilat " + p.product + " kg. Ekipman " + p.capex + " · CO₂ geri kazanım %95–98."; },
        extractOver: function () { return "Besleme Caladrius/Isolute anma kapasitesini aşıyor — ek hat veya ikinci vardiya gerekir."; },
        salesRamp: function (p) { return "Satış rampası: yıl 1–" + p.gacpY + " GACP çiçek " + p.gacpP + "/kg (" + p.gacpR + ") · yıl " + p.gmpY + "+ EU-GMP " + p.gmpP + "/kg (" + p.gmpR + ")" + (p.ex ? (" + distilat " + p.ex) : "") + ". Geri ödeme bu rampa ile."; },
        opexV3: function () { return "OPEX v3: yetiştirme elektrik ~2,2 kWh/g @ 0,10 €/kWh (LED+HVAC), G&A/sigorta/güvenlik, dış COA/hasat, lisans, Cannactive girdiler, scCO₂ işletme. Distilat geri kazanım %72."; },
        staffModel: function (p) { return "Kadro modeli: " + p.base + " FTE taban + hasat günü +" + p.peak + " = " + p.total + " kişi. " + p.note; },
        mktShareLow: function (p) { return p.country + " pazarında üretim payınız ~%" + p.pct + " — kapasite pazar için küçük kalıyor."; },
        mktShareHigh: function (p) { return p.country + " pazarında ~%" + p.pct + " pay — agresif hedef."; },
        mktShareOk: function (p) { return "Cannastream hedef pazar " + p.country + ": ~%" + p.pct + " pay · talep ~" + p.kg + " kg/yıl."; },
        mktOutlook: function (p) { return p.outlook + ": " + p.country + " ihracat/satış modeli yüksek regülasyon riski."; },
        mktPrices: function (p) { return "Arka plan fiyat (Cannastream): GACP " + p.gacp + "/kg · GMP " + p.gmp + "/kg."; }
      }
    },
    en: {
      meta: {
        title: "Medical Cannabis Facility Simulator",
        description: "Full indoor GACP production and GMP processing facility simulator — powered by Cannastream market data."
      },
      dom: {
        "gate.title": "Medical cannabis simulator",
        "gate.lead": "Enter the access code you were given to open the simulator.",
        "gate.label": "Access code",
        "gate.submit": "Sign in",
        "view.label": "View",
        "view.desktop": "Desktop",
        "view.phone": "Phone",
        "brand.title": "Medical cannabis simulator",
        "brand.sub": "Full indoor GACP production & GMP processing",
        "header.market": "Target market",
        "header.logout": "Sign out",
        "tab.tesis": "Facility",
        "tab.proses": "Process",
        "tab.pazar": "Market",
        "panel.scenarios": "Scenarios",
        "panel.capacity": "Capacity",
        "panel.process": "Production parameters",
        "panel.marketAuto": "Target market · auto",
        "panel.marketLive": "Market context · live",
        "panel.layout": "Facility layout",
        "panel.rooms": "Flower rooms",
        "panel.calendar": "52-week batch calendar",
        "panel.flow": "Process flow",
        "panel.alerts": "Alerts",
        "panel.econ": "Economics (OPEX v3)",
        "panel.ops": "Operations",
        "ctrl.plantsYear": "Annual plants (derived)",
        "ctrl.plantsPerM2": "Average plants / m²",
        "ctrl.harvestsPerRoom": "Harvests / room / year",
        "ctrl.flowerRooms": "Flower rooms",
        "ctrl.roomM2": "Room area",
        "ctrl.flowerArea": "Flower area",
        "ctrl.dryRooms": "Drying rooms",
        "ctrl.dryTiers": "Drying tiers",
        "ctrl.trimM2": "Trim area",
        "ctrl.packM2": "Pack area",
        "hint.capacity": "Annual plants = plants in flower at harvest × harvests per room per year. Plants/m² is set per room card. These sliders write the facility average to all rooms. Drying tiers are hanging layers; veg areas derive from flower m² × genetics timing ratios. Trim and pack process dry-room output via FIFO queues and room vaults; small rooms cannot absorb peak harvests.",
        "ctrl.flowerDays": "Flowering",
        "ctrl.vegDays": "Vegetative period",
        "ctrl.preVegDays": "Pre-veg",
        "ctrl.rootDays": "Rooting",
        "ctrl.dryDays": "Drying duration",
        "ctrl.dryCleanDays": "Dry-room cleaning",
        "ctrl.yieldSkill": "Production level",
        "ctrl.yieldG": "Custom g/plant",
        "ctrl.priceGacp": "Flower GACP price (years 1–2)",
        "ctrl.priceGmp": "Flower EU-GMP price (year 3+)",
        "ctrl.extractPrice": "Extract sale price (per kg)",
        "ctrl.saleablePct": "Saleable ratio",
        "ctrl.extractPct": "Extraction feed",
        "hint.process": "Years 1–2 sell GACP flower; later years EU-GMP (higher €/kg). Revenue = sold dry flower × year price + distillate × extract price. Payback uses this ramp. At 0% feed there is no scCO₂ line.",
        "hint.market": "Cannastream runs in the background: when you pick a country, all facility parameters (capacity, process, price, genetics) update to market width.",
        "ctrl.marketCountry": "Export / target country",
        "market.sync": "Auto sync",
        "hint.layout": "Left GACP production, centre GMP processing, right admin and support. Click a room to edit genetics and plants/m² on its card. Concept floor plan downloads as PNG. Scenario PDF exports capacity, rooms, economics, alerts and calendar. Play year: batches glow cyan in trim and green in pack; orange when vault is full.",
        "legend.flower": "Indoor flower",
        "legend.mother": "Mother / veg",
        "legend.dry": "GMP drying",
        "legend.clean": "Dry-room cleaning",
        "legend.trim": "Trim (from dry)",
        "legend.pack": "Pack (from trim)",
        "legend.hold": "Dry hold",
        "legend.quarantine": "Quarantine / R&D",
        "legend.office": "Office",
        "btn.play": "Play year",
        "btn.stop": "Stop",
        "btn.pdf": "Scenario summary (PDF)",
        "btn.json": "JSON",
        "btn.concept": "Download concept layout",
        "btn.resetDens": "Genetics plants/m²",
        "week": "Week",
        "preset.pilot": "Pilot",
        "preset.pilotSub": "3 rooms · 4 harvests/yr · 3,060 plants",
        "preset.dengeli": "Balanced",
        "preset.dengeliSub": "4 rooms · 5 harvests/yr · 5,360 plants",
        "preset.yuksek": "High capacity",
        "preset.yuksekSub": "8 rooms · 6 harvests/yr · 16,320 plants",
        "preset.faz2": "Expansion",
        "preset.faz2Sub": "12 rooms · 6 harvests/yr · 19,300 plants",
        "preset.custom": "Custom",
        "preset.customSub": "Tune with sliders",
        "skill.starter": "Starter",
        "skill.starterSub": "65 g/plant",
        "skill.mid": "Mid",
        "skill.midSub": "105 g/plant",
        "skill.pro": "Professional",
        "skill.proSub": "145 g/plant",
        "market.loading": "Loading Cannastream data…"
      },
      gate: {
        session: "Guest session",
        noCodes: "Define accessCodes in gate-config.js.",
        badCode: "Invalid access code."
      },
      skill: { starter: "Starter", mid: "Mid", pro: "Professional" },
      preset: { pilot: "Pilot", dengeli: "Balanced", yuksek: "High capacity", faz2: "Expansion", custom: "Custom" },
      unit: { days: "days", tiers: "tiers", room: "room", rooms: "rooms", harvest: "harvest", year: "year", empty: "empty", clean: "cleaning", hold: "dry hold", pack: "pack" },
      cal: { flower: "Flower", dry: "Dry", trim: "Trim", pack: "Pack" },
      flow: { mother: "Mother", cutting: "Cuttings", preVeg: "Pre-veg", veg: "Veg", flower: "Flower", harvest: "Harvest", dry: "Drying", trim: "Trim", pack: "Pack", wait: "waiting" },
      market: {
        loading: "CS…",
        error: "CS · off",
        live: "CS · live",
        liveShort: "CS · {d}",
        notLoaded: "Cannastream data not loaded yet.",
        patients: "Patients",
        market: "Market",
        growth: "Growth",
        authority: "Authority",
        gacpBg: "GACP (background)",
        gmpBg: "EU-GMP (background)",
        extractBg: "Extract (background)",
        algo: "Market-width algorithm",
        applyAll: "Apply all facility parameters",
        genetics: "Market genetics (auto suggestion)",
        sync: "Auto sync · {updated} · refresh {mins} min",
        salesTitle: "Background sales simulation · {country}",
        colItem: "Item",
        colValue: "Value",
        share: "Market share (flower kg)",
        demand: "Market demand",
        demandShort: "demand ~{kg} kg/yr",
        insufficient: "Insufficient data",
        soldFlower: "Facility saleable flower",
        marketGrowth: "Market growth",
        yearRow: "Year {y} · {kg} kg · {price}/kg",
        cumEbitda: "5-year cumulative EBITDA",
        intelScan: "Live market scan",
        intelReg: "Regulatory signals",
        intelNews: "Related news",
        intelOfficial: "Official source (Firecrawl)",
        source: "Source",
        officialLink: "Official source",
        tier0: "Micro pilot — closed or early market",
        tier1: "Small scale — niche export",
        tier2: "Balanced — mid market share",
        tier3: "High capacity — broad market",
        tier4: "Expansion phase — leading market volume",
        metaScore: "Score {score}% · target share ~{share}%{demand} · {rooms}×{roomM2} m² rooms · {plants} plants/yr · ~{kg} kg saleable · {dry} dry/{tiers} tiers · trim/pack {trim}/{pack} m² · extract {extract}% · genetics {strains}"
      },
      staff: {
        prodMgr: "Production manager",
        grower: "Grow technician",
        ipm: "IPM / climate technician",
        harvest: "Harvest crew (peak day)",
        dryOp: "Drying operator",
        trimOp: "Trim operator",
        packOp: "Pack / label",
        qa: "QA / documentation",
        extractOp: "Extraction operator",
        facility: "Facility / sanitation",
        office: "Office / QMS",
        zoneGacp: "GACP",
        zoneGmp: "GMP",
        zoneBoth: "GACP→GMP",
        zoneShared: "Shared",
        zoneAdmin: "Admin",
        prodMgrTasks: "Genetics selection, IPM/feed strategy, shift plan, seed-to-sale, harvest quality",
        growerTasks: "Room rounds, pruning/defoliation, irrigation checks, scouting, transplant, records",
        ipmTasks: "Pest monitoring, traps/biopreps, sensor calibration, HVAC set-point control",
        harvestTasks: "Cutting, transfer, hanging, room CIP; peak-day extra only",
        dryTasks: "Hang/take-down, T/RH logs, batch transfer, dry-room cleaning",
        trimTasks: "Dry trim, QC sort, station sanitation, vault stock",
        packTasks: "Weighing, labeling, primary pack, lot records, vault out",
        qaTasks: "Visual QC, sampling, batch records, deviation/CAPA, release",
        extractTasks: "scCO₂ line operation, separator, distillation, CIP, process records",
        facilityTasks: "Airlocks, floor/wall CIP, waste, PPE stock, maintenance coordination",
        officeTasks: "SOPs, training records, suppliers, permits/traceability, reporting",
        note: "Canopy rule ~1 grower / {canopy} m² flower (industry 74–111 m²). Trim {trim} kg/shift/station machine-assisted assumption.",
        rolesHead: "Role / staff",
        baseStaff: "Base staff",
        harvestTotal: "Peak harvest total",
        peakNote: "* peak-day extra.",
        peakDay: " · peak day"
      },
      kpi: {
        plantsYear: "Annual plants",
        inFlower: "{n} in flower · {h} harvests/yr",
        roomArea: "Room area",
        roomCap: "max 300 m² · total {area}",
        drying: "Drying",
        drySub: "need {need} · trim queue {q} kg · trim/pack {trim}/{pack} m²",
        dryFlower: "Dry flower",
        dryFlowerSub: "{gm2} g/m² · sold {sold} kg · distillate {ex} kg",
        revenue: "Revenue",
        revenueSub: "Y3+ EU-GMP · Y1–2 GACP {gacp}",
        capex: "CAPEX",
        capexSub: "margin Y3+ {ebitda} · payback {payback} (ramp)",
        staff: "Staff",
        staffSub: "harvest day {crew} · {roles} role lines",
        share: "Market share",
        shareSub: "{country} · demand ~{kg} kg"
      },
      table: {
        item: "Item",
        operation: "Operation",
        indoorGacp: "Indoor GACP",
        gmp: "GMP",
        extractEq: "Extraction equipment (Caladrius 450 X + Isolute X, ex VAT)",
        extractRoom: "Extraction GMP room (scCO₂)",
        stability: "Stability",
        office: "Office",
        totalCapex: "Total CAPEX",
        substrate: "Substrate (pot+coco+perlite)",
        waterFert: "Water + fert + acid + automation",
        labor: "Labor",
        materials: "Materials (IPM, dripper, drying)",
        energy: "Electricity (lighting+HVAC)",
        ga: "G&A / insurance / COA / license",
        extractOps: "Extraction operations",
        totalOpex: "Total OPEX",
        opexPerG: "OPEX / g saleable",
        flowerGacp: "Flower GACP yrs 1–2 ({kg} kg × {price})",
        flowerGmp: "Flower EU-GMP yr 3+ ({kg} kg × {price})",
        extractSales: "Extract sales ({kg} kg × {price})",
        revGacp: "Revenue / margin yrs 1–2 (GACP)",
        revGmp: "Revenue / margin yr 3+ (EU-GMP)",
        totalRev: "Total revenue (mature Y3+)",
        ebitda: "Mature margin (revenue − OPEX)",
        payback: "Payback (GACP→GMP ramp)",
        roomArea: "Room area",
        density: "Plants / m² (room model)",
        yieldLevel: "Production level",
        yieldPlant: "Yield per plant (density adjusted)",
        yieldM2: "Yield / m² (usable)",
        plantsHarvest: "Plants / harvest (in flower)",
        harvestRoom: "Harvests / room / year (calendar)",
        harvestFacility: "Facility harvests / year",
        plantsYear: "Annual plants (harvest plants × harvests)",
        vegAlgo: "Veg (algorithm)",
        preVegAlgo: "Pre-veg (algorithm)",
        cuttings: "Cuttings / rooting",
        dryRoom: "Drying rooms",
        dryNeed: " · need ",
        dryTier: "Dry floor / tier",
        trimArea: "Trim area",
        packArea: "Pack area",
        trimQueue: "Trim queue / hold",
        trimPeak: " kg peak · ",
        trimHold: " days in dry room",
        cycle: "Cycle time",
        fte: "Staff (FTE / harvest day)",
        laborH: "Labor hours / year",
        clones: "Clones / week (buffered)",
        extractLine: "Extraction line",
        none: "none",
        indoorTotal: "Total indoor built area",
        stations: " stn. · ",
        kgDay: " kg/d · vault ",
        kgVault: " kg · need "
      },
      alerts: {
        harvestBad: function (p) {
          return "For " + p.harvests + " harvests/room/year flowering can be at most " + p.max + " days" + (p.tight ? (" — tight: " + p.tight) : "") + ".";
        },
        harvestOk: function (p) { return "Each room harvests " + p.harvests + "×/year (cycle " + p.cycle + " days). Annual plants = plants in flower × calendar harvests."; },
        harvestConflict: function (p) { return "Harvest weeks overlap — some rooms counted fewer than " + p.want + " harvests. Annual plants follow actual harvest count."; },
        roomMax: function () { return "Room area hard cap is 300 m²."; },
        dryRule: function (p) { return "Drying rule: each flower-room harvest goes to its own dry room. Room dries " + p.dry + " days, then cleans " + p.clean + " days; no other batch enters meanwhile."; },
        dryBad: function (p) { return "Insufficient drying: " + p.rooms + " rooms, " + p.wait + " harvests queued. " + p.flower + " flower rooms need " + p.need + " dry rooms."; },
        dryWarn: function (p) { return "Dry rooms (" + p.rooms + ") above need (" + p.need + ") — GMP cost rises."; },
        dryOk: function (p) { return "Drying OK: " + p.rooms + " rooms sufficient (need " + p.need + ", peak " + p.peak + ")."; },
        gacpVeg: function (p) { return "Pre-flower GACP: veg+pre-veg ~" + p.pct + "% of flower canopy (target 20–30%); mother+bank+cuttings " + p.m2 + " m² (~2.5% canopy)."; },
        densityHigh: function (p) { return "Density " + p.d + " plants/m² — commercial bench ~7–11 /m²; SOG higher. Per-plant yield drops; canopy disease/uniformity risk rises."; },
        yieldLevel: function (p) { return "Production " + p.skill + " — " + p.ref + " g/plant (5.5 /m²). Genetics catalog ±18%. Higher density lowers g/plant, raises g/m² (now avg. " + p.use + " g/plant · " + p.gm2 + " g/m²)."; },
        geneticsDensity: function (p) { return "Selected genetics suggest " + p.gen + " plants/m²; slider at " + p.cur + " (manual density)."; },
        roomModel: function (p) { return "Room model with genetics plants/m²: " + p.bits + ". Annual plants " + p.plants + "."; },
        gmpIdle: function (p) { return "GMP drying idle " + p.w + " weeks."; },
        hangBad: function (p) { return "Dry floor insufficient: " + p.base + " m² × " + p.tiers + " tiers = " + p.eq + " m² hang; one flower harvest needs " + p.need + " m²."; },
        hangOk: function (p) { return "Dry sizing: flower room " + p.room + " m² → floor " + p.base + " m² over " + p.tiers + " tiers. Hang equivalent " + p.eq + " m²."; },
        trimFlow: function (p) { return "Dry output → trim → pack queue (FIFO, 5 days/week). Trim " + p.ts + " stn × " + p.tkg + " kg/shift, vault " + p.tv + " kg. Pack " + p.ps + " stn × " + p.pkg + " kg/shift, vault " + p.pv + " kg. Extract share skips pack."; },
        batchBig: function (p) { return "One flower harvest " + p.kg + " kg; trim vault only " + p.vault + " kg. Trim room needs at least " + p.need + " m²."; },
        throughputBad: function (p) { return "Annual " + p.kg + " kg dry flower cannot pass this line (trim " + p.trim + " / pack " + p.pack + " kg/calendar day). Suggested trim " + p.trimM2 + " m², pack " + p.packM2 + " m²."; },
        vaultHold: function (p) { return "Dry done but trim/pack vault full — product waits up to " + p.days + " days in dry room. Cleaning slips; next harvest locks. Trim " + p.trim + " / pack " + p.pack + " m² insufficient; need " + p.trimNeed + " / " + p.packNeed + " m²."; },
        trimTight: function (p) { return "Trim " + p.trim + " m² / pack " + p.pack + " m² tight at peak (queue " + p.tq + " / " + p.pq + " kg). Comfortable: trim " + p.trimNeed + " m², pack " + p.packNeed + " m²."; },
        trimOk: function (p) { return "Trim/pack OK: peak queue " + p.tq + " kg trim / " + p.pq + " kg pack. Dry output clears without hold."; },
        layoutRule: function () { return "Layout: veg / pre-veg / cuttings = flower m² × (stage days / flower days) / density factor. Mother area scales with genetics count."; },
        allocTrim: function (p) { return "Room split " + p.assigned + " vs facility " + p.total + " rooms. Excess trimmed in simulation (" + p.dist + ")."; },
        allocFill: function (p) { return "Room split " + p.assigned + " / " + p.total + ". Empty rooms filled with " + p.name + " (" + p.dist + ")."; },
        allocOk: function (p) { return "Room split: " + p.dist + " (" + p.total + "/" + p.total + ")."; },
        allocEmpty: function () { return "No room count entered — split evenly across selected genetics."; },
        geneticsMix: function (p) { return "Genetics (room-weighted): " + p.bits + " · avg flower " + p.flower + " days / density-adjusted " + p.yield + " g/plant / crude oil " + p.oil + "%."; },
        extractLine: function (p) { return "scCO₂ extraction: " + p.feed + " kg dry flower/yr (~" + p.day + " / " + p.rated + " kg/day). Crude " + p.crude + " kg → sold distillate " + p.product + " kg. Equipment " + p.capex + " · CO₂ recovery 95–98%."; },
        extractOver: function () { return "Feed exceeds Caladrius/Isolute rated capacity — add line or second shift."; },
        salesRamp: function (p) { return "Sales ramp: yrs 1–" + p.gacpY + " GACP flower " + p.gacpP + "/kg (" + p.gacpR + ") · yr " + p.gmpY + "+ EU-GMP " + p.gmpP + "/kg (" + p.gmpR + ")" + (p.ex ? (" + distillate " + p.ex) : "") + ". Payback uses this ramp."; },
        opexV3: function () { return "OPEX v3: grow electricity ~2.2 kWh/g @ €0.10/kWh (LED+HVAC), G&A/insurance/security, external COA/harvest, license, Cannactive inputs, scCO₂ ops. Distillate recovery 72%."; },
        staffModel: function (p) { return "Staff model: " + p.base + " FTE base + harvest day +" + p.peak + " = " + p.total + " people. " + p.note; },
        mktShareLow: function (p) { return p.country + " market share ~" + p.pct + "% — capacity small for market."; },
        mktShareHigh: function (p) { return p.country + " market ~" + p.pct + "% share — aggressive target."; },
        mktShareOk: function (p) { return "Cannastream target " + p.country + ": ~" + p.pct + "% share · demand ~" + p.kg + " kg/yr."; },
        mktOutlook: function (p) { return p.outlook + ": " + p.country + " export/sales model carries high regulatory risk."; },
        mktPrices: function (p) { return "Background prices (Cannastream): GACP " + p.gacp + "/kg · GMP " + p.gmp + "/kg."; }
      }
    }
  };

  function pack() { return PACK[locale] || PACK.tr; }

  function t(key, params) {
    var val = resolve(pack(), key);
    if (typeof val === "function") return val(params || {});
    if (val == null) return key;
    return interpolate(String(val), params);
  }

  function alert(key, params) {
    var fn = resolve(pack(), "alerts." + key);
    if (typeof fn === "function") return fn(params || {});
    return key;
  }

  function countryDisplay(name) {
    if (!name) return "";
    if (locale === "en") return COUNTRY_EN[name] || name;
    return name;
  }

  function localeTag() { return locale === "en" ? "en-US" : "tr-TR"; }

  function facilityTierLabel(score) {
    if (score <= 0.2) return t("market.tier0");
    if (score <= 0.4) return t("market.tier1");
    if (score <= 0.6) return t("market.tier2");
    if (score <= 0.8) return t("market.tier3");
    return t("market.tier4");
  }

  function applyDom() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (!key) return;
      var val = t("dom." + key);
      if (val == null || val === "dom." + key) val = t(key);
      if (val == null || val === key || val === "dom." + key) return;
      if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") node.placeholder = val;
      else node.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-html");
      var val = t("dom." + key);
      if (val == null || val === "dom." + key) val = t(key);
      if (val != null && val !== key && val !== "dom." + key) node.innerHTML = val;
    });
    document.title = t("meta.title");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));
    document.documentElement.lang = locale;
    var gate = document.getElementById("gate");
    if (gate) gate.lang = locale;
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.classList.toggle("on", btn.getAttribute("data-lang") === locale);
    });
  }

  function setLocale(lang, persist) {
    if (lang !== "en" && lang !== "tr") return;
    locale = lang;
    if (persist !== false) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    }
    applyDom();
    try {
      window.dispatchEvent(new CustomEvent("tkts-locale-change", { detail: { locale: locale } }));
    } catch (e2) {}
  }

  function bindLangSwitch() {
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      if (btn._i18nBound) return;
      btn._i18nBound = true;
      btn.addEventListener("click", function () {
        setLocale(btn.getAttribute("data-lang"));
      });
    });
  }

  locale = pickLocale();
  document.documentElement.lang = locale;

  window.TKTS_i18n = {
    t: t,
    alert: alert,
    setLocale: setLocale,
    getLocale: function () { return locale; },
    localeTag: localeTag,
    countryDisplay: countryDisplay,
    facilityTierLabel: facilityTierLabel,
    applyDom: applyDom
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyDom();
      bindLangSwitch();
    });
  } else {
    applyDom();
    bindLangSwitch();
  }
})();
