import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CAMERAS, type CameraId } from "@/config/cameras";

/** grid: 2 × 2. focus: one large, the others in a column beside it. */
export type Layout = "grid" | "focus";

interface ViewStore {
  layout: Layout;
  /** The large camera of the focus layout */
  focused: CameraId;
  /** One camera filling the window, until Esc */
  solo: CameraId | null;
  setLayout: (layout: Layout) => void;
  /** Show this camera large (focus layout) */
  focus: (id: CameraId) => void;
  setSolo: (id: CameraId | null) => void;
}

/**
 * How the cameras are laid out. Layout and focused camera are saved per
 * browser (a kiosk keeps its view across reloads); solo is not.
 */
export const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      layout: "grid",
      focused: CAMERAS[0].id,
      solo: null,
      setLayout: (layout) => set({ layout }),
      focus: (focused) => set({ layout: "focus", focused }),
      setSolo: (solo) => set({ solo }),
    }),
    {
      name: "x30-view",
      version: 1,
      skipHydration: true,
      partialize: ({ layout, focused }) => ({ layout, focused }),
    },
  ),
);
