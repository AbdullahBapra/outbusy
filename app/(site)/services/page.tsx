import type { Metadata } from "next";
import Link from "next/link";
import { categories, serviceHref } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { ServicesStack } from "@/components/sections/ServicesStack";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { AnimatedIcon } from "@/components/ui/animated-icon";

export const metadata: Metadata = {
  title: "Services",
  description: "AI consulting, workflow automation, AI agents & chatbots and AI-powered websites.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        bigLine="Services"
        subStrong="Four ways"
        subLight="to put AI to work in your business"
        paragraphs={["From strategy to working systems — pick a category to explore every service, or start with a free AI audit and we'll recommend the right mix."]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      {/* 4 category hub cards */}
      <section className="sec-green bg-white">
        <div className="container-x grid grid-cols-2 gap-[2.375rem] max-md:grid-cols-1">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={serviceHref(c)}
              className="hover-card group flex min-h-[26rem] flex-col justify-between rounded-[1.875rem] border-[0.8px] border-[var(--mint-soft)] p-[3rem] transition-transform duration-300 hover:-translate-y-1 max-md:p-6"
              style={{ background: c.tint }}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-[6.72rem] w-[6.72rem] items-center justify-center rounded-full bg-white">
                  <AnimatedIcon name={c.icon} className="h-[5.8rem] w-[5.8rem] text-[var(--ink)]" />
                </span>
                <span className="text-[5rem] font-bold italic leading-none text-black/15">{c.number}</span>
              </div>
              <div>
                <h2 className="card-title">{c.title}</h2>
                <p className="body-thin mt-[0.6rem] max-w-[36rem]">{c.intro}</p>
                <span className="mt-[1.2rem] inline-block text-[1.2rem] font-semibold uppercase text-[var(--teal)]">
                  {c.services.length} services →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ServicesStack heading={{ top: "Every", big: "Service", strong: "All Categories", light: "at a glance" }} />
      <IndustriesGrid heading={{ top: "Tailored For", big: "Industries", light: "systems adapted to your sector" }} />
      <CtaBanner />
    </>
  );
}
