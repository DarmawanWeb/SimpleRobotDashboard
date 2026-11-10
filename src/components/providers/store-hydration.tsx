"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/use-settings-store";

/** Reads the saved settings once the page is interactive. */
export function StoreHydration() {
  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
  }, []);
  return null;
}
