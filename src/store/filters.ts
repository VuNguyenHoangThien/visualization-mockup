import { create } from "zustand";

export type FilterKey =
  | "company"
  | "segment"
  | "businessLine"
  | "country"
  | "site"
  | "building"
  | "line"
  | "workstation"
  | "asset";

type State = Record<FilterKey, string[]>;

const empty: State = {
  company: [],
  segment: [],
  businessLine: [],
  country: [],
  site: [],
  building: [],
  line: [],
  workstation: [],
  asset: [],
};

interface Store extends State {
  toggle: (k: FilterKey, v: string) => void;
  clear: (k?: FilterKey) => void;
  reset: () => void;
}

export const useFilters = create<Store>((set, get) => ({
  ...empty,
  toggle: (k, v) => {
    const arr = get()[k];
    const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    set({ [k]: next } as Partial<State>);
  },
  clear: (k) => {
    if (!k) set(empty);
    else set({ [k]: [] } as Partial<State>);
  },
  reset: () => set(empty),
}));
