"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Clear, product-style visual for CTA banners: a "weekly report" card comparing
 * hours of manual work before vs after automation, plus the tasks that get automated.
 * The figures are illustrative and labelled as an example.
 */
export function TimeSavedPanel({
  tasks = ["Lead follow-ups", "CRM data entry", "Weekly reporting"],
  before = 14,
  after = 2,
}: {
  tasks?: string[];
  before?: number;
  after?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  // Animate the bars once, when the panel scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const afterPct = Math.max(6, Math.round((after / before) * 100));

  return (
    <div ref={ref} className="flex min-h-[29.04rem] items-center justify-center rounded-[1.875rem] bg-[var(--mint-50)] p-[3rem] max-md:p-5">
      <div className="w-full max-w-[44rem] rounded-[1.4rem] border border-black/[0.08] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        {/* window bar */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-[1.6rem] py-[1rem]">
          <div className="flex gap-[0.4rem]" aria-hidden="true">
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-[0.7rem] w-[0.7rem] rounded-full bg-black/10" />
            ))}
          </div>
          <span className="text-[1rem] font-medium uppercase tracking-[0.1em] text-black/40">Weekly report</span>
        </div>

        <div className="space-y-[1.4rem] p-[1.6rem]">
          <div className="text-[1.1rem] font-medium text-black/50">Hours spent on manual work, per person</div>

          {/* Before */}
          <div>
            <div className="mb-[0.4rem] flex items-baseline justify-between text-[1.1rem]">
              <span className="font-semibold text-[var(--ink)]">Before</span>
              <span className="whitespace-nowrap tabular-nums text-black/60">{before} h / week</span>
            </div>
            <div className="h-[1rem] overflow-hidden rounded-full bg-black/[0.05]">
              <div className="h-full w-full rounded-full bg-black/25" />
            </div>
          </div>

          {/* After */}
          <div>
            <div className="mb-[0.4rem] flex items-baseline justify-between text-[1.1rem]">
              <span className="font-semibold text-[var(--teal)]">With automation</span>
              <span className="whitespace-nowrap tabular-nums font-semibold text-[var(--teal)]">{after} h / week</span>
            </div>
            <div className="h-[1rem] overflow-hidden rounded-full bg-black/[0.05]">
              <div
                className="h-full rounded-full bg-[var(--teal)] transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                style={{ width: shown ? `${afterPct}%` : "100%" }}
              />
            </div>
          </div>

          {/* Automated tasks */}
          <ul className="divide-y divide-black/[0.06] border-t border-black/[0.06] pt-[0.4rem]">
            {tasks.slice(0, 3).map((t) => (
              <li key={t} className="flex items-center justify-between gap-3 py-[0.8rem] text-[1.1rem]">
                <span className="text-[var(--ink)]">{t}</span>
                <span className="flex-none whitespace-nowrap rounded-full bg-[var(--mint-100)] px-[0.8rem] py-[0.15rem] text-[0.95rem] font-medium text-[var(--teal)]">✓ Automated</span>
              </li>
            ))}
          </ul>

          <p className="text-[0.95rem] text-black/40">Example figures — your free audit gives you real numbers.</p>
        </div>
      </div>
    </div>
  );
}
