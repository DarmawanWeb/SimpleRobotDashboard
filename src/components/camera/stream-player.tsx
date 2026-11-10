"use client";

import { useEffect, useRef } from "react";
import type { CameraStreamElement } from "@/lib/go2rtc/camera-stream";
import { cn } from "@/lib/utils";
import type { StreamStatus } from "@/types/stream";

/**
 * Plays one go2rtc stream: mounts a <camera-stream> element (browser only)
 * and reports its status. Changing `src` starts a new connection; changing
 * `nonce` reconnects the same one.
 */
export function StreamPlayer({
  src,
  nonce = 0,
  onStatus,
  className,
}: {
  /** WebSocket (or http) URL of the stream, null to wait */
  src: string | null;
  nonce?: number;
  onStatus?: (status: StreamStatus) => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<CameraStreamElement | null>(null);
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onStatusRef.current = onStatus;
  });

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let element: CameraStreamElement | null = null;

    void import("@/lib/go2rtc/camera-stream").then(
      ({ defineCameraStream, CAMERA_STREAM_TAG, STATUS_EVENT }) => {
        const host = hostRef.current;
        if (cancelled || !host) return;
        defineCameraStream();
        element = document.createElement(
          CAMERA_STREAM_TAG,
        ) as CameraStreamElement;
        element.className = "block size-full";
        element.addEventListener(STATUS_EVENT, (event) => {
          onStatusRef.current?.((event as CustomEvent<StreamStatus>).detail);
        });
        host.appendChild(element);
        element.src = src;
        elementRef.current = element;
      },
    );

    return () => {
      cancelled = true;
      if (element) {
        // stop now (the element itself would wait a few seconds)
        element.ondisconnect();
        element.remove();
      }
      elementRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (nonce > 0) elementRef.current?.reconnect();
  }, [nonce]);

  return <div ref={hostRef} className={cn("size-full", className)} />;
}
