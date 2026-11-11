import Link from "next/link";
import { posts, type Post } from "@/content/pages";
import { HoverHighlight, HighlightIcon, HighlightMarker, HighlightTitle } from "@/components/ui/hover-highlight";
import { MegaCta, GuideVisual } from "@/components/MegaCta";

const resources = [
  { label: "Free Automation Audit", href: "/free-audit", icon: "ClipboardList", desc: "5-minute quiz with your score and where to start" },
  { label: "Blog", href: "/blog", icon: "BookOpen", desc: "Practical guides on AI and automation" },
  { label: "Free n8n Templates", href: "/free-n8n-templates", icon: "Download", desc: "Ready-to-import workflows" },
  { label: "ROI Calculator", href: "/roi-calculator", icon: "Calculator", desc: "Estimate the hours and money you'd save" },
  { label: "FAQ", href: "/faq", icon: "MessageCircle", desc: "Straight answers to common questions" },
];

const company = [
  { label: "About", href: "/about", icon: "Users" },
  { label: "Process", href: "/process", icon: "Workflow" },
  { label: "Case Studies", href: "/case-studies", icon: "LineChart" },
  { label: "Careers", href: "/careers", icon: "Rocket" },
  { label: "Contact", href: "/contact", icon: "Mail" },
];

/** Resources mega menu: resources, company links and the latest guide. */
export function ResourcesMega({ latest = posts[0] }: { latest?: Post }) {
  return (
    <div className="grid grid-cols-[1fr_19rem_22rem] overflow-hidden rounded-[1.2rem] border border-black/[0.08] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      {/* Resources */}
      <div className="p-[2rem]">
        <div className="text-[0.9rem] font-medium uppercase tracking-[0.1em] text-black/40">Resources</div>
        <HoverHighlight className="mt-[0.6rem] grid grid-cols-2 gap-x-[1.6rem]">
          {resources.map((r) => (
            <Link
              key={r.href}
              data-hl
              href={r.href}
              className="group/hl relative flex items-start gap-[0.9rem] rounded-[0.8rem] px-[1rem] py-[0.8rem] outline-none"
            >
              <HighlightMarker />
              <HighlightIcon name={r.icon} />
              <span className="min-w-0">
                <HighlightTitle>{r.label}</HighlightTitle>
                <span className="mt-[0.15rem] block text-[1rem] leading-[1.45rem] text-black/50">{r.desc}</span>
              </span>
            </Link>
          ))}
        </HoverHighlight>
      </div>

      {/* Company */}
      <div className="border-l border-black/[0.06] p-[2rem]">
        <div className="text-[0.9rem] font-medium uppercase tracking-[0.1em] text-black/40">Company</div>
        <HoverHighlight className="mt-[0.6rem] flex flex-col">
          {company.map((c) => (
            <Link
              key={c.href}
              data-hl
              href={c.href}
              className="group/hl relative flex items-center gap-[0.8rem] rounded-[0.8rem] px-[1rem] py-[0.45rem] outline-none"
            >
              <HighlightMarker />
              <HighlightIcon name={c.icon} />
              <HighlightTitle>{c.label}</HighlightTitle>
            </Link>
          ))}
        </HoverHighlight>
      </div>

      <MegaCta
        eyebrow={`Latest guide · ${latest.readTime}`}
        title={latest.title}
        body={latest.excerpt}
        cta="Read the guide"
        href={`/blog/${latest.slug}`}
        visual={<GuideVisual tag={latest.tag} readTime={latest.readTime} />}
      />
    </div>
  );
}
