import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X30 Live View",
  description:
    "Live camera display for the Deep Robotics Jueying X30: front, PTZ, thermal and acoustic imaging.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
