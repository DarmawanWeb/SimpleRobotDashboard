"use client";

import { CAMERAS } from "@/config/cameras";
import { cn } from "@/lib/utils";
import { useViewStore } from "@/stores/use-view-store";
import { CameraTile } from "./camera-tile";

/** Rows of the side column in the focus layout (Tailwind needs them literal). */
const SIDE_ROWS = ["lg:row-start-1", "lg:row-start-2", "lg:row-start-3"];

/**
 * The four cameras. grid: 2 × 2 filling the screen. focus: the chosen camera
 * large, the other three in a column beside it (stacked on small screens).
 * Tiles keep their DOM order in every layout; only the grid placement
 * changes, so no stream restarts.
 */
export function CameraGrid({ className }: { className?: string }) {
  const layout = useViewStore((s) => s.layout);
  const focused = useViewStore((s) => s.focused);
  const others = CAMERAS.filter((c) => c.id !== focused);

  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:gap-4 lg:p-4",
        layout === "grid" && "sm:grid-cols-2 sm:grid-rows-2",
        layout === "focus" &&
          "lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:grid-rows-3",
        className,
      )}
    >
      {CAMERAS.map((camera, i) => {
        const isFocused = layout === "focus" && camera.id === focused;
        const side = others.findIndex((c) => c.id === camera.id);
        return (
          <CameraTile
            key={camera.id}
            camera={camera}
            index={i + 1}
            className={cn(
              layout === "focus" &&
                (isFocused
                  ? "order-first lg:order-none lg:col-start-1 lg:row-span-3 lg:row-start-1"
                  : cn("lg:col-start-2", SIDE_ROWS[side])),
            )}
          />
        );
      })}
    </div>
  );
}
