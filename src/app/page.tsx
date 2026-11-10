import { AppMark, BuiltBy, Copyright, PartnerLockup } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";
import { BRAND } from "@/config/brand";
import { getBrandLogos } from "@/lib/brand-logos";

export default function Page() {
  const logos = getBrandLogos();

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="card flex flex-col items-center gap-5 px-8 py-7 text-center">
        <div className="flex items-center gap-3">
          <AppMark className="size-10" />
          <div className="text-left leading-tight">
            <h1 className="text-xl font-semibold tracking-tight">
              {BRAND.app.name}
            </h1>
            <p className="text-sm text-fg-3">
              {BRAND.robot.maker} {BRAND.robot.name}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <PartnerLockup logos={logos} />
        <div className="flex flex-col gap-1 text-xs text-fg-muted">
          <BuiltBy logos={logos} />
          <Copyright />
        </div>
      </div>
    </main>
  );
}
