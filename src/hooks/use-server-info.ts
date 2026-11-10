"use client";

import { useEffect, useState } from "react";
import { fetchServerInfo, type ServerInfo } from "@/lib/go2rtc/server";

export type ServerState =
  | { status: "checking" }
  | { status: "online"; info: ServerInfo }
  | { status: "offline" };

const POLL_MS = 15_000;

/** Whether go2rtc answers at `server`, checked now and every 15 s. */
export function useServerInfo(server: string | null): ServerState {
  const [state, setState] = useState<ServerState>({ status: "checking" });

  useEffect(() => {
    if (!server) return;
    let alive = true;
    const controller = new AbortController();
    setState({ status: "checking" });

    const check = async () => {
      const info = await fetchServerInfo(server, controller.signal);
      if (alive)
        setState(info ? { status: "online", info } : { status: "offline" });
    };
    void check();
    const timer = window.setInterval(check, POLL_MS);
    return () => {
      alive = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [server]);

  return state;
}
