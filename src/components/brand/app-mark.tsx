import { cn } from "@/lib/utils";

/**
 * The app's own mark: a lens in a scan frame on the brand gradient (the
 * one gradient in the UI). src/app/icon.svg is the same drawing.
 */
export function AppMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-lg bg-gradient-brand text-on-brand",
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className="size-[70%]"
        fill="none"
        role="presentation"
      >
        <g
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 24v-7a3 3 0 0 1 3-3h7M40 14h7a3 3 0 0 1 3 3v7M50 40v7a3 3 0 0 1-3 3h-7M24 50h-7a3 3 0 0 1-3-3v-7" />
          <circle cx="32" cy="32" r="8" />
        </g>
        <circle cx="32" cy="32" r="2.75" fill="currentColor" />
      </svg>
    </span>
  );
}
