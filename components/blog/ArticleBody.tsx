import Image from "next/image";
import { Check, Lightbulb } from "lucide-react";
import type { PostBlock } from "@/content/pages";
import { canOptimizeImage, headingId } from "@/lib/blog/format";
import { tokenizeInline } from "@/lib/markdown";

/** Renders **bold**, *italic* and [links](url) inside a line of text. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((t, i) => {
        if (t.kind === "bold") return <strong key={i} className="font-semibold text-[var(--ink)]">{t.text}</strong>;
        if (t.kind === "italic") return <em key={i}>{t.text}</em>;
        if (t.kind === "link") {
          const external = /^https?:\/\//.test(t.href);
          return (
            <a
              key={i}
              href={t.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-medium text-[var(--teal)] underline decoration-[var(--teal)]/30 decoration-1 underline-offset-[3px] transition-colors hover:decoration-[var(--teal)]"
            >
              {t.text}
            </a>
          );
        }
        return t.text;
      })}
    </>
  );
}

/**
 * Editorial article typography. Sizes are in px (not the site's scaled rem) so the reading
 * experience stays the same on every screen: 17–18px body, ~70 characters per line.
 */
export function ArticleBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={headingId(b.text)}
                className="!mt-14 scroll-mt-8 text-[24px] font-semibold leading-[1.25] tracking-[-0.015em] text-[var(--ink)] first:!mt-0 md:text-[28px]"
              >
                {b.text}
              </h2>
            );
          case "p":
            // The opening paragraph reads as a lead.
            return i === 0 ? (
              <p key={i} className="text-[19px] leading-[1.7] text-[#1b1f20] md:text-[21px]">
                <Inline text={b.text} />
              </p>
            ) : (
              <p key={i} className="text-[17px] leading-[1.8] text-[#3a4042] md:text-[18px]">
                <Inline text={b.text} />
              </p>
            );
          case "list":
            return (
              <ul key={i} className="space-y-3">
                {b.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[17px] leading-[1.7] text-[#3a4042] md:text-[18px]">
                    <span className="mt-[7px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-[var(--mint-100)] text-[var(--teal)] md:mt-[8px]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <figure key={i} className="!my-10 border-l-[3px] border-[var(--accent)] py-1 pl-6">
                <blockquote className="text-[21px] font-medium leading-[1.45] tracking-[-0.01em] text-[var(--ink)] md:text-[24px]">
                  <Inline text={b.text} />
                </blockquote>
              </figure>
            );
          case "tip":
            return (
              <aside key={i} className="!my-8 flex gap-4 rounded-2xl border border-[#d9f2ee] bg-[var(--mint-50)] p-5 md:p-6">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-[var(--teal)] ring-1 ring-[#d9f2ee]">
                  <Lightbulb className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">{b.title}</div>
                  <p className="mt-1 text-[16px] leading-[1.65] text-[#2a2f30]">
                    <Inline text={b.text} />
                  </p>
                </div>
              </aside>
            );
          case "image":
            return (
              <figure key={i} className="!my-10">
                <div className="overflow-hidden rounded-2xl bg-[var(--mint-50)] ring-1 ring-black/5">
                  <Image
                    src={b.url}
                    alt={b.alt}
                    width={1600}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 720px"
                    unoptimized={!canOptimizeImage(b.url)}
                    className="h-auto w-full"
                  />
                </div>
                {b.caption && <figcaption className="mt-3 text-center text-[14px] text-black/50">{b.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
