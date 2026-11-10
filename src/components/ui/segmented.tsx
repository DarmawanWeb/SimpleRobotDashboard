import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
  /** Tooltip, e.g. with the keyboard shortcut */
  title?: string;
}

/** Icon segmented control (one of a few views). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name of the group */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-lg bg-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a styled segmented control, not a native radio
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.title ?? option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "grid h-full w-8 place-items-center rounded-md transition-colors [&>svg]:size-4",
              active
                ? "bg-surface text-fg shadow-card ring-1 ring-line-subtle"
                : "text-fg-3 hover:text-fg",
            )}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
