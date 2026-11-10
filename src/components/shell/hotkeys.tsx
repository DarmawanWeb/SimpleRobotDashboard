"use client";

import { useEffect } from "react";
import { CAMERAS } from "@/config/cameras";
import { toggleFullscreen } from "@/hooks/use-fullscreen";
import { useViewStore } from "@/stores/use-view-store";

function typing(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Keyboard: 1–4 shows that camera large, G (or 0) the grid, F fullscreen,
 * Esc leaves a camera that fills the window.
 */
export function Hotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      const view = useViewStore.getState();
      const key = e.key.toLowerCase();

      const index = Number.parseInt(key, 10);
      if (index >= 1 && index <= CAMERAS.length) {
        view.setSolo(null);
        view.focus(CAMERAS[index - 1].id);
      } else if (key === "g" || key === "0") {
        view.setSolo(null);
        view.setLayout("grid");
      } else if (key === "f") {
        void toggleFullscreen();
      } else if (key === "escape" && view.solo) {
        view.setSolo(null);
      } else {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
