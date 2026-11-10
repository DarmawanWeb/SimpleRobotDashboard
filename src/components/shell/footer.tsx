import { BuiltBy, Copyright, PartnerLockup } from "@/components/brand";
import type { BrandLogos } from "@/types/brand";

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface px-1 font-sans text-[0.65rem] text-fg-2">
      {children}
    </kbd>
  );
}

/** Built by B401 ITS · shortcuts · © ITS × Ezra Robotics */
export function Footer({ logos }: { logos: BrandLogos }) {
  return (
    <footer className="@container shrink-0 border-t border-line-subtle px-3 text-xs text-fg-muted lg:px-4">
      <div className="flex min-h-9 flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center @3xl:justify-between @3xl:py-0">
        <BuiltBy logos={logos} />
        <span className="hidden items-center gap-1.5 @5xl:flex">
          <Key>1</Key>–<Key>4</Key> large
          <span className="text-line-strong">·</span>
          <Key>G</Key> grid
          <span className="text-line-strong">·</span>
          <Key>F</Key> fullscreen
          <span className="text-line-strong">·</span>
          double-click a camera to fill the window
        </span>
        {/* the top bar shows the partners on wide screens */}
        <PartnerLockup
          logos={logos}
          className="@3xl:hidden"
          logoClassName="h-5 text-xs"
        />
        <Copyright className="hidden @3xl:inline" />
      </div>
    </footer>
  );
}
