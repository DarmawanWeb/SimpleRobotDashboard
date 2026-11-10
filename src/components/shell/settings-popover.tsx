"use client";

import { Server, Settings2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { CAMERAS } from "@/config/cameras";
import { useServerInfo } from "@/hooks/use-server-info";
import { useServerUrl } from "@/hooks/use-server-url";
import { defaultServerUrl, normalizeServerUrl } from "@/lib/go2rtc/server";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

function ServerStatus({ server }: { server: string | null }) {
  const state = useServerInfo(server);
  const { dot, text } =
    state.status === "online"
      ? { dot: "bg-green", text: `Connected · go2rtc ${state.info.version}` }
      : state.status === "offline"
        ? { dot: "bg-red", text: "Not reachable" }
        : { dot: "bg-amber animate-pulse-dot", text: "Checking…" };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-2">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {text}
    </span>
  );
}

/**
 * The stream server (go2rtc) to play from, saved per browser / desktop
 * install. The cameras' RTSP addresses live in go2rtc's own config.
 */
export function SettingsPopover() {
  const inputId = useId();
  const server = useServerUrl();
  const saved = useSettingsStore((s) => s.serverUrl);
  const setServerUrl = useSettingsStore((s) => s.setServerUrl);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
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

  const normalized = normalizeServerUrl(draft);
  const invalid = draft.trim() !== "" && normalized === null;

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        onClick={() => {
          setDraft(saved);
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
          className="absolute top-10 right-0 z-40 w-80 animate-fade-in rounded-xl border border-line-subtle bg-surface p-4 shadow-card-lg"
        >
          <div className="mb-3 flex items-center gap-2">
            <Server className="size-4 text-fg-3" />
            <h2 className="text-sm font-semibold">Stream server</h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (invalid) return;
              setServerUrl(normalized ?? "");
              setOpen(false);
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor={inputId} className="text-xs text-fg-3">
                go2rtc address
              </label>
              <input
                id={inputId}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={defaultServerUrl()}
                spellCheck={false}
                autoComplete="off"
                className={cn(
                  "h-9 rounded-lg border bg-surface px-3 font-mono text-[0.8rem] outline-none transition-[border-color,box-shadow] placeholder:text-fg-muted focus:ring-3",
                  invalid
                    ? "border-red focus:ring-red/15"
                    : "border-line focus:border-brand focus:ring-brand/15",
                )}
              />
              <span className="text-[0.7rem] text-fg-muted">
                Empty uses the default above. Streams it must have:{" "}
                <span className="font-mono">
                  {CAMERAS.map((c) => c.stream).join(", ")}
                </span>
              </span>
            </div>

            <ServerStatus server={server} />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft("")}
                className="h-8 rounded-lg px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={invalid}
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
