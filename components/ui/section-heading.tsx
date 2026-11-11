import { cn } from "@/lib/utils";

export type HeadingProps = {
  top?: string;
  big: string;
  accent?: boolean;
  strong?: string;
  light?: string;
  intro?: string;
};

/**
 * The signature heading pattern: small bold line, giant display word, then a
 * bold + light uppercase sub line and a thin intro paragraph.
 */
export function SectionHeading({
  top,
  big,
  accent = true,
  strong,
  light,
  intro,
  as: Tag = "h2",
  className,
}: {
  top?: string;
  big: string;
  accent?: boolean;
  strong?: string;
  light?: string;
  intro?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={className}>
      <Tag className="flex flex-col">
        {top && <span className="sub-strong">{top}</span>}
        <span className={cn("display", accent && "accent")}>{big}</span>
        {(strong || light) && (
          <span>
            {strong && <span className="sub-strong">{strong} </span>}
            {light && <span className="sub-light">{light}</span>}
          </span>
        )}
      </Tag>
      {intro && <p className="body-thin mt-[0.6rem] max-w-[60rem]">{intro}</p>}
    </div>
  );
}
