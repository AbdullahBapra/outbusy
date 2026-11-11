import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { TemplatesGate } from "@/components/sections/TemplatesGate";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Free n8n Templates",
  description: "Ready-to-import n8n workflow templates for lead capture, email triage, invoices, missed calls and more.",
};

export default function TemplatesPage() {
  return (
    <>
      <PageHero
        bigLine="Free n8n"
        subStrong="Templates"
        subLight="ready to import and run"
        paragraphs={["Production-tested n8n workflows we use with clients — import, add your credentials and go."]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }, { label: "n8n Templates" }]}
      />
      <TemplatesGate />
      <CtaBanner
        big="Want It"
        tail="Built For You?"
        title="We'll Build It Properly"
        body="Templates are a great start. For production systems with error handling, monitoring and your exact logic, we'll build it for you."
      />
    </>
  );
}
