"use client";

import { useEffect, useRef } from "react";
import { CAMERAS, type CameraId } from "@/config/cameras";
import { useServerUrl } from "@/hooks/use-server-url";
import {
  fetchServerInfo,
  listStreamSources,
  setStreamSource,
} from "@/lib/go2rtc/server";
import { useServerStore } from "@/stores/use-server-store";
import {
  type CameraSources,
  useSettingsStore,
} from "@/stores/use-settings-store";
import { useStreamStore } from "@/stores/use-stream-store";

const POLL_MS = 10_000;

/**
 * Hand the RTSP addresses set in the app to go2rtc (all of them, or `only`
 * these cameras), then let the players reconnect to the new source.
 * Cameras without an address keep what go2rtc's own config says.
 */
async function pushSources(
  server: string,
  sources: CameraSources,
  only?: readonly CameraId[],
): Promise<void> {
  const store = useServerStore.getState();
  const errors = { ...store.sourceErrors };

  for (const camera of CAMERAS) {
    if (only && !only.includes(camera.id)) continue;
    const source = sources[camera.id]?.trim();
    if (!source) {
      delete errors[camera.id];
      continue;
    }
    const result = await setStreamSource(server, camera.stream, source);
    if (result.ok) {
      delete errors[camera.id];
      useStreamStore.getState().reconnect(camera.id);
    } else {
      errors[camera.id] = result.error;
    }
  }

  store.set({ sourceErrors: errors });
  const listed = await listStreamSources(server);
  if (listed) useServerStore.getState().set({ sources: listed });
}

/**
 * Watches the stream server: whether go2rtc answers (for the settings and
 * the top bar), and keeps it playing the cameras set in the app. go2rtc
 * forgets them when it restarts with a read-only config, so they are handed
 * over again every time it comes (back) online, and whenever they change.
 */
export function ServerWatch() {
  const server = useServerUrl();
  const sources = useSettingsStore((s) => s.sources);
  const previous = useRef<CameraSources | null>(null);

  useEffect(() => {
    if (!server) return;
    let alive = true;
    let online = false;
    const controller = new AbortController();
    const store = useServerStore.getState();
    store.set({ status: "checking", version: null, sources: {} });

    const check = async () => {
      const info = await fetchServerInfo(server, controller.signal);
      if (!alive) return;
      if (!info) {
        online = false;
        store.set({ status: "offline", version: null });
        return;
      }
      store.set({ status: "online", version: info.version });
      if (!online) {
        online = true;
        await pushSources(server, useSettingsStore.getState().sources);
      } else {
        const listed = await listStreamSources(server, controller.signal);
        if (alive && listed) store.set({ sources: listed });
      }
    };

    void check();
    const timer = window.setInterval(() => void check(), POLL_MS);
    return () => {
      alive = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [server]);

  // addresses changed in the settings: hand over the ones that changed
  useEffect(() => {
    const before = previous.current;
    previous.current = sources;
    if (!server || before === null) return;
    const changed = CAMERAS.filter(
      (c) => (sources[c.id] ?? "") !== (before[c.id] ?? ""),
    ).map((c) => c.id);
    if (changed.length > 0) void pushSources(server, sources, changed);
  }, [server, sources]);

  return null;
}
