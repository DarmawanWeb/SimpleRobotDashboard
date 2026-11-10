"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False while the server HTML hydrates, true from the next render on. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
