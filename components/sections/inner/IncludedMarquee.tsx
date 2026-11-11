import { includedWithEveryBuild } from "@/content/inner";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";

const tints = ["#E4FFFC", "#F2FEFD", "#D9FFFB"];

/** Infinite marquee of tinted cards (pauses on hover). */
export function IncludedMarquee({ heading, items = includedWithEveryBuild }: { heading: HeadingProps; items?: { title: string; body: string }[] }) {
  const loop = [...items, ...items];
  return (
    <section className="sec-red overflow-hidden bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />
      </div>
      <div className="marquee-wrap mt-[3.4rem]">
        <div className="marquee-track gap-[2rem] pr-[2rem]" style={{ animationDuration: "40s" }}>
          {loop.map((c, i) => (
            <div
              key={i}
              className="flex h-[17rem] w-[31rem] flex-none flex-col rounded-[1.875rem] px-[1.25rem] pb-[1rem] pt-[2.5rem] max-md:h-auto max-md:w-64"
              style={{ background: tints[i % tints.length] }}
            >
              <h3 className="text-[2.4rem] font-bold uppercase leading-[2.8rem] text-[var(--ink)] max-md:text-lg">{c.title}</h3>
              <p className="body-thin mt-[0.8rem]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
