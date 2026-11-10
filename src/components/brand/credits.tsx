import { BRAND, PARTNERSHIP } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { BrandLogos } from "@/types/brand";
import { CompanyLogo } from "./company-logo";

/** "Built by B401 ITS", with the lab's logo when there is one. */
export function BuiltBy({
  logos,
  className,
}: {
  logos: BrandLogos;
  className?: string;
}) {
  const files = logos[BRAND.lab.slug];
  const hasLogo = Boolean(files?.light || files?.dark);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      Built by
      {hasLogo && (
        <CompanyLogo company={BRAND.lab} files={files} className="h-4" />
      )}
      <span className="font-medium text-fg-2">{BRAND.lab.name}</span>
    </span>
  );
}

/** "© 2026 ITS × Ezra Robotics" */
export function Copyright({ className }: { className?: string }) {
  return (
    <span className={className}>
      © {BRAND.year} {PARTNERSHIP}
    </span>
  );
}
