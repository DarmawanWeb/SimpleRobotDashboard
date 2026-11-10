import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Company, LogoFiles } from "@/types/brand";

/**
 * A company's official logo from public/brand/, right for the theme: the
 * `-dark` file on dark backgrounds when there is one, otherwise the regular
 * file on a white plate. Without any file it shows the short name, so the
 * layout holds until the files are added.
 */
export function CompanyLogo({
  company,
  files,
  className,
}: {
  company: Company;
  files: LogoFiles | undefined;
  /** Sets the logo height (e.g. "h-7"); the width follows the file */
  className?: string;
}) {
  const light = files?.light;
  const dark = files?.dark;

  if (!light && !dark) {
    return (
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap font-semibold leading-none tracking-tight text-fg",
          className,
        )}
        title={company.name}
      >
        {company.short}
      </span>
    );
  }

  const image = (src: string, extra?: string) => (
    <Image
      src={src}
      alt={company.name}
      width={320}
      height={96}
      unoptimized
      priority
      className={cn("h-full w-auto max-w-none object-contain", extra)}
    />
  );

  if (light && dark) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {image(light, "dark:hidden")}
        {image(dark, "hidden dark:block")}
      </span>
    );
  }

  // One file only: put it on a plate where it would not read well.
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md",
        light
          ? "dark:bg-white dark:px-1.5 dark:py-0.5"
          : "bg-[#0c0d10] px-1.5 py-0.5 dark:bg-transparent dark:p-0",
        className,
      )}
    >
      {image((light ?? dark) as string)}
    </span>
  );
}
