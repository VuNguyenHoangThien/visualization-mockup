import { create } from "zustand";

type ThemeState = {
  theme: "light" | "dark";
  toggle: () => void;
  setTheme: (t: "light" | "dark") => void;
};

const apply = (t: "light" | "dark") => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
};

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "light",
  toggle: () => {
    const next = get().theme === "light" ? "dark" : "light";
    apply(next);
    set({ theme: next });
  },
  setTheme: (t) => {
    apply(t);
    set({ theme: t });
  },
}));
