import Link from "next/link";
import { industries } from "@/content/industries";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";

export function IndustriesGrid({
  heading,
  showButton = true,
}: {
  heading?: HeadingProps;
  showButton?: boolean;
}) {
  return (
    <section className="sec-red bg-white">
      <div className="container-x">
        {heading && <SectionHeading {...heading} />}

        <div className="mt-[3rem] grid grid-cols-3 gap-[2rem] max-lg:grid-cols-2 max-md:grid-cols-1">
          {industries.map((ind, i) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="hover-card group relative flex items-center gap-[1.6rem] rounded-[1.875rem] border-[0.8px] border-[var(--line)] bg-white p-[1.6rem] transition-colors max-md:gap-4 max-md:p-5 duration-300 hover:bg-[var(--mint-50)]"
            >
              <span
                className="flex h-[6.72rem] w-[6.72rem] flex-none max-md:h-16 max-md:w-16 items-center justify-center rounded-[4rem] transition-transform duration-300 group-hover:-translate-y-1"
                style={{ background: i % 2 ? "var(--mint-200)" : "var(--mint-50)" }}
              >
                <AnimatedIcon name={ind.icon} className="h-[5.3rem] w-[5.3rem] text-[var(--ink)] max-md:h-12 max-md:w-12" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.6rem] font-semibold uppercase leading-[2rem] text-[var(--ink)] max-md:text-lg max-md:leading-6">{ind.name}</span>
                <span className="body-thin mt-[0.3rem] block">{ind.short}</span>
              </span>
            </Link>
          ))}
        </div>

        {showButton && (
          <div className="mt-[2.4rem] flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
            <p className="body-thin">Don&apos;t see your industry? Most of our systems adapt to any service business.</p>
            <PillButton href="/industries">All Industries</PillButton>
          </div>
        )}
      </div>
    </section>
  );
}
