import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3 mb-3", className)}>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-base font-medium text-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
