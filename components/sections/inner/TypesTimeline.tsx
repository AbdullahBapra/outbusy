"use client";

import { useEffect, useRef, useState } from "react";
import { PillButton } from "@/components/ui/pill-button";
import { cn } from "@/lib/utils";

type Item = { title: string; body: string; icon: string; href?: string };

/**
 * Scroll-driven list (desktop ≥992px): the section pins while you scroll through a tall
 * wrapper; scroll progress picks the active item. Left: numbered list — active item is
 * dark and shows its description, the rest are dimmed; a thin rail fills with teal as you
 * go. Clicking an item scrolls to it. Right: an editorial panel for the active item.
 * Below 992px it's a plain stacked list.
 */
export function TypesTimeline({ big, accent, strong, intro, items }: { big: string; accent: string; strong: string; intro: string; items: Item[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [desktop, setDesktop] = useState(true);
  const n = items.length;

  useEffect(() => {
    const onScroll = () => {
      const isDesktop = window.innerWidth >= 992;
      setDesktop(isDesktop);
      const el = wrap.current;
      if (!el || !isDesktop) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(Math.max(-el.getBoundingClientRect().top / Math.max(total, 1), 0), 1);
      setProgress(p);
      setActive(Math.min(n - 1, Math.floor(p * n)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  // Jump to an item's scroll segment.
  const goTo = (i: number) => {
    const el = wrap.current;
    if (!el || !desktop) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * total, behavior: "smooth" });
  };

  const current = items[active] ?? items[0];
  const num = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div ref={wrap} className="relative" style={desktop ? { height: `${n * 45 + 70}vh` } : undefined}>
      <section className="flex min-h-screen items-center bg-white py-[3.5rem] lg:sticky lg:top-0 max-lg:min-h-0">
        <div className="container-x w-full">
          <h2>
            <span className="heading-title block whitespace-nowrap max-lg:whitespace-normal">
              {big} <strong className="accent">{accent}</strong>
            </span>
            <span className="mt-[0.3rem] block text-[2.4rem] font-bold uppercase leading-[1.2] text-black max-md:text-lg">{strong}</span>
          </h2>
          <p className="body-text mt-[0.4rem] max-w-[55rem]">{intro}</p>

          <div className="mt-[3rem] grid grid-cols-[1fr_1fr] gap-[6rem] max-lg:grid-cols-1 max-lg:gap-0">
            {/* Left: numbered list with progress rail */}
            <div className="relative pl-[2.4rem] max-lg:pl-0">
              <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-[2px] rounded-full bg-black/10 max-lg:hidden">
                <span
                  className="absolute inset-x-0 top-0 rounded-full bg-[var(--teal)] transition-[height] duration-200 ease-out"
                  style={{ height: `${Math.max(progress, 1 / (n * 4)) * 100}%` }}
                />
              </span>

              <ol>
                {items.map((it, i) => {
                  const on = !desktop || i === active;
                  return (
                    <li key={it.title} className="border-b border-black/[0.08] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className="group/row flex w-full items-baseline gap-[1.4rem] py-[1.2rem] text-left"
                        aria-current={desktop && i === active ? "true" : undefined}
                      >
                        <span className={cn("text-[1.1rem] font-medium tabular-nums transition-colors duration-300", on ? "text-[var(--teal)]" : "text-black/25")}>
                          {num(i)}
                        </span>
                        <span className="flex-1">
                          <span
                            className={cn(
                              "block text-[2rem] font-semibold uppercase leading-[2.4rem] transition-colors duration-300 max-md:text-lg",
                              on ? "text-[var(--ink)]" : "text-black/25 group-hover/row:text-black/50",
                            )}
                          >
                            {it.title}
                          </span>
                          {/* description expands for the active item */}
                          <span className={cn("grid transition-[grid-template-rows] duration-300 ease-out", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                            <span className="overflow-hidden">
                              <span className="body-text block pt-[0.5rem]">{it.body}</span>
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Right: editorial panel for the active item */}
            <div className="max-lg:hidden">
              <div key={active} className="fade-quick flex h-full min-h-[34rem] flex-col rounded-[3rem] bg-[var(--mint-50)] p-[3rem]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.1rem] font-medium uppercase tracking-[0.12em] text-black/40">{strong}</span>
                  <span className="text-[1.1rem] font-medium tabular-nums text-black/40">
                    {num(active)} / {String(n).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-auto">
                  <div className="text-[5.5rem] font-bold leading-[0.9] tracking-[-0.04em] text-[var(--teal)]">{num(active)}</div>
                  <h3 className="card-title mt-[1.4rem]">{current.title}</h3>
                  <p className="body-text mt-[0.6rem] max-w-[40rem]">{current.body}</p>
                  {current.href && (
                    <div className="mt-[2rem]">
                      <PillButton href={current.href}>View Service</PillButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
