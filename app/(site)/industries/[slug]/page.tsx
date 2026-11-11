import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { industries, getIndustry } from "@/content/industries";
import { getCaseStudy } from "@/content/caseStudies";
import { faqs } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { IntroStack } from "@/components/sections/inner/IntroStack";
import { StackedList } from "@/components/sections/inner/StackedList";
import { BeforeAfter } from "@/components/sections/inner/BeforeAfter";
import { PitfallsGrid } from "@/components/sections/inner/PitfallsGrid";
import { IncludedMarquee } from "@/components/sections/inner/IncludedMarquee";
import { IndustryTabs } from "@/components/sections/inner/IndustryTabs";
import { WorkflowMockup, SampleBadge } from "@/components/sections/CaseStudySlider";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { PricingCards } from "@/components/sections/PricingCards";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ContactSection } from "@/components/sections/ContactSection";
import { SectionHeading } from "@/components/ui/section-heading";
import { PillButton } from "@/components/ui/pill-button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = getIndustry(slug);
  return ind ? { title: `AI Automation for ${ind.name}`, description: ind.short } : {};
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const ind = getIndustry(slug);
  if (!ind) notFound();
  const cs = getCaseStudy(ind.caseStudy);

  return (
    <div className="inner-page">
      <PageHero
        bigLine={ind.name.split(" ")[0]}
        subStrong={ind.name.split(" ").slice(1).join(" ") || "AI Automation"}
        subLight={ind.headline}
        paragraphs={[ind.problem.body]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Industries", href: "/industries" }, { label: ind.name }]}
      />

      <IntroStack
        big="Our"
        bigAccent="Systems"
        strong={`Built for ${ind.name.toLowerCase()}`}
        intro={ind.short}
        cards={ind.systems}
        visualLabels={["New Enquiry", "AI Agent", ...ind.systems.map((s) => s.title.split(" ").slice(0, 2).join(" "))]}
        visualCaption={ind.headline}
      />

      <StackedList
        heading={{ top: "The", big: "Problem", strong: ind.problem.title }}
        items={ind.problem.points.map((p, i) => ({ title: p, body: i === 0 ? ind.problem.body : ind.short }))}
        enquire={ind.name}
      />

      <BeforeAfter
        heading={{ top: "Your Business", big: "Before & After", light: ind.name }}
        subject="Automation"
        before={ind.problem.points}
        after={ind.systems.map((s) => s.body)}
      />

      {cs && (
        <section className="sec-green bg-white">
          <div className="container-x">
            <SectionHeading top="Case" big="Study" strong={cs.client} />
            <div className="mt-[3rem] grid grid-cols-2 items-center gap-[2rem] rounded-[1.875rem] p-[3.125rem] max-md:grid-cols-1 max-md:p-6" style={{ background: cs.tint }}>
              <div>
                {cs.sample && <SampleBadge />}
                <h3 className="mt-[0.8rem] text-[3.125rem] font-semibold uppercase leading-[3.75rem] text-[var(--ink)] max-md:text-2xl">{cs.title}</h3>
                <p className="body-thin mt-[1rem]">{cs.problem}</p>
                <div className="mt-[1.6rem] grid grid-cols-3 gap-[1rem]">
                  {cs.results.map((r) => (
                    <div key={r.label} className="rounded-[1.2rem] bg-white/70 p-[1rem]">
                      <div className="text-[2.4rem] font-bold leading-none text-[var(--ink)] max-md:text-xl">{r.value}</div>
                      <div className="mt-[0.4rem] text-[0.95rem] uppercase leading-tight text-black/60">{r.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-[2rem]">
                  <PillButton href={`/case-studies/${cs.slug}`}>Read Case Study</PillButton>
                </div>
              </div>
              <WorkflowMockup cs={cs} />
            </div>
          </div>
        </section>
      )}

      <CtaBanner lead="Ready for" big="Less Admin" tail="More Growth?" title={`Automate Your ${ind.name} Business`} button="Free 30-Minute Call" tasks={ind.systems.map((s) => s.title)} />
      <PitfallsGrid heading={{ top: "Common Pitfalls", big: "Avoided", light: "tap a card to see how" }} />
      <ProcessSteps heading={{ top: "How We", big: "Work", strong: "Audit to Optimize", light: "tailored to your business" }} />
      <IncludedMarquee heading={{ top: "Every Build", big: "Includes", light: "no matter the size" }} />
      <IndustryTabs heading={{ top: "Other", big: "Industries", light: "we build for" }} exclude={ind.slug} />
      <PricingCards heading={{ top: "Simple", big: "Pricing", light: "fixed-price packages" }} />
      <Faq items={faqs.slice(0, 5)} />
      <ContactSection />
    </div>
  );
}
