"use client";

import { Moon, Sun } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

/** One button that flips light ↔ dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const hydrated = useHydrated();
  const dark = !hydrated || resolved === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-2",
        "transition-colors hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          "absolute size-4 transition-all duration-300",
          dark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute size-4 transition-all duration-300",
          dark ? "scale-100 rotate-0" : "scale-0 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
