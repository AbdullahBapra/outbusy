import { pitfalls } from "@/content/inner";
import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { ArrowCircleIcon } from "@/components/icons";

/**
 * 3-column grid of pitfall cards. Hovering (or focusing/tapping) a card flips it
 * to reveal how we handle that problem.
 */
export function PitfallsGrid({ heading, items = pitfalls }: { heading: HeadingProps; items?: typeof pitfalls }) {
  return (
    <section className="sec-blue bg-white">
      <div className="container-x">
        <div className="flex justify-center text-center">
          <SectionHeading {...heading} />
        </div>
        <div className="mt-[3.4rem] grid grid-cols-3 gap-[2.2rem] max-lg:grid-cols-2 max-md:grid-cols-1">
          {items.map((p) => (
            <div key={p.title} tabIndex={0} className="group h-[14.5rem] outline-none [perspective:1200px] max-md:h-48">
              <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
                {/* front */}
                <div className="absolute inset-0 flex flex-col justify-between rounded-[1.875rem] border-[0.8px] border-[var(--line)] bg-white px-[2rem] pb-[1rem] pt-[2rem] [backface-visibility:hidden]">
                  <div>
                    <div className="text-[2.4rem] font-bold uppercase leading-[2.6rem] text-[var(--ink)] max-md:text-xl">{p.title}</div>
                    <div className="mt-[0.2rem] text-[1rem] uppercase leading-[1.4rem] text-[var(--ink)]">{p.sub}</div>
                  </div>
                  <span className="flex items-center gap-[0.6rem] text-[1.1rem] uppercase text-[var(--ink)] max-md:text-xs">
                    How we fix it
                    <ArrowCircleIcon className="h-[2.2rem] w-[2.2rem]" circle="#00efd4" arrow="#040404" />
                  </span>
                </div>
                {/* back */}
                <div className="absolute inset-0 flex flex-col justify-center rounded-[1.875rem] bg-[var(--accent)] px-[2rem] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="text-[1.4rem] font-bold uppercase leading-tight text-[var(--ink)] max-md:text-sm">{p.title}</div>
                  <p className="mt-[0.6rem] text-[1.2rem] font-light leading-[1.7rem] text-[var(--ink)] max-md:text-sm">{p.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
