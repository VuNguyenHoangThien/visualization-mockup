import { createFileRoute, notFound } from "@tanstack/react-router";
import { Phone, Ticket, Wifi } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { TrendChart } from "@/components/kpi/TrendChart";
import { SectionHeader } from "@/components/common/SectionHeader";
import { DetailTabs, InfoGrid } from "@/components/detail/DetailTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getAsset, getBuilding, getLine, getSite, getWorkstation } from "@/data/selectors";
import { statusColor } from "@/lib/oee";

export const Route = createFileRoute(
  "/sites/$siteId/buildings/$buildingId/lines/$lineId/workstations/$wsId/assets/$assetId"
)({
  head: ({ params }) => ({
    meta: [
      {
        title: `${
          getAsset(params.siteId, params.buildingId, params.lineId, params.wsId, params.assetId)?.name ?? "Asset"
        } — Asset View`,
      },
    ],
  }),
  loader: ({ params }) => {
    const site = getSite(params.siteId);
    const building = getBuilding(params.siteId, params.buildingId);
    const line = getLine(params.siteId, params.buildingId, params.lineId);
    const ws = getWorkstation(params.siteId, params.buildingId, params.lineId, params.wsId);
    const asset = getAsset(params.siteId, params.buildingId, params.lineId, params.wsId, params.assetId);
    if (!site || !building || !line || !ws || !asset) throw notFound();
    return { site, building, line, ws, asset };
  },
  component: AssetView,
});

function AssetView() {
  const { site, building, line, ws, asset } = Route.useLoaderData();

  return (
    <main className="px-4 lg:px-6 py-6 max-w-[1600px] mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: site.country },
          { label: site.name, to: `/sites/${site.id}` },
          { label: building.name, to: `/sites/${site.id}/buildings/${building.id}` },
          { label: line.name, to: `/sites/${site.id}/buildings/${building.id}/lines/${line.id}` },
          {
            label: ws.name,
            to: `/sites/${site.id}/buildings/${building.id}/lines/${line.id}/workstations/${ws.id}`,
          },
          { label: asset.name },
        ]}
      />

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-primary">Asset</div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{asset.name}</h1>
            <StatusBadge status={asset.status} />
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {asset.type} · {asset.manufacturer} {asset.modelNumber} · RFID {asset.rfid}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Contact
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Ticket className="h-3.5 w-3.5" /> Log Ticket
          </Button>
          <Button size="sm" className="gap-1.5">
            <Wifi className="h-3.5 w-3.5" /> Remote Connect
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Asset visualization */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="relative aspect-square bg-secondary">
            <img src={asset.image} alt={asset.name} className="h-full w-full object-cover" />
            <div
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow"
              style={{ color: statusColor(asset.status) }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: statusColor(asset.status) }}
              />
              {asset.status.toUpperCase()}
            </div>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <Row label="Asset ID" value={asset.id} />
            <Row label="Serial Number" value={asset.serialNumber} />
            <Row label="Model" value={asset.modelNumber} />
            <Row label="RFID" value={asset.rfid} />
          </div>
        </div>

        <div className="space-y-4">
          <KpiGrid kpi={asset.kpi} />
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <SectionHeader title="OEE Trend" subtitle="Last 30 days" />
            <TrendChart data={asset.trend} />
          </div>
        </div>
      </div>

      <DetailTabs
        info={
          <InfoGrid
            items={[
              { label: "Asset", value: asset.name },
              { label: "Type", value: asset.type },
              { label: "Manufacturer", value: asset.manufacturer },
              { label: "Model", value: asset.modelNumber },
              { label: "Serial Number", value: asset.serialNumber },
              { label: "RFID", value: asset.rfid },
              { label: "Status", value: <StatusBadge status={asset.status} /> },
              { label: "Install Date", value: asset.installDate },
              { label: "Last Maintenance", value: asset.lastMaintenance },
              { label: "Operating Hours", value: asset.operatingHours.toLocaleString() },
              { label: "MTTR (mins)", value: asset.mttr },
              { label: "MTBF (hrs)", value: asset.mtbf },
              { label: "Parent Line", value: line.name },
              { label: "Parent Site", value: site.name },
              { label: "Alerts (7d)", value: asset.alertsLast7d },
            ]}
          />
        }
        maintenance={
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Maintenance schedule</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Last maintenance</span>
                <span className="font-medium">{asset.lastMaintenance}</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">MTTR</span>
                <span className="font-medium">{asset.mttr} mins</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">MTBF</span>
                <span className="font-medium">{asset.mtbf} hrs</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Maintenance Manager</span>
                <span className="font-medium">Joe Smithsonian</span>
              </li>
            </ul>
          </div>
        }
        alerts={
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Alerts last 7 days:</span>{" "}
              <span className="font-semibold text-destructive">{asset.alertsLast7d}</span>
            </div>
          </div>
        }
      />
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}
