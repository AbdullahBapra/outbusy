import type { Metadata } from "next";
import { brand } from "@/content/brand";
import { careers, about } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { SectionHeading } from "@/components/ui/section-heading";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join a remote team building AI agents and automation for real businesses.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        bigLine="Careers"
        subStrong="Build systems"
        subLight="that give people their time back"
        paragraphs={[careers.intro]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />
      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="Open" big="Roles" />
          <div className="mt-[3rem] space-y-[1.6rem]">
            {careers.roles.map((r) => (
              <div
                key={r.title}
                className="grid grid-cols-[1fr_auto] items-center gap-[2rem] rounded-[1.875rem] border-[0.8px] border-[var(--line)] p-[2.4rem] transition-colors hover:bg-[var(--mint-50)] max-md:grid-cols-1"
              >
                <div>
                  <h2 className="text-[2.4rem] font-semibold uppercase leading-[2.9rem] text-[var(--ink)] max-md:text-xl">{r.title}</h2>
                  <div className="mt-[0.3rem] text-[1.1rem] uppercase tracking-wide text-[var(--teal)]">{r.type}</div>
                  <p className="body-thin mt-[0.6rem]">{r.body}</p>
                </div>
                <PillButton href={`mailto:${brand.email}?subject=${encodeURIComponent(r.title)}`}>Apply</PillButton>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="How We" big="Work" strong="Our Values" />
          <div className="mt-[3rem]">
            <FeatureCards items={about.values} columns={4} />
          </div>
        </div>
      </section>
    </>
  );
}
