"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Link2 } from "lucide-react";
import { LinkedInIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { aiAssistant } from "@/lib/aiLinks";

/** Assistants offered for "Summarize with AI". */
const SUMMARIZERS = ["chatgpt", "claude", "perplexity", "google"].map(aiAssistant);

type TocItem = { id: string; text: string };

const label = "mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40";
const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.12] text-[var(--ink)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white";

/** The heading in the upper part of the viewport (for highlighting the contents). */
function useActiveHeading(toc: TocItem[]) {
  const [active, setActive] = useState(toc[0]?.id ?? "");
  useEffect(() => {
    const els = toc.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [toc]);
  return active;
}

function Contents({ toc, active }: { toc: TocItem[]; active: string }) {
  return (
    <ol className="border-l border-black/[0.08]">
      {toc.map((t) => {
        const on = active === t.id;
        return (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              aria-current={on ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-[14px] leading-[1.45] transition-colors",
                on ? "border-[var(--teal)] font-medium text-[var(--ink)]" : "border-transparent text-black/50 hover:text-[var(--ink)]",
              )}
            >
              {t.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** Share (copy / LinkedIn / X) and "Summarize with AI" — used in the side rail and on mobile. */
export function ArticleShare({ title, summaryPrompt }: { title: string; summaryPrompt: string }) {
  const [copied, setCopied] = useState(false);

  const share = (network: "linkedin" | "x") => {
    const url = encodeURIComponent(window.location.href);
    const href =
      network === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        : `https://x.com/intent/post?url=${url}&text=${encodeURIComponent(title)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) — fail silently.
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <div className={label}>Share</div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] px-3.5 text-[13px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
          >
            {copied ? <Check className="h-4 w-4 text-[var(--teal)]" /> : <Link2 className="h-4 w-4" />}
            <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
          </button>
          <button type="button" aria-label="Share on LinkedIn" onClick={() => share("linkedin")} className={iconButton}>
            <LinkedInIcon className="h-[15px] w-[15px]" />
          </button>
          <button type="button" aria-label="Share on X" onClick={() => share("x")} className={iconButton}>
            <XIcon className="h-[14px] w-[14px]" />
          </button>
        </div>
      </div>
      <div>
        <div className={label}>Summarize with AI</div>
        <div className="flex flex-wrap items-center gap-2">
          {SUMMARIZERS.map((a) => (
            <a
              key={a.id}
              href={a.url(summaryPrompt)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Summarize this article with ${a.name} (opens in a new tab)`}
              title={`Summarize with ${a.name}`}
              className={iconButton}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path d={a.logo.path} fill="currentColor" fillRule={a.logo.evenOdd ? "evenodd" : undefined} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Left column: sticky contents that track the section in view. On medium screens it also
 * carries Share / Summarize (the right rail appears only on wide screens); on phones it
 * becomes a collapsible card above the article.
 */
export function ArticleSidebar({ toc, title, summaryPrompt }: { toc: TocItem[]; title: string; summaryPrompt: string }) {
  const active = useActiveHeading(toc);

  return (
    <aside>
      <div className="sticky top-8 max-lg:hidden">
        <div className={label}>In this article</div>
        <nav aria-label="Table of contents">
          <Contents toc={toc} active={active} />
        </nav>
        <div className="mt-8 border-t border-black/[0.08] pt-7 xl:hidden">
          <ArticleShare title={title} summaryPrompt={summaryPrompt} />
        </div>
      </div>

      <div className="lg:hidden">
        <details className="group rounded-2xl border border-black/[0.1] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14px] font-semibold text-[var(--ink)] [&::-webkit-details-marker]:hidden">
            In this article
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-black/40 transition-transform group-open:rotate-180" />
          </summary>
          <nav aria-label="Table of contents" className="px-5 pb-4">
            <Contents toc={toc} active={active} />
          </nav>
        </details>
        <div className="mt-6">
          <ArticleShare title={title} summaryPrompt={summaryPrompt} />
        </div>
      </div>
    </aside>
  );
}

/** Right rail (wide screens): Share / Summarize, sticky while reading. */
export function ArticleActionsRail({ title, summaryPrompt }: { title: string; summaryPrompt: string }) {
  return (
    <aside aria-label="Share this article" className="max-xl:hidden">
      <div className="sticky top-8">
        <ArticleShare title={title} summaryPrompt={summaryPrompt} />
      </div>
    </aside>
  );
}
