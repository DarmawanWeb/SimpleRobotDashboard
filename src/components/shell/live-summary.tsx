"use client";

import { CAMERAS } from "@/config/cameras";
import { cn } from "@/lib/utils";
import { useLiveCount } from "@/stores/use-stream-store";

/** "● 3/4 live": green when all play, amber when some, red when none. */
export function LiveSummary({ className }: { className?: string }) {
  const live = useLiveCount();
  const total = CAMERAS.length;
  const dot = live === total ? "bg-green" : live > 0 ? "bg-amber" : "bg-red";

  return (
    <span
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-line-subtle bg-surface px-2.5 text-xs font-medium text-fg-2",
        className,
      )}
      title={`${live} of ${total} cameras playing`}
    >
      <span className="relative flex size-1.5">
        {live > 0 && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full animate-ping-soft",
              dot,
            )}
          />
        )}
        <span className={cn("relative size-1.5 rounded-full", dot)} />
      </span>
      <span className="tabular-nums">
        {live}/{total}
      </span>
      live
    </span>
  );
}
