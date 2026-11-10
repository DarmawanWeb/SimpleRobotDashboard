"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Time and date, for a display that runs all day. */
export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--:--";
  const date = now
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now)
    : "";

  return (
    <div className={cn("flex flex-col items-end leading-tight", className)}>
      <span
        className="font-mono text-[0.85rem] font-medium tabular-nums"
        suppressHydrationWarning
      >
        {time}
      </span>
      <span className="text-[0.68rem] text-fg-3" suppressHydrationWarning>
        {date}
      </span>
    </div>
  );
}
