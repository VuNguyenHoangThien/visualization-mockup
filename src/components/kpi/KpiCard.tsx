import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPct, oeeTone } from "@/lib/oee";

interface Props {
  label: string;
  value: number;
  delta?: number;
  tone?: "primary" | "auto";
  size?: "md" | "lg";
  icon?: React.ReactNode;
}

const toneColor = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
} as const;

export function KpiCard({ label, value, delta, tone = "auto", size = "md", icon }: Props) {
  const t = tone === "primary" ? "success" : oeeTone(value);
  const Arrow = delta === undefined ? Minus : delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
  const deltaTone =
    delta === undefined || delta === 0
      ? "text-muted-foreground"
      : delta > 0
      ? "text-success"
      : "text-destructive";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className={cn("mt-2 font-semibold tracking-tight", size === "lg" ? "text-4xl" : "text-3xl", toneColor[t])}>
        {formatPct(value)}
      </div>
      {delta !== undefined && (
        <div className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", deltaTone)}>
          <Arrow className="h-3 w-3" />
          {Math.abs(delta).toFixed(1)}% vs last week
        </div>
      )}
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ background: tone === "primary" ? "var(--primary)" : `var(--${t})` }}
      />
    </div>
  );
}
