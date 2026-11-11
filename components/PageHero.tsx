import { PillButton } from "@/components/ui/pill-button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { WaveCanvas } from "@/components/WaveCanvas";
import { StarIcon } from "@/components/icons";

type Cta = { label: string; href: string };

/**
 * Black rounded hero card with the animated wave background — used on every page.
 * `size="home"` keeps the giant display word; inner pages use a slightly smaller title.
 */
export function PageHero({
  bigLine,
  subStrong,
  subLight,
  paragraphs = [],
  primary,
  secondary,
  breadcrumbs,
  stats,
  size = "page",
}: {
  bigLine: string;
  subStrong?: string;
  subLight?: string;
  paragraphs?: string[];
  primary?: Cta;
  secondary?: Cta;
  breadcrumbs?: { label: string; href?: string }[];
  stats?: { value: string; label: string }[];
  size?: "home" | "page";
}) {
  const strip = stats ? [...stats, ...stats] : [];

  return (
    <section className="bg-white pt-[10rem] max-md:pt-[6rem]">
      <div className="container-x">
        <div
          className={`relative isolate overflow-hidden rounded-[1.875rem] bg-[#040404] ${
            size === "home" ? "min-h-[42rem] max-md:min-h-0" : "min-h-[30rem] max-md:min-h-0"
          }`}
        >
          <WaveCanvas className="absolute inset-0 -z-10 h-full w-full" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_30%,rgba(4,4,4,0.85),rgba(4,4,4,0.2)_60%)]" />

          <div className="px-[2.875rem] pb-[4rem] pt-[4.94rem] max-md:px-5 max-md:pt-10">
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            <h1 className="flex flex-col">
              <span
                className={
                  size === "home"
                    ? "display text-white !text-[8rem] !leading-[0.95] max-md:!text-[2.6rem] max-md:!leading-none"
                    : "display text-white !text-[5.75rem] !leading-[0.95] max-md:!text-[2.4rem] max-md:!leading-none"
                }
              >
                {bigLine}
              </span>
              {(subStrong || subLight) && (
                <span className="sub-strong mt-[0.6rem] text-white">
                  {subStrong} {subLight && <em className="font-extralight italic">{subLight}</em>}
                </span>
              )}
            </h1>

            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`max-w-[75rem] text-[1.125rem] font-thin leading-[1.75rem] text-white max-md:text-sm ${
                  i === 0 ? "pt-[1.375rem]" : "pt-[0.6rem]"
                }`}
              >
                {p}
              </p>
            ))}

            {(primary || secondary) && (
              <div className="mt-[3.4rem] flex flex-wrap gap-[0.8rem]">
                {primary && (
                  <PillButton variant="white" href={primary.href}>
                    {primary.label}
                  </PillButton>
                )}
                {secondary && (
                  <PillButton variant="ghost" href={secondary.href}>
                    {secondary.label}
                  </PillButton>
                )}
              </div>
            )}
          </div>

          {stats && (
            <>
              <div className="mx-[2.875rem] h-px bg-[linear-gradient(90deg,#0a0a0a,#fff_41%,#fff_56%,#0a0a0a)] max-md:mx-5" />
              <div className="marquee-wrap mx-[2.875rem] overflow-hidden py-[2.2rem] max-md:mx-5">
                <div className="marquee-track slow">
                  {strip.map((s, i) => (
                    <div key={i} className="flex w-[24.3rem] flex-none flex-col items-center max-md:w-40">
                      <div className="flex items-center gap-[0.4rem] text-[1.6rem] font-semibold leading-[2.4rem] text-white max-md:text-base">
                        {s.value}
                        <StarIcon className="h-[1rem] w-[1rem] text-[var(--accent)]" />
                      </div>
                      <div className="text-[1rem] font-light uppercase leading-[1.6rem] tracking-wide text-white/70 max-md:text-xs">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
