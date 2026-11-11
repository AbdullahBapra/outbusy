import { home, faqs } from "@/content/pages";
import { caseStudies } from "@/content/caseStudies";
import { PageHero } from "@/components/PageHero";
import { ServicesStack } from "@/components/sections/ServicesStack";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { CaseStudySlider } from "@/components/sections/CaseStudySlider";
import { TechStack } from "@/components/sections/TechStack";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";

export default function Home() {
  const { hero } = home;
  return (
    <>
      <PageHero
        size="home"
        bigLine={hero.bigLine}
        subStrong={hero.subStrong}
        subLight={hero.subLight}
        paragraphs={hero.paragraphs}
        primary={hero.primary}
        secondary={hero.secondary}
        stats={home.proof}
      />
      <ServicesStack heading={home.services} />
      <ProcessSteps heading={home.process} />
      <IndustriesGrid heading={home.industries} />
      <CaseStudySlider items={caseStudies.slice(0, 3)} heading={home.cases} />
      <TechStack heading={home.stack} items={home.stack.items} cta={{ label: "Book Free AI Audit", href: "/contact" }} />
      <Faq items={faqs.slice(0, 5)} />
      <CtaBanner {...home.cta} />
    </>
  );
}
