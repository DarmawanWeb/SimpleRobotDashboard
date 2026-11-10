import { X } from "lucide-react";
import { Fragment } from "react";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { BrandLogos } from "@/types/brand";
import { CompanyLogo } from "./company-logo";

/** ITS × Ezra Robotics, as logos side by side (or their names). */
export function PartnerLockup({
  logos,
  className,
  logoClassName = "h-7 text-sm",
}: {
  logos: BrandLogos;
  className?: string;
  /** Height (and fallback text size) of each logo */
  logoClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {BRAND.partners.map((company, i) => (
        <Fragment key={company.slug}>
          {i > 0 && (
            <X
              aria-hidden
              className="size-3 shrink-0 text-fg-muted"
              strokeWidth={2.5}
            />
          )}
          <CompanyLogo
            company={company}
            files={logos[company.slug]}
            className={logoClassName}
          />
        </Fragment>
      ))}
    </div>
  );
}
