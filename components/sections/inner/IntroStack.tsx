"use client";

import { useEffect, useRef } from "react";
import { PillButton } from "@/components/ui/pill-button";
import { MediaVisual } from "@/components/sections/inner/MediaVisual";
import { AutomationVisual } from "@/components/sections/inner/AutomationVisual";
import { useSyncedRelease } from "@/components/sections/inner/useSyncedRelease";
import { cn } from "@/lib/utils";

// Card variants: white / accent / mint, tilted -2°, 1°, -1°.
const cardStyle = [
  "bg-white lg:-rotate-2",
  "bg-[var(--accent)] lg:rotate-1",
  "bg-[var(--mint-300)] lg:-rotate-1",
];

/**
 * Intro section (spec: docs/research/components/inner-scroll-sections.spec.md §1).
 * - Heading row pins at top:0 (≥992px). Its height is written to --header-height.
 * - Cards pin at calc(var(--header-height) + 20px) and stack over each other.
 * - The heading must stay compact (one display line + one short sub line), otherwise
 *   the cards pin too low and the pinned heading covers the right-hand media.
 * - Heading, cards and media all let go at the same scroll position, so the whole block
 *   scrolls away together (no cards sliding up under the pinned heading). The media's pin
 *   offset is set so its bottom lines up with the last card's bottom.
 */
export function IntroStack({
  big,
  bigAccent,
  strong,
  intro,
  cards,
  visualLabels,
  visualCaption,
  image,
  cta = { label: "Book Free AI Audit", href: "/contact" },
}: {
  big: string;
  bigAccent: string;
  strong: string;
  intro: string;
  cards: { title: string; body: string }[];
  visualLabels?: string[];
  visualCaption?: string;
  /** Art for the visual panel; the pipeline floats over it. Falls back to the diagram. */
  image?: string;
  cta?: { label: string; href: string };
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  // Heading's container must end (20px + last card height) earlier than the cards' column.
  useSyncedRelease(sectionRef, () => {
    const last = cardsRef.current?.lastElementChild as HTMLElement | null;
    const head = headRef.current;
    const media = mediaRef.current;
    if (!last || !head) return 0;
    const lastH = last.offsetHeight;
    if (media) {
      const top = head.offsetHeight + 20 + lastH - media.offsetHeight;
      sectionRef.current?.style.setProperty("--media-top", `${Math.max(top, head.offsetHeight + 20)}px`);
    }
    return 20 + lastH;
  });

  useEffect(() => {
    const section = sectionRef.current;
    const head = headRef.current;
    if (!section || !head) return;

    const setHeight = () => section.style.setProperty("--header-height", `${head.offsetHeight}px`);
    setHeight();
    window.addEventListener("resize", setHeight);

    // Re-measure once web fonts have loaded (the heading height changes with them).
    document.fonts?.ready.then(setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);

  return (
    <section ref={sectionRef} className="bg-white pb-[calc(5rem+var(--release,0px))] pt-[5rem] max-lg:py-[2rem]">
      <div className="container-x flow-root">
        <div ref={headRef} className="relative z-[100] bg-white pt-[1rem] lg:sticky lg:top-0">
          <h2 className="flex flex-col">
            <span className="heading-title whitespace-nowrap max-lg:whitespace-normal">
              {big} <strong className="accent">{bigAccent}</strong>
            </span>
            <span className="sub-heading font-semibold">{strong}</span>
          </h2>
          <div className="flex items-end justify-between gap-[2rem] max-md:flex-col max-md:items-start">
            <p className="body-text mt-[0.625rem] max-w-[47.8rem]">{intro}</p>
            <PillButton href={cta.href}>{cta.label}</PillButton>
          </div>
        </div>

        <div className="mt-[2.8rem] mb-[calc(-1*var(--release,0px))] grid grid-cols-2 gap-[7.5rem] max-lg:grid-cols-1 max-lg:gap-[1rem]">
          <div ref={cardsRef} className="flex flex-col gap-[1.5rem]">
            {cards.slice(0, 3).map((c, i) => (
              <div
                key={c.title}
                className={cn(
                  "mx-auto w-full max-w-[40.625rem] rounded-[1.875rem] border border-black/50 p-[1.5rem] lg:sticky lg:top-[calc(var(--header-height,0px)+20px)]",
                  cardStyle[i],
                )}
              >
                <h3 className="sub-heading mt-[0.625rem] font-bold">{c.title}</h3>
                <p className="body-text">{c.body}</p>
                <div className="mb-[1rem] mt-[2rem] flex h-[13rem] items-center gap-[0.8rem] rounded-[1.4rem] bg-[#040404] p-[1.2rem]">
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="flex h-full flex-1 flex-col justify-between rounded-[1rem] border border-white/10 bg-white/5 p-[0.9rem]">
                      <span className="h-[0.6rem] w-2/3 rounded-full bg-white/20" />
                      <span className="text-[2rem] font-bold leading-none text-[var(--accent)]">{["✓", "→", "★"][k]}</span>
                      <span className="h-[0.5rem] w-1/2 rounded-full bg-white/15" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div ref={mediaRef} className="lg:sticky lg:top-[var(--media-top,27rem)]">
              {image ? (
                <MediaVisual image={image} labels={visualLabels} caption={visualCaption} className="w-full max-md:rounded-[1.4rem]" />
              ) : (
                <AutomationVisual
                  labels={visualLabels}
                  caption={visualCaption}
                  className="h-[25rem] w-full rounded-[3rem] max-md:h-[12rem] max-md:rounded-[2rem]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
