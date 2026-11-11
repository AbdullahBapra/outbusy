import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RoiCalculator } from "@/components/sections/RoiCalculator";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "ROI Calculator",
  description: "Estimate the hours and money AI automation could save your business each year.",
};

export default function RoiPage() {
  return (
    <>
      <PageHero
        bigLine="ROI"
        subStrong="Calculator"
        subLight="what could automation be worth to you?"
        paragraphs={["Move the sliders to estimate hours saved, labour cost recovered and extra revenue from faster lead response."]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }, { label: "ROI Calculator" }]}
      />
      <RoiCalculator />
      <CtaBanner />
    </>
  );
}
