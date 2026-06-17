import type { Asset } from "@/data/types";
import { StatusBadge } from "@/components/common/StatusBadge";

export function EquipmentStatusList({ assets }: { assets: Asset[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 text-left font-medium">Equipment</th>
            <th className="px-4 py-2 text-left font-medium">Type</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-right font-medium">Uptime</th>
            <th className="px-4 py-2 text-right font-medium">OEE</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => {
            const hrs = Math.floor(a.operatingHours);
            const mins = Math.round((a.operatingHours - hrs) * 60);
            return (
              <tr key={a.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 font-medium">{a.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{a.type}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                  {hrs} Hr {mins} Min
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{a.kpi.oee.toFixed(0)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
