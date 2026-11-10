/** Where a camera's stream is: not started, starting, playing or failing. */
export type StreamState = "idle" | "connecting" | "live" | "offline";

/** How the video arrives from go2rtc. */
export type StreamMode = "webrtc" | "mse" | "hls" | "mjpeg";

export interface StreamStatus {
  state: StreamState;
  mode: StreamMode | null;
  /** Video size in pixels, 0 until known */
  width: number;
  height: number;
  /** Why the stream is offline (go2rtc's message, a timeout…) */
  error: string | null;
}

export const IDLE_STATUS: StreamStatus = {
  state: "idle",
  mode: null,
  width: 0,
  height: 0,
  error: null,
};
