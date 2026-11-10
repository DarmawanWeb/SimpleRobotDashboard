"use client";

import type { CSSProperties } from "react";
import type { Camera } from "@/config/cameras";
import { useServerUrl } from "@/hooks/use-server-url";
import { streamUrl } from "@/lib/go2rtc/server";
import { cn } from "@/lib/utils";
import { useStreamStore } from "@/stores/use-stream-store";
import { useViewStore } from "@/stores/use-view-store";
import { CameraIcon } from "./camera-icon";
import { NoSignal } from "./no-signal";
import { StatusBadge } from "./status-badge";
import { StreamPlayer } from "./stream-player";
import { TileActions } from "./tile-actions";

/**
 * One camera: its live picture on a dark screen, the name and status on
 * top, the device and picture size below, actions on hover. The element
 * never moves in the DOM when the layout changes (only its grid placement
 * does), so the video keeps playing.
 */
export function CameraTile({
  camera,
  index,
  className,
  style,
}: {
  camera: Camera;
  /** 1-based, for the keyboard shortcut hint */
  index: number;
  className?: string;
  style?: CSSProperties;
}) {
  const server = useServerUrl();
  const status = useStreamStore((s) => s.statuses[camera.id]);
  const nonce = useStreamStore((s) => s.nonces[camera.id]);
  const setStatus = useStreamStore((s) => s.setStatus);
  const reconnect = useStreamStore((s) => s.reconnect);
  const layout = useViewStore((s) => s.layout);
  const focusedId = useViewStore((s) => s.focused);
  const soloId = useViewStore((s) => s.solo);
  const focus = useViewStore((s) => s.focus);
  const setSolo = useViewStore((s) => s.setSolo);

  const solo = soloId === camera.id;
  const focused = layout === "focus" && focusedId === camera.id;
  const live = status.state === "live";
  const size =
    status.width && status.height ? `${status.width}×${status.height}` : null;

  return (
    <section
      aria-label={camera.label}
      onDoubleClick={() => setSolo(solo ? null : camera.id)}
      style={style}
      className={cn(
        "group relative isolate min-h-0 min-w-0 overflow-hidden rounded-xl border border-line-subtle bg-video shadow-card",
        "aspect-video sm:aspect-auto",
        solo && "fixed inset-0 z-50 rounded-none border-0 sm:aspect-auto",
        className,
      )}
    >
      <StreamPlayer
        src={server ? streamUrl(server, camera.stream) : null}
        nonce={nonce}
        onStatus={(next) => setStatus(camera.id, next)}
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          live ? "opacity-100" : "opacity-0",
        )}
      />

      {!live && (
        <NoSignal
          camera={camera}
          status={status}
          onRetry={() => reconnect(camera.id)}
        />
      )}

      {/* legibility of the text on bright pictures */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
        <span className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md bg-black/55 px-2 text-xs font-medium text-white backdrop-blur-md">
          <CameraIcon kind={camera.kind} className="size-3.5 shrink-0" />
          <span className="truncate">{camera.label}</span>
          <kbd className="hidden font-sans text-[0.65rem] text-white/45 lg:inline">
            {index}
          </kbd>
        </span>
        <StatusBadge status={status} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
        <span className="pointer-events-none min-w-0 truncate text-[0.7rem] text-white/60">
          {camera.device}
        </span>
        {/* the picture size, swapped for the actions on hover (always on touch) */}
        <div className="grid shrink-0 place-items-end">
          {size && (
            <span className="pointer-events-none col-start-1 row-start-1 pb-1 font-mono text-[0.65rem] text-white/50 tabular-nums transition-opacity group-focus-within:opacity-0 group-hover:opacity-0 pointer-coarse:opacity-0">
              {size}
            </span>
          )}
          <TileActions
            focused={focused}
            solo={solo}
            onReconnect={() => reconnect(camera.id)}
            onFocus={() => focus(camera.id)}
            onSolo={() => setSolo(solo ? null : camera.id)}
            className="col-start-1 row-start-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
          />
        </div>
      </div>
    </section>
  );
}
