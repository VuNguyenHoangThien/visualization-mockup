import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { GlobalMap } from "@/components/map/GlobalMap";
import { FilterPanel } from "@/components/layout/FilterPanel";
import { CompactStats } from "@/components/common/CompactStats";
import { company } from "@/data/mock";
import {
  countAssetsInSite,
  countLinesInSite,
  countWorkstationsInSite,
  filterSites,
} from "@/data/selectors";
import { formatPct, oeeColor } from "@/lib/oee";
import { useFilters } from "@/store/filters";
import { useUi } from "@/store/ui";
import { cn } from "@/lib/utils";
import type { KpiDelta } from "@/data/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Global View — Advanced Factory Analytics" },
      { name: "description", content: "Global OEE overview across all sites." },
    ],
  }),
  component: GlobalView,
});

function GlobalView() {
  const filters = useFilters();
  const navigate = useNavigate();
  const { highlightedSiteId, setHighlightedSite } = useUi();

  const sites = useMemo(
    () =>
      filterSites({
        segment: filters.segment,
        businessLine: filters.businessLine,
        country: filters.country,
        site: filters.site,
      }),
    [filters.segment, filters.businessLine, filters.country, filters.site]
  );

  const totals = useMemo(() => {
    const buildings = sites.reduce((s, x) => s + x.buildings.length, 0);
    const lines = sites.reduce((s, x) => s + countLinesInSite(x), 0);
    const workstations = sites.reduce((s, x) => s + countWorkstationsInSite(x), 0);
    const machines = sites.reduce((s, x) => s + countAssetsInSite(x), 0);
    return { sites: sites.length, buildings, lines, workstations, machines };
  }, [sites]);

  const kpi = useMemo<KpiDelta>(() => {
    if (sites.length === 0) {
      return {
        oee: 0, availability: 0, performance: 0, quality: 0,
        oeeDelta: 0, availabilityDelta: 0, performanceDelta: 0, qualityDelta: 0,
      };
    }
    const avg = (k: keyof KpiDelta) =>
      sites.reduce((s, x) => s + (x.kpi[k] as number), 0) / sites.length;
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
  }, [sites]);

  const selectedCountries = useMemo(
    () => Array.from(new Set(sites.map((s) => s.country))),
    [sites]
  );

  // Auto-zoom focus based on filter selection
  const focus = useMemo(() => {
    if (filters.site.length) {
      const s = sites.find((x) => filters.site.includes(x.name));
      if (s) return { center: s.coords, zoom: 6 };
    }
    if (filters.country.length || filters.businessLine.length || filters.segment.length) {
      if (sites.length === 0) return null;
      const lng = sites.reduce((a, s) => a + s.coords[0], 0) / sites.length;
      const lat = sites.reduce((a, s) => a + s.coords[1], 0) / sites.length;
      const zoom = filters.country.length === 1 ? 4 : 2;
      return { center: [lng, lat] as [number, number], zoom };
    }
    return null;
  }, [sites, filters.site, filters.country, filters.businessLine, filters.segment]);

  return (
    <main className="px-4 lg:px-6 py-4 max-w-[1600px] mx-auto space-y-3">
      {/* Header with compact stats top-right */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-primary">
            {company.name} · Global Operations
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            Visual Management by Advanced Factory Analytics
          </h1>
        </div>
        <CompactStats
          stats={[
            { label: "Sites", value: totals.sites },
            { label: "Buildings", value: totals.buildings },
            { label: "Production Lines", value: totals.lines },
            { label: "Work Stations", value: totals.workstations },
            { label: "Machines", value: totals.machines },
          ]}
        />
      </section>

      <FilterPanel />

      <KpiGrid kpi={kpi} />

      <GlobalMap sites={sites} selectedCountries={selectedCountries} focus={focus} />

      <section>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">All Sites</h2>
            <p className="text-xs text-muted-foreground">
              Showing {sites.length} of {company.sites.length} sites. Click a site to drill in.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Site</th>
                <th className="px-4 py-2.5 text-left font-medium">Country</th>
                <th className="px-4 py-2.5 text-left font-medium">Segment</th>
                <th className="px-4 py-2.5 text-right font-medium">Buildings</th>
                <th className="px-4 py-2.5 text-right font-medium">Lines</th>
                <th className="px-4 py-2.5 text-right font-medium">Machines</th>
                <th className="px-4 py-2.5 text-right font-medium">OEE</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No sites match the current filters.
                  </td>
                </tr>
              )}
              {sites.map((s) => {
                const isHi = highlightedSiteId === s.id;
                return (
                  <tr
                    key={s.id}
                    onMouseEnter={() => setHighlightedSite(s.id)}
                    onMouseLeave={() => setHighlightedSite(null)}
                    onClick={() => navigate({ to: "/sites/$siteId", params: { siteId: s.id } })}
                    className={cn(
                      "cursor-pointer border-t border-border transition-colors",
                      isHi ? "bg-primary/10" : "hover:bg-secondary/40"
                    )}
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to="/sites/$siteId"
                        params={{ siteId: s.id }}
                        className="hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.country}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.segment}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.buildings.length}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{countLinesInSite(s)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{countAssetsInSite(s)}</td>
                    <td
                      className="px-4 py-3 text-right tabular-nums font-semibold"
                      style={{ color: oeeColor(s.kpi.oee) }}
                    >
                      {formatPct(s.kpi.oee)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/sites/$siteId"
                        params={{ siteId: s.id }}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
