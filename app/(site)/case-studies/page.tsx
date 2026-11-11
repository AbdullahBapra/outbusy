import type { Metadata } from "next";
import Link from "next/link";
import { caseStudies } from "@/content/caseStudies";
import { PageHero } from "@/components/PageHero";
import { WorkflowMockup, SampleBadge } from "@/components/sections/CaseStudySlider";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "How businesses use AI agents and automation — problem, system built and results.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        bigLine="Results"
        subStrong="Case Studies"
        subLight="problem → system → outcome"
        paragraphs={["Real problems, the systems we built to solve them, and what changed afterwards."]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Studies" }]}
      />

      <section className="sec-green bg-white">
        <div className="container-x grid grid-cols-2 gap-[2.4rem] max-md:grid-cols-1">
          {caseStudies.map((cs) => (
            <Link
              key={cs.slug}
              href={`/case-studies/${cs.slug}`}
              className="group flex flex-col gap-[1.6rem] rounded-[1.875rem] p-[2rem] transition-transform duration-300 hover:-translate-y-1"
              style={{ background: cs.tint }}
            >
              <WorkflowMockup cs={cs} />
              <div>
                <div className="flex flex-wrap items-center gap-[0.6rem]">
                  <span className="rounded-[0.938rem] bg-white px-[0.8rem] py-[0.4rem] text-[1.1rem] uppercase leading-none">{cs.industry}</span>
                  {cs.sample && <SampleBadge />}
                </div>
                <h2 className="mt-[1rem] text-[2.625rem] font-semibold uppercase leading-[3.15rem] text-[var(--ink)] max-md:text-xl">{cs.title}</h2>
                <p className="body-thin mt-[0.6rem]">{cs.client}</p>
                <span className="mt-[1rem] inline-block text-[1.2rem] font-semibold uppercase text-[var(--teal)] group-hover:underline">Read case study →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CtaBanner big="Your" tail="Success Story" title="Be Our Next Case Study" />
    </>
  );
}
