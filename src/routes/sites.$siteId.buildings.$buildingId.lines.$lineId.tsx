import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getBuilding, getLine, getSite } from "@/data/selectors";
import { formatPct, oeeColor } from "@/lib/oee";

export const Route = createFileRoute("/sites/$siteId/buildings/$buildingId/lines/$lineId")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${getLine(params.siteId, params.buildingId, params.lineId)?.name ?? "Line"} — Production Line View`,
      },
    ],
  }),
  loader: ({ params }) => {
    const site = getSite(params.siteId);
    const building = getBuilding(params.siteId, params.buildingId);
    const line = getLine(params.siteId, params.buildingId, params.lineId);
    if (!site || !building || !line) throw notFound();
    return { site, building, line };
  },
  component: LineView,
});

function LineView() {
  const { site, building, line } = Route.useLoaderData();

  return (
    <main className="px-4 lg:px-6 py-4 max-w-[1600px] mx-auto space-y-4">
      <Breadcrumbs
        items={[
          { label: site.country },
          { label: site.name, to: `/sites/${site.id}` },
          { label: building.name, to: `/sites/${site.id}/buildings/${building.id}` },
          { label: line.name },
        ]}
      />

      <header>
        <div className="text-[10px] font-medium uppercase tracking-widest text-primary">Production Line</div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{line.name}</h1>
          <StatusBadge status={line.status} />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Manager: {line.manager} · Current PO: {line.currentPO}
        </div>
      </header>

      <KpiGrid kpi={line.kpi} />

      <section>
        <SectionHeader title="Workstations" subtitle="Select a workstation to view its machines" />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Workstation</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Machines</th>
                <th className="px-4 py-2.5 text-right font-medium">OEE</th>
                <th className="px-4 py-2.5 text-right font-medium">Availability</th>
                <th className="px-4 py-2.5 text-right font-medium">Performance</th>
                <th className="px-4 py-2.5 text-right font-medium">Quality</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {line.workstations.map((w: typeof line.workstations[number]) => (
                <tr key={w.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to="/sites/$siteId/buildings/$buildingId/lines/$lineId/workstations/$wsId"
                      params={{ siteId: site.id, buildingId: building.id, lineId: line.id, wsId: w.id }}
                      className="hover:text-primary"
                    >
                      {w.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                  <td className="px-4 py-3 text-right tabular-nums">{w.assets.length}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: oeeColor(w.kpi.oee) }}>
                    {formatPct(w.kpi.oee)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPct(w.kpi.availability)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPct(w.kpi.performance)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPct(w.kpi.quality)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/sites/$siteId/buildings/$buildingId/lines/$lineId/workstations/$wsId"
                      params={{ siteId: site.id, buildingId: building.id, lineId: line.id, wsId: w.id }}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Open <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
