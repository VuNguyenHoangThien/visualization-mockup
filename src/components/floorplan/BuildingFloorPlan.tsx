import { useRef, useState, type WheelEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Minus, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { oeeColor } from "@/lib/oee";

import type { ProductionLine } from "@/data/types";

// Hand-tuned overlay rectangles aligned to the orange production-line zones
// in the uploaded Building A floor plan. Coordinates are percentages.
const ZONE_PRESETS: Array<{ left: number; top: number; width: number; height: number; label: string }> = [
  { left: 47, top: 60, width: 17, height: 9, label: "Legacy" },
  { left: 47, top: 69, width: 17, height: 8, label: "SMT" },
  { left: 47, top: 77, width: 17, height: 9, label: "SMT PCBA" },
  { left: 67, top: 69, width: 10, height: 17, label: "PCBA" },
  { left: 39, top: 60, width: 4, height: 26, label: "Sub Assembly" },
];

interface Props {
  lines: ProductionLine[];
  siteId: string;
  buildingId: string;
  imageUrl?: string;
}

export function BuildingFloorPlan({ lines, siteId, buildingId, imageUrl }: Props) {
  const src = imageUrl ?? "https://images.unsplash.com/photo-1581092919535-0c4f06e25b80?w=1200&auto=format&fit=crop";
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale((s) => Math.min(s * 1.4, 6));
  const zoomOut = () => setScale((s) => Math.max(s / 1.4, 1));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 30) return;
    e.preventDefault();
    setScale((s) => Math.min(6, Math.max(1, s * (e.deltaY > 0 ? 0.9 : 1.1))));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setTx(dragRef.current.tx + (e.clientX - dragRef.current.x));
    setTy(dragRef.current.ty + (e.clientY - dragRef.current.y));
  };
  const endDrag = () => { dragRef.current = null; };

  // Map each production line to a preset zone (cycle if more lines)
  const overlays = lines.map((l, i) => ({ line: l, zone: ZONE_PRESETS[i % ZONE_PRESETS.length] }));

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      {/* Toolbar */}
      <div className="absolute right-3 top-3 z-20 flex flex-col rounded-lg border border-border bg-card/95 backdrop-blur shadow-soft">
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={zoomIn} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <div className="h-px bg-border" />
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={zoomOut} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <div className="h-px bg-border" />
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={reset} aria-label="Reset">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-md border border-border bg-card/90 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
        <Move className="h-3 w-3" /> Drag to pan · scroll/ctrl-scroll to zoom
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[16/9] w-full select-none overflow-hidden bg-secondary"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onWheel={onWheel}
        style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
      >
        <div
          className="absolute inset-0 origin-center"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transition: dragRef.current ? "none" : "transform 0.15s ease",
          }}
        >
          <img src={src} alt="Building floor plan" className="h-full w-full object-contain" draggable={false} />

          {/* Production line clickable overlays */}
          {overlays.map(({ line, zone }) => {
            const color = oeeColor(line.kpi.oee);
            const isHover = hover === line.id;
            return (
              <Link
                key={line.id}
                to="/sites/$siteId/buildings/$buildingId/lines/$lineId"
                params={{ siteId, buildingId, lineId: line.id }}
                onMouseEnter={() => setHover(line.id)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "absolute block rounded-md transition-all",
                  isHover ? "ring-4 ring-primary/60 z-10" : "ring-2 ring-transparent hover:ring-primary/40"
                )}
                style={{
                  left: `${zone.left}%`,
                  top: `${zone.top}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  background: isHover ? `${color}55` : `${color}22`,
                  border: `2px solid ${color}`,
                }}
                aria-label={`Open ${line.name}`}
              >
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {line.name}
                </span>

                {isHover && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-52 -translate-x-1/2 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-elevated"
                    style={{ transform: `translate(-50%, 0) scale(${1 / scale})`, transformOrigin: "top center" }}
                  >
                    <div className="text-xs font-semibold mb-1.5 flex items-center justify-between">
                      <span>{line.name}</span>
                      <span style={{ color }}>{line.kpi.oee.toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <div>OEE</div><div className="text-right font-medium text-foreground">{line.kpi.oee.toFixed(1)}%</div>
                      <div>Availability</div><div className="text-right font-medium text-foreground">{line.kpi.availability.toFixed(1)}%</div>
                      <div>Performance</div><div className="text-right font-medium text-foreground">{line.kpi.performance.toFixed(1)}%</div>
                      <div>Quality</div><div className="text-right font-medium text-foreground">{line.kpi.quality.toFixed(1)}%</div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
