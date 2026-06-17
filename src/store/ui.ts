import { create } from "zustand";

interface UiState {
  highlightedSiteId: string | null;
  setHighlightedSite: (id: string | null) => void;
}

export const useUi = create<UiState>((set) => ({
  highlightedSiteId: null,
  setHighlightedSite: (id) => set({ highlightedSiteId: id }),
}));
