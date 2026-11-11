import { MediaVisual } from "@/components/sections/inner/MediaVisual";
import { AutomationVisual } from "@/components/sections/inner/AutomationVisual";

/** Big two-line heading with a side list, then a wide visual card and two stat boxes. */
export function ImpactPanel({
  lightWord,
  boldWord,
  accentLine,
  sideList,
  caption,
  stats,
  labels,
  image,
}: {
  lightWord: string;
  boldWord: string;
  accentLine: string;
  sideList: string[];
  caption: string;
  stats: { value: string; label: string }[];
  labels?: string[];
  /** Photo for the visual panel; the pipeline floats over it. Falls back to the diagram. */
  image?: string;
}) {
  return (
    <section className="bg-white py-[5rem]">
      <div className="container-x">
        <div className="flex items-end justify-between gap-[3rem] max-lg:flex-col max-lg:items-start">
          <h2 className="flex flex-none flex-col whitespace-nowrap max-lg:whitespace-normal">
            <span className="display">
              {boldWord} <span className="font-extralight">{lightWord}</span>
            </span>
            <span className="display accent">{accentLine}</span>
          </h2>
          <ul className="mb-[1rem] max-w-[38rem] space-y-[0.6rem]">
            {sideList.map((s) => (
              <li key={s} className="text-[1.6rem] font-semibold uppercase leading-[2rem] text-[var(--ink)] max-md:text-base">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[2.4rem] grid grid-cols-[55.8rem_20.7rem_1fr] gap-[1.6rem] max-xl:grid-cols-[1fr_20.7rem] max-lg:grid-cols-1">
          {image ? (
            <MediaVisual image={image} labels={labels} className="max-md:rounded-[1.4rem]" imageClassName="aspect-[16/9]" />
          ) : (
            <AutomationVisual labels={labels} className="h-[28.7rem] max-md:h-64" />
          )}
          <div className="grid grid-rows-2 gap-[1.6rem]">
            {stats.slice(0, 2).map((s, i) => (
              <div
                key={s.label}
                className={
                  i === 0
                    ? "flex flex-col items-center justify-center rounded-[1.875rem] bg-[var(--mint-300)] p-[2rem] text-center"
                    : "flex flex-col items-center justify-center rounded-[1.875rem] border-[0.8px] border-[var(--line)] bg-white p-[2rem] text-center"
                }
              >
                <div className="text-[4.4rem] font-bold leading-none text-[var(--ink)] max-md:text-4xl">{s.value}</div>
                <div className="mt-[0.6rem] text-[1.2rem] uppercase leading-[1.5rem] text-[var(--ink)] max-md:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center rounded-[1.875rem] bg-[var(--mint-50)] p-[2.4rem] max-xl:hidden">
            <p className="text-[1.6rem] font-light uppercase leading-[2.2rem] text-[var(--ink)]">{caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
