/**
 * The four cameras on the X30, in display order. `stream` is the stream's
 * name in go2rtc (docker/go2rtc.yaml), where the RTSP addresses live.
 */

export type CameraId = "front" | "ptz" | "thermal" | "acoustic";

export type CameraKind = "front" | "ptz" | "thermal" | "acoustic";

export interface Camera {
  id: CameraId;
  /** go2rtc stream name */
  stream: string;
  kind: CameraKind;
  label: string;
  /** The device, shown small under the picture */
  device: string;
}

export const CAMERAS: readonly Camera[] = [
  {
    id: "front",
    stream: "front",
    kind: "front",
    label: "Front camera",
    device: "Jueying X30 front camera",
  },
  {
    id: "ptz",
    stream: "ptz",
    kind: "ptz",
    label: "PTZ camera",
    device: "HIKMICRO HM-TD5567T-15/W · optical",
  },
  {
    id: "thermal",
    stream: "thermal",
    kind: "thermal",
    label: "Thermal",
    device: "HIKMICRO HM-TD5567T-15/W · thermal",
  },
  {
    id: "acoustic",
    stream: "acoustic",
    kind: "acoustic",
    label: "Acoustic imaging",
    device: "Hertzinno HZ-FA-371",
  },
];
