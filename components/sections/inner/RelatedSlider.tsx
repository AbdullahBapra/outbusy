"use client";

import Link from "next/link";
import { useRef } from "react";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { ArrowCircleIcon } from "@/components/icons";

/** Horizontal card slider (prev/next arrows) linking to other services or pages. */
export function RelatedSlider({ heading, items }: { heading: HeadingProps; items: { title: string; body: string; href: string }[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (d: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 300) + 24), behavior: "smooth" });
  };

  return (
    <section className="sec-red bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />
        <div className="relative mt-[3rem]">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scroll(-1)}
            className="absolute left-[-2rem] top-1/2 z-10 flex h-[4.8rem] w-[4.8rem] -translate-y-1/2 items-center justify-center rounded-full bg-white text-[2rem] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 max-md:left-1"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scroll(1)}
            className="absolute right-[-2rem] top-1/2 z-10 flex h-[4.8rem] w-[4.8rem] -translate-y-1/2 items-center justify-center rounded-full bg-white text-[2rem] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 max-md:right-1"
          >
            →
          </button>
          <div
            ref={track}
            className="flex snap-x snap-mandatory gap-[2rem] overflow-x-auto px-[0.4rem] py-[0.4rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                data-card
                className="group relative flex min-h-[28.5rem] w-[26.9rem] flex-none snap-start flex-col justify-between gap-[0.7rem] rounded-[1.5rem] border-[0.8px] border-black bg-white px-[1.5rem] py-[2.5rem] transition-colors duration-300 hover:bg-[var(--mint-50)] max-md:w-64"
              >
                <div>
                  <h3 className="text-[2.4rem] font-light uppercase leading-[2.8rem] text-[var(--ink)] max-md:text-xl">{it.title}</h3>
                  <p className="body-thin mt-[1rem]">{it.body}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-[1rem] rounded-[1.875rem] border-[0.8px] border-[rgba(217,217,217,0.7)] p-[1rem] text-[1.2rem] uppercase text-[var(--text)] transition-colors group-hover:bg-[rgba(28,208,188,0.2)] max-md:text-xs">
                  Learn more
                  <ArrowCircleIcon className="h-[2.6rem] w-[2.6rem] transition-transform duration-300 group-hover:-rotate-[40deg]" circle="#00efd4" arrow="#040404" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
