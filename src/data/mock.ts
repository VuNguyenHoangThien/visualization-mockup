import type {
  Asset,
  Building,
  Company,
  KpiDelta,
  ProductionLine,
  Site,
  Status,
  TrendPoint,
  Workstation,
  AlertItem,
} from "@/data/types";

// Seeded RNG for deterministic mock data
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTrend(seed: number, base: Partial<{ a: number; p: number; q: number }> = {}): TrendPoint[] {
  const rnd = mulberry32(seed);
  const points: TrendPoint[] = [];
  const now = new Date("2026-06-01T00:00:00Z").getTime();
  const a0 = base.a ?? 85;
  const p0 = base.p ?? 88;
  const q0 = base.q ?? 95;
  let a = a0, p = p0, q = q0;
  for (let i = 29; i >= 0; i--) {
    a = Math.max(40, Math.min(100, a + (rnd() - 0.5) * 6));
    p = Math.max(40, Math.min(100, p + (rnd() - 0.5) * 6));
    q = Math.max(40, Math.min(100, q + (rnd() - 0.5) * 3));
    const oee = (a * p * q) / 10000;
    points.push({
      t: new Date(now - i * 86400000).toISOString(),
      oee: +oee.toFixed(1),
      availability: +a.toFixed(1),
      performance: +p.toFixed(1),
      quality: +q.toFixed(1),
    });
  }
  return points;
}

function kpiFromTrend(trend: TrendPoint[]): KpiDelta {
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 8] ?? trend[0];
  return {
    oee: last.oee,
    availability: last.availability,
    performance: last.performance,
    quality: last.quality,
    oeeDelta: +(last.oee - prev.oee).toFixed(1),
    availabilityDelta: +(last.availability - prev.availability).toFixed(1),
    performanceDelta: +(last.performance - prev.performance).toFixed(1),
    qualityDelta: +(last.quality - prev.quality).toFixed(1),
  };
}

const ASSET_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop", // robot
  "https://images.unsplash.com/photo-1565374790563-1d010c2b1cce?w=600&auto=format&fit=crop", // factory arm
  "https://images.unsplash.com/photo-1581091870622-2c6c2c4ea2f1?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop",
];
const WS_IMAGES = [
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565374790551-78ec1eaad2d6?w=800&auto=format&fit=crop",
];
const LINE_IMAGES = [
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=900&auto=format&fit=crop",
];
const BUILDING_IMAGES = [
  "https://images.unsplash.com/photo-1581092919535-0c4f06e25b80?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565374790552-79c0e9c2e94f?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=1200&auto=format&fit=crop",
];

const ASSET_TYPES = ["Pos Robot", "Connected Screwdriver", "Conveyor", "Hydraulic Fixture", "AGV", "CNC Mill"];
const MANUFACTURERS = ["Hermle", "Fanuc", "Siemens", "ABB", "KUKA", "Mitsubishi"];

function buildAsset(seed: number, lineName: string, idx: number): Asset {
  const trend = makeTrend(seed, { a: 80 + (seed % 10), p: 82 + ((seed * 3) % 10), q: 92 + (seed % 5) });
  const kpi = kpiFromTrend(trend);
  const statusPool: Status[] = ["running", "running", "running", "warning", "idle", "down"];
  const status = statusPool[seed % statusPool.length];
  const type = ASSET_TYPES[seed % ASSET_TYPES.length];
  const mfr = MANUFACTURERS[seed % MANUFACTURERS.length];
  return {
    id: `${lineName}-A${idx}`.replace(/\s+/g, "-").toLowerCase(),
    name: `${type} #${100 + seed}`,
    type,
    status,
    rfid: `RFID-${(seed * 7919).toString(16).toUpperCase().slice(-8)}`,
    serialNumber: `${1300 + seed}`,
    modelNumber: `${mfr.slice(0, 3).toUpperCase()}-${2000 + seed}`,
    manufacturer: mfr,
    installDate: `202${(seed % 4) + 1}-0${(seed % 9) + 1}-15`,
    lastMaintenance: `2026-05-${String((seed % 27) + 1).padStart(2, "0")}`,
    operatingHours: 1200 + ((seed * 37) % 8800),
    mttr: 12 + (seed % 22),
    mtbf: 80 + (seed % 200),
    image: ASSET_IMAGES[seed % ASSET_IMAGES.length],
    kpi,
    trend,
    alertsLast7d: seed % 14,
  };
}

function buildWorkstation(seed: number, lineName: string, idx: number): Workstation {
  const assets: Asset[] = Array.from({ length: 3 }, (_, i) => buildAsset(seed * 31 + i + 1, lineName, i + 1));
  const trend = makeTrend(seed + 11);
  const kpi = kpiFromTrend(trend);
  return {
    id: `${lineName}-WS${idx}`.replace(/\s+/g, "-").toLowerCase(),
    name: `Workstation ${String(idx).padStart(2, "0")}`,
    status: assets.some((a) => a.status === "down") ? "warning" : "running",
    image: WS_IMAGES[seed % WS_IMAGES.length],
    kpi,
    trend,
    assets,
  };
}

function buildLine(seed: number, buildingName: string, idx: number, lineName: string): ProductionLine {
  const workstations = Array.from({ length: 3 }, (_, i) => buildWorkstation(seed * 17 + i + 1, lineName, i + 1));
  const trend = makeTrend(seed + 23);
  const kpi = kpiFromTrend(trend);
  return {
    id: `${buildingName}-L${idx}`.replace(/\s+/g, "-").toLowerCase(),
    name: lineName,
    status: "running",
    image: LINE_IMAGES[seed % LINE_IMAGES.length],
    kpi,
    trend,
    workstations,
    manager: ["Benjamin George", "Elissa Humphries", "Joe Smithsonian", "Marie Chen"][seed % 4],
    currentPO: `PO-${4000 + (seed % 900)}`,
  };
}

function buildBuilding(seed: number, siteName: string, idx: number): Building {
  const lineNames = ["Final Assembly Pro", "Sub-Assembly", "Machining Cell", "Inspection Line"];
  const lines = Array.from({ length: 2 }, (_, i) =>
    buildLine(seed * 13 + i + 1, `${siteName}-B${idx}`, i + 1, lineNames[(seed + i) % lineNames.length])
  );
  const avg = (k: keyof KpiDelta) => lines.reduce((s, l) => s + (l.kpi[k] as number), 0) / lines.length;
  const trendBase = lines[0].trend;
  const kpi: KpiDelta = {
    oee: +avg("oee").toFixed(1),
    availability: +avg("availability").toFixed(1),
    performance: +avg("performance").toFixed(1),
    quality: +avg("quality").toFixed(1),
    oeeDelta: +avg("oeeDelta").toFixed(1),
    availabilityDelta: +avg("availabilityDelta").toFixed(1),
    performanceDelta: +avg("performanceDelta").toFixed(1),
    qualityDelta: +avg("qualityDelta").toFixed(1),
  };
  return {
    id: `${siteName}-B${idx}`.replace(/\s+/g, "-").toLowerCase(),
    name: `Building ${String.fromCharCode(64 + idx)}`,
    image: BUILDING_IMAGES[seed % BUILDING_IMAGES.length],
    kpi,
    lines,
  };
}

type SiteSeed = {
  name: string;
  country: string;
  countryCode: string;
  address: string;
  segment: string;
  businessLine: string;
  manager: string;
  coords: [number, number];
  seed: number;
};

const MANAGERS = ["Elissa Humphries", "Marcus Webb", "Sophie Renaud", "Klaus Müller", "Anika Rao", "Linh Pham", "Joe Smithsonian", "Marie Chen"];

const SITES_SEED: SiteSeed[] = [
  // Electrification System — GA (Grid Automation)
  { name: "SMS", country: "United Kingdom", countryCode: "GBR", address: "Stafford, UK", segment: "Electrification System", businessLine: "GA", coords: [-2.12, 52.81], seed: 7 },
  { name: "SMP", country: "India", countryCode: "IND", address: "Vadodara, India", segment: "Electrification System", businessLine: "GA", coords: [73.18, 22.31], seed: 11 },
  { name: "ATT", country: "Turkey", countryCode: "TUR", address: "Gebze, Turkey", segment: "Electrification System", businessLine: "GA", coords: [29.43, 40.80], seed: 13 },
  // Electrification System — PT (Power Transformers)
  { name: "BHT", country: "France", countryCode: "FRA", address: "Belfort, France", segment: "Electrification System", businessLine: "PT", coords: [6.86, 47.64], seed: 17 },
  { name: "SUZ", country: "China", countryCode: "CHN", address: "Suzhou, China", segment: "Electrification System", businessLine: "PT", coords: [120.62, 31.30], seed: 19 },
  { name: "AGM", country: "Germany", countryCode: "DEU", address: "Mannheim, Germany", segment: "Electrification System", businessLine: "PT", coords: [8.46, 49.49], seed: 23 },
  { name: "CME", country: "Italy", countryCode: "ITA", address: "Sesto San Giovanni, Italy", segment: "Electrification System", businessLine: "PT", coords: [9.23, 45.53], seed: 29 },
  { name: "RPV", country: "Italy", countryCode: "ITA", address: "Monfalcone, Italy", segment: "Electrification System", businessLine: "PT", coords: [13.55, 45.80], seed: 31 },
  { name: "ROC", country: "United States of America", countryCode: "USA", address: "Rochester, NY, USA", segment: "Electrification System", businessLine: "PT", coords: [-77.61, 43.16], seed: 37 },
  { name: "USC", country: "United States of America", countryCode: "USA", address: "Charleroi, PA, USA", segment: "Electrification System", businessLine: "PT", coords: [-79.90, 40.14], seed: 41 },
  { name: "MKM", country: "Canada", countryCode: "CAN", address: "Markham, ON, Canada", segment: "Electrification System", businessLine: "PT", coords: [-79.34, 43.86], seed: 43 },
  { name: "TDC", country: "Canada", countryCode: "CAN", address: "Tracy, QC, Canada", segment: "Electrification System", businessLine: "PT", coords: [-73.18, 46.00], seed: 47 },
  // Electrification System — GSI (Grid Solutions Integration)
  { name: "VSC", country: "United Kingdom", countryCode: "GBR", address: "Stafford, UK", segment: "Electrification System", businessLine: "GSI", coords: [-2.10, 52.80], seed: 53 },
  { name: "NCG", country: "United Kingdom", countryCode: "GBR", address: "Edinburgh, UK", segment: "Electrification System", businessLine: "GSI", coords: [-3.19, 55.95], seed: 59 },
  // Electrification System — PCS (Power Conversion Systems)
  { name: "RMR", country: "United States of America", countryCode: "USA", address: "Roanoke, VA, USA", segment: "Electrification System", businessLine: "PCS", coords: [-79.94, 37.27], seed: 61 },
  { name: "CWC", country: "Belgium", countryCode: "BEL", address: "Charleroi, Belgium", segment: "Electrification System", businessLine: "PCS", coords: [4.44, 50.41], seed: 67 },
  { name: "AIB", country: "United States of America", countryCode: "USA", address: "Aiken, SC, USA", segment: "Electrification System", businessLine: "PCS", coords: [-81.72, 33.56], seed: 71 },
  { name: "AHT", country: "United States of America", countryCode: "USA", address: "Atlanta, GA, USA", segment: "Electrification System", businessLine: "PCS", coords: [-84.39, 33.75], seed: 73 },
  { name: "UTR", country: "Netherlands", countryCode: "NLD", address: "Utrecht, Netherlands", segment: "Electrification System", businessLine: "PCS", coords: [5.12, 52.09], seed: 79 },
  // One Wind — ONW (Onshore Wind)
  { name: "SCH", country: "United States of America", countryCode: "USA", address: "Schenectady, NY, USA", segment: "One Wind", businessLine: "ONW", coords: [-73.94, 42.81], seed: 83 },
  { name: "PUN", country: "India", countryCode: "IND", address: "Pune, India", segment: "One Wind", businessLine: "ONW", coords: [73.85, 18.52], seed: 89 },
  { name: "PNS", country: "United States of America", countryCode: "USA", address: "Pensacola, FL, USA", segment: "One Wind", businessLine: "ONW", coords: [-87.22, 30.42], seed: 97 },
  { name: "SLZ", country: "Germany", countryCode: "DEU", address: "Salzbergen, Germany", segment: "One Wind", businessLine: "ONW", coords: [7.34, 52.32], seed: 101 },
  // One Wind — OFW (Offshore Wind)
  { name: "JYG", country: "Vietnam", countryCode: "VNM", address: "Bac Ninh, Vietnam", segment: "One Wind", businessLine: "OFW", coords: [106.08, 21.19], seed: 103 },
  { name: "SNZ", country: "China", countryCode: "CHN", address: "Shenzhen, China", segment: "One Wind", businessLine: "OFW", coords: [114.06, 22.54], seed: 107 },
].map((s, i): SiteSeed => ({ ...s, coords: s.coords as [number, number], manager: MANAGERS[i % MANAGERS.length] }));

function buildSite(s: (typeof SITES_SEED)[number]): Site {
  const buildings = Array.from({ length: 2 + (s.seed % 2) }, (_, i) => buildBuilding(s.seed * 7 + i + 1, s.name, i + 1));
  const avg = (k: keyof KpiDelta) =>
    buildings.reduce((sum, b) => sum + (b.kpi[k] as number), 0) / buildings.length;
  const kpi: KpiDelta = {
    oee: +avg("oee").toFixed(1),
    availability: +avg("availability").toFixed(1),
    performance: +avg("performance").toFixed(1),
    quality: +avg("quality").toFixed(1),
    oeeDelta: +avg("oeeDelta").toFixed(1),
    availabilityDelta: +avg("availabilityDelta").toFixed(1),
    performanceDelta: +avg("performanceDelta").toFixed(1),
    qualityDelta: +avg("qualityDelta").toFixed(1),
  };
  return {
    id: s.name.toLowerCase().replace(/\s+/g, "-"),
    name: s.name,
    country: s.country,
    countryCode: s.countryCode,
    address: s.address,
    segment: s.segment,
    businessLine: s.businessLine,
    manager: s.manager,
    coords: s.coords,
    kpi,
    trend: makeTrend(s.seed + 101),
    buildings,
  };
}

export const company: Company = {
  id: "ge-vernova",
  name: "GE Vernova",
  segments: ["Electrification System", "One Wind"],
  businessLines: ["GA", "PT", "GSI", "PCS", "ONW", "OFW"],
  sites: SITES_SEED.map(buildSite),
};

export const globalAlerts: AlertItem[] = [
  {
    id: "a1",
    kind: "wo_at_risk",
    title: "WO-2413 at risk of delay",
    detail: "Final Assembly Pro · Toronto",
    time: "12m ago",
  },
  {
    id: "a2",
    kind: "maintenance",
    title: "Planned maintenance on Hyd Press",
    detail: "Sub-Assembly · Greenville",
    time: "1h ago",
  },
  {
    id: "a3",
    kind: "unplanned_downtime",
    title: "Pos Robot failure on final ASM",
    detail: "Workstation 02 · JYG Vietnam",
    time: "2h ago",
  },
];

export function globalKpi(): KpiDelta {
  const sites = company.sites;
  const avg = (k: keyof KpiDelta) => sites.reduce((s, x) => s + (x.kpi[k] as number), 0) / sites.length;
  return {
    oee: +avg("oee").toFixed(1),
    availability: +avg("availability").toFixed(1),
    performance: +avg("performance").toFixed(1),
    quality: +avg("quality").toFixed(1),
    oeeDelta: +avg("oeeDelta").toFixed(1),
    availabilityDelta: +avg("availabilityDelta").toFixed(1),
    performanceDelta: +avg("performanceDelta").toFixed(1),
    qualityDelta: +avg("qualityDelta").toFixed(1),
  };
}
