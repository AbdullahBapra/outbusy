import { logos } from "@/content/logos.generated";
import { cn } from "@/lib/utils";

/**
 * Official brand logo for a tool (from Simple Icons), falling back to a clean wordmark
 * for brands that aren't available. Logos render in a neutral ink tone and switch to the
 * brand colour when the surrounding `group/logo` is hovered.
 * Regenerate the logo map with `node scripts/build-logos.mjs`.
 */
export function ToolLogo({ name, className, tone = "ink" }: { name: string; className?: string; tone?: "ink" | "light" }) {
  const logo = logos[name];
  if (!logo) {
    return (
      <span className={cn("font-semibold tracking-[-0.01em]", tone === "light" ? "text-white" : "text-[var(--ink)]", className)}>{name}</span>
    );
  }
  return (
    <svg
      role="img"
      aria-label={logo.title}
      viewBox="0 0 24 24"
      className={cn(
        "flex-none transition-colors duration-300",
        tone === "light" ? "text-white" : "text-[#1a1b1f] group-hover/logo:text-[var(--brand)]",
        className,
      )}
      style={{ ["--brand" as string]: `#${logo.hex}` }}
    >
      <title>{logo.title}</title>
      <path d={logo.path} fill="currentColor" />
    </svg>
  );
}

/** True when an official logo is available for the tool. */
export const hasLogo = (name: string) => Boolean(logos[name]);
