import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Data Processing Agreement" };

export default function DpaPage() {
  return <LegalPage slug="dpa" />;
}
