"use client";

import { Cctv, Server, Settings2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { CameraIcon } from "@/components/camera/camera-icon";
import { IconButton } from "@/components/ui/icon-button";
import { CAMERAS, type CameraId } from "@/config/cameras";
import { defaultServerUrl, normalizeServerUrl } from "@/lib/go2rtc/server";
import { cn } from "@/lib/utils";
import { useServerStore } from "@/stores/use-server-store";
import {
  type CameraSources,
  useSettingsStore,
} from "@/stores/use-settings-store";
import { useStreamStore } from "@/stores/use-stream-store";

/** A camera address needs its scheme (rtsp://, rtsps://, ffmpeg:…). */
function validSource(value: string): boolean {
  const text = value.trim();
  return text === "" || /^[a-z][a-z\d+.-]*:/i.test(text);
}

const INPUT =
  "h-9 w-full min-w-0 rounded-lg border bg-surface px-3 font-mono text-[0.8rem] outline-none transition-[border-color,box-shadow] placeholder:text-fg-muted focus:ring-3";

function inputTone(invalid: boolean): string {
  return invalid
    ? "border-red focus:ring-red/15"
    : "border-line focus:border-brand focus:ring-brand/15";
}

function ServerStatusLine() {
  const status = useServerStore((s) => s.status);
  const version = useServerStore((s) => s.version);
  const { dot, text } =
    status === "online"
      ? { dot: "bg-green", text: `Connected · go2rtc ${version ?? ""}` }
      : status === "offline"
        ? { dot: "bg-red", text: "Not reachable" }
        : { dot: "bg-amber animate-pulse-dot", text: "Checking…" };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-2">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {text}
    </span>
  );
}

function CameraSourceField({
  id,
  value,
  onChange,
}: {
  id: CameraId;
  value: string;
  onChange: (value: string) => void;
}) {
  const camera = CAMERAS.find((c) => c.id === id);
  const inputId = useId();
  const state = useStreamStore((s) => s.statuses[id].state);
  const current = useServerStore((s) =>
    camera ? s.sources[camera.stream] : undefined,
  );
  const error = useServerStore((s) => s.sourceErrors[id]);
  if (!camera) return null;

  const invalid = !validSource(value);
  // an unset ${VAR} in go2rtc.yaml shows up as the placeholder text itself
  const fromConfig = current && !current.includes("${") ? current : "";
  const dot =
    state === "live"
      ? "bg-green"
      : state === "offline"
        ? "bg-red"
        : "bg-fg-muted";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-xs text-fg-2"
      >
        <CameraIcon kind={camera.kind} className="size-3.5 text-fg-3" />
        {camera.label}
        <span className={cn("ml-auto size-1.5 rounded-full", dot)} />
      </label>
      <input
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fromConfig || "rtsp://user:password@192.168.1.64:554/…"}
        spellCheck={false}
        autoComplete="off"
        className={cn(INPUT, inputTone(invalid))}
      />
      {invalid && (
        <span className="text-[0.7rem] text-red">
          Start with the scheme, e.g. rtsp://
        </span>
      )}
      {!invalid && error && (
        <span className="line-clamp-2 font-mono text-[0.7rem] text-red">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Settings: the stream server (go2rtc) to play from, and each camera's RTSP
 * address, handed to go2rtc. Saved per browser / desktop install; an empty
 * address leaves the camera to go2rtc's own config.
 */
export function SettingsPanel() {
  const serverInputId = useId();
  const savedServer = useSettingsStore((s) => s.serverUrl);
  const savedSources = useSettingsStore((s) => s.sources);
  const setServerUrl = useSettingsStore((s) => s.setServerUrl);
  const setSources = useSettingsStore((s) => s.setSources);
  const [open, setOpen] = useState(false);
  const [server, setServer] = useState("");
  const [sources, setSourceDrafts] = useState<CameraSources>({});
  const rootRef = useRef<HTMLDivElement>(null);

  // close on Esc or a click outside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const normalizedServer = normalizeServerUrl(server);
  const serverInvalid = server.trim() !== "" && normalizedServer === null;
  const sourcesInvalid = CAMERAS.some((c) => !validSource(sources[c.id] ?? ""));

  const save = () => {
    if (serverInvalid || sourcesInvalid) return;
    setServerUrl(normalizedServer ?? "");
    setSources(
      Object.fromEntries(
        CAMERAS.map((c) => [c.id, sources[c.id]?.trim() ?? ""]).filter(
          ([, url]) => url,
        ),
      ),
    );
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        onClick={() => {
          setServer(savedServer);
          setSourceDrafts(savedSources);
          setOpen((o) => !o);
        }}
        active={open}
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Settings"
      >
        <Settings2 />
      </IconButton>

      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute top-10 right-0 z-40 max-h-[calc(100dvh-4.5rem)] w-[min(26rem,calc(100vw-1.5rem))] animate-fade-in overflow-y-auto rounded-xl border border-line-subtle bg-surface shadow-card-lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <section className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-fg-3" />
                <h2 className="text-sm font-semibold">Stream server</h2>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={serverInputId} className="text-xs text-fg-3">
                  go2rtc address
                </label>
                <input
                  id={serverInputId}
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  placeholder={defaultServerUrl()}
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(INPUT, inputTone(serverInvalid))}
                />
              </div>
              <ServerStatusLine />
            </section>

            <section className="flex flex-col gap-3 border-t border-line-subtle p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Cctv className="size-4 text-fg-3" />
                  <h2 className="text-sm font-semibold">Cameras</h2>
                </div>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-fg-muted">
                  RTSP addresses, handed to go2rtc. Empty: go2rtc&apos;s own
                  config (.env) decides; its current address shows greyed out.
                </p>
              </div>
              {CAMERAS.map((camera) => (
                <CameraSourceField
                  key={camera.id}
                  id={camera.id}
                  value={sources[camera.id] ?? ""}
                  onChange={(value) =>
                    setSourceDrafts((s) => ({ ...s, [camera.id]: value }))
                  }
                />
              ))}
            </section>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line-subtle bg-surface p-3">
              <button
                type="button"
                onClick={() => {
                  setServer("");
                  setSourceDrafts({});
                }}
                className="h-8 rounded-lg px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
              >
                Clear all
              </button>
              <button
                type="submit"
                disabled={serverInvalid || sourcesInvalid}
                className="h-8 rounded-lg bg-brand px-3 text-xs font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
