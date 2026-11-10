import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  /** go2rtc address chosen in the app; empty: the default (lib/go2rtc/server) */
  serverUrl: string;
  setServerUrl: (serverUrl: string) => void;
}

/**
 * Settings saved per browser / desktop install. Read from storage after the
 * first render (StoreHydration), so the server HTML and the first client
 * render agree.
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      serverUrl: "",
      setServerUrl: (serverUrl) => set({ serverUrl }),
    }),
    { name: "x30-settings", version: 1, skipHydration: true },
  ),
);

/** True once the saved settings were read. */
export function useSettingsHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useSettingsStore.persist.onFinishHydration(onChange),
    () => useSettingsStore.persist.hasHydrated(),
    () => false,
  );
}
