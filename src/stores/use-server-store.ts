import { create } from "zustand";

export type ServerStatus = "checking" | "online" | "offline";

interface ServerStore {
  status: ServerStatus;
  /** go2rtc's version, once it answered */
  version: string | null;
  /** The cameras' RTSP addresses as go2rtc has them right now */
  sources: Record<string, string>;
  /** Why setting a camera's address failed, by camera */
  sourceErrors: Record<string, string>;
  set: (patch: Partial<Omit<ServerStore, "set">>) => void;
}

/** The stream server as ServerWatch last saw it. */
export const useServerStore = create<ServerStore>((set) => ({
  status: "checking",
  version: null,
  sources: {},
  sourceErrors: {},
  set: (patch) => set(patch),
}));
