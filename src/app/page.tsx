import { AppMark, PartnerLockup } from "@/components/brand";
import { CameraGrid } from "@/components/camera";
import { ThemeToggle } from "@/components/theme";
import { BRAND } from "@/config/brand";
import { getBrandLogos } from "@/lib/brand-logos";

export default function Page() {
  const logos = getBrandLogos();

  return (
    <div className="flex min-h-dvh flex-col sm:h-dvh">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line-subtle px-4">
        <AppMark className="size-8" />
        <span className="font-semibold tracking-tight">{BRAND.app.name}</span>
        <PartnerLockup logos={logos} className="ml-auto" />
        <ThemeToggle />
      </header>
      <CameraGrid />
    </div>
  );
}
