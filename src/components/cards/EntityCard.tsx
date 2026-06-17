import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatPct, oeeColor } from "@/lib/oee";
import type { Status } from "@/data/types";

interface Props {
  name: string;
  image: string;
  oee: number;
  meta?: string;
  status?: Status;
  to: string;
  params?: Record<string, string>;
}

export function EntityCard({ name, image, oee, meta, status, to, params }: Props) {
  return (
    <Link
      to={to}
      params={params as never}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {status && <StatusBadge status={status} className="backdrop-blur" />}
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold shadow"
             style={{ color: oeeColor(oee) }}>
          OEE {formatPct(oee)}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-base font-semibold text-white drop-shadow">{name}</div>
          {meta && <div className="text-xs text-white/80">{meta}</div>}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-xs text-muted-foreground">View details</div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}
