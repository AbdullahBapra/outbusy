import type { Metadata } from "next";
import { faqs } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { ContactSection } from "@/components/sections/ContactSection";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a free AI audit call or send us a message.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        bigLine="Contact"
        subStrong="Book your free"
        subLight="AI audit call"
        paragraphs={["Tell us where your team loses time. We'll come back within one business day with ideas and next steps."]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <ContactSection />
      <Faq items={faqs.slice(0, 4)} />
    </>
  );
}
