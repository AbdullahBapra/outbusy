"use client";

import Link from "next/link";
import { useRef } from "react";
import { useSyncedRelease } from "@/components/sections/inner/useSyncedRelease";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { ArrowCircleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// white → mint → dark teal
const tones = [
  "border-black/50 bg-white text-[var(--ink)]",
  "border-[var(--mint-300)] bg-[var(--mint-300)] text-[var(--ink)]",
  "border-[#038475] bg-[#038475] text-white",
];

/**
 * Full-width stacking cards (spec §2): heading pins at top:5rem, every card pins at
 * top:33rem, so each new card slides up over the previous one. When the last card has
 * pinned, heading and cards let go together and scroll away as one block.
 */
export function StackedList({
  heading,
  items,
  enquire,
}: {
  heading: HeadingProps;
  items: { title: string; body: string; href?: string }[];
  /** Context for the enquiry funnel, e.g. the service name. Cards without their own
   *  `href` link to the contact form with "<enquire> — <item>" prefilled. */
  enquire?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Cards pin 1.875rem below the heading (its measured height is exposed as --head-h). Cards
  // let go when their wrapper's bottom reaches that pin line + last card height; the heading
  // when its container reaches 5rem + heading height. Pull the heading's container up by the
  // difference so both happen at the same scroll position.
  useSyncedRelease(sectionRef, () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const last = cardsRef.current?.lastElementChild as HTMLElement | null;
    const head = headRef.current;
    if (!last || !head) return 0;
    sectionRef.current?.style.setProperty("--head-h", `${head.offsetHeight}px`);
    return 1.875 * rem + last.offsetHeight;
  });

  return (
    <section ref={sectionRef} className="bg-white pb-[calc(7.5rem+var(--release,0px))] pt-[7.5rem] max-lg:py-[2rem]">
      <div className="container-x flow-root">
        <div ref={headRef} className="relative z-20 flex items-end justify-between bg-white pb-[1rem] lg:sticky lg:top-[5rem] lg:shadow-[0_-5rem_0_0_#fff]">
          <SectionHeading {...heading} />
        </div>

        <div ref={cardsRef} className="mb-[calc(-1*var(--release,0px))] mt-[1.875rem] flex flex-wrap gap-[1.875rem] bg-white">
          {items.map((it, i) => {
            const topic = enquire ? `${enquire} — ${it.title}` : it.title;
            const href = it.href ?? `/contact?topic=${encodeURIComponent(topic)}#contact`;
            const funnel = !it.href;
            const inner = (
              <>
                <h3 className="heading-2 mt-[0.625rem] max-w-[60rem] uppercase">{it.title}</h3>
                <p className={cn("body-text mb-[0.625rem] max-w-[55rem]", i % 3 === 2 ? "!text-white/90" : "")}>{it.body}</p>
                {funnel && (
                  <span
                    className={cn(
                      "text-[1.05rem] font-semibold uppercase tracking-[0.08em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
                      i % 3 === 2 ? "text-[var(--accent)]" : "text-[var(--teal)]",
                    )}
                  >
                    Get a quote for this →
                  </span>
                )}
                <span className="absolute right-[2.3rem] top-1/2 flex h-[10.4rem] w-[10.4rem] -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-[var(--accent)] opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 max-lg:hidden">
                  <ArrowCircleIcon className="h-[4rem] w-[4rem] -rotate-45 transition-transform duration-300 group-hover:rotate-0" circle="transparent" arrow="#040404" />
                </span>
              </>
            );
            const cls = cn(
              "group relative flex min-h-[10rem] w-full flex-col items-start rounded-[1.875rem] border py-[1.75rem] pl-[4rem] pr-[10rem] lg:sticky lg:top-[calc(6.875rem+var(--head-h,24rem))] max-lg:sticky max-lg:top-[11.5rem] max-lg:pl-[1rem] max-lg:pr-[4rem]",
              tones[i % 3],
            );
            return (
              <Link key={it.title} href={href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
