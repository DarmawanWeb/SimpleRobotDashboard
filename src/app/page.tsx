import { CameraGrid } from "@/components/camera";
import { Footer, Hotkeys, TopBar } from "@/components/shell";
import { getBrandLogos } from "@/lib/brand-logos";

/** The camera wall: top bar, the four cameras, credits. */
export default function Page() {
  const logos = getBrandLogos();

  return (
    <div className="flex min-h-dvh flex-col sm:h-dvh">
      <TopBar logos={logos} />
      <main className="flex min-h-0 flex-1 flex-col">
        <CameraGrid />
      </main>
      <Footer logos={logos} />
      <Hotkeys />
    </div>
  );
}
