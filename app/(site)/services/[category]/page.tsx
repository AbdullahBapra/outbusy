import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, serviceHref } from "@/content/services";
import { categoryImpact } from "@/content/inner";
import { caseStudies } from "@/content/caseStudies";
import { PageHero } from "@/components/PageHero";
import { IntroStack } from "@/components/sections/inner/IntroStack";
import { StackedList } from "@/components/sections/inner/StackedList";
import { BeforeAfter } from "@/components/sections/inner/BeforeAfter";
import { PitfallsGrid } from "@/components/sections/inner/PitfallsGrid";
import { IncludedMarquee } from "@/components/sections/inner/IncludedMarquee";
import { ImpactPanel } from "@/components/sections/inner/ImpactPanel";
import { TypesTimeline } from "@/components/sections/inner/TypesTimeline";
import { IndustryTabs } from "@/components/sections/inner/IndustryTabs";
import { RelatedSlider } from "@/components/sections/inner/RelatedSlider";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CaseStudySlider } from "@/components/sections/CaseStudySlider";
import { PricingCards } from "@/components/sections/PricingCards";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ContactSection } from "@/components/sections/ContactSection";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  return c ? { title: c.title, description: c.intro } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();

  const impact = categoryImpact[c.slug];
  const tools = [...new Set(c.services.flatMap((s) => s.tools))];
  const faqs = c.services.flatMap((s) => s.faqs.slice(0, 1));
  const otherCategories = categories
    .filter((x) => x.slug !== c.slug)
    .map((x) => ({ title: x.title, body: x.short, href: serviceHref(x) }));

  return (
    <div className="inner-page">
      <PageHero
        bigLine={c.headline.big}
        subStrong={c.headline.strong}
        subLight={c.headline.light}
        paragraphs={[c.intro]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: c.title }]}
      />

      <IntroStack
        big="Start"
        bigAccent="Here"
        strong={`Popular ${c.title.split(" ")[0]} services`}
        intro={c.intro}
        cards={c.services.slice(0, 3).map((s) => ({ title: s.title, body: s.summary }))}
        visualLabels={["Trigger", "AI", ...tools.slice(0, 3)]}
        visualCaption={`${c.title} — built on the tools you already use.`}
        image={`/images/services/${c.slug}-how.webp`}
      />

      <StackedList
        heading={{ top: `${c.number} —`, big: "All Services", strong: c.title, light: `${c.services.length} ways to get started` }}
        items={c.services.map((s) => ({ title: s.title, body: s.summary, href: serviceHref(c, s) }))}
      />

      <CtaBanner lead="Not sure" big="Where To" tail="Start?" title="Start With A Free Audit" button="Free 30-Minute Call" />

      <BeforeAfter
        heading={{ top: "Your Business", big: "Before & After", light: c.title }}
        subject={c.title}
        before={c.services.slice(0, 4).map((s) => s.problems[0])}
        after={c.services.slice(0, 4).map((s) => s.outcomes[0])}
      />

      <PitfallsGrid heading={{ top: "Common Pitfalls", big: "Avoided", light: "tap a card to see how" }} />
      <ProcessSteps heading={{ top: "How We", big: "Deliver", strong: "Audit to Optimize", light: "for every build" }} />
      <IncludedMarquee heading={{ top: "Every Build", big: "Includes", light: "no matter the size" }} />
      <ImpactPanel
        boldWord="Why"
        lightWord="It"
        accentLine="Pays Off"
        sideList={c.services.slice(0, 3).map((s) => s.outcomes[0])}
        caption={impact.lead}
        stats={impact.stats}
        labels={["Input", "Automation", ...tools.slice(0, 3)]}
        image={`/images/services/${c.slug}-payoff.webp`}
      />
      <TypesTimeline
        big="Every"
        accent="Service"
        strong={c.title}
        intro={c.intro}
        items={c.services.map((s) => ({ title: s.title, body: s.summary, icon: s.icon, href: serviceHref(c, s) }))}
      />
      <IndustryTabs heading={{ top: "Where It", big: "Works Best", light: "industries we build for" }} />
      <CaseStudySlider items={caseStudies.slice(0, 3)} heading={{ big: "Results", strong: "Case Studies", light: "systems we've built" }} />
      <PricingCards heading={{ top: "Simple", big: "Pricing", light: "fixed-price packages" }} />
      <Faq items={faqs} />
      <RelatedSlider heading={{ top: "Other", big: "Categories", light: "explore what else we build" }} items={otherCategories} />
      <ContactSection />
    </div>
  );
}
