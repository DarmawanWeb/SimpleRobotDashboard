import { create } from "zustand";
import { CAMERAS, type CameraId } from "@/config/cameras";
import { IDLE_STATUS, type StreamStatus } from "@/types/stream";

interface StreamStore {
  statuses: Record<CameraId, StreamStatus>;
  /** Bumped to make a camera's player reconnect */
  nonces: Record<CameraId, number>;
  setStatus: (id: CameraId, status: StreamStatus) => void;
  reconnect: (id: CameraId) => void;
}

function byCamera<T>(value: T): Record<CameraId, T> {
  return Object.fromEntries(CAMERAS.map((c) => [c.id, value])) as Record<
    CameraId,
    T
  >;
}

/** Live status of every camera's stream, as the players report it. */
export const useStreamStore = create<StreamStore>((set) => ({
  statuses: byCamera(IDLE_STATUS),
  nonces: byCamera(0),
  setStatus: (id, status) =>
    set((s) => ({ statuses: { ...s.statuses, [id]: status } })),
  reconnect: (id) =>
    set((s) => ({ nonces: { ...s.nonces, [id]: s.nonces[id] + 1 } })),
}));

/** How many cameras are playing. */
export function useLiveCount(): number {
  return useStreamStore(
    (s) => Object.values(s.statuses).filter((st) => st.state === "live").length,
  );
}
