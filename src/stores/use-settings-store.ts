import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CameraId } from "@/config/cameras";

export type CameraSources = Partial<Record<CameraId, string>>;

interface SettingsStore {
  /** go2rtc address chosen in the app; empty: the default (lib/go2rtc/server) */
  serverUrl: string;
  /**
   * RTSP address per camera, set in the app and handed to go2rtc. Empty:
   * go2rtc's own config decides (docker/go2rtc.yaml, .env).
   */
  sources: CameraSources;
  setServerUrl: (serverUrl: string) => void;
  setSources: (sources: CameraSources) => void;
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
      sources: {},
      setServerUrl: (serverUrl) => set({ serverUrl }),
      setSources: (sources) => set({ sources }),
    }),
    {
      name: "x30-settings",
      version: 2,
      skipHydration: true,
      // v1 had the server only
      migrate: (saved) => {
        const state = (saved ?? {}) as Partial<SettingsStore>;
        return {
          serverUrl: state.serverUrl ?? "",
          sources: state.sources ?? {},
        };
      },
      partialize: ({ serverUrl, sources }) => ({ serverUrl, sources }),
    },
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
