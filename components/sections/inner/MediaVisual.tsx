import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Image panel shown in full, with the automation pipeline as a slim strip underneath, so the
 * picture and the actual workflow read together. Used in place of AutomationVisual when a page has art.
 */
export function MediaVisual({
  image,
  labels = [],
  caption,
  className,
  imageClassName = "aspect-[16/10]",
}: {
  image: string;
  labels?: string[];
  caption?: string;
  className?: string;
  /** Sizing for the image area, e.g. an aspect ratio, or `flex-1` inside a fixed-height panel. */
  imageClassName?: string;
}) {
  const steps = labels.slice(0, 5);
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-[1.875rem] bg-[#06201d]", className)}>
      <div className={cn("relative min-h-0 bg-[var(--mint-50)]", imageClassName)}>
        <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
      </div>

      {steps.length > 0 && (
        <div className="flex-none px-[1.6rem] py-[1.3rem] text-white max-md:p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.95rem] uppercase tracking-[0.16em] text-white/55 max-md:text-[10px]">Live workflow</span>
            <span className="flex items-center gap-[0.4rem] text-[0.95rem] text-[var(--accent)] max-md:text-[11px]">
              <span className="h-[0.6rem] w-[0.6rem] animate-pulse rounded-full bg-[var(--accent)]" /> Running
            </span>
          </div>
          <div className="mt-[0.8rem] flex flex-wrap items-center gap-[0.5rem] max-md:mt-2 max-md:gap-1.5">
            {steps.map((s, i) => (
              <span key={s} className="flex items-center gap-[0.5rem] max-md:gap-1.5">
                {i > 0 && <span className="h-[2px] w-[1rem] bg-[var(--accent)] flow-dash max-md:w-2" />}
                <span
                  className={cn(
                    "rounded-full px-[0.9rem] py-[0.35rem] text-[1.05rem] font-medium max-md:px-2 max-md:py-0.5 max-md:text-[11px]",
                    i === 1 ? "bg-[var(--accent)] text-[#040404]" : "bg-white/[0.07] text-white ring-1 ring-white/15",
                  )}
                >
                  {s}
                </span>
              </span>
            ))}
          </div>
          {caption && <p className="mt-[0.8rem] line-clamp-1 text-[1rem] leading-[1.5] text-white/55 max-md:hidden">{caption}</p>}
        </div>
      )}
    </div>
  );
}
