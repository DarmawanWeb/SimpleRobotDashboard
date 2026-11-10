/**
 * Types for the vendored go2rtc player (video-rtc.js), for the members
 * this app uses. `onclose` is left out on purpose: HTMLElement already has
 * an `onclose` event handler property, and the app does not override it.
 */

export interface VideoRTCMessage {
  type: string;
  value: string;
}

export declare class VideoRTC extends HTMLElement {
  DISCONNECT_TIMEOUT: number;
  RECONNECT_TIMEOUT: number;
  CODECS: string[];

  /** Modes to try, e.g. "webrtc,mse,hls,mjpeg" */
  mode: string;
  /** Requested media, e.g. "video,audio" */
  media: string;
  background: boolean;
  visibilityThreshold: number;
  visibilityCheck: boolean;
  pcConfig: RTCConfiguration;

  /** WebSocket.CONNECTING | OPEN | CLOSED */
  wsState: number;
  /** WebSocket.CONNECTING | OPEN | CLOSED, for the peer connection */
  pcState: number;

  video: HTMLVideoElement;
  ws: WebSocket | null;
  wsURL: string;
  pc: RTCPeerConnection | null;
  connectTS: number;
  mseCodecs: string;

  ondata: ((data: ArrayBuffer) => void) | null;
  onmessage: Record<string, (msg: VideoRTCMessage) => void> | null;

  /** WebSocket URL of the stream; http(s) and relative URLs are converted */
  set src(value: string | URL);

  play(): void;
  send(value: object): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
  oninit(): void;
  /** @returns true when a connection was started */
  onconnect(): boolean;
  ondisconnect(): void;
  /** @returns the modes started */
  onopen(): string[];
  onpcvideo(video2: HTMLVideoElement): void;
}
