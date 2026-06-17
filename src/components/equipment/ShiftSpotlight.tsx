import { Progress } from "@/components/ui/progress";

export function ShiftSpotlight({
  shift = "Shift 7",
  production = 86,
  scrap = 1,
  oee = 85,
  quality = 72,
  efficiency = 44,
}: {
  shift?: string;
  production?: number;
  scrap?: number;
  oee?: number;
  quality?: number;
  efficiency?: number;
}) {
  const row = (label: string, value: number, tone = "var(--primary)") => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: tone }} />
      </div>
    </div>
  );
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Shift Spotlight
          </div>
          <div className="text-base font-semibold mt-0.5">Current: {shift}</div>
        </div>
        <div className="text-xs text-muted-foreground">Uptime</div>
      </div>
      <div className="mt-4 space-y-3">
        {row("Production", production, "var(--primary)")}
        {row("OEE", oee, "var(--info)")}
        {row("Quality", quality, "var(--success)")}
        {row("Efficiency", efficiency, "var(--warning)")}
        {row("Scrap", scrap, "var(--destructive)")}
      </div>
    </div>
  );
}
