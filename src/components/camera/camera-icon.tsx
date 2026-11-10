import {
  AudioLines,
  Cctv,
  type LucideProps,
  Thermometer,
  Video,
} from "lucide-react";
import type { CameraKind } from "@/config/cameras";

const ICONS = {
  front: Video,
  ptz: Cctv,
  thermal: Thermometer,
  acoustic: AudioLines,
} satisfies Record<CameraKind, React.ComponentType<LucideProps>>;

/** The icon of a kind of camera. */
export function CameraIcon({
  kind,
  ...props
}: { kind: CameraKind } & LucideProps) {
  const Icon = ICONS[kind];
  return <Icon aria-hidden {...props} />;
}
