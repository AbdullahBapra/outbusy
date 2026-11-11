import Image from "next/image";
import { processSteps } from "@/content/pages";
import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

export function ProcessSteps({
  heading,
  cta = { label: "Book Free AI Audit", href: "/contact" },
}: {
  heading: HeadingProps;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="sec-green bg-white">
      <div className="container-x">
        <div className="flex items-end justify-between gap-8 max-md:flex-col max-md:items-start">
          <SectionHeading {...heading} />
          <PillButton href={cta.href}>{cta.label}</PillButton>
        </div>

        <div className="mt-[3rem] grid grid-cols-2 gap-[2.4rem] max-md:grid-cols-1 max-md:gap-4">
          {processSteps.map((s, i) => {
            // An odd last step spans the full row, with the image beside the text.
            const wide = i === processSteps.length - 1 && processSteps.length % 2 === 1;
            return (
              <div
                key={s.title}
                className={cn(
                  "group/run flex flex-col rounded-[1.875rem] border-[0.8px] border-black/15 bg-white p-[0.8rem] transition-[border-color,box-shadow] duration-300 hover:border-black/30 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] max-md:rounded-[1.4rem] max-md:p-2",
                  wide && "col-span-2 grid grid-cols-2 items-center gap-[0.8rem] max-md:col-span-1 max-md:flex",
                )}
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.4rem] bg-[var(--mint-50)] max-md:rounded-2xl">
                  <Image
                    src={`/images/process/${s.title.toLowerCase()}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover/run:scale-[1.04]"
                  />
                  <span className="absolute left-[1.2rem] top-[1.2rem] flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[#040404] text-[1.2rem] font-semibold tabular-nums text-white max-md:left-3 max-md:top-3 max-md:h-9 max-md:w-9 max-md:text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="px-[1.6rem] pb-[1.6rem] pt-[2rem] max-md:px-3 max-md:pb-3 max-md:pt-4">
                  <div className="text-[1rem] font-semibold uppercase tracking-[0.16em] text-[var(--teal)] max-md:text-[11px]">
                    Step {i + 1} of {processSteps.length}
                  </div>
                  <h3 className="run-num mt-[0.4rem] text-[2.6rem] font-bold uppercase leading-[1.1] text-[var(--ink)] max-md:text-2xl">{s.title}</h3>
                  <p className="body-thin mt-[0.6rem] max-w-[44rem]">{s.body}</p>
                  <ul className="mt-[1.4rem] flex flex-wrap gap-[0.6rem] border-t border-black/[0.08] pt-[1.4rem] max-md:gap-1.5 max-md:pt-3">
                    {s.points.map((p) => (
                      <li key={p} className="rounded-full bg-[var(--mint-50)] px-[1rem] py-[0.45rem] text-[1.05rem] text-[var(--ink)] ring-1 ring-[#d3f1ec] max-md:px-3 max-md:py-1 max-md:text-xs">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
