import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { ToolLogo, hasLogo } from "@/components/ui/tool-logo";

const tints = ["#F2FEFD", "#C0FFF8", "#D9FFFB", "#97FFF4"];

/**
 * Tool tiles with official brand logos (grey by default, brand colour on hover).
 * Tools without an available logo show a clean wordmark. See components/ui/tool-logo.tsx.
 */
export function TechStack({
  heading,
  items,
  cta,
}: {
  heading: HeadingProps;
  items: string[];
  cta?: { label: string; href: string };
}) {
  return (
    <section className="sec-red bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />
        {cta && (
          <div className="mt-[1.6rem]">
            <PillButton href={cta.href}>{cta.label}</PillButton>
          </div>
        )}

        <div className="mt-[4rem] grid grid-cols-4 gap-[2.4rem] max-md:grid-cols-2 max-md:gap-4">
          {items.map((t, i) => (
            <div
              key={t}
              className="group/logo flex h-[12rem] flex-col items-center justify-center gap-[1rem] rounded-[2rem] text-center transition-transform duration-500 hover:scale-[1.03] max-md:h-28 max-md:gap-2"
              style={{ background: tints[i % tints.length] }}
            >
              {hasLogo(t) ? (
                <>
                  <ToolLogo name={t} className="h-[4.2rem] w-[4.2rem] max-md:h-9 max-md:w-9" />
                  <span className="text-[1.15rem] font-medium text-black/55 max-md:text-xs">{t}</span>
                </>
              ) : (
                <ToolLogo name={t} className="text-[2.4rem] max-md:text-xl" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
