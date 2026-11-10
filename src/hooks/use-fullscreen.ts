"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

/** Whether the page fills the screen (browser fullscreen). */
export function useIsFullscreen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement !== null,
    () => false,
  );
}

/** Fill the screen with the page, or leave fullscreen. */
export async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // not allowed here (an iframe, a webview without fullscreen): ignore
  }
}
