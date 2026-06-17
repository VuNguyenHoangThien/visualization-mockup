import { createFileRoute, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EntityCard } from "@/components/cards/EntityCard";
import { getSite, countAssetsInSite, countLinesInSite, countWorkstationsInSite } from "@/data/selectors";
import type { Building } from "@/data/types";

export const Route = createFileRoute("/sites/$siteId")({
  loader: ({ params }) => {
    const site = getSite(params.siteId);
    if (!site) throw notFound();
    return { site };
  },
  component: SiteView,
});

function SiteView() {
  const { site } = Route.useLoaderData();

  return (
    <main className="px-4 lg:px-6 py-4 max-w-[1600px] mx-auto space-y-4">
      <Breadcrumbs items={[{ label: site.country }, { label: site.name }]} />

      {/* Header */}
      <header className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-primary">
            {site.businessLine} · {site.segment}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {site.address}
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Buildings</div>
            <div className="text-2xl font-semibold">{site.buildings.length}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Lines</div>
            <div className="text-2xl font-semibold">{countLinesInSite(site)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Machines</div>
            <div className="text-2xl font-semibold">{countAssetsInSite(site)}</div>
          </div>
        </div>
      </header>

      {/* KPI cards */}
      <KpiGrid kpi={site.kpi} />

      {/* Buildings section */}
      <section>
        <div className="mb-3">
          <SectionHeader title="Buildings" subtitle="Drill into a building to view its production lines" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.buildings.map((b: Building) => (
            <EntityCard
              key={b.id}
              name={b.name}
              image={b.image}
              oee={b.kpi.oee}
              status={(b.kpi.oee >= 85 ? "running" : b.kpi.oee >= 70 ? "warning" : "down") as any}
              meta={`${b.lines.length} production lines`}
              to="/sites/$siteId/buildings/$buildingId"
              params={{ siteId: site.id, buildingId: b.id }}
            />
          ))}
        </div>
      </section>

      {/* Site information */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <SectionHeader title="Site Information" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
          <Info label="Country" value={site.country} />
          <Info label="Segment" value={site.segment} />
          <Info label="Business Line" value={site.businessLine} />
          <Info label="Plant Manager" value={site.manager} />
          <Info label="Address" value={site.address} />
          <Info label="Buildings" value={site.buildings.length} />
          <Info label="Production Lines" value={countLinesInSite(site)} />
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
