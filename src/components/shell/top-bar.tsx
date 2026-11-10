import { AppMark, PartnerLockup } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";
import { BRAND } from "@/config/brand";
import type { BrandLogos } from "@/types/brand";
import { FullscreenButton } from "./fullscreen-button";
import { LayoutSwitch } from "./layout-switch";
import { LiveClock } from "./live-clock";
import { LiveSummary } from "./live-summary";
import { SettingsPopover } from "./settings-popover";

/**
 * The app and robot on the left, ITS × Ezra Robotics in the middle, the
 * cameras' state, clock and view controls on the right.
 */
export function TopBar({ logos }: { logos: BrandLogos }) {
  return (
    <header className="@container relative z-30 shrink-0 border-b border-line-subtle bg-bg/80 backdrop-blur-xl">
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 lg:px-4 @3xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <AppMark className="size-8" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[0.95rem] font-semibold tracking-tight">
              {BRAND.app.name}
            </div>
            <div className="hidden truncate text-[0.7rem] text-fg-3 @md:block">
              {BRAND.robot.maker} {BRAND.robot.name} · {BRAND.app.tagline}
            </div>
          </div>
        </div>

        <PartnerLockup
          logos={logos}
          className="hidden @3xl:flex"
          logoClassName="h-7 text-[0.95rem]"
        />

        <div className="flex min-w-0 items-center justify-end gap-1.5 @3xl:col-start-3">
          <LiveSummary className="hidden @lg:inline-flex" />
          <LiveClock className="hidden px-2 @5xl:flex" />
          <LayoutSwitch className="hidden @md:inline-flex" />
          <SettingsPopover />
          <ThemeToggle />
          <FullscreenButton className="hidden @md:inline-flex" />
        </div>
      </div>
    </header>
  );
}
