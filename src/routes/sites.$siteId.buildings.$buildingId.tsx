import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { TrendChart } from "@/components/kpi/TrendChart";
import { EntityCard } from "@/components/cards/EntityCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { DetailTabs, InfoGrid } from "@/components/detail/DetailTabs";
import { FloorPlanView } from "@/components/floorplan/FloorPlanView";
import { getBuilding, getSite } from "@/data/selectors";

export const Route = createFileRoute("/sites/$siteId/buildings/$buildingId")({
  head: ({ params }) => ({
    meta: [{ title: `${getBuilding(params.siteId, params.buildingId)?.name ?? "Building"} — Building View` }],
  }),
  loader: ({ params }) => {
    const site = getSite(params.siteId);
    const building = getBuilding(params.siteId, params.buildingId);
    if (!site || !building) throw notFound();
    return { site, building };
  },
  component: BuildingView,
});

function BuildingView() {
  const { site, building } = Route.useLoaderData();
  const allWs = building.lines.flatMap((l: typeof building.lines[number]) => l.workstations);

  return (
    <main className="px-4 lg:px-6 py-6 max-w-[1600px] mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: site.country },
          { label: site.name, to: `/sites/${site.id}` },
          { label: building.name },
        ]}
      />

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-primary">Building</div>
          <h1 className="text-3xl font-semibold tracking-tight">{building.name}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {site.name} · {building.lines.length} production lines
          </div>
        </div>
      </header>

      <KpiGrid kpi={building.kpi} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <SectionHeader title="OEE Trend" subtitle="Last 30 days" />
          <TrendChart data={building.lines[0].trend} />
        </div>
        <FloorPlanView workstations={allWs} title={`${building.name} — Floor Plan`} />
      </div>

      <DetailTabs
        info={
          <InfoGrid
            items={[
              { label: "Building", value: building.name },
              { label: "Site", value: site.name },
              { label: "Lines", value: building.lines.length },
              { label: "Workstations", value: allWs.length },
              { label: "OEE", value: `${building.kpi.oee.toFixed(1)}%` },
              { label: "Availability", value: `${building.kpi.availability.toFixed(1)}%` },
              { label: "Performance", value: `${building.kpi.performance.toFixed(1)}%` },
              { label: "Quality", value: `${building.kpi.quality.toFixed(1)}%` },
            ]}
          />
        }
      />

      <section>
        <SectionHeader title="Production Lines" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {building.lines.map((l: typeof building.lines[number]) => (
            <EntityCard
              key={l.id}
              name={l.name}
              image={l.image}
              oee={l.kpi.oee}
              status={l.status}
              meta={`${l.workstations.length} workstations · ${l.manager}`}
              to="/sites/$siteId/buildings/$buildingId/lines/$lineId"
              params={{ siteId: site.id, buildingId: building.id, lineId: l.id }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
