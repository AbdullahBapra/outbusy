"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Post } from "@/content/pages";
import { PillButton } from "@/components/ui/pill-button";
import { ArrowCircleIcon } from "@/components/icons";
import { canOptimizeImage, coverFor } from "@/lib/blog/format";

export type BlogPanel = {
  eyebrow: string;
  title: string;
  body: string;
  items: { title: string; meta?: string }[];
};

// Default side panel: the topics the blog covers.
function topicsPanel(posts: Post[]): BlogPanel {
  const count = (tag: string) => posts.filter((p) => p.tag === tag).length;
  return {
    eyebrow: "The blog",
    title: "Guides without the hype",
    body: "Short, practical reads from real client builds — what works, what doesn't, and how to roll it out.",
    items: [...new Set(posts.map((p) => p.tag))].slice(0, 4).map((tag) => ({
      title: tag,
      meta: `${count(tag)} guide${count(tag) > 1 ? "s" : ""}`,
    })),
  };
}

// Slider geometry: 2 slides per view, 33.8rem slides, 2.4rem gap → 70rem viewport.
// Sizes come from CSS vars (--slide / --gap) so mobile can use a narrower slide.
const AUTOPLAY_MS = 2500;
const SPEED_MS = 300;

function SliderArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous post" : "Next post"}
      onClick={onClick}
      className={`absolute top-[7.9rem] z-10 h-[5.5rem] w-[5.5rem] rounded-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] max-md:top-[5rem] max-md:h-12 max-md:w-12 ${
        dir === "prev" ? "left-[-2rem] max-lg:left-1" : "left-[66.5rem] max-lg:left-auto max-lg:right-1"
      }`}
    >
      <svg viewBox="0 0 88 88" className="h-full w-full" fill="none" aria-hidden="true">
        <circle cx="44" cy="44" r="36" fill="#fff" />
        <path
          d={dir === "prev" ? "M56 44H33m0 0 9-9m-9 9 9 9" : "M32 44h23m0 0-9-9m9 9-9 9"}
          stroke="#040404"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function BlogSlider({
  posts,
  big = "Insights",
  strong = "Latest",
  light = "on AI automation",
  cta = "View All Posts",
  ctaHref = "/blog",
  panel,
}: {
  posts: Post[];
  big?: string;
  strong?: string;
  light?: string;
  cta?: string;
  ctaHref?: string;
  panel?: BlogPanel;
}) {
  const side = panel ?? topicsPanel(posts);
  const n = Math.max(posts.length, 1);
  // Three copies so the loop can run in either direction without a visible jump.
  const slides = [...posts, ...posts, ...posts];
  const [index, setIndex] = useState(n);
  const [animate, setAnimate] = useState(true);

  const go = useCallback((d: 1 | -1) => {
    setAnimate(true);
    setIndex((i) => i + d);
  }, []);

  // Autoplay every 2.5s (restarts after manual navigation, paused while the tab is hidden).
  useEffect(() => {
    const id = setTimeout(() => {
      if (!document.hidden) go(1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, go]);

  // Once the slide transition has finished, silently jump back into the middle copy.
  // Timer-based rather than transitionend, which never fires on a hidden page.
  useEffect(() => {
    if (index >= n && index < 2 * n) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setIndex(((index % n) + n) % n + n);
    }, SPEED_MS + 20);
    return () => clearTimeout(id);
  }, [index, n]);

  // Re-enable the transition shortly after a silent jump has been painted.
  useEffect(() => {
    if (animate) return;
    const id = setTimeout(() => setAnimate(true), 30);
    return () => clearTimeout(id);
  }, [animate]);

  return (
    <section className="sec-red bg-white">
      <div className="container-x">
        <h2 className="flex flex-col">
          <span className="display">{big}</span>
          <span className="sub-light">
            <strong className="font-bold text-black">{strong}</strong> {light}
          </span>
        </h2>

        <div className="mt-[4rem] flex gap-[1.5rem] max-lg:flex-col">
          {/* Slider */}
          <div className="relative w-[70rem] flex-none [--gap:2.4rem] [--slide:33.8rem] max-lg:w-full max-md:[--gap:1rem] max-md:[--slide:80vw]">
            <SliderArrow dir="prev" onClick={() => go(-1)} />
            <SliderArrow dir="next" onClick={() => go(1)} />

            <div className="overflow-hidden">
              <div
                className="flex gap-[var(--gap)]"
                style={{
                  transform: `translateX(calc(${-index} * (var(--slide) + var(--gap))))`,
                  transition: animate ? `transform ${SPEED_MS}ms ease` : "none",
                }}
              >
                {slides.map((p, i) => (
                  <article key={i} className="flex w-[var(--slide)] flex-none flex-col gap-[1rem]">
                    <Link href={`/blog/${p.slug}`} className="block overflow-hidden rounded-[1.875rem]">
                      <div
                        className="relative flex h-[21.5rem] items-end p-[1.6rem] transition-transform duration-500 hover:scale-105"
                        style={p.cover ? undefined : { background: coverFor(p) }}
                      >
                        {p.cover && (
                          <>
                            <Image src={p.cover.url} alt={p.cover.alt} fill unoptimized={!canOptimizeImage(p.cover.url)} sizes="(max-width: 767px) 80vw, 540px" className="object-cover" />
                            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.55))]" />
                          </>
                        )}
                        <span className="relative text-[1rem] uppercase tracking-[0.2em] text-white/80">
                          {p.readTime} read
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-col items-start gap-[1rem] px-[2rem] pt-[2rem]">
                      <Link
                        href="/blog"
                        className="rounded-[0.5rem] bg-[rgba(0,239,212,0.21)] px-[0.75rem] py-[0.563rem] text-[1.44rem] uppercase leading-[1.76rem] text-[var(--text)] transition-colors duration-200 hover:bg-[rgba(0,239,212,0.4)]"
                      >
                        {p.tag}
                      </Link>
                      <Link href={`/blog/${p.slug}`} className="block w-full pb-[1rem] pt-[0.5rem]">
                        <h3 className="line-clamp-2 h-[6.6rem] overflow-hidden text-[3rem] font-light uppercase leading-[3.3rem] text-[var(--text)]">
                          {p.title}
                        </h3>
                      </Link>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="group inline-flex items-center justify-center gap-[1rem] rounded-[1.875rem] border-[0.8px] border-[rgba(217,217,217,0.7)] p-[1rem] text-[1.375rem] uppercase leading-[1.788rem] text-[var(--text)] transition-colors duration-200 hover:bg-[rgba(28,208,188,0.2)]"
                      >
                        Read More
                        <ArrowCircleIcon
                          className="h-[3rem] w-[3rem] transition-transform duration-300 group-hover:-rotate-[40deg]"
                          circle="#00efd4"
                          arrow="#ffffff"
                        />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Side panel — promo card beside the slider */}
          <aside className="relative isolate flex min-h-[44.37rem] flex-1 flex-col overflow-hidden rounded-[1.875rem] bg-[#040404] p-[2.8rem] text-white max-lg:min-h-0 max-md:p-6">
            <div aria-hidden="true" className="absolute -bottom-[10rem] -right-[10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[var(--accent)] opacity-30 blur-[6rem]" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:1.6rem_1.6rem]" />

            <span className="w-fit rounded-full border border-white/15 bg-white/5 px-[1rem] py-[0.35rem] text-[1rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] max-md:text-[10px]">
              {side.eyebrow}
            </span>
            <h3 className="mt-[1.6rem] text-[3.2rem] font-bold uppercase leading-[1.02] max-lg:text-[3.6rem] max-md:mt-4 max-md:text-[1.6rem]">{side.title}</h3>
            <p className="mt-[1rem] text-[1.3rem] font-light leading-[2rem] text-white/70 max-lg:text-[1.5rem] max-md:text-sm max-md:leading-6">{side.body}</p>

            <ul className="mt-[2rem] divide-y divide-white/10 border-y border-white/10 max-md:mt-5">
              {side.items.map((it) => (
                <li key={it.title} className="flex items-center gap-[1rem] py-[1.1rem] max-md:py-3">
                  <span className="flex h-[2rem] w-[2rem] flex-none items-center justify-center rounded-full bg-[var(--accent)] text-[1rem] font-bold text-[var(--ink)] max-md:h-5 max-md:w-5 max-md:text-[10px]">
                    ✓
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[1.3rem] font-medium leading-[1.8rem] max-lg:text-[1.5rem] max-md:text-sm">{it.title}</span>
                  {it.meta && <span className="flex-none text-[1rem] uppercase tracking-wide text-white/45 max-md:text-[10px]">{it.meta}</span>}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-[2.4rem] max-md:pt-6">
              <PillButton href={ctaHref} variant="white">
                {cta}
              </PillButton>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
