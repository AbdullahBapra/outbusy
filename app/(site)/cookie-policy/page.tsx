import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiePolicyPage() {
  return <LegalPage slug="cookie-policy" />;
}
