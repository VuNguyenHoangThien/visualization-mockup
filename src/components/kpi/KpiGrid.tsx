import { KpiCard } from "@/components/kpi/KpiCard";
import type { KpiDelta } from "@/data/types";
import { Gauge, CheckCircle2, Zap, Award } from "lucide-react";

export function KpiGrid({ kpi }: { kpi: KpiDelta }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="OEE" value={kpi.oee} delta={kpi.oeeDelta} icon={<Gauge className="h-4 w-4" />} size="lg" />
      <KpiCard
        label="Availability"
        value={kpi.availability}
        delta={kpi.availabilityDelta}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <KpiCard
        label="Performance"
        value={kpi.performance}
        delta={kpi.performanceDelta}
        icon={<Zap className="h-4 w-4" />}
      />
      <KpiCard label="Quality" value={kpi.quality} delta={kpi.qualityDelta} icon={<Award className="h-4 w-4" />} />
    </div>
  );
}
