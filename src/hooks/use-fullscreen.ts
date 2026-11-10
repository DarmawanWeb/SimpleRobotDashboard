"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isDesktopApp } from "@/lib/go2rtc/server";

/*
 * Fullscreen in two worlds: the browser's Fullscreen API on the web, the
 * window's own fullscreen in the desktop app (the webview may not offer
 * the API). The desktop state is mirrored here, because it changes outside
 * the page too (macOS green button, Esc).
 */

let desktopFullscreen = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

async function desktopWindow() {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  document.addEventListener("fullscreenchange", onChange);
  return () => {
    listeners.delete(onChange);
    document.removeEventListener("fullscreenchange", onChange);
  };
}

function snapshot(): boolean {
  return isDesktopApp()
    ? desktopFullscreen
    : document.fullscreenElement !== null;
}

/** Whether the dashboard fills the screen. */
export function useIsFullscreen(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

/** Keep the desktop window's fullscreen state in step (mount once). */
export function useDesktopFullscreenSync(): void {
  useEffect(() => {
    if (!isDesktopApp()) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void desktopWindow().then(async (win) => {
      const read = async () => {
        desktopFullscreen = await win.isFullscreen();
        notify();
      };
      await read();
      const unlisten = await win.onResized(() => void read());
      if (cancelled) unlisten();
      else stop = unlisten;
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);
}

/** Fill the screen with the dashboard, or leave fullscreen. */
export async function setFullscreen(on: boolean): Promise<void> {
  try {
    if (isDesktopApp()) {
      const win = await desktopWindow();
      await win.setFullscreen(on);
      desktopFullscreen = on;
      notify();
    } else if (on && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else if (!on && document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {
    // not allowed here (an iframe, a restricted webview): ignore
  }
}

export async function toggleFullscreen(): Promise<void> {
  await setFullscreen(!snapshot());
}

/** Whether fullscreen is on right now (outside React). */
export function isFullscreen(): boolean {
  return snapshot();
}
