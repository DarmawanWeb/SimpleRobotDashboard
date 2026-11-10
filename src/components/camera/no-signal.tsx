import { Loader2, RotateCw, VideoOff } from "lucide-react";
import type { Camera } from "@/config/cameras";
import type { StreamStatus } from "@/types/stream";

/**
 * What a tile shows until its picture plays: connecting, or no signal with
 * go2rtc's reason (the player keeps retrying on its own).
 */
export function NoSignal({
  camera,
  status,
  onRetry,
}: {
  camera: Camera;
  status: StreamStatus;
  onRetry: () => void;
}) {
  const offline = status.state === "offline";

  return (
    <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
      {/* faint scan lines, so an empty screen still reads as a screen */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div className="relative flex max-w-sm flex-col items-center gap-2">
        {offline ? (
          <VideoOff className="size-7 text-white/50" />
        ) : (
          <Loader2 className="size-7 animate-spin text-white/50" />
        )}
        <div className="text-sm font-semibold">
          {offline
            ? "No signal"
            : `Connecting to ${camera.label.toLowerCase()}…`}
        </div>
        {offline && status.error && (
          <p className="line-clamp-2 font-mono text-[0.7rem] text-white/50">
            {status.error}
          </p>
        )}
        {offline && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 inline-flex h-7 items-center gap-1.5 rounded-md border border-white/15 px-2.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCw className="size-3.5" />
            Retry now
          </button>
        )}
      </div>
    </div>
  );
}
