import { create } from "zustand";
import { DEFAULT_THEME_MODE } from "@/lib/theme";
import type { ResolvedTheme, ThemeMode } from "@/types/theme";

interface ThemeStore {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setTheme: (mode: ThemeMode, resolved: ResolvedTheme) => void;
}

/** The theme as React sees it; lib/theme.ts keeps <html> in step. */
export const useThemeStore = create<ThemeStore>((set) => ({
  mode: DEFAULT_THEME_MODE,
  resolved: "dark",
  setTheme: (mode, resolved) => set({ mode, resolved }),
}));
