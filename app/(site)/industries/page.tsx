import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Industries",
  description: "AI automation systems for dental & healthcare, real estate, home services, law firms, e-commerce and marketing agencies.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        bigLine="Industries"
        subStrong="Proven systems"
        subLight="for businesses like yours"
        paragraphs={["Each industry has its own bottlenecks — missed calls, slow lead response, paperwork. Explore the problems we solve and the systems we build for each."]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        secondary={{ label: "See Case Studies", href: "/case-studies" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Industries" }]}
      />
      <IndustriesGrid heading={{ top: "Choose", big: "Your Sector", light: "problem, systems and a case study for each" }} showButton={false} />
      <ProcessSteps heading={{ top: "How We", big: "Work", strong: "Audit to Optimize", light: "in every industry" }} />
      <CtaBanner />
    </>
  );
}
