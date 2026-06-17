import type { Status } from "@/data/types";

export const formatPct = (n: number) => `${Math.round(n)}%`;
export const formatDelta = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export function statusColor(status: Status): string {
  switch (status) {
    case "running":
      return "var(--success)";
    case "warning":
      return "var(--warning)";
    case "down":
      return "var(--destructive)";
    case "maintenance":
      return "var(--info)";
    case "idle":
    default:
      return "var(--muted-foreground)";
  }
}

export function statusLabel(status: Status): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Performance bands per spec: ≥85 green, 70–84 yellow, <70 red
export function oeeColor(oee: number): string {
  if (oee >= 85) return "var(--success)";
  if (oee >= 70) return "var(--warning)";
  return "var(--destructive)";
}

export function oeeTone(oee: number): "success" | "warning" | "destructive" {
  if (oee >= 85) return "success";
  if (oee >= 70) return "warning";
  return "destructive";
}
