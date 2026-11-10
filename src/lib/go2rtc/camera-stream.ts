/**
 * <camera-stream>: go2rtc's player (VideoRTC) without its controls, plus a
 * status the dashboard can show. It tries WebRTC and MSE at once and keeps
 * whichever plays first, reconnects on its own, and reports through a
 * `camerastatus` event:
 *
 *   connecting → live (with mode and size) → offline (with the reason) → …
 *
 * Browser only: the module defines a class that extends HTMLElement, so
 * import it dynamically from client code (components/camera/stream-player).
 */

import {
  IDLE_STATUS,
  type StreamMode,
  type StreamStatus,
} from "@/types/stream";
import { VideoRTC } from "./vendor/video-rtc.js";

export const CAMERA_STREAM_TAG = "camera-stream";
export const STATUS_EVENT = "camerastatus";

/** No picture within this time after connecting: offline, try again. */
const CONNECT_TIMEOUT_MS = 20_000;
/** Picture frozen for this long while live: offline, try again. */
const STALL_MS = 10_000;
/** Wait before trying again after an error from go2rtc. */
const RETRY_MS = 5_000;
const WATCHDOG_MS = 2_000;

const MODES: readonly StreamMode[] = ["webrtc", "mse", "hls", "mjpeg"];

function isMode(value: string): value is StreamMode {
  return (MODES as readonly string[]).includes(value);
}

export class CameraStreamElement extends VideoRTC {
  private current: StreamStatus = { ...IDLE_STATUS };
  private watchdog = 0;
  private retryTimer = 0;
  private connectedAt = 0;
  private lastTime = -1;
  private lastProgressAt = 0;

  constructor() {
    super();
    // video only: the cameras have no sound worth playing on a wall
    this.mode = "webrtc,mse,hls";
    this.media = "video";
    this.RECONNECT_TIMEOUT = RETRY_MS;
    // the robot's LAN: host candidates are enough, no public STUN servers
    this.pcConfig = { ...this.pcConfig, iceServers: [] };
  }

  /** The latest status (also sent with every `camerastatus` event). */
  get status(): StreamStatus {
    return this.current;
  }

  /** Drop the connection and start a fresh one. */
  reconnect(): void {
    this.ondisconnect();
    this.onconnect();
  }

  override oninit(): void {
    super.oninit();
    const video = this.video;
    video.controls = false;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.style.objectFit = "contain";

    video.addEventListener("playing", () => this.markLive());
    video.addEventListener("resize", () => this.readSize());
    video.addEventListener("loadedmetadata", () => this.readSize());
  }

  override onconnect(): boolean {
    const started = super.onconnect();
    if (!started) return false;

    this.connectedAt = Date.now();
    this.lastTime = -1;
    this.clearRetry();
    this.startWatchdog();
    this.update({ state: "connecting", error: null });

    // a WebSocket that drops while it carries the video: go2rtc reconnects
    this.ws?.addEventListener("close", () => {
      if (this.pcState === WebSocket.OPEN || this.wsState === WebSocket.CLOSED)
        return;
      this.update({ state: "connecting" });
    });
    return true;
  }

  override ondisconnect(): void {
    this.stopWatchdog();
    this.clearRetry();
    super.ondisconnect();
    this.update({ ...IDLE_STATUS });
  }

  override onopen(): string[] {
    const modes = super.onopen();
    if (this.onmessage) {
      this.onmessage.status = (msg) => {
        if (msg.type === "error") {
          // only WebRTC failed: MSE may still bring the picture
          if (msg.value.includes("webrtc")) return;
          this.fail(msg.value);
        } else if (isMode(msg.type)) {
          this.update({ mode: msg.type });
        }
      };
    }
    return modes;
  }

  override onpcvideo(video2: HTMLVideoElement): void {
    super.onpcvideo(video2);
    if (this.pcState !== WebSocket.CLOSED) this.update({ mode: "webrtc" });
  }

  private markLive(): void {
    this.lastProgressAt = Date.now();
    this.lastTime = this.video.currentTime;
    this.update({ state: "live", error: null });
    this.readSize();
  }

  private readSize(): void {
    const { videoWidth: width, videoHeight: height } = this.video;
    if (width && height) this.update({ width, height });
  }

  /** Offline for a reason; try again shortly. */
  private fail(reason: string): void {
    this.update({ state: "offline", error: reason });
    this.clearRetry();
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = 0;
      if (this.isConnected) this.reconnect();
    }, RETRY_MS);
  }

  private startWatchdog(): void {
    this.stopWatchdog();
    this.watchdog = window.setInterval(() => this.check(), WATCHDOG_MS);
  }

  private stopWatchdog(): void {
    if (this.watchdog) window.clearInterval(this.watchdog);
    this.watchdog = 0;
  }

  private clearRetry(): void {
    if (this.retryTimer) window.clearTimeout(this.retryTimer);
    this.retryTimer = 0;
  }

  private check(): void {
    const now = Date.now();
    const { state } = this.current;

    if (state === "connecting" && now - this.connectedAt > CONNECT_TIMEOUT_MS) {
      this.fail("No picture from the camera");
      return;
    }

    if (state === "live") {
      const time = this.video.currentTime;
      if (time !== this.lastTime) {
        this.lastTime = time;
        this.lastProgressAt = now;
      } else if (now - this.lastProgressAt > STALL_MS) {
        this.fail("The picture stopped");
      }
    }
  }

  private update(patch: Partial<StreamStatus>): void {
    const next = { ...this.current, ...patch };
    // a new attempt: forget how the last one played
    if (patch.state === "connecting") next.mode = null;
    const changed = (Object.keys(next) as (keyof StreamStatus)[]).some(
      (key) => next[key] !== this.current[key],
    );
    if (!changed) return;
    this.current = next;
    this.dispatchEvent(
      new CustomEvent<StreamStatus>(STATUS_EVENT, { detail: next }),
    );
  }
}

/** Register <camera-stream> once. */
export function defineCameraStream(): void {
  if (!customElements.get(CAMERA_STREAM_TAG)) {
    customElements.define(CAMERA_STREAM_TAG, CameraStreamElement);
  }
}
