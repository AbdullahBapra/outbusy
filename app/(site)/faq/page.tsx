import type { Metadata } from "next";
import { faqs } from "@/content/pages";
import { categories } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about AI automation, agents, pricing, data privacy and our process.",
};

export default function FaqPage() {
  const serviceFaqs = categories.flatMap((c) => c.services.map((s) => s.faqs[0])).slice(0, 10);
  return (
    <>
      <PageHero
        bigLine="FAQ"
        subStrong="Straight answers"
        subLight="to common questions"
        paragraphs={["Can't find what you need? Ask our AI assistant on the homepage or book a free audit call."]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />
      <Faq items={faqs} title="General" />
      <Faq items={serviceFaqs} title="Services" />
      <CtaBanner />
    </>
  );
}
