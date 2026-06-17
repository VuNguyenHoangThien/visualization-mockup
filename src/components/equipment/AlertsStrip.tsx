import { AlertTriangle, Wrench, Clock } from "lucide-react";
import type { AlertItem } from "@/data/types";

const config = {
  wo_at_risk: {
    icon: Clock,
    label: "WO At Risk",
    tone: "text-warning bg-warning/10 border-warning/30",
  },
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    tone: "text-info bg-info/10 border-info/30",
  },
  unplanned_downtime: {
    icon: AlertTriangle,
    label: "Unplanned Downtime",
    tone: "text-destructive bg-destructive/10 border-destructive/30",
  },
} as const;

export function AlertsStrip({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {alerts.map((a) => {
        const c = config[a.kind];
        const Icon = c.icon;
        return (
          <div
            key={a.id}
            className={`rounded-xl border bg-card p-3 shadow-soft border-l-4 ${c.tone.replace("bg-", "border-l-").split(" ").find((x) => x.startsWith("border-l-"))}`}
          >
            <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.tone}`}>
              <Icon className="h-3 w-3" />
              {c.label}
            </div>
            <div className="mt-2 text-sm font-medium leading-snug">{a.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {a.detail} · {a.time}
            </div>
          </div>
        );
      })}
    </div>
  );
}
