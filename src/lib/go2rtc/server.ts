/**
 * The go2rtc server the dashboard plays from: where it is, the WebSocket
 * URL of a stream, and a quick "is it there" check.
 */

import { ENV } from "@/config/env";

/** go2rtc's default API / WebSocket port. */
export const GO2RTC_PORT = 1984;

/** Running inside the Tauri desktop app (no web server of our own). */
export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** "192.168.1.10:1984/" → "http://192.168.1.10:1984"; null if not a URL. */
export function normalizeServerUrl(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(text)
    ? text
    : `http://${text}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

/**
 * Where go2rtc is when nothing is saved: the build's NEXT_PUBLIC_GO2RTC_URL,
 * else the host serving this page on go2rtc's port (docker-compose runs both
 * on one machine), else this machine (the desktop app).
 */
export function defaultServerUrl(): string {
  const fromEnv = normalizeServerUrl(ENV.go2rtcUrl);
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  const { protocol, hostname } = window.location;
  if (!isDesktopApp() && (protocol === "http:" || protocol === "https:")) {
    return `${protocol}//${hostname}:${GO2RTC_PORT}`;
  }
  return `http://127.0.0.1:${GO2RTC_PORT}`;
}

/** The player's WebSocket URL for a go2rtc stream (http is fine: it converts). */
export function streamUrl(server: string, stream: string): string {
  return `${server}/api/ws?src=${encodeURIComponent(stream)}`;
}

export interface ServerInfo {
  version: string;
}

/** go2rtc's version, or null when it does not answer. */
export async function fetchServerInfo(
  server: string,
  signal?: AbortSignal,
): Promise<ServerInfo | null> {
  try {
    const res = await fetch(`${server}/api`, { signal, cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { version?: unknown };
    return { version: typeof body.version === "string" ? body.version : "?" };
  } catch {
    return null;
  }
}

/** A go2rtc stream as GET /api/streams lists it. */
interface StreamListing {
  producers?: Array<{ url?: string }> | null;
}

/** The source URL of every stream go2rtc has (null when it does not answer). */
export async function listStreamSources(
  server: string,
  signal?: AbortSignal,
): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`${server}/api/streams`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as Record<string, StreamListing | null>;
    return Object.fromEntries(
      Object.entries(body).map(([name, stream]) => [
        name,
        stream?.producers?.[0]?.url ?? "",
      ]),
    );
  } catch {
    return null;
  }
}

/**
 * Point a go2rtc stream at a camera (PUT /api/streams). go2rtc applies it at
 * once, then tries to write it into its config file too: with a read-only
 * config (docker-compose.yml) only that last part fails, and the stream
 * still plays until go2rtc restarts (the dashboard sets it again then).
 */
export async function setStreamSource(
  server: string,
  name: string,
  source: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const query = new URLSearchParams({ name, src: source });
  let res: Response;
  try {
    res = await fetch(`${server}/api/streams?${query}`, { method: "PUT" });
  } catch {
    return { ok: false, error: "Can't reach the stream server" };
  }
  if (res.ok) return { ok: true };

  const error = (await res.text()).trim();
  if (/config|read-only|file system/i.test(error)) return { ok: true };
  const sources = await listStreamSources(server);
  if (sources?.[name] === source) return { ok: true };
  return { ok: false, error: error || `HTTP ${res.status}` };
}
