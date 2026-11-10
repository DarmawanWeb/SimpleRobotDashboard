/**
 * <camera-stream>: go2rtc's player (VideoRTC) without its controls, plus a
 * status the dashboard can show. It tries WebRTC and MSE at once and keeps
 * whichever plays first, retries on its own, and reports through a
 * `camerastatus` event:
 *
 *   connecting → live (with mode and size)
 *   any failure → offline (with the reason), retried until live again
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
/** Wait before trying again after a failure. */
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
  private attemptAt = 0;
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

  /**
   * Drop the connection and start a fresh one, once the old socket has
   * closed: VideoRTC's handlers of the old socket would otherwise act on
   * the new one.
   */
  reconnect(): void {
    const old = this.ws;
    this.teardown();
    let started = false;
    const start = () => {
      if (started || !this.isConnected || this.ws || this.pc) return;
      started = true;
      this.onconnect();
    };
    if (old && old.readyState !== WebSocket.CLOSED) {
      old.addEventListener("close", start, { once: true });
      window.setTimeout(start, 1_000);
    } else {
      start();
    }
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

    this.attemptAt = Date.now();
    this.lastTime = -1;
    this.clearRetry();
    this.startWatchdog();
    // retries after a failure stay "offline" until the picture is back
    if (this.current.state !== "offline") {
      this.update({ state: "connecting", error: null });
    }

    const ws = this.ws;
    let opened = false;
    ws?.addEventListener("open", () => {
      opened = true;
    });
    ws?.addEventListener("close", () => {
      // closed on purpose (teardown) or replaced by WebRTC: nothing to report
      if (this.wsState === WebSocket.CLOSED || this.pcState === WebSocket.OPEN)
        return;
      // VideoRTC reconnects by itself after RECONNECT_TIMEOUT
      if (!opened) {
        this.update({
          state: "offline",
          error: "Can't reach the stream server",
        });
      } else if (this.current.state === "live") {
        this.update({ state: "connecting" });
      }
    });
    return true;
  }

  override ondisconnect(): void {
    this.teardown();
    this.update({ ...IDLE_STATUS });
  }

  override onopen(): string[] {
    const modes = super.onopen();
    if (this.onmessage) {
      this.onmessage.status = (msg) => {
        if (msg.type === "error") {
          if (msg.value.includes("webrtc")) {
            // only WebRTC failed (VideoRTC closed the peer connection): MSE
            // may still bring the picture. Forget the closed connection, or
            // VideoRTC would never reconnect after the socket drops.
            if (this.pc?.connectionState === "closed") {
              this.pc = null;
              this.pcState = WebSocket.CLOSED;
            }
            return;
          }
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

  /**
   * VideoRTC's ondisconnect, except that it clears the video without
   * `src = ""`: that raises a media error, and VideoRTC answers media errors
   * by closing whatever socket is open by then (the next connection's).
   */
  private teardown(): void {
    this.stopWatchdog();
    this.clearRetry();
    if (this.reconnectTID) {
      window.clearTimeout(this.reconnectTID);
      this.reconnectTID = 0;
    }

    this.wsState = WebSocket.CLOSED;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.pcState = WebSocket.CLOSED;
    if (this.pc) {
      for (const sender of this.pc.getSenders()) sender.track?.stop();
      this.pc.close();
      this.pc = null;
    }

    const video = this.video;
    if (video) {
      video.removeAttribute("src");
      video.srcObject = null;
      video.load();
    }
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
    if (this.retryTimer) return;
    const now = Date.now();

    if (this.current.state === "live") {
      const time = this.video.currentTime;
      if (time !== this.lastTime) {
        this.lastTime = time;
        this.lastProgressAt = now;
      } else if (now - this.lastProgressAt > STALL_MS) {
        this.fail("The picture stopped");
      }
    } else if (now - this.attemptAt > CONNECT_TIMEOUT_MS) {
      this.fail(this.current.error ?? "No picture from the camera");
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
