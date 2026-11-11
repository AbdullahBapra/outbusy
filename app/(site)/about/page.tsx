import type { Metadata } from "next";
import { about, home } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { TechStack } from "@/components/sections/TechStack";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "About",
  description: "Outbusy is a senior team of automation engineers and AI specialists helping businesses get their time back.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        bigLine={about.big}
        subStrong={about.strong}
        subLight={about.light}
        paragraphs={[about.intro]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        secondary={{ label: "Careers", href: "/careers" }}
        stats={home.proof}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="What We" big="Believe" strong="Our Values" />
          <div className="mt-[3rem]">
            <FeatureCards items={about.values} columns={4} />
          </div>
        </div>
      </section>
      <ProcessSteps heading={{ top: "How We", big: "Work", strong: "Audit to Optimize", light: "every time" }} />
      <TechStack heading={home.stack} items={home.stack.items} />
      <CtaBanner />
    </>
  );
}
