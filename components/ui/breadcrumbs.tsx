import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: { label: string; href?: string }[];
  /** "light" for dark heroes (default), "dark" for white backgrounds. */
  tone?: "light" | "dark";
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-[1.6rem] flex flex-wrap items-center gap-[0.6rem] text-[1.1rem] uppercase leading-none max-md:text-xs", tone === "light" ? "text-white/70" : "text-black/45")}>
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-[0.6rem]">
          {item.href ? (
            <Link href={item.href} className={cn("transition-colors", tone === "light" ? "hover:text-[var(--accent)]" : "hover:text-[var(--ink)]")}>
              {item.label}
            </Link>
          ) : (
            <span className={tone === "light" ? "text-[var(--accent)]" : "text-[var(--teal)]"}>{item.label}</span>
          )}
          {i < items.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}
