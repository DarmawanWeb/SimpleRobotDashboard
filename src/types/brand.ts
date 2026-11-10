export interface Company {
  /** Full name, also the logo's alt text */
  name: string;
  /** Short form, shown while there is no logo file */
  short: string;
  /** Logo file name in public/brand/ without the extension */
  slug: string;
}

/** A logo for light backgrounds and, optionally, one for dark ones. */
export interface LogoFiles {
  light?: string;
  dark?: string;
}

/** Logo files found in public/brand/, by slug. */
export type BrandLogos = Record<string, LogoFiles>;
