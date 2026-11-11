import type { NavItem } from "@/content/brand";
import { categories, serviceHref } from "@/content/services";
import { industries } from "@/content/industries";

export const nav: NavItem[] = [
  {
    label: "Services",
    href: "/services",
    groups: categories.map((c) => ({
      title: c.title,
      href: serviceHref(c),
      links: c.services.map((s) => ({ label: s.title, href: serviceHref(c, s) })),
    })),
  },
  {
    label: "Industries",
    href: "/industries",
    groups: [{ title: "Industries", href: "/industries", links: industries.map((i) => ({ label: i.name, href: `/industries/${i.slug}` })) }],
  },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    href: "/blog",
    groups: [
      {
        title: "Resources",
        links: [
          { label: "Free Automation Audit", href: "/free-audit" },
          { label: "Blog", href: "/blog" },
          { label: "Free n8n Templates", href: "/free-n8n-templates" },
          { label: "ROI Calculator", href: "/roi-calculator" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Process", href: "/process" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
  },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Terms", href: "/terms" },
  { label: "DPA", href: "/dpa" },
];
