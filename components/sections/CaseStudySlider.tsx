"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseStudy } from "@/content/caseStudies";
import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { ToolLogo, hasLogo } from "@/components/ui/tool-logo";

/** The case study's stack as a running pipeline: steps, live status and the headline result. */
function WorkflowCard({ cs }: { cs: CaseStudy }) {
  const nodes = cs.stack.slice(0, 4);
  return (
    <div
      className="relative h-[26.4rem] w-full overflow-hidden rounded-[1.2rem] bg-[#0b2a27] p-[1.6rem] shadow-[0_30px_60px_rgba(0,80,70,0.25)] max-md:h-64 max-md:p-4"
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:1.6rem_1.6rem]" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-[0.9rem] py-[0.3rem] whitespace-nowrap text-[0.95rem] uppercase leading-normal tracking-widest text-white/70 max-md:text-[10px]">Live workflow</span>
          <span className="flex items-center gap-[0.4rem] text-[0.95rem] leading-normal text-[var(--accent)] max-md:text-xs">
            <span className="h-[0.6rem] w-[0.6rem] animate-pulse rounded-full bg-[var(--accent)]" /> Running
          </span>
        </div>
        <div className="flex items-center justify-between gap-[0.6rem] max-md:gap-1">
          {nodes.map((n, i) => (
            <div key={n} className="flex min-w-0 flex-1 items-center gap-[0.6rem] max-md:gap-1">
              <div
                className="flex min-h-[5.6rem] min-w-0 flex-1 flex-col items-center justify-center rounded-[0.9rem] border border-white/15 bg-white/5 px-[0.4rem] text-center max-md:min-h-16 max-md:px-0.5"
              >
                <span className="whitespace-nowrap text-[0.85rem] uppercase leading-normal text-white/50 max-md:text-[8px]">Step {i + 1}</span>
                {hasLogo(n) && <ToolLogo name={n} tone="light" className="my-[0.3rem] h-[1.8rem] w-[1.8rem] max-md:h-4 max-md:w-4" />}
                <span className="text-[1.1rem] font-semibold leading-tight text-white max-md:max-w-full max-md:truncate max-md:text-[10px]">{n}</span>
              </div>
              {i < nodes.length - 1 && <span className="h-[2px] w-[1.4rem] flex-none bg-[var(--accent)] flow-dash max-md:w-2" />}
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[3.4rem] font-bold leading-none text-[var(--accent)] max-md:text-3xl">
              {cs.headlineStat.value}
            </div>
            <div className="mt-[0.4rem] text-[1rem] uppercase leading-snug tracking-wide text-white/70 max-md:text-[10px]">{cs.headlineStat.label}</div>
          </div>
          <div className="flex h-[5rem] flex-none items-end gap-[0.4rem] max-md:h-12 max-md:gap-1">
            {[40, 55, 45, 70, 60, 85, 95].map((h, i) => (
              <div key={i} className="w-[0.9rem] rounded-t-[0.3rem] max-md:w-2 bg-[var(--accent)]" style={{ height: `${h}%`, opacity: 0.4 + i * 0.08 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Slim pipeline strip shown under a case study photo: headline result, then the tool chain. */
function WorkflowStrip({ cs }: { cs: CaseStudy }) {
  const nodes = cs.stack.slice(0, 4);
  return (
    <div className="flex items-center gap-[2rem] px-[1.6rem] py-[1.3rem] max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-4">
      <div className="flex-none">
        <div className="text-[2.4rem] font-bold leading-none text-[var(--accent)] max-md:text-2xl">{cs.headlineStat.value}</div>
        <div className="mt-[0.4rem] max-w-[14rem] text-[0.95rem] uppercase leading-snug tracking-wide text-white/60 max-md:max-w-none max-md:text-[10px]">
          {cs.headlineStat.label}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-[0.5rem] max-md:justify-start max-md:gap-1.5">
        {nodes.map((n, i) => (
          <span key={n} className="flex items-center gap-[0.5rem] max-md:gap-1.5">
            {i > 0 && <span className="h-[2px] w-[1rem] bg-[var(--accent)] flow-dash max-md:w-2" />}
            <span className="flex items-center gap-[0.5rem] rounded-full bg-white/[0.07] py-[0.4rem] pl-[0.6rem] pr-[0.9rem] text-[1.05rem] font-medium text-white ring-1 ring-white/15 max-md:py-1 max-md:pl-1.5 max-md:pr-2 max-md:text-[11px]">
              {hasLogo(n) && <ToolLogo name={n} tone="light" className="h-[1.4rem] w-[1.4rem] max-md:h-3.5 max-md:w-3.5" />}
              {n}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Case study visual: the photo of the business moment shown in full, with the live pipeline
 * as a slim strip underneath. Falls back to the plain workflow panel when there is no photo.
 */
export function WorkflowMockup({ cs }: { cs: CaseStudy }) {
  if (!cs.image) return <WorkflowCard cs={cs} />;
  return (
    <div className="w-full overflow-hidden rounded-[1.4rem] bg-[#06201d] shadow-[0_30px_60px_rgba(0,80,70,0.25)]">
      <div className="relative aspect-[16/9]">
        <Image src={cs.image} alt="" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
        <span className="absolute left-[1.2rem] top-[1.2rem] flex items-center gap-[0.5rem] rounded-full bg-[#040404]/70 px-[0.9rem] py-[0.35rem] text-[0.95rem] uppercase tracking-[0.14em] text-white backdrop-blur-sm max-md:left-3 max-md:top-3 max-md:text-[10px]">
          <span className="h-[0.6rem] w-[0.6rem] animate-pulse rounded-full bg-[var(--accent)]" /> Live workflow
        </span>
      </div>
      <WorkflowStrip cs={cs} />
    </div>
  );
}

export function SampleBadge() {
  return (
    <span className="rounded-full border border-black/20 bg-white/60 px-[0.8rem] py-[0.2rem] text-[0.9rem] max-md:text-[10px] uppercase tracking-wide text-black/60">
      Example project
    </span>
  );
}

export function CaseStudySlider({
  items,
  heading,
}: {
  items: CaseStudy[];
  heading: HeadingProps;
}) {
  const [active, setActive] = useState(0);
  const count = items.length;

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setActive((a) => (a + 1) % count);
    }, 5000);
    return () => clearInterval(id);
  }, [count, active]);

  return (
    <section className="sec-red bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />

        <div className="relative mt-[3rem] overflow-hidden">
          <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateX(-${active * 100}%)` }}>
            {items.map((cs) => (
              <div key={cs.slug} className="w-full flex-none">
                <div
                  className="grid grid-cols-2 items-center gap-[2rem] rounded-[1.875rem] px-[3.125rem] pb-[2rem] pt-[3.75rem] max-md:grid-cols-1 max-md:p-6"
                  style={{ background: cs.tint }}
                >
                  <div>
                    <div className="mb-[1rem] flex flex-wrap items-center gap-[0.6rem]">
                      <span className="rounded-[0.938rem] bg-white px-[0.8rem] py-[0.4rem] text-[1.1rem] uppercase leading-none max-md:text-xs">{cs.industry}</span>
                      {cs.sample && <SampleBadge />}
                    </div>
                    <h3 className="text-[3.125rem] font-semibold uppercase leading-[3.75rem] text-[var(--ink)] max-md:text-2xl max-md:leading-8">{cs.title}</h3>
                    <p className="body-thin mt-[1rem] max-w-[44rem]">{cs.problem}</p>
                    <ul className="mt-[1.4rem] space-y-[0.6rem]">
                      {cs.results.map((r) => (
                        <li key={r.label} className="flex items-center gap-[0.8rem] text-[1.375rem] font-semibold uppercase leading-[1.6rem] text-[var(--ink)] max-md:items-start max-md:text-sm max-md:leading-5">
                          <span className="h-[0.32rem] w-[0.32rem] flex-none rounded-[0.5rem] max-md:mt-2 bg-[var(--text)]" />
                          {r.value} {r.label}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/case-studies/${cs.slug}`} className="mt-[1.6rem] inline-block text-[1.2rem] font-semibold uppercase text-[var(--teal)] underline-offset-4 max-md:text-sm hover:underline">
                      Read the case study →
                    </Link>
                  </div>
                  <WorkflowMockup cs={cs} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[1.2rem] flex gap-[0.5rem] pl-[3.125rem] max-md:pl-2">
            {items.map((cs, i) => (
              <button
                key={cs.slug}
                type="button"
                aria-label={`Show case study ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-[1.28rem] w-[1.28rem] rounded-[8rem] border-[0.8px] border-[var(--teal)] transition-colors duration-300",
                  i === active ? "bg-[var(--accent)]" : "bg-white/40",
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-[2rem] flex justify-end">
          <PillButton href="/case-studies">All Case Studies</PillButton>
        </div>
      </div>
    </section>
  );
}
