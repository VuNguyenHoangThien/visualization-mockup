interface Stat {
  label: string;
  value: number;
}

export function CompactStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-soft">
      {stats.map((s, i) => (
        <span key={s.label} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/50">|</span>}
          <span className="text-muted-foreground">{s.label}:</span>
          <span className="font-semibold tabular-nums">{s.value}</span>
        </span>
      ))}
    </div>
  );
}
