"use client";

import Link from "next/link";
import { useState } from "react";
import { brand } from "@/content/brand";
import { categories, serviceHref } from "@/content/services";
import { cn } from "@/lib/utils";
import { TabRail } from "@/components/ui/tab-rail";
import { HoverHighlight, HighlightIcon, HighlightMarker, HighlightTitle } from "@/components/ui/hover-highlight";
import { MegaCta, BookingVisual } from "@/components/MegaCta";

/** Services mega menu: category list (hover to switch) → services → quiet CTA card. */
export function ServicesMega() {
  const [active, setActive] = useState(0);
  const cat = categories[active];

  return (
    <div className="grid grid-cols-[22rem_1fr_22rem] overflow-hidden rounded-[1.2rem] border border-black/[0.08] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      {/* Categories */}
      <div className="flex flex-col border-r border-black/[0.06] bg-[#fafafa] p-[1rem]">
        <TabRail
          items={categories}
          active={active}
          onActivate={setActive}
          getKey={(c) => c.slug}
          getHref={(c) => serviceHref(c)}
          label="Service categories"
        >
          {(c, on) => (
            <span className="flex items-start gap-[0.9rem] px-[1rem] py-[0.9rem]">
              <span className={cn("pt-[0.1rem] text-[1rem] font-medium tabular-nums transition-colors duration-200", on ? "text-[var(--teal)]" : "text-black/35")}>
                {c.number}
              </span>
              <span className="flex-1">
                <span className="block text-[1.2rem] font-semibold leading-[1.5rem] text-[var(--ink)]">{c.title}</span>
                <span className="mt-[0.15rem] block text-[1rem] text-black/45">{c.services.length} services</span>
              </span>
              <span className={cn("pt-[0.1rem] text-[1.2rem] text-black/40 transition-opacity duration-200", on ? "opacity-100" : "opacity-0")}>→</span>
            </span>
          )}
        </TabRail>
        <Link href="/services" className="mt-auto px-[1rem] pt-[1.4rem] text-[1.05rem] font-medium text-[var(--teal)] hover:underline">
          View all services →
        </Link>
      </div>

      {/* Services of the active category */}
      <div key={cat.slug} className="fade-quick p-[2rem]">
        <div className="flex items-baseline justify-between gap-[1rem] border-b border-black/[0.08] pb-[1rem]">
          <div className="text-[1.8rem] font-semibold text-[var(--ink)]">{cat.title}</div>
          <Link href={serviceHref(cat)} className="text-[1.05rem] font-medium text-[var(--teal)] hover:underline">
            Overview →
          </Link>
        </div>
        <HoverHighlight className="mt-[1rem] grid grid-cols-2 gap-x-[1.6rem]">
          {cat.services.map((s) => (
            <Link
              key={s.slug}
              data-hl
              href={serviceHref(cat, s)}
              className="group/hl relative flex items-start gap-[0.9rem] rounded-[0.8rem] px-[1rem] py-[0.8rem] outline-none"
            >
              <HighlightMarker />
              <HighlightIcon name={s.icon} />
              <span className="min-w-0">
                <HighlightTitle>{s.title}</HighlightTitle>
                <span className="mt-[0.15rem] block text-[1rem] leading-[1.45rem] text-black/50">{s.summary}</span>
              </span>
            </Link>
          ))}
        </HoverHighlight>
      </div>

      <MegaCta
        eyebrow="Free · 30 minutes"
        title="Not sure what to automate first?"
        body="Pick a time — we'll map your processes and rank each idea by hours saved."
        cta={brand.ctaLabel}
        href={brand.ctaHref}
        visual={<BookingVisual />}
      />
    </div>
  );
}
