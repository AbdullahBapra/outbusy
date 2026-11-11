// Global brand + contact settings. Change these once and they update everywhere.

export const brand = {
  name: "Outbusy",
  tagline: "AI Automation Agency",
  /** Public site address (used in AI-summary prompts). Set NEXT_PUBLIC_SITE_URL in production. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://outbusy.com",
  email: "hello@outbusy.com", // TODO: replace with your real domain
  phone: "+1 (555) 010-2030",
  /** Number visitors can call to hear the AI receptionist demo. */
  demoPhone: "+1 (555) 010-4040",
  /** Paste a Calendly / Cal.com embed URL to show a live booking calendar on /contact. */
  bookingUrl: "",
  /** Optional webhook (e.g. n8n) that receives every completed free audit as JSON. */
  auditWebhookUrl: "",
  /** Optional webhook (e.g. n8n) that receives every contact-form request as JSON. */
  contactWebhookUrl: "",
  ctaLabel: "Book Free AI Audit",
  ctaHref: "/contact",
  offices: [
    { label: "EU:", text: "Your street 1, 10115 Berlin, Germany" },
    { label: "UK:", text: "Your street 2, London EC1A 1BB" },
  ],
  socials: {
    linkedin: "#",
    x: "#",
    instagram: "#",
    github: "#",
  },
};

export type NavLink = { label: string; href: string; desc?: string };
export type NavItem = {
  label: string;
  href: string;
  groups?: { title: string; href?: string; links: NavLink[] }[];
};
