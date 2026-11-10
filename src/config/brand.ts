/**
 * Names on the display: the app, the robot, the partners and the credits.
 *
 * Logos are the official files in public/brand/, named after the slug
 * (`<slug>.svg|png|webp`, plus an optional `<slug>-dark.*` for dark
 * backgrounds). The build picks up whatever is there (lib/brand-logos.ts);
 * without a file the slot shows the short name.
 */

import type { Company } from "@/types/brand";

export const BRAND = {
  app: {
    name: "X30 Live View",
    tagline: "Inspection cameras",
  },
  robot: {
    name: "Jueying X30",
    maker: "Deep Robotics",
  },
  partners: [
    {
      name: "Institut Teknologi Sepuluh Nopember",
      short: "ITS",
      slug: "its",
    },
    {
      name: "PT Ezra Robotics Teknologi",
      short: "Ezra Robotics",
      slug: "ezra-robotics",
    },
  ],
  lab: {
    name: "B401 ITS",
    short: "B401",
    slug: "b401",
  },
  year: 2026,
} as const satisfies {
  app: { name: string; tagline: string };
  robot: { name: string; maker: string };
  partners: readonly Company[];
  lab: Company;
  year: number;
};

/** "ITS × Ezra Robotics" */
export const PARTNERSHIP = BRAND.partners.map((p) => p.short).join(" × ");

/** Every slug that has a logo slot. */
export const LOGO_SLUGS = [
  ...BRAND.partners.map((p) => p.slug),
  BRAND.lab.slug,
] as const;
