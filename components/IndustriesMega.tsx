"use client";

import Link from "next/link";
import { useState } from "react";
import { brand } from "@/content/brand";
import { industries } from "@/content/industries";
import { getCaseStudy } from "@/content/caseStudies";
import { cn } from "@/lib/utils";
import { TabRail } from "@/components/ui/tab-rail";
import { HoverHighlight, HighlightIcon, HighlightMarker, HighlightTitle } from "@/components/ui/hover-highlight";
import { MegaCta, HoursVisual } from "@/components/MegaCta";
import { categories, serviceHref } from "@/content/services";

/** Icon of the service a system links to (falls back to a generic one). */
const iconFor = (href: string) =>
  categories.flatMap((c) => c.services.map((s) => ({ href: serviceHref(c, s), icon: s.icon }))).find((x) => x.href === href)?.icon ?? "Workflow";

/** Industries mega menu: industry list (hover to switch) → systems + case study → CTA card. */
export function IndustriesMega() {
  const [active, setActive] = useState(0);
  const ind = industries[active];
  const cs = getCaseStudy(ind.caseStudy);

  return (
    <div className="grid grid-cols-[22rem_1fr_22rem] overflow-hidden rounded-[1.2rem] border border-black/[0.08] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      {/* Industries */}
      <div className="flex flex-col border-r border-black/[0.06] bg-[#fafafa] p-[1rem]">
        <TabRail
          items={industries}
          active={active}
          onActivate={setActive}
          getKey={(it) => it.slug}
          getHref={(it) => `/industries/${it.slug}`}
          label="Industries"
        >
          {(it, on) => (
            <span className="flex items-center justify-between px-[1rem] py-[0.75rem] text-[1.15rem] font-semibold text-[var(--ink)]">
              {it.name}
              <span className={cn("text-[1.2rem] font-normal text-black/40 transition-opacity duration-200", on ? "opacity-100" : "opacity-0")}>→</span>
            </span>
          )}
        </TabRail>
        <Link href="/industries" className="mt-auto px-[1rem] pt-[1.4rem] text-[1.05rem] font-medium text-[var(--teal)] hover:underline">
          All industries →
        </Link>
      </div>

      {/* Systems + case study */}
      <div key={ind.slug} className="fade-quick flex flex-col p-[2rem]">
        <div className="flex items-baseline justify-between gap-[1rem] border-b border-black/[0.08] pb-[1rem]">
          <div>
            <div className="text-[1.8rem] font-semibold text-[var(--ink)]">{ind.name}</div>
            <div className="mt-[0.2rem] text-[1.05rem] text-black/50">{ind.headline}</div>
          </div>
          <Link href={`/industries/${ind.slug}`} className="flex-none text-[1.05rem] font-medium text-[var(--teal)] hover:underline">
            Overview →
          </Link>
        </div>

        <div className="mt-[1rem] text-[0.9rem] font-medium uppercase tracking-[0.1em] text-black/40">Systems we build</div>
        <HoverHighlight className="mt-[0.4rem] grid grid-cols-3 gap-x-[1rem]">
          {ind.systems.map((s) => (
            <Link
              key={s.title}
              data-hl
              href={s.serviceHref}
              className="group/hl relative flex flex-col gap-[0.7rem] rounded-[0.8rem] px-[1rem] py-[0.8rem] outline-none"
            >
              <HighlightMarker />
              <HighlightIcon name={iconFor(s.serviceHref)} />
              <span>
                <HighlightTitle>{s.title}</HighlightTitle>
                <span className="mt-[0.15rem] line-clamp-3 block text-[1rem] leading-[1.45rem] text-black/50">{s.body}</span>
              </span>
            </Link>
          ))}
        </HoverHighlight>

        {cs && (
          <Link
            href={`/case-studies/${cs.slug}`}
            className="group/cs mt-auto flex items-baseline gap-[0.8rem] border-t border-black/[0.08] px-[0.8rem] pt-[1rem] text-[1.05rem]"
          >
            <span className="font-medium uppercase tracking-[0.1em] text-black/40">Case study</span>
            <span className="truncate font-semibold text-[var(--ink)] group-hover/cs:text-[var(--teal)]">{cs.title}</span>
          </Link>
        )}
      </div>

      <MegaCta
        eyebrow={`For ${ind.name}`}
        title="See what we'd automate in your business"
        body={ind.short}
        cta={brand.ctaLabel}
        href={brand.ctaHref}
        visual={<HoursVisual label={`Typical ${ind.name.split(" ")[0].toLowerCase()} team`} />}
      />
    </div>
  );
}
