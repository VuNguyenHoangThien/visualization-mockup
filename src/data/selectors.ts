import { company } from "@/data/mock";
import type { Asset, Building, ProductionLine, Site, Workstation } from "@/data/types";

export const getSite = (siteId: string): Site | undefined =>
  company.sites.find((s) => s.id === siteId);

export const getBuilding = (siteId: string, buildingId: string): Building | undefined =>
  getSite(siteId)?.buildings.find((b) => b.id === buildingId);

export const getLine = (siteId: string, buildingId: string, lineId: string): ProductionLine | undefined =>
  getBuilding(siteId, buildingId)?.lines.find((l) => l.id === lineId);

export const getWorkstation = (
  siteId: string,
  buildingId: string,
  lineId: string,
  wsId: string
): Workstation | undefined =>
  getLine(siteId, buildingId, lineId)?.workstations.find((w) => w.id === wsId);

export const getAsset = (
  siteId: string,
  buildingId: string,
  lineId: string,
  wsId: string,
  assetId: string
): Asset | undefined =>
  getWorkstation(siteId, buildingId, lineId, wsId)?.assets.find((a) => a.id === assetId);

export function countAssetsInSite(site: Site): number {
  return site.buildings.reduce(
    (sum, b) =>
      sum +
      b.lines.reduce((s, l) => s + l.workstations.reduce((s2, w) => s2 + w.assets.length, 0), 0),
    0
  );
}

export function countLinesInSite(site: Site): number {
  return site.buildings.reduce((s, b) => s + b.lines.length, 0);
}

export function countWorkstationsInSite(site: Site): number {
  return site.buildings.reduce(
    (s, b) => s + b.lines.reduce((ss, l) => ss + l.workstations.length, 0),
    0
  );
}

export interface EntityPath {
  siteId: string;
  buildingId?: string;
  lineId?: string;
  wsId?: string;
  assetId?: string;
}

export function findBuildingPath(name: string): EntityPath | undefined {
  for (const s of company.sites)
    for (const b of s.buildings)
      if (b.name === name) return { siteId: s.id, buildingId: b.id };
  return undefined;
}

export function findLinePath(name: string): EntityPath | undefined {
  for (const s of company.sites)
    for (const b of s.buildings)
      for (const l of b.lines)
        if (l.name === name) return { siteId: s.id, buildingId: b.id, lineId: l.id };
  return undefined;
}

export function findWorkstationPath(name: string): EntityPath | undefined {
  for (const s of company.sites)
    for (const b of s.buildings)
      for (const l of b.lines)
        for (const w of l.workstations)
          if (w.name === name)
            return { siteId: s.id, buildingId: b.id, lineId: l.id, wsId: w.id };
  return undefined;
}

export function findAssetPath(name: string): EntityPath | undefined {
  for (const s of company.sites)
    for (const b of s.buildings)
      for (const l of b.lines)
        for (const w of l.workstations)
          for (const a of w.assets)
            if (a.name === name)
              return {
                siteId: s.id,
                buildingId: b.id,
                lineId: l.id,
                wsId: w.id,
                assetId: a.id,
              };
  return undefined;
}

/** Apply high-level filters and return the matching sites. */
export function filterSites(sel: {
  segment?: string[];
  businessLine?: string[];
  country?: string[];
  site?: string[];
}): Site[] {
  return company.sites.filter(
    (s) =>
      (!sel.segment?.length || sel.segment.includes(s.segment)) &&
      (!sel.businessLine?.length || sel.businessLine.includes(s.businessLine)) &&
      (!sel.country?.length || sel.country.includes(s.country)) &&
      (!sel.site?.length || sel.site.includes(s.name))
  );
}
