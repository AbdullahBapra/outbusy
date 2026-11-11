import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getService, serviceHref } from "@/content/services";
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
import { TechStack } from "@/components/sections/TechStack";
import { PricingCards } from "@/components/sections/PricingCards";
import { Faq } from "@/components/sections/Faq";
import { BlogSlider } from "@/components/sections/BlogSlider";
import { getPosts } from "@/lib/blog/queries";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ContactSection } from "@/components/sections/ContactSection";

type Props = { params: Promise<{ category: string; service: string }> };

export function generateStaticParams() {
  return categories.flatMap((c) => c.services.map((s) => ({ category: c.slug, service: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, service } = await params;
  const found = getService(category, service);
  return found ? { title: found.service.title, description: found.service.summary } : {};
}

export default async function ServicePage({ params }: Props) {
  const { category, service } = await params;
  const found = getService(category, service);
  if (!found) notFound();
  const { category: c, service: s } = found;
  const [first, ...rest] = s.title.split(" ");
  const impact = categoryImpact[c.slug];
  const siblings = c.services.filter((x) => x.slug !== s.slug);
  const others = categories
    .filter((x) => x.slug !== c.slug)
    .flatMap((x) => x.services.slice(0, 3).map((o) => ({ title: o.title, body: o.summary, href: serviceHref(x, o) })));

  return (
    <div className="inner-page">
      <PageHero
        bigLine={first}
        subStrong={rest.join(" ")}
        subLight={s.summary}
        paragraphs={[s.intro]}
        primary={{ label: "Book Free AI Audit", href: "/contact" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: c.title, href: serviceHref(c) },
          { label: s.title },
        ]}
      />

      <IntroStack
        big="How It"
        bigAccent="Works"
        strong={`${s.title}, step by step`}
        intro={s.summary}
        cards={s.deliverables}
        visualLabels={["Trigger", "AI", ...s.tools.slice(0, 3)]}
        visualCaption={`${s.title}: connected to the tools you already use, monitored around the clock.`}
        image={`/images/services/${c.slug}-how.webp`}
      />

      <StackedList heading={{ top: "What's", big: "Included", strong: s.title, light: "deliverables" }} items={s.deliverables} enquire={s.title} />

      <CtaBanner
        lead="Still doing it"
        big="By Hand?"
        tail="Fix It Now"
        title={`Hand It Over To ${s.title}`}
        body={`In a free 30-minute call we'll look at how this works in your business today, where ${s.title.toLowerCase()} fits, and what it could save you.`}
        button="Free 30-Minute Call"
        tasks={s.deliverables.map((d) => d.title)}
      />

      <BeforeAfter heading={{ top: "Your Week", big: "Before & After", light: "the difference it makes" }} subject={s.title} before={s.problems} after={s.outcomes} />

      <PitfallsGrid heading={{ top: "Common Pitfalls", big: "Avoided", light: "tap a card to see how" }} />

      <ProcessSteps heading={{ top: "How We", big: "Build It", strong: "Audit to Optimize", light: "in five clear steps" }} />

      <IncludedMarquee heading={{ top: "Every Build", big: "Includes", light: "no matter the size" }} />

      <ImpactPanel
        boldWord="Why"
        lightWord="It"
        accentLine="Pays Off"
        sideList={s.outcomes}
        caption={impact.lead}
        stats={impact.stats}
        labels={["Input", "Automation", ...s.tools.slice(0, 3)]}
        image={`/images/services/${c.slug}-payoff.webp`}
      />

      {siblings.length > 0 && (
        <TypesTimeline
          big="More"
          accent="Ways"
          strong={`in ${c.title}`}
          intro={c.intro}
          items={siblings.map((x) => ({ title: x.title, body: x.summary, icon: x.icon, href: serviceHref(c, x) }))}
        />
      )}

      <IndustryTabs heading={{ top: "Where It", big: "Works Best", light: "industries we build for" }} />
      <CaseStudySlider items={caseStudies.slice(0, 3)} heading={{ big: "Results", strong: "Case Studies", light: "problem, system, outcome" }} />
      <TechStack heading={{ top: "Tools", big: "We Use", light: `for ${s.title.toLowerCase()}` }} items={s.tools} />
      <PricingCards heading={{ top: "Simple", big: "Pricing", light: "fixed-price packages" }} />
      <Faq items={s.faqs} />
      <BlogSlider posts={await getPosts()} big="Insights" strong="Guides" light="on AI and automation" />
      <RelatedSlider heading={{ top: "Other", big: "Services", light: "you can add next" }} items={others} />
      <ContactSection />
    </div>
  );
}
