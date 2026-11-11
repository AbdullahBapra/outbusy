"use client";

import Link from "next/link";
import { useRef } from "react";
import { useSyncedRelease } from "@/components/sections/inner/useSyncedRelease";
import { categories, serviceHref, type ServiceCategory } from "@/content/services";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { DragMarquee } from "@/components/ui/drag-marquee";
import { directionalFill } from "@/components/ui/directional-fill";

const arrowPath = "M4 12h15m0 0-6-6m6 6-6 6";

/**
 * Round arrow button with a before/after hover: a dark circle grows from the centre
 * (::before), the current arrow slides out to the right and a white one slides in
 * from the left. Styles: `.chip-swap` in globals.css.
 */
function ChipArrow() {
  return (
    <span className="chip-arrow chip-swap">
      {[0, 1].map((k) => (
        <svg key={k} viewBox="0 0 24 24" className={k === 0 ? "chip-a1" : "chip-a2"} fill="none" aria-hidden="true">
          <path d={arrowPath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function ServiceCard({ href, icon, title, body }: { href: string; icon: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      {...directionalFill}
      className="hover-card group relative flex h-[18.72rem] w-[25.04rem] flex-none flex-col justify-between overflow-hidden rounded-[2.4rem] border-[0.8px] border-black bg-white p-[1.875rem] max-md:h-auto max-md:w-[17rem] max-md:gap-6 [&>*:not([data-fill])]:relative"
    >
      {/* Mint fill that slides in from the edge the pointer enters */}
      <span data-fill aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--mint-50)] [transform:translate3d(-101%,0,0)]" />
      <div className="flex items-start justify-between">
        <AnimatedIcon name={icon} className="h-[6.4rem] w-[6.4rem] text-[var(--ink)]" strokeWidth={1.2} />
        <ChipArrow />
      </div>
      <div>
        <h3 className="text-[1.375rem] font-semibold capitalize leading-[1.65rem] text-[var(--ink)] max-md:text-lg">{title}</h3>
        <p className="body-thin mt-[0.5rem] line-clamp-3">{body}</p>
      </div>
    </Link>
  );
}

/**
 * Sticky stacking section: heading pins at top, each category pins below it with a
 * white background so later categories slide over earlier ones. Once the last category
 * has pinned, heading and rows let go together and scroll away as one block.
 */
export function ServicesStack({
  heading,
  items = categories,
}: {
  heading: HeadingProps;
  items?: ServiceCategory[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const phasesRef = useRef<HTMLDivElement>(null);

  // Rows pin 1rem below the heading (its measured height is exposed as --head-h). Rows let
  // go when their wrapper's bottom reaches that pin line + last row height; the heading when
  // the container reaches 5rem + heading height. Pull the heading's container up by the
  // difference so both release at the same scroll position.
  useSyncedRelease(sectionRef, () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const last = phasesRef.current?.lastElementChild as HTMLElement | null;
    const head = headRef.current;
    if (!last || !head) return 0;
    sectionRef.current?.style.setProperty("--head-h", `${head.offsetHeight}px`);
    return 1 * rem + last.offsetHeight;
  });

  return (
    <section ref={sectionRef} className="sec-red bg-white lg:pb-[calc(10rem+var(--release,0px))]">
      <div className="container-x flow-root">
        <div ref={headRef} className="sticky top-[5rem] z-0 bg-white pb-[1rem] max-md:static">
          <SectionHeading {...heading} />
        </div>

        <div ref={phasesRef} className="lg:mb-[calc(-1*var(--release,0px))]">

        {items.map((c, pi) => {
          const cards = c.services.map((s) => ({ href: serviceHref(c, s), icon: s.icon, title: s.title, body: s.summary }));
          return (
            <div
              key={c.slug}
              className={cn("sticky top-[calc(6rem+var(--head-h,18rem))] bg-white pb-[8rem] max-md:static max-md:pb-10", pi === 0 && "mt-[2.4rem]")}
              style={{ zIndex: pi + 1 }}
            >
              <div className="flex flex-wrap items-center gap-[1.6rem]">
                <Link
                  href={serviceHref(c)}
                  className="inline-block rounded-[1.875rem] border-[0.8px] border-[var(--teal)] bg-[var(--teal)] py-[1.25rem] pl-[1rem] pr-[2rem] text-[1.375rem] uppercase leading-[2.08rem] text-white transition-colors hover:bg-[#006e62] max-md:text-sm"
                >
                  {c.number} - {c.title}
                </Link>
                <span className="body-thin max-md:hidden">{c.short}</span>
              </div>

              {/* Every row auto-scrolls (alternating direction), pauses on hover and can be dragged. */}
              <DragMarquee className="mt-[2.4rem] py-[0.4rem]" speed={45} reverse={pi % 2 === 1}>
                <div className="flex gap-[2.5rem] pr-[2.5rem]">
                  {cards.map((card) => (
                    <ServiceCard key={card.href} {...card} />
                  ))}
                </div>
              </DragMarquee>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
