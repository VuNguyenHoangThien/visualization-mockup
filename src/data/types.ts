export type Status = "running" | "warning" | "down" | "idle" | "maintenance";

export interface Kpi {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface KpiDelta extends Kpi {
  oeeDelta: number;
  availabilityDelta: number;
  performanceDelta: number;
  qualityDelta: number;
}

export interface TrendPoint {
  t: string; // ISO timestamp
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: Status;
  rfid: string;
  serialNumber: string;
  modelNumber: string;
  manufacturer: string;
  installDate: string;
  lastMaintenance: string;
  operatingHours: number;
  mttr: number; // mins
  mtbf: number; // hrs
  image: string;
  kpi: KpiDelta;
  trend: TrendPoint[];
  alertsLast7d: number;
}

export interface Workstation {
  id: string;
  name: string;
  status: Status;
  image: string;
  kpi: KpiDelta;
  trend: TrendPoint[];
  assets: Asset[];
}

export interface ProductionLine {
  id: string;
  name: string;
  status: Status;
  image: string;
  kpi: KpiDelta;
  trend: TrendPoint[];
  workstations: Workstation[];
  manager: string;
  currentPO: string;
}

export interface Building {
  id: string;
  name: string;
  image: string;
  kpi: KpiDelta;
  lines: ProductionLine[];
}

export interface Site {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO A3 for map matching
  address: string;
  segment: string;
  businessLine: string;
  manager: string;
  coords: [number, number]; // [lng, lat]
  kpi: KpiDelta;
  trend: TrendPoint[];
  buildings: Building[];
}

export interface Company {
  id: string;
  name: string;
  segments: string[];
  businessLines: string[];
  sites: Site[];
}

export interface AlertItem {
  id: string;
  kind: "wo_at_risk" | "maintenance" | "unplanned_downtime";
  title: string;
  detail: string;
  time: string;
}
