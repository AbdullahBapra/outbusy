import type { ReactNode } from "react";
import { PillButton } from "@/components/ui/pill-button";

/** Right-hand CTA column for the mega menus: a small product-style visual + copy + button. */
export function MegaCta({
  eyebrow,
  title,
  body,
  cta,
  href,
  visual,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  visual: ReactNode;
}) {
  return (
    <div className="flex flex-col border-l border-black/[0.06] bg-[#fafafa] p-[1.4rem]">
      <div className="rounded-[1rem] border border-black/[0.06] bg-[var(--mint-50)] p-[1.2rem]">{visual}</div>
      <div className="flex flex-1 flex-col px-[0.4rem] pt-[1.2rem]">
        <span className="text-[0.9rem] font-medium uppercase tracking-[0.1em] text-black/40">{eyebrow}</span>
        <div className="mt-[0.4rem] text-[1.45rem] font-semibold leading-[1.8rem] text-[var(--ink)]">{title}</div>
        <p className="mt-[0.4rem] text-[1.02rem] leading-[1.5rem] text-black/55">{body}</p>
        <div className="mt-auto pt-[1rem]">
          <PillButton href={href} size="sm" full>
            {cta}
          </PillButton>
        </div>
      </div>
    </div>
  );
}

/** Mini booking widget: "pick a time" slots with one selected. */
export function BookingVisual() {
  const slots = ["Tue 10:00", "Tue 14:30", "Wed 11:00", "Thu 09:30"];
  return (
    <div className="rounded-[0.8rem] bg-white p-[1rem] shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[1rem] font-semibold text-[var(--ink)]">Free AI audit · 30 min</span>
        <span className="h-[0.6rem] w-[0.6rem] rounded-full bg-[var(--teal)]" aria-hidden="true" />
      </div>
      <div className="mt-[0.8rem] grid grid-cols-2 gap-[0.5rem]">
        {slots.map((s, i) => (
          <span
            key={s}
            className={
              i === 1
                ? "rounded-[0.5rem] border border-[var(--teal)] bg-[var(--teal)] py-[0.4rem] text-center text-[0.95rem] font-medium text-white"
                : "rounded-[0.5rem] border border-black/10 py-[0.4rem] text-center text-[0.95rem] text-black/60"
            }
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Mini before/after hours card. */
export function HoursVisual({ label }: { label: string }) {
  return (
    <div className="rounded-[0.8rem] bg-white p-[1rem] shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
      <div className="text-[1rem] font-semibold text-[var(--ink)]">{label}</div>
      <div className="mt-[0.8rem] space-y-[0.6rem] text-[0.92rem]">
        <div>
          <div className="flex justify-between text-black/55">
            <span>Manual</span>
            <span className="tabular-nums">14 h/wk</span>
          </div>
          <div className="mt-[0.25rem] h-[0.55rem] rounded-full bg-black/20" />
        </div>
        <div>
          <div className="flex justify-between font-medium text-[var(--teal)]">
            <span>Automated</span>
            <span className="tabular-nums">2 h/wk</span>
          </div>
          <div className="mt-[0.25rem] h-[0.55rem] w-[16%] rounded-full bg-[var(--teal)]" />
        </div>
      </div>
      <div className="mt-[0.7rem] text-[0.85rem] text-black/35">Example estimate</div>
    </div>
  );
}

/** Mini article cover. */
export function GuideVisual({ tag, readTime }: { tag: string; readTime: string }) {
  return (
    <div className="rounded-[0.8rem] bg-white p-[1rem] shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between text-[0.9rem]">
        <span className="rounded-full bg-[var(--mint-100)] px-[0.6rem] py-[0.1rem] font-medium text-[var(--teal)]">{tag}</span>
        <span className="text-black/40">{readTime} read</span>
      </div>
      <div className="mt-[0.9rem] space-y-[0.45rem]" aria-hidden="true">
        <span className="block h-[0.6rem] w-[85%] rounded-full bg-black/15" />
        <span className="block h-[0.6rem] w-[65%] rounded-full bg-black/15" />
        <span className="block h-[0.45rem] w-[90%] rounded-full bg-black/[0.07]" />
        <span className="block h-[0.45rem] w-[75%] rounded-full bg-black/[0.07]" />
      </div>
    </div>
  );
}
