import { pricing } from "@/content/pages";
import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const pkgStyle: Record<string, string> = {
  white: "border-black bg-white",
  accent: "border-[var(--accent)] bg-[var(--accent)]",
  mint: "border-[rgba(151,255,244,0.62)] bg-[rgba(151,255,244,0.62)]",
};

export function Check() {
  return (
    <span className="mt-[0.2rem] flex h-[1.8rem] w-[1.8rem] flex-none items-center justify-center rounded-full bg-black text-[1rem] text-[var(--accent)]">
      ✓
    </span>
  );
}

/** Three build packages (Starter / Growth / Custom). */
export function PricingCards({ heading, cta = true }: { heading: HeadingProps; cta?: boolean }) {
  return (
    <section className="sec-green bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />
        <div className="mt-[3rem] grid grid-cols-3 gap-[2rem] max-md:grid-cols-1">
          {pricing.packages.map((p) => (
            <div
              key={p.name}
              className={cn("relative flex flex-col rounded-[1.875rem] border-[0.8px] p-[2.5rem] transition-transform duration-300 hover:-translate-y-1", pkgStyle[p.style])}
            >
              {p.featured && (
                <span className="absolute right-[1.6rem] top-[1.6rem] rounded-full bg-black px-[0.9rem] py-[0.3rem] text-[0.95rem] uppercase text-[var(--accent)]">
                  Most popular
                </span>
              )}
              <h3 className="text-[3.125rem] font-semibold uppercase leading-[3.75rem] text-[var(--ink)] max-md:text-2xl">{p.name}</h3>
              <div className="mt-[0.6rem] text-[2.4rem] font-bold text-[var(--ink)] max-md:text-xl">{p.price}</div>
              <p className="body-thin mt-[0.6rem]">{p.desc}</p>
              <ul className="mt-[1.6rem] flex-1 space-y-[0.8rem]">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-[0.8rem] text-[1.3rem] leading-[1.9rem] text-[var(--ink)] max-md:text-sm">
                    <Check />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-[2rem]">
                <PillButton href="/contact">Get Started</PillButton>
              </div>
            </div>
          ))}
        </div>
        {cta && (
          <div className="mt-[2.4rem] flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
            <p className="body-thin">Every project starts with an AI audit — credited in full toward your build.</p>
            <PillButton href="/pricing">Full Pricing</PillButton>
          </div>
        )}
      </div>
    </section>
  );
}
