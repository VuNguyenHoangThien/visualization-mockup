import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFilters, type FilterKey } from "@/store/filters";
import { company } from "@/data/mock";
import { filterSites } from "@/data/selectors";

interface FilterDef {
  key: FilterKey;
  label: string;
  options: (selected: Partial<Record<FilterKey, string[]>>) => string[];
}

const DEFS: FilterDef[] = [
  { key: "company", label: "Company", options: () => [company.name] },
  { key: "segment", label: "Segment", options: () => company.segments },
  {
    key: "businessLine",
    label: "Business Line",
    options: (sel) => {
      const sites = filterSites({ segment: sel.segment });
      return Array.from(new Set(sites.map((s) => s.businessLine)));
    },
  },
  {
    key: "country",
    label: "Country",
    options: (sel) => {
      const sites = filterSites({ segment: sel.segment, businessLine: sel.businessLine });
      return Array.from(new Set(sites.map((s) => s.country)));
    },
  },
  {
    key: "site",
    label: "Site",
    options: (sel) => filterSites(sel).map((s) => s.name),
  },
  {
    key: "building",
    label: "Building",
    options: (sel) => {
      const names = new Set<string>();
      filterSites(sel).forEach((s) => s.buildings.forEach((b) => names.add(b.name)));
      return Array.from(names);
    },
  },
  {
    key: "line",
    label: "Production Line",
    options: (sel) => {
      const names = new Set<string>();
      filterSites(sel).forEach((s) =>
        s.buildings
          .filter((b) => !sel.building?.length || sel.building.includes(b.name))
          .forEach((b) => b.lines.forEach((l) => names.add(l.name)))
      );
      return Array.from(names);
    },
  },
  {
    key: "workstation",
    label: "Work Station",
    options: (sel) => {
      const names = new Set<string>();
      filterSites(sel).forEach((s) =>
        s.buildings
          .filter((b) => !sel.building?.length || sel.building.includes(b.name))
          .forEach((b) =>
            b.lines
              .filter((l) => !sel.line?.length || sel.line.includes(l.name))
              .forEach((l) => l.workstations.forEach((w) => names.add(w.name)))
          )
      );
      return Array.from(names);
    },
  },
  {
    key: "asset",
    label: "Machine",
    options: (sel) => {
      const names = new Set<string>();
      filterSites(sel).forEach((s) =>
        s.buildings
          .filter((b) => !sel.building?.length || sel.building.includes(b.name))
          .forEach((b) =>
            b.lines
              .filter((l) => !sel.line?.length || sel.line.includes(l.name))
              .forEach((l) =>
                l.workstations
                  .filter((w) => !sel.workstation?.length || sel.workstation.includes(w.name))
                  .forEach((w) => w.assets.forEach((a) => names.add(a.name)))
              )
          )
      );
      return Array.from(names);
    },
  },
];

function FilterDropdown({ def }: { def: FilterDef }) {
  const state = useFilters();
  const selected = state[def.key];
  const opts = useMemo(() => def.options(state), [def, state]);
  const [q, setQ] = useState("");
  const filtered = opts.filter((o) => o.toLowerCase().includes(q.toLowerCase()));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 justify-between gap-2 border-border bg-card font-normal min-w-[140px]",
            selected.length > 0 && "border-primary/50 ring-1 ring-primary/20"
          )}
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {def.label}
          </span>
          <span className="flex items-center gap-1.5">
            {selected.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {selected.length}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${def.label.toLowerCase()}…`}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-auto p-1">
          {filtered.length === 0 && (
            <div className="px-2 py-3 text-center text-xs text-muted-foreground">No options</div>
          )}
          {filtered.map((o) => {
            const checked = selected.includes(o);
            return (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              >
                <Checkbox checked={checked} onCheckedChange={() => state.toggle(def.key, o)} />
                <span className="flex-1 truncate">{o}</span>
              </label>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => state.clear(def.key)}
            >
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function FilterPanel() {
  const state = useFilters();
  const anySelected = DEFS.some((d) => state[d.key].length > 0);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-soft">
      {DEFS.map((d) => (
        <FilterDropdown key={d.key} def={d} />
      ))}
      {anySelected && (
        <Button variant="ghost" size="sm" className="h-9 text-xs ml-auto" onClick={() => state.reset()}>
          <X className="h-3.5 w-3.5 mr-1" /> Clear all
        </Button>
      )}
    </div>
  );
}
