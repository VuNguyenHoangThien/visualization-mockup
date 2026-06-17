import type { Workstation } from "@/data/types";
import { statusColor } from "@/lib/oee";

/**
 * Schematic floor plan: workstations rendered as color-coded boxes laid out in a grid.
 */
export function FloorPlanView({ workstations, title = "Plant View" }: { workstations: Workstation[]; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <Legend color="var(--success)" label="Running" />
          <Legend color="var(--warning)" label="Warning" />
          <Legend color="var(--destructive)" label="Down" />
          <Legend color="var(--muted-foreground)" label="Idle" />
        </div>
      </div>
      <svg viewBox="0 0 600 320" className="w-full">
        {/* building outline */}
        <rect x="10" y="10" width="580" height="300" rx="8" fill="var(--secondary)" stroke="var(--border)" strokeWidth="2" />
        <rect x="40" y="40" width="520" height="240" rx="4" fill="var(--background)" stroke="var(--border)" strokeDasharray="4 3" />
        {/* workstations */}
        {workstations.map((w, i) => {
          const cols = 3;
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = 70 + c * 165;
          const y = 70 + r * 120;
          const color = statusColor(w.status);
          return (
            <g key={w.id}>
              <rect x={x} y={y} width="130" height="90" rx="6" fill={color} fillOpacity={0.15} stroke={color} strokeWidth="2" />
              <text x={x + 65} y={y + 30} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--foreground)">
                {w.name}
              </text>
              <text x={x + 65} y={y + 50} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                {w.assets.length} assets
              </text>
              <text x={x + 65} y={y + 72} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
                {w.kpi.oee.toFixed(0)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
