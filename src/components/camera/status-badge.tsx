import { cn } from "@/lib/utils";
import type { StreamMode, StreamStatus } from "@/types/stream";

const MODE_LABEL: Record<StreamMode, string> = {
  webrtc: "WebRTC",
  mse: "MSE",
  hls: "HLS",
  mjpeg: "MJPEG",
};

const STATE = {
  live: { label: "Live", dot: "bg-green" },
  connecting: { label: "Connecting", dot: "bg-amber animate-pulse-dot" },
  offline: { label: "No signal", dot: "bg-red" },
  idle: { label: "Waiting", dot: "bg-white/40" },
} as const;

/** "● Live · WebRTC" on the picture (dark glass, for any video). */
export function StatusBadge({
  status,
  className,
}: {
  status: StreamStatus;
  className?: string;
}) {
  const style = STATE[status.state];
  const mode =
    status.state === "live" && status.mode ? MODE_LABEL[status.mode] : null;

  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-black/55 px-2 text-xs font-medium text-white backdrop-blur-md",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
      {mode && <span className="text-white/60">· {mode}</span>}
    </span>
  );
}
