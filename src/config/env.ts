/**
 * Build-time settings (NEXT_PUBLIC_* are inlined by `next build`). The
 * stream server can also be changed at run time in the app's settings,
 * saved per browser / desktop install.
 */
export const ENV = {
  /**
   * go2rtc's address as the browser reaches it, e.g. http://192.168.1.10:1984.
   * Empty: the host that serves the dashboard, on go2rtc's port.
   */
  go2rtcUrl: (process.env.NEXT_PUBLIC_GO2RTC_URL ?? "").trim(),
} as const;
