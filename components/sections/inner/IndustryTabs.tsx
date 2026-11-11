"use client";

import Link from "next/link";
import { useState } from "react";
import { industries } from "@/content/industries";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { AutomationVisual } from "@/components/sections/inner/AutomationVisual";
import { PillButton } from "@/components/ui/pill-button";
import { cn } from "@/lib/utils";

/** Tab pills over a mint slide card (text + visual) with prev/next arrows. */
export function IndustryTabs({ heading, exclude }: { heading: HeadingProps; exclude?: string }) {
  const list = industries.filter((i) => i.slug !== exclude);
  const [active, setActive] = useState(0);
  const ind = list[active];
  const go = (d: number) => setActive((a) => (a + d + list.length) % list.length);

  return (
    <section className="sec-green bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />

        {/* All tabs share the row equally (never cropped); on phones the row scrolls. */}
        <div
          className="mt-[3rem] flex gap-[0.4rem] max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {list.map((it, i) => (
            <button
              key={it.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "flex min-h-[4.3rem] min-w-0 flex-1 items-center justify-center rounded-t-[1.5rem] px-[0.8rem] py-[0.6rem] text-center text-[1.2rem] font-semibold uppercase leading-[1.3] transition-colors duration-300 max-md:min-w-[11rem] max-md:flex-none max-md:text-xs",
                i === active ? "bg-[#d5fffa] text-[var(--ink)]" : "text-black/45 hover:bg-black/[0.03] hover:text-[var(--teal)]",
              )}
            >
              {it.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Previous industry"
            onClick={() => go(-1)}
            className="absolute left-[-2.4rem] top-1/2 z-10 flex h-[4.4rem] w-[4.4rem] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 max-lg:left-1"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next industry"
            onClick={() => go(1)}
            className="absolute right-[-2.4rem] top-1/2 z-10 flex h-[4.4rem] w-[4.4rem] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 max-lg:right-1"
          >
            →
          </button>

          <div key={ind.slug} className="fade-in grid min-h-[26.5rem] grid-cols-[1fr_38rem] items-center max-lg:grid-cols-1 gap-[3rem] rounded-b-[1.8rem] rounded-tr-[1.8rem] bg-[#d5fffa] px-[3rem] py-[2.25rem] max-md:grid-cols-1 max-md:p-6">
            <div>
              <h3 className="text-[3.125rem] font-light uppercase leading-[3.75rem] text-[var(--ink)] max-md:text-2xl">{ind.headline}</h3>
              <p className="body-thin mt-[0.8rem] max-w-[48rem]">{ind.problem.body}</p>
              <ul className="mt-[1.2rem] space-y-[0.4rem]">
                {ind.systems.map((s) => (
                  <li key={s.title} className="flex items-center gap-[0.8rem] text-[1.2rem] leading-[1.8rem] text-[var(--ink)] max-md:text-sm">
                    <span className="h-[0.4rem] w-[0.4rem] rounded-full bg-[var(--ink)]" />
                    <Link href={s.serviceHref} className="hover:text-[var(--teal)] hover:underline">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-[1.6rem]">
                <PillButton href={`/industries/${ind.slug}`}>Explore {ind.name}</PillButton>
              </div>
            </div>
            <AutomationVisual labels={["New Enquiry", "AI Agent", ...ind.systems.map((s) => s.title.split(" ").slice(0, 2).join(" "))]} className="h-[22rem] max-md:h-56" />
          </div>
        </div>
      </div>
    </section>
  );
}
