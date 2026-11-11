import { SectionHeading, type HeadingProps } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

function Column({ label, sub, items, after }: { label: string; sub: string; items: string[]; after?: boolean }) {
  return (
    <div className="w-[38.8rem] max-lg:w-full">
      <div
        className={cn(
          "mb-[2.4rem] flex min-h-[9.6rem] flex-col justify-center rounded-[1.875rem] px-[1.5rem] py-[1rem]",
          after ? "bg-[var(--accent)]" : "bg-[var(--mint-50)]",
        )}
      >
        <div className="text-[2.4rem] font-bold uppercase leading-[2.8rem] text-[var(--ink)] max-md:text-xl">{label}</div>
        <div className="text-[2.4rem] font-light uppercase leading-[2.8rem] text-[var(--ink)] max-md:text-xl">{sub}</div>
      </div>
      <ul className="relative space-y-[1.8rem]">
        <span className="absolute bottom-[0.9rem] left-[0.55rem] top-[0.9rem] w-px bg-[var(--accent)]/60" aria-hidden="true" />
        {items.map((it) => (
          <li key={it} className="relative pl-[2.5rem] text-[1.125rem] font-light leading-[1.7rem] text-black max-md:text-sm">
            <span
              className={cn(
                "absolute left-0 top-[0.35rem] h-[1.1rem] w-[1.1rem] rounded-full border-2 border-[var(--accent)]",
                after ? "bg-[var(--accent)]" : "bg-white",
              )}
              aria-hidden="true"
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two-column "before vs after" comparison with timeline dots and a swap icon between. */
export function BeforeAfter({
  heading,
  before,
  after,
  subject,
}: {
  heading: HeadingProps;
  before: string[];
  after: string[];
  subject: string;
}) {
  return (
    <section className="sec-green bg-white">
      <div className="container-x">
        <SectionHeading {...heading} />
        <div className="mt-[4rem] flex items-start justify-between gap-[3rem] max-lg:flex-col">
          <Column label="Without" sub={subject} items={before} />
          <div className="flex self-center pt-[2rem] max-lg:self-start max-lg:pt-0" aria-hidden="true">
            <svg viewBox="0 0 64 48" className="h-[4.8rem] w-[6.4rem] text-black max-lg:rotate-90">
              <path d="M8 16h46m0 0-10-10m10 10-10 10M56 32H10m0 0 10-10M10 32l10 10" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </div>
          <Column label="With" sub={subject} items={after} after />
        </div>
      </div>
    </section>
  );
}
