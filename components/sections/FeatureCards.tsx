import { cn } from "@/lib/utils";

const tones = [
  "bg-[var(--mint-50)] border-[var(--mint-50)]",
  "bg-[var(--mint-soft)] border-[var(--mint-soft)]",
  "bg-white border-[var(--line)]",
  "bg-[rgba(0,239,212,0.1)] border-[var(--mint-soft)]",
];

/** Tinted rounded cards with big thin uppercase titles (the "benefits" card style). */
export function FeatureCards({
  items,
  columns = 3,
  numbered = false,
}: {
  items: { title: string; body: string }[];
  columns?: 2 | 3 | 4;
  numbered?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-[2rem] max-md:grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3 max-lg:grid-cols-2",
        columns === 4 && "grid-cols-4 max-lg:grid-cols-2",
      )}
    >
      {items.map((c, i) => (
        <div
          key={c.title}
          className={cn(
            "flex min-h-[16rem] flex-col justify-center gap-[0.6rem] rounded-[1.875rem] border-[0.8px] px-[2.2rem] py-[2rem] transition-transform duration-300 hover:-translate-y-1",
            tones[i % tones.length],
          )}
        >
          {numbered && <span className="text-[1.2rem] font-semibold text-[var(--teal)]">{String(i + 1).padStart(2, "0")}</span>}
          <h3 className={cn("card-title", columns === 4 && "!text-[2.4rem] !leading-[2.9rem] max-md:!text-2xl")}>{c.title}</h3>
          <p className="body-thin">{c.body}</p>
        </div>
      ))}
    </div>
  );
}
