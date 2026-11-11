"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/content/brand";
import { nav } from "@/content/nav";
import { ChevronDownIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { ServicesMega } from "@/components/ServicesMega";
import { IndustriesMega } from "@/components/IndustriesMega";
import { ResourcesMega } from "@/components/ResourcesMega";
import { cn } from "@/lib/utils";
import { PillButton } from "@/components/ui/pill-button";
import type { Post } from "@/content/pages";

export function Navbar({ latestPost }: { latestPost?: Post }) {
  // Full-width mega panel for each dropdown item.
  const megaPanels: Record<string, () => React.ReactNode> = {
    Services: () => <ServicesMega />,
    Industries: () => <IndustriesMega />,
    Resources: () => <ResourcesMega latest={latestPost} />,
  };

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  // Desktop mega menu: opens after a short hover delay (switches instantly once a menu is
  // already open) and closes after a small grace period, so brushing past a nav item or
  // slipping off the panel for a moment doesn't flicker it.
  const [menu, setMenu] = useState<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const enter = (label: string) => {
    clearTimers();
    if (!megaPanels[label]) {
      closeTimer.current = setTimeout(() => setMenu(null), 120);
      return;
    }
    openTimer.current = setTimeout(() => setMenu(label), menu ? 0 : 80);
  };
  const leave = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setMenu(null), 180);
  };

  // Close menus on navigation (reset during render when the path changes).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setExpanded(null);
    setMenu(null);
  }

  // Escape closes the desktop menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-[rgba(0,0,0,0.93)] py-[1.563rem] transition-all duration-300">
      {/* Soft dim over the page while a mega menu is open */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 bg-black/20 transition-opacity duration-200 max-lg:hidden",
          menu ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="container-x relative flex items-center justify-between">
        <Link href="/" aria-label={`${brand.name} — home`} className="flex items-center">
          <BrandLogo priority className="h-[3rem] max-md:h-8" />
        </Link>

        <nav className="hidden items-center gap-[3.5rem] lg:flex" onMouseLeave={leave}>
          {nav.map((item) => {
            const isOpen = menu === item.label;
            const current = pathname.startsWith(item.href) && item.href !== "/";
            return (
              <div
                key={item.label}
                onMouseEnter={() => enter(item.label)}
                onFocus={() => {
                  clearTimers();
                  setMenu(megaPanels[item.label] ? item.label : null);
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) leave();
                }}
              >
                <Link
                  href={item.href}
                  aria-expanded={megaPanels[item.label] ? isOpen : undefined}
                  className={cn(
                    "relative flex items-center gap-[0.4rem] py-[1rem] text-[16px] leading-[28px] transition-colors duration-200",
                    isOpen || current ? "text-[var(--accent)]" : "text-white hover:text-[var(--accent)]",
                  )}
                >
                  {item.label}
                  {item.groups && (
                    <ChevronDownIcon className={cn("h-[14px] w-[14px] transition-transform duration-200", isOpen && "rotate-180")} />
                  )}
                  {/* underline grows from the centre */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 bottom-[0.55rem] h-[2px] origin-center rounded-full bg-[var(--accent)] transition-transform duration-200 ease-out",
                      isOpen || current ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>

                {megaPanels[item.label] && (
                  <div
                    className={cn(
                      "absolute inset-x-[var(--gutter)] top-full z-50 pt-[0.6rem] transition-[opacity,visibility] duration-150",
                      isOpen ? "visible opacity-100" : "invisible opacity-0",
                    )}
                  >
                    {megaPanels[item.label]()}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <PillButton href={brand.ctaHref} variant="white" size="sm" className="max-lg:!hidden">
          {brand.ctaLabel}
        </PillButton>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
        >
          <span className={cn("h-[2px] w-6 bg-white transition-transform", open && "translate-y-[8px] rotate-45")} />
          <span className={cn("h-[2px] w-6 bg-white transition-opacity", open && "opacity-0")} />
          <span className={cn("h-[2px] w-6 bg-white transition-transform", open && "-translate-y-[8px] -rotate-45")} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("overflow-y-auto bg-black transition-[max-height] duration-500 lg:hidden", open ? "max-h-[85vh]" : "max-h-0")}>
        <div className="container-x flex flex-col py-6">
          {nav.map((item) => (
            <div key={item.label} className="border-b border-white/10">
              <div className="flex items-center justify-between py-3">
                <Link href={item.href} className="text-lg text-white">
                  {item.label}
                </Link>
                {item.groups && (
                  <button
                    type="button"
                    aria-label={`Expand ${item.label}`}
                    onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                    className="p-2 text-white"
                  >
                    <ChevronDownIcon className={cn("h-4 w-4 transition-transform", expanded === item.label && "rotate-180")} />
                  </button>
                )}
              </div>
              {item.groups && expanded === item.label && (
                <div className="space-y-4 pb-4 pl-3">
                  {item.groups.map((g) => (
                    <div key={g.title}>
                      <div className="mb-1 text-sm font-semibold text-[var(--accent)]">{g.title}</div>
                      {g.links.map((l) => (
                        <Link key={l.href} href={l.href} className="block py-1 text-sm text-white/80">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <PillButton href={brand.ctaHref} variant="white" size="sm" className="mt-5 self-start">
            {brand.ctaLabel}
          </PillButton>
        </div>
      </div>
    </header>
  );
}
