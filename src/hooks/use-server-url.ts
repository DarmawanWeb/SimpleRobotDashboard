"use client";

import { defaultServerUrl } from "@/lib/go2rtc/server";
import {
  useSettingsHydrated,
  useSettingsStore,
} from "@/stores/use-settings-store";

/**
 * The go2rtc address to play from: the one saved in the app, else the
 * default. Null until the saved settings are read, so no player connects
 * to the wrong server first.
 */
export function useServerUrl(): string | null {
  const saved = useSettingsStore((s) => s.serverUrl);
  const hydrated = useSettingsHydrated();
  if (!hydrated) return null;
  return saved || defaultServerUrl();
}
