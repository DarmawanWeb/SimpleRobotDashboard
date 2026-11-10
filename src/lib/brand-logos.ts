/**
 * Which official logo files are in public/brand/. Runs on the server while
 * the page is built (also for the desktop app's static export), so the
 * browser never asks for a logo that is not there.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { LOGO_SLUGS } from "@/config/brand";
import type { BrandLogos, LogoFiles } from "@/types/brand";

const EXTENSIONS = ["svg", "png", "webp", "jpg"] as const;

function find(file: string): string | undefined {
  for (const ext of EXTENSIONS) {
    const url = `/brand/${file}.${ext}`;
    const disk = path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "public",
      url,
    );
    if (existsSync(disk)) return url;
  }
  return undefined;
}

function logosOf(slug: string): LogoFiles {
  return { light: find(slug), dark: find(`${slug}-dark`) };
}

export function getBrandLogos(): BrandLogos {
  return Object.fromEntries(LOGO_SLUGS.map((slug) => [slug, logosOf(slug)]));
}
