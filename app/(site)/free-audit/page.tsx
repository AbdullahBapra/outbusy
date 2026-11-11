import type { Metadata } from "next";
import { auditFaqs, questions } from "@/content/audit";
import { PageHero } from "@/components/PageHero";
import { AuditQuiz } from "@/components/sections/AuditQuiz";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { Faq } from "@/components/sections/Faq";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Free Automation Audit",
  description: "Answer 11 quick questions and get a free report: your automation score, hours you could save and where to start.",
};

const steps = [
  { title: "Answer", body: `${questions.length} quick questions about your team, tools and bottlenecks — most are one tap.` },
  { title: "Get your score", body: "See your automation opportunity score, the hours you could win back and what that's worth." },
  { title: "Know where to start", body: "Get the three systems we'd build first — then book a call if you want help, or don't." },
];

export default function FreeAuditPage() {
  return (
    <>
      <PageHero
        bigLine="Free Audit"
        subStrong="How much could you automate?"
        subLight="find out in 5 minutes"
        paragraphs={["A short, no-pressure quiz that shows where automation would save your team the most time — and what to build first. No call needed to see your results."]}
        primary={{ label: "Start the Audit", href: "#audit" }}
        secondary={{ label: "Book a Call Instead", href: "/contact" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }, { label: "Free Audit" }]}
      />

      <section className="sec-green bg-white">
        <div className="container-x">
          <SectionHeading top="How It" big="Works" light="three steps, about five minutes" />
          <div className="mt-[3rem]">
            <FeatureCards items={steps} columns={3} numbered />
          </div>
        </div>
      </section>

      <section id="audit" className="scroll-mt-[2rem] bg-white pb-[7.5rem] pt-[2rem] max-md:pb-10">
        <div className="container-x">
          <AuditQuiz />
          <p className="mt-[1.2rem] text-center text-[1rem] text-black/40">
            Your answers are only used to prepare your report. No spam, no sharing.
          </p>
        </div>
      </section>

      <Faq items={auditFaqs} title="Questions" />
    </>
  );
}
