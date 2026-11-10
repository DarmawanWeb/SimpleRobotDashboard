"use client";

import { Maximize, Minimize } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { toggleFullscreen, useIsFullscreen } from "@/hooks/use-fullscreen";

/** Fill the screen (F). */
export function FullscreenButton({ className }: { className?: string }) {
  const fullscreen = useIsFullscreen();
  const label = fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)";

  return (
    <IconButton
      onClick={() => void toggleFullscreen()}
      aria-label={label}
      title={label}
      className={className}
    >
      {fullscreen ? <Minimize /> : <Maximize />}
    </IconButton>
  );
}
