import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A quiet square button for the top bar. */
export function IconButton({
  className,
  active = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg [&>svg]:size-4",
        active && "bg-surface-2 text-fg",
        className,
      )}
      {...props}
    />
  );
}
