import Link from "next/link";
import { brand } from "@/content/brand";
import { categories, serviceHref } from "@/content/services";
import { legalLinks } from "@/content/nav";
import { GitHubIcon, InstagramIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { AiSummary } from "@/components/AiSummary";

function BigArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} fill="none" aria-hidden="true">
      <path d="M4 20h50m0 0L37 3m17 17L37 37" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Process", href: "/process" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Industries", href: "/industries" },
  { label: "Pricing", href: "/pricing" },
  { label: "Careers", href: "/careers" },
  { label: "Free Audit", href: "/free-audit" },
  { label: "Blog", href: "/blog" },
  { label: "n8n Templates", href: "/free-n8n-templates" },
  { label: "ROI Calculator", href: "/roi-calculator" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  { Icon: LinkedInIcon, href: brand.socials.linkedin, label: "LinkedIn" },
  { Icon: XIcon, href: brand.socials.x, label: "X" },
  { Icon: InstagramIcon, href: brand.socials.instagram, label: "Instagram" },
  { Icon: GitHubIcon, href: brand.socials.github, label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="overflow-x-clip bg-white">
      <div className="mx-auto flex min-h-[72rem] max-w-[114rem] flex-col justify-between bg-black text-white max-md:min-h-0">
        <div className="px-[4rem] pt-[4rem] max-md:px-5">
          {/* Accent banner */}
          <div className="relative flex min-h-[20rem] flex-col justify-center rounded-[1.875rem] bg-[var(--accent)] px-[4rem] text-black max-md:min-h-0 max-md:p-6">
            <div className="text-[6.5rem] font-bold uppercase leading-[1] tracking-[-0.03em] max-md:text-5xl max-md:leading-none">
              Let&apos;s Automate
            </div>
            <div className="mt-[1rem] self-end pr-[20rem] text-[2.4rem] uppercase leading-none max-md:self-start max-md:pr-0 max-md:text-lg">
              Your Next Workflow
            </div>
            <Link
              href={brand.ctaHref}
              className="absolute bottom-[-2rem] right-[-2rem] flex h-[9.36rem] w-[15.6rem] items-center justify-center rounded-[1.875rem] border-[0.6rem] border-black bg-white text-black transition-colors duration-200 hover:bg-[var(--mint-200)] max-md:static max-md:mt-6 max-md:h-16 max-md:w-28"
              aria-label={brand.ctaLabel}
            >
              <BigArrow className="h-[4rem] w-[6rem]" />
            </Link>
          </div>

          <div className="mt-[4rem] grid grid-cols-[1fr_29.04rem] gap-[4rem] max-lg:grid-cols-1">
            <div className="grid grid-cols-[1.9fr_1fr] gap-[2rem] max-lg:grid-cols-1">
              <div>
                <Link href="/services" className="flex items-center gap-[1rem] text-[3.8rem] font-semibold uppercase leading-none transition-colors hover:text-[var(--accent)] max-md:text-2xl">
                  Services <BigArrow className="h-[2.6rem] w-[4rem]" />
                </Link>
                <div className="mt-[1.6rem] grid grid-cols-2 gap-x-[1.28rem] gap-y-[1.6rem] pl-[1.5rem] pt-[0.5rem]">
                  {categories.map((c) => (
                    <div key={c.slug}>
                      <Link href={serviceHref(c)} className="text-[1.28rem] font-semibold leading-[2.24rem] text-[var(--accent)] max-md:text-sm">
                        {c.title}
                      </Link>
                      {c.services.slice(0, 4).map((s) => (
                        <Link
                          key={s.slug}
                          href={serviceHref(c, s)}
                          className="block text-[1.15rem] leading-[2rem] transition-colors duration-200 hover:text-[var(--accent)] max-md:text-sm"
                        >
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Link href="/about" className="flex items-center gap-[1rem] text-[3.8rem] font-semibold uppercase leading-none transition-colors hover:text-[var(--accent)] max-md:text-2xl">
                  Company <BigArrow className="h-[2.6rem] w-[4rem]" />
                </Link>
                <div className="mt-[1.6rem] grid grid-cols-2 gap-x-[1.28rem] pl-[1.5rem] pt-[0.5rem]">
                  {companyLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="pt-[0.25rem] text-[1.15rem] leading-[2.24rem] transition-colors duration-200 hover:text-[var(--accent)] max-md:text-sm"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[2.4rem] self-start">
            <div className="rounded-[1.8rem] bg-[#1d1d1d] p-[1.5rem]">
              <div className="text-[3.2rem] font-semibold leading-[3.2rem] max-md:text-2xl">Contact</div>
              {brand.offices.map((o) => (
                <p key={o.label} className="mt-[1rem] text-[1.125rem] font-light leading-[1.75rem] max-md:text-sm">
                  <span className="text-[1.375rem] font-semibold">{o.label}</span> {o.text}
                </p>
              ))}
              <a href={`mailto:${brand.email}`} className="mt-[1rem] block text-[1.125rem] text-[var(--accent)] max-md:text-sm">
                {brand.email}
              </a>
              <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} className="block text-[1.125rem] text-white/80 max-md:text-sm">
                {brand.phone}
              </a>
            </div>
            <AiSummary />
            </div>
          </div>
        </div>

        <div className="mt-[4rem] bg-[#1d1d1d] py-[1.3rem]">
          <div className="flex items-center justify-between gap-6 px-[4rem] max-lg:flex-col max-md:px-5">
            <div className="flex items-center gap-[1.2rem] text-[1.1rem] text-white/70 max-md:flex-col max-md:text-sm">
              <BrandLogo className="h-[2.4rem] max-md:h-7" />
              <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
              {/* Required by the Flaticon free license for the animated icons */}
              <a href="https://www.flaticon.com/free-animated-icons" target="_blank" rel="noopener noreferrer" title="Animated icons" className="text-white/45 transition-colors hover:text-[var(--accent)]">
                Animated icons by Flaticon
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-x-[1.6rem] gap-y-2">
              {legalLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-[1.1rem] text-white/70 transition-colors hover:text-[var(--accent)] max-md:text-sm">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex gap-[0.6rem]">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-[2.24rem] w-[2.24rem] items-center justify-center rounded-[0.5rem] bg-black text-white transition-colors duration-200 hover:text-[#20dcc7] max-md:h-9 max-md:w-9"
                >
                  <Icon className="h-[1.3rem] w-[1.3rem]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
