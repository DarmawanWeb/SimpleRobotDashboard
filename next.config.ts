import type { NextConfig } from "next";

/**
 * Hosts that may open the dev server besides localhost. Next.js blocks its
 * dev scripts for any other host, and the page then renders but never
 * becomes interactive. Allowed: this machine by IP, private networks (the
 * display PC, a tablet or the robot on the LAN), mDNS names, and the extra
 * hosts in DEV_ORIGINS (comma separated). Production builds ignore it.
 */
const DEV_ORIGINS = [
  "127.0.0.1",
  "10.*.*.*",
  "172.*.*.*",
  "192.168.*.*",
  "*.local",
  ...(process.env.DEV_ORIGINS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // A self-contained server for the Docker image (docker-compose.yml).
  output: "standalone",
  allowedDevOrigins: DEV_ORIGINS,
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
