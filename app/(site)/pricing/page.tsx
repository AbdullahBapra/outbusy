import type { Metadata } from "next";
import { pricing, faqs } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { SectionHeading } from "@/components/ui/section-heading";
import { PillButton } from "@/components/ui/pill-button";
import { PricingCards, Check } from "@/components/sections/PricingCards";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "AI audit credited toward your build, fixed-price build packages and monthly care plans.",
};



export default function PricingPage() {
  const { audit, care } = pricing;
  return (
    <>
      <PageHero
        bigLine="Pricing"
        subStrong="Clear, fixed prices"
        subLight="no surprises"
        paragraphs={["Start with an AI audit — credited in full toward your build — then choose a package that fits your scope. Keep everything running with an optional care plan."]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
      />

      {/* Audit */}
      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="Step 1 —" big="The Audit" strong="Where Every Project Starts" />
          <div className="mt-[3rem] grid grid-cols-[1fr_1.2fr] items-center gap-[3rem] rounded-[1.875rem] bg-[#040404] p-[3.5rem] text-white max-md:grid-cols-1 max-md:p-6">
            <div>
              <h3 className="text-[3.125rem] font-light uppercase leading-[3.75rem] max-md:text-2xl">{audit.title}</h3>
              <div className="mt-[1rem] text-[4.5rem] font-bold leading-none text-[var(--accent)] max-md:text-5xl">{audit.price}</div>
              <p className="mt-[0.8rem] text-[1.4rem] uppercase tracking-wide text-white/70 max-md:text-sm">{audit.note}</p>
            </div>
            <div>
              <ul className="grid grid-cols-2 gap-[1.2rem] max-md:grid-cols-1">
                {audit.points.map((p) => (
                  <li key={p} className="flex items-start gap-[0.8rem] text-[1.4rem] leading-[2rem] max-md:text-base">
                    <span className="mt-[0.2rem] flex h-[1.8rem] w-[1.8rem] flex-none items-center justify-center rounded-full bg-[var(--accent)] text-[1rem] text-black">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-[2rem]">
                <PillButton variant="white" href="/contact">Book Your Audit</PillButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingCards heading={{ top: "Step 2 —", big: "Build", strong: "Packages", light: "scoped after your audit" }} cta={false} />

      {/* Care plans */}
      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="Step 3 —" big="Care Plans" strong="Monthly" light="monitoring, fixes & improvements" />
          <div className="mt-[3rem] grid grid-cols-3 gap-[2rem] max-md:grid-cols-1">
            {care.map((c, i) => (
              <div key={c.name} className={cn("rounded-[1.875rem] border-[0.8px] p-[2.4rem]", i === 1 ? "border-[var(--teal)] bg-[var(--mint-100)]" : "border-[var(--line)] bg-white")}>
                <h3 className="text-[2.2rem] font-semibold uppercase leading-[2.6rem] text-[var(--ink)] max-md:text-xl">{c.name}</h3>
                <div className="mt-[0.4rem] text-[2rem] font-bold text-[var(--teal)] max-md:text-lg">{c.price}</div>
                <ul className="mt-[1.2rem] space-y-[0.6rem]">
                  {c.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-[0.8rem] text-[1.3rem] leading-[1.9rem] text-[var(--ink)] max-md:text-sm">
                      <Check />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq items={faqs.filter((_, i) => [1, 2, 6].includes(i))} title="Pricing FAQs" />
      <CtaBanner big="Get Your" tail="Fixed Quote" />
    </>
  );
}
