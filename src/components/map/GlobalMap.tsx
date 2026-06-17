import { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { useNavigate } from "@tanstack/react-router";
import { Globe2, Map as MapIcon, Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUi } from "@/store/ui";
import { oeeColor } from "@/lib/oee";
import type { Site } from "@/data/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Mode = "globe" | "flat";

const BLUE_ACTIVE = "#2563EB";
const BLUE_SELECTED = "#1D4ED8";

interface Props {
  sites: Site[];
  selectedCountries?: string[];
  focus?: { center: [number, number]; zoom: number } | null;
  onSelectSite?: (id: string) => void;
}

export function GlobalMap({ sites, selectedCountries = [], focus, onSelectSite }: Props) {
  const [mode, setMode] = useState<Mode>("flat");
  const [rotation, setRotation] = useState<[number, number, number]>([-10, -20, 0]);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const animRef = useRef<number | null>(null);
  const { highlightedSiteId, setHighlightedSite } = useUi();

  const activeCountryNames = useMemo(() => new Set(sites.map((s) => s.country)), [sites]);
  const selectedSet = useMemo(() => new Set(selectedCountries), [selectedCountries]);

  // Apply focus from filters
  useEffect(() => {
    if (!focus) return;
    if (mode === "flat") {
      setCenter(focus.center);
      setZoom(focus.zoom);
    } else {
      setRotation([-focus.center[0], -focus.center[1], 0]);
    }
  }, [focus, mode]);

  // Globe auto-rotate
  useEffect(() => {
    if (mode !== "globe" || focus) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotation(([x, y, z]) => [x + dt * 5, y, z]);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [mode, focus]);

  const handleSite = (id: string) => {
    if (onSelectSite) onSelectSite(id);
    else navigate({ to: "/sites/$siteId", params: { siteId: id } });
  };

  const zoomIn = () => setZoom((z) => Math.min(z * 1.5, 16));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.5, 1));
  const reset = () => {
    setZoom(1);
    setCenter([0, 20]);
    setRotation([-10, -20, 0]);
  };

  const handleMouseEnter = (id: string) => {
    setHoveredSiteId(id);
    setHighlightedSite(id);
  };
  const handleMouseLeave = () => {
    setHoveredSiteId(null);
    setHighlightedSite(null);
  };

  const isGlobe = mode === "globe";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      {/* Mode toggle */}
      <div className="absolute right-3 top-3 z-10 flex rounded-lg border border-[#2563EB]/30 bg-card/95 p-1 backdrop-blur shadow-soft">
        <Button
          size="sm"
          className={cn(
            "h-7 px-2.5 gap-1.5",
            isGlobe
              ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              : "bg-transparent text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8]"
          )}
          onClick={() => setMode("globe")}
        >
          <Globe2 className="h-3.5 w-3.5" /> Globe
        </Button>
        <Button
          size="sm"
          className={cn(
            "h-7 px-2.5 gap-1.5",
            !isGlobe
              ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              : "bg-transparent text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8]"
          )}
          onClick={() => setMode("flat")}
        >
          <MapIcon className="h-3.5 w-3.5" /> Flat
        </Button>
      </div>

      {/* Zoom controls (flat only) */}
      {!isGlobe && (
        <div className="absolute right-3 top-14 z-10 flex flex-col rounded-lg border border-border bg-card/95 backdrop-blur shadow-soft">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={zoomIn}>
            <Plus className="h-4 w-4" />
          </Button>
          <div className="h-px bg-border" />
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={zoomOut}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="h-px bg-border" />
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute left-3 bottom-3 z-10 flex flex-col gap-1 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs backdrop-blur shadow-soft">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Site OEE</div>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--success)" }} />≥ 85% Excellent</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--warning)" }} />70–84% Acceptable</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--destructive)" }} />&lt; 70% Needs Attention</span>
        <span className="mt-1 flex items-center gap-1.5 border-t border-border pt-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BLUE_ACTIVE }} />Active country
        </span>
      </div>

      {/* Map container */}
      <div
        className="w-full"
        style={{
          aspectRatio: isGlobe ? "1 / 1" : "16 / 9",
          background: isGlobe
            ? "radial-gradient(circle at 40% 40%, #e8f0fe 0%, #c7d9f8 50%, #a8c0f0 100%)"
            : undefined,
        }}
      >
        {isGlobe ? (
          // Globe mode: no ZoomableGroup, pure orthographic projection
          <ComposableMap
            projection="geoOrthographic"
            projectionConfig={{ rotate: rotation, scale: 280 }}
            width={600}
            height={600}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = (geo.properties as { name?: string }).name;
                  const isActive = name && activeCountryNames.has(name);
                  const isSelected = name && selectedSet.has(name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: isSelected ? BLUE_SELECTED : isActive ? BLUE_ACTIVE : "#e2e8f0",
                          stroke: "#cbd5e1",
                          strokeWidth: 0.4,
                          outline: "none",
                        },
                        hover: {
                          fill: isActive ? BLUE_SELECTED : "#cbd5e1",
                          outline: "none",
                        },
                        pressed: { fill: BLUE_SELECTED, outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {sites.map((s) => {
              const color = oeeColor(s.kpi.oee);
              const isHovered = hoveredSiteId === s.id;
              const isHi = highlightedSiteId === s.id || isHovered;
              return (
                <Marker
                  key={s.id}
                  coordinates={s.coords}
                  onClick={() => handleSite(s.id)}
                  onMouseEnter={() => handleMouseEnter(s.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <g style={{ cursor: "pointer" }}>
                    <circle r={isHi ? 10 : 7} fill={color} fillOpacity={0.25} />
                    <circle r={isHi ? 5 : 3.5} fill={color} stroke="white" strokeWidth={1.5} />
                    {isHovered && (
                      <text
                        textAnchor="middle"
                        y={-14}
                        style={{
                          fontFamily: "system-ui",
                          fontSize: 10,
                          fontWeight: 600,
                          fill: "#1e293b",
                          paintOrder: "stroke",
                          stroke: "white",
                          strokeWidth: 3,
                          pointerEvents: "none",
                        }}
                      >
                        {s.name}
                      </text>
                    )}
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        ) : (
          // Flat mode: with ZoomableGroup
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 155 }}
            width={900}
            height={500}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ coordinates, zoom: z }) => {
                setCenter(coordinates as [number, number]);
                setZoom(z);
              }}
              minZoom={1}
              maxZoom={16}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name = (geo.properties as { name?: string }).name;
                    const isActive = name && activeCountryNames.has(name);
                    const isSelected = name && selectedSet.has(name);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: isSelected ? BLUE_SELECTED : isActive ? BLUE_ACTIVE : "var(--muted)",
                            stroke: "var(--border)",
                            strokeWidth: 0.5,
                            outline: "none",
                            opacity: isActive ? 0.9 : 1,
                          },
                          hover: {
                            fill: isActive ? BLUE_SELECTED : "var(--secondary)",
                            outline: "none",
                          },
                          pressed: { fill: BLUE_SELECTED, outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              {sites.map((s) => {
                const color = oeeColor(s.kpi.oee);
                const isHovered = hoveredSiteId === s.id;
                const isHi = highlightedSiteId === s.id || isHovered;
                const r = (isHi ? 6 : 4) / Math.sqrt(zoom);
                const ringR = (isHi ? 12 : 8) / Math.sqrt(zoom);
                return (
                  <Marker
                    key={s.id}
                    coordinates={s.coords}
                    onClick={() => handleSite(s.id)}
                    onMouseEnter={() => handleMouseEnter(s.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <g style={{ cursor: "pointer" }}>
                      <circle r={ringR} fill={color} fillOpacity={0.25} />
                      <circle r={r} fill={color} stroke="white" strokeWidth={(isHi ? 2 : 1.5) / Math.sqrt(zoom)} />
                      {isHovered && (
                        <text
                          textAnchor="middle"
                          y={-(r + 4)}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: Math.max(7, 10 / Math.sqrt(zoom)),
                            fontWeight: 600,
                            fill: "var(--foreground)",
                            paintOrder: "stroke",
                            stroke: "var(--background)",
                            strokeWidth: 3 / Math.sqrt(zoom),
                            pointerEvents: "none",
                          }}
                        >
                          {s.name}
                        </text>
                      )}
                    </g>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>
    </div>
  );
}
