"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useViewStore } from "@/stores/use-view-store";

/** Reads the saved settings and view once the page is interactive. */
export function StoreHydration() {
  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
    void useViewStore.persist.rehydrate();
  }, []);
  return null;
}
