import Image from "next/image";
import logoLight from "@/public/images/outbusy-logo.png";
import logoDark from "@/public/images/outbusy-logo-dark.png";
import { brand } from "@/content/brand";
import { cn } from "@/lib/utils";

/**
 * Outbusy logo (transparent PNG). `tone="light"` (default) has white "out" lettering for dark
 * backgrounds such as the header and footer; `tone="dark"` keeps the original black lettering
 * for light backgrounds. Set the height via className; width follows.
 */
export function BrandLogo({
  className,
  priority = false,
  tone = "light",
}: {
  className?: string;
  priority?: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <Image
      src={tone === "light" ? logoLight : logoDark}
      alt={brand.name}
      priority={priority}
      className={cn("h-[2.6rem] w-auto", className)}
    />
  );
}
