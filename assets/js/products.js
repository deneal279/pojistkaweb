/* =====================================================================
   KONFIGURACE PRODUKTŮ – Dovča s jistotou
   ---------------------------------------------------------------------
   Tady upravujete vše, co se týká pojištění a monetizace:
     • affiliateUrl  – váš affiliate odkaz od partnera / sítě (Dognet,
                       CJ, eHub, přímý program pojišťovny…)
     • ceny, limity, sporty, slevy
   ⚠️  Data níže jsou UKÁZKOVÁ (fiktivní pojišťovny a orientační ceny).
       Před spuštěním je nahraďte údaji svých affiliate partnerů a pak
       přepněte DEMO_MODE na false.
   ===================================================================== */

window.DSJ_CONFIG = {
  DEMO_MODE: true,

  /* Parametry, které se automaticky přidají ke každému affiliate odkazu.
     {product} {region} {persons} {days} se nahradí skutečnými hodnotami.
     Většina sítí používá pro sub-ID parametr "subid", "data1" apod. */
  affiliateParams: {
    utm_source: "dovcasjistotou",
    utm_medium: "affiliate",
    utm_campaign: "kalkulacka",
    subid: "{product}-{region}-{persons}os-{days}d",
  },

  /* Věkový koeficient ceny (nejstarší cestující). */
  ageFactor: { "18-35": 1.0, "36-49": 1.05, "50-60": 1.2, "61+": 1.6 },

  /* Koeficient ceny za dítě, pokud produkt nemá vlastní (kidsFactor). */
  defaultKidsFactor: 0.5,
};

/* Klíče aktivit (musí sedět s dotazníkem):
   relax, hiking, cycling, ski, diving, water, adrenaline, motor
   Hodnota u produktu = cenový koeficient:
     1    → kryto v základu
     1.5  → kryto za příplatek (cena se vynásobí)
     chybí → NENÍ kryto */

window.DSJ_PRODUCTS = [
  {
    id: "atlas-zaklad",
    insurer: "Atlas Travel",
    name: "Základ",
    tagline: "Nejlevnější rozumné krytí na pohodovou dovolenou.",
    color: "#5B8DEF",
    pricePerDay: { europe: 19, world: 34, usa: 59 },
    medicalLimit: 3000000,
    liability: 1000000,
    luggage: 0,
    cancellation: null,
    carRental: false,
    chronic: false,
    rescue: 300000,
    sports: { relax: 1, hiking: 1, cycling: 1.3, water: 1.3 },
    maxAge: 70,
    highlights: ["Asistence 24/7 v češtině", "Sjednání za 3 minuty"],
    affiliateUrl: "https://example.com/affiliate/atlas-zaklad",
  },
  {
    id: "horizont-komfort",
    insurer: "Horizont",
    name: "Komfort",
    tagline: "Vyvážený poměr ceny a krytí pro většinu cest.",
    color: "#1E7BFF",
    pricePerDay: { europe: 29, world: 49, usa: 82 },
    medicalLimit: Infinity,
    liability: 3000000,
    luggage: 30000,
    cancellation: null,
    carRental: false,
    chronic: false,
    rescue: 1000000,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1.5, diving: 1.5 },
    maxAge: 75,
    highlights: ["Neomezené léčebné výlohy", "Zavazadla i elektronika"],
    affiliateUrl: "https://example.com/affiliate/horizont-komfort",
  },
  {
    id: "modravlna-premium",
    insurer: "Modrá vlna",
    name: "Premium",
    tagline: "Maximální jistota včetně storna a půjčeného auta.",
    color: "#0A56C9",
    pricePerDay: { europe: 46, world: 72, usa: 112 },
    medicalLimit: Infinity,
    liability: 5000000,
    luggage: 60000,
    cancellation: { percent: 80, limit: 40000 },
    carRental: true,
    chronic: true,
    rescue: Infinity,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1, diving: 1.3 },
    maxAge: 80,
    highlights: ["Storno zájezdu do 40 000 Kč", "Spoluúčast u půjčeného auta", "Kryje i chronická onemocnění"],
    affiliateUrl: "https://example.com/affiliate/modravlna-premium",
  },
  {
    id: "alpina-hory",
    insurer: "Alpina",
    name: "Hory & Sport",
    tagline: "Pro lyžaře, skialpinisty a turisty ve vysokých horách.",
    color: "#2D6BD8",
    pricePerDay: { europe: 39, world: 61, usa: 98 },
    medicalLimit: Infinity,
    liability: 4000000,
    luggage: 40000,
    cancellation: { percent: 80, limit: 20000 },
    carRental: false,
    chronic: false,
    rescue: Infinity,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1, diving: 1, adrenaline: 1.2 },
    maxAge: 70,
    highlights: ["Horská služba a vrtulník bez limitu", "Sportovní vybavení v ceně", "Lyže i mimo sjezdovky"],
    affiliateUrl: "https://example.com/affiliate/alpina-hory",
  },
  {
    id: "familia-rodina",
    insurer: "Familia",
    name: "Rodina",
    tagline: "Děti do 18 let pojištěné zdarma s rodiči.",
    color: "#3A9BFF",
    pricePerDay: { europe: 33, world: 54, usa: 88 },
    kidsFactor: 0,
    medicalLimit: Infinity,
    liability: 3000000,
    luggage: 40000,
    cancellation: { percent: 70, limit: 25000 },
    carRental: false,
    chronic: false,
    rescue: 1500000,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1.3 },
    maxAge: 70,
    familyProduct: true,
    highlights: ["Děti zdarma", "Doprovod dítěte při hospitalizaci", "Storno pro celou rodinu"],
    affiliateUrl: "https://example.com/affiliate/familia-rodina",
  },
  {
    id: "horizont-skupina",
    insurer: "Horizont",
    name: "Skupina+",
    tagline: "Sleva 15 % pro partu od 5 cestujících.",
    color: "#4C7FE0",
    pricePerDay: { europe: 28, world: 46, usa: 78 },
    groupDiscount: { minPersons: 5, discount: 0.15 },
    medicalLimit: 5000000,
    liability: 3000000,
    luggage: 25000,
    cancellation: null,
    carRental: true,
    chronic: false,
    rescue: 1000000,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1.4, adrenaline: 1.6 },
    maxAge: 70,
    groupProduct: true,
    highlights: ["Jedna smlouva pro celou partu", "Spoluúčast u půjčeného auta"],
    affiliateUrl: "https://example.com/affiliate/horizont-skupina",
  },
  {
    id: "atlas-adrenalin",
    insurer: "Atlas Travel",
    name: "Explorer Adrenalin",
    tagline: "Paragliding, rafting, potápění do 40 m i skútr.",
    color: "#0E4DB0",
    pricePerDay: { europe: 52, world: 78, usa: 118 },
    medicalLimit: Infinity,
    liability: 5000000,
    luggage: 40000,
    cancellation: null,
    carRental: false,
    chronic: false,
    rescue: Infinity,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1, diving: 1, adrenaline: 1, motor: 1 },
    maxAge: 65,
    highlights: ["Rizikové sporty v ceně", "Skútr a motorka do 125 ccm", "Potápění do 40 m"],
    affiliateUrl: "https://example.com/affiliate/atlas-adrenalin",
  },
  {
    id: "modravlna-celorocni",
    insurer: "Modrá vlna",
    name: "Celoroční cestovatel",
    tagline: "Jedna smlouva na všechny cesty v roce (až 45 dní na cestu).",
    color: "#1663DB",
    annual: { europe: 1590, world: 2790, usa: 4190 },
    maxTripDays: 45,
    medicalLimit: Infinity,
    liability: 3000000,
    luggage: 30000,
    cancellation: { percent: 80, limit: 20000 },
    carRental: false,
    chronic: false,
    rescue: 1500000,
    sports: { relax: 1, hiking: 1, cycling: 1, water: 1, ski: 1 },
    maxAge: 70,
    highlights: ["Neomezený počet cest", "Lyže v ceně", "Platí od podpisu celý rok"],
    affiliateUrl: "https://example.com/affiliate/modravlna-celorocni",
  },
];
