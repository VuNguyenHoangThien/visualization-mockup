import type { Status } from "@/data/types";
import { cn } from "@/lib/utils";

const styles: Record<Status, string> = {
  running: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
  maintenance: "bg-info/15 text-info border-info/30",
  idle: "bg-muted text-muted-foreground border-border",
};

const dotStyle: Record<Status, string> = {
  running: "bg-success",
  warning: "bg-warning",
  down: "bg-destructive",
  maintenance: "bg-info",
  idle: "bg-muted-foreground",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        styles[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyle[status], status === "running" && "animate-pulse")} />
      {status}
    </span>
  );
}
