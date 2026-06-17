import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpDown, ArrowUpRight, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPct, oeeColor } from "@/lib/oee";
import { getBuilding, getLine, getSite, getWorkstation } from "@/data/selectors";
import type { Asset } from "@/data/types";

export const Route = createFileRoute("/sites/$siteId/buildings/$buildingId/lines/$lineId/workstations/$wsId")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${
          getWorkstation(params.siteId, params.buildingId, params.lineId, params.wsId)?.name ?? "Workstation"
        } — Workstation View`,
      },
    ],
  }),
  loader: ({ params }) => {
    const site = getSite(params.siteId);
    const building = getBuilding(params.siteId, params.buildingId);
    const line = getLine(params.siteId, params.buildingId, params.lineId);
    const ws = getWorkstation(params.siteId, params.buildingId, params.lineId, params.wsId);
    if (!site || !building || !line || !ws) throw notFound();
    return { site, building, line, ws };
  },
  component: WorkstationView,
});

type SortKey = "id" | "name" | "type" | "status" | "oee" | "availability" | "performance" | "quality";

function WorkstationView() {
  const { site, building, line, ws } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const rows = useMemo(() => {
    const filtered = ws.assets.filter((a: Asset) =>
      [a.id, a.name, a.type, a.status].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    );
    const get = (a: Asset, k: SortKey): string | number => {
      switch (k) {
        case "id": return a.id;
        case "name": return a.name;
        case "type": return a.type;
        case "status": return a.status;
        default: return a.kpi[k];
      }
    };
    return [...filtered].sort((a, b) => {
      const va = get(a, sort.key);
      const vb = get(b, sort.key);
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [ws.assets, q, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const Th = ({ k, label, align }: { k: SortKey; label: string; align?: "right" }) => (
    <th
      className={cn("px-4 py-2.5 font-medium select-none cursor-pointer hover:text-foreground", align === "right" ? "text-right" : "text-left")}
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sort.key === k ? "text-primary" : "opacity-40")} />
      </span>
    </th>
  );

  return (
    <main className="px-4 lg:px-6 py-4 max-w-[1600px] mx-auto space-y-4">
      <Breadcrumbs
        items={[
          { label: site.country },
          { label: site.name, to: `/sites/${site.id}` },
          { label: building.name, to: `/sites/${site.id}/buildings/${building.id}` },
          { label: line.name, to: `/sites/${site.id}/buildings/${building.id}/lines/${line.id}` },
          { label: ws.name },
        ]}
      />

      <header>
        <div className="text-[10px] font-medium uppercase tracking-widest text-primary">Workstation</div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{ws.name}</h1>
          <StatusBadge status={ws.status} />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {line.name} · {ws.assets.length} machines
        </div>
      </header>

      <KpiGrid kpi={ws.kpi} />

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <SectionHeader title="Machines" subtitle="Click a row to view machine details" />
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter machines…"
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <Th k="id" label="Machine ID" />
                <Th k="name" label="Machine Name" />
                <Th k="type" label="Type" />
                <Th k="status" label="Status" />
                <Th k="oee" label="OEE" align="right" />
                <Th k="availability" label="Availability" align="right" />
                <Th k="performance" label="Performance" align="right" />
                <Th k="quality" label="Quality" align="right" />
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No machines match.
                  </td>
                </tr>
              )}
              {rows.map((a) => (
                <tr key={a.id} className="cursor-pointer border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      to="/sites/$siteId/buildings/$buildingId/lines/$lineId/workstations/$wsId/assets/$assetId"
                      params={{ siteId: site.id, buildingId: building.id, lineId: line.id, wsId: ws.id, assetId: a.id }}
                      className="hover:text-primary"
                    >
                      {a.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: oeeColor(a.kpi.oee) }}>
                    {formatPct(a.kpi.oee)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPct(a.kpi.availability)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPct(a.kpi.performance)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPct(a.kpi.quality)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/sites/$siteId/buildings/$buildingId/lines/$lineId/workstations/$wsId/assets/$assetId"
                      params={{ siteId: site.id, buildingId: building.id, lineId: line.id, wsId: ws.id, assetId: a.id }}
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
