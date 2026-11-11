import type { Metadata } from "next";
import { processSteps } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Process",
  description: "Audit → Blueprint → Build → Launch → Optimize: how we deliver AI automation projects.",
};

const principles = [
  { title: "Fixed Scope", body: "Every build starts with an agreed scope and fixed price — no open-ended hourly billing." },
  { title: "Weekly Demos", body: "You see working progress every week and can steer before anything is final." },
  { title: "Human in the Loop", body: "Sensitive actions get approval steps until you're confident in the system." },
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        bigLine="Process"
        subStrong={processSteps.map((s) => s.title).join(" → ")}
        paragraphs={["A simple, transparent five-step process so you always know what's being built, why, and what it's worth."]}
        primary={{ label: "Start With An Audit", href: "/contact" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Process" }]}
      />
      <ProcessSteps heading={{ top: "The", big: "5 Steps", strong: "Audit to Optimize", light: "in detail" }} />
      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="Our" big="Principles" />
          <div className="mt-[3rem]">
            <FeatureCards items={principles} columns={3} />
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
