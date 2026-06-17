import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { SectionHeader } from "@/components/common/SectionHeader";
import { BuildingFloorPlan } from "@/components/floorplan/BuildingFloorPlan";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSite, countAssetsInSite, countLinesInSite, countWorkstationsInSite } from "@/data/selectors";

export const Route = createFileRoute("/sites/$siteId")({
  head: ({ params }) => ({
    meta: [{ title: `${getSite(params.siteId)?.name ?? "Site"} — Site View` }],
  }),
  loader: ({ params }) => {
    const site = getSite(params.siteId);
    if (!site) throw notFound();
    return { site };
  },
  component: SiteView,
});

function SiteView() {
  const { site } = Route.useLoaderData();
  const [activeBuildingId, setActiveBuildingId] = useState(site.buildings[0].id);
  const activeBuilding = site.buildings.find((b: typeof site.buildings[number]) => b.id === activeBuildingId) ?? site.buildings[0];

  return (
    <main className="px-4 lg:px-6 py-4 max-w-[1600px] mx-auto space-y-4">
      <Breadcrumbs items={[{ label: site.country }, { label: site.name }]} />

      {/* Site name */}
      <header>
        <div className="text-[10px] font-medium uppercase tracking-widest text-primary">Site</div>
        <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {site.address}
        </div>
      </header>

      {/* Compact KPI cards */}
      <KpiGrid kpi={site.kpi} />

      {/* Building section: selector + image */}
      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <SectionHeader title="Buildings" subtitle="Click a production line on the floor plan to drill in" />
          <div className="flex flex-wrap gap-1.5">
            {site.buildings.map((b: typeof site.buildings[number]) => (
              <Button
                key={b.id}
                size="sm"
                variant="outline"
                className={cn(
                  "h-8",
                  b.id === activeBuildingId &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
                onClick={() => setActiveBuildingId(b.id)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        </div>
        <BuildingFloorPlan
          lines={activeBuilding.lines}
          siteId={site.id}
          buildingId={activeBuilding.id}
        />
      </section>

      {/* Site information */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <SectionHeader title="Site Information" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
          <Info label="Country" value={site.country} />
          <Info label="Segment" value={site.segment} />
          <Info label="Business Line" value={site.businessLine} />
          <Info label="Plant Manager" value={site.manager} />
          <Info label="Buildings" value={site.buildings.length} />
          <Info label="Production Lines" value={countLinesInSite(site)} />
          <Info label="Work Stations" value={countWorkstationsInSite(site)} />
          <Info label="Machines" value={countAssetsInSite(site)} />
        </dl>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
