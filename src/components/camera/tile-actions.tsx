import { Maximize, Minimize, PictureInPicture2, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-7 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white [&>svg]:size-3.5"
    >
      {children}
    </button>
  );
}

/** Reconnect, show large, fill the window: on hover (always on touch). */
export function TileActions({
  focused,
  solo,
  onReconnect,
  onFocus,
  onSolo,
  className,
}: {
  /** Already the large camera of the focus layout */
  focused: boolean;
  solo: boolean;
  onReconnect: () => void;
  onFocus: () => void;
  onSolo: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-md bg-black/55 p-0.5 backdrop-blur-md",
        className,
      )}
    >
      <ActionButton label="Reconnect" onClick={onReconnect}>
        <RotateCw />
      </ActionButton>
      {!focused && !solo && (
        <ActionButton label="Show large" onClick={onFocus}>
          <PictureInPicture2 />
        </ActionButton>
      )}
      <ActionButton
        label={solo ? "Exit full view (Esc)" : "Full view"}
        onClick={onSolo}
      >
        {solo ? <Minimize /> : <Maximize />}
      </ActionButton>
    </div>
  );
}
