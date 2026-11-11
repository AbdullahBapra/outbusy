import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content/caseStudies";
import { PageHero } from "@/components/PageHero";
import { WorkflowMockup, SampleBadge } from "@/components/sections/CaseStudySlider";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { TechStack } from "@/components/sections/TechStack";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { SectionHeading } from "@/components/ui/section-heading";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  return cs ? { title: cs.title, description: cs.problem } : {};
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  return (
    <>
      <PageHero
        bigLine="Case Study"
        subStrong={cs.title}
        subLight={cs.client}
        stats={cs.results}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Studies", href: "/case-studies" }, { label: cs.industry }]}
      />

      <section className="sec-green bg-white">
        <div className="container-x grid grid-cols-2 items-center gap-[4rem] max-md:grid-cols-1">
          <div>
            {cs.sample && <SampleBadge />}
            <SectionHeading top="01 —" big="Problem" className="mt-[1rem]" />
            <p className="mt-[1.4rem] text-[1.8rem] font-light leading-[2.6rem] text-[var(--ink)] max-md:text-lg">{cs.problem}</p>
          </div>
          <WorkflowMockup cs={cs} />
        </div>
      </section>

      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="02 —" big="System" strong="What We Built" />
          <div className="mt-[3rem]">
            <FeatureCards items={cs.system} columns={3} numbered />
          </div>
        </div>
      </section>

      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="03 —" big="Results" />
          <div className="mt-[3rem] grid grid-cols-3 gap-[2rem] max-md:grid-cols-1">
            {cs.results.map((r, i) => (
              <div
                key={r.label}
                className={`flex min-h-[18rem] flex-col justify-end rounded-[1.875rem] p-[2.4rem] ${i === 1 ? "bg-[var(--accent)]" : "bg-[var(--mint-100)]"}`}
              >
                <div className="text-[4.5rem] font-bold leading-none tracking-[-0.03em] text-[var(--ink)] max-md:text-5xl">{r.value}</div>
                <div className="mt-[0.8rem] text-[1.4rem] uppercase text-[var(--ink)] max-md:text-sm">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TechStack heading={{ top: "Built", big: "With" }} items={cs.stack} />
      <CtaBanner big="Get Results" tail="Like These" />
    </>
  );
}
