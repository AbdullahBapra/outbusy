"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Post } from "@/content/pages";
import { PostCard } from "@/components/blog/PostCard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

/** All-articles grid with category filters (each showing its post count) and numbered pages. */
export function BlogGrid({ posts }: { posts: Post[] }) {
  const tags = ["All", ...new Set(posts.map((p) => p.tag))];
  const count = (t: string) => (t === "All" ? posts.length : posts.filter((p) => p.tag === t).length);
  const [tag, setTag] = useState("All");
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const matching = tag === "All" ? posts : posts.filter((p) => p.tag === tag);
  const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = matching.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageBtn = "flex h-[3.2rem] min-w-[3.2rem] items-center justify-center rounded-full px-[1rem] text-[1.1rem] font-medium tabular-nums transition-colors max-md:h-10 max-md:min-w-10 max-md:text-sm";

  return (
    <>
      <div ref={top} className="mt-[3rem] flex scroll-mt-[calc(var(--head-h,5rem)+2rem)] flex-wrap items-center justify-between gap-[1.6rem] border-y border-black/[0.08] py-[1.4rem] max-md:mt-6 max-md:py-3">
        <div role="tablist" aria-label="Filter by category" className="-mx-1 flex gap-[0.6rem] overflow-x-auto px-1 max-md:w-full">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tag === t}
              onClick={() => {
                setTag(t);
                setPage(1);
              }}
              className={cn(
                "flex flex-none items-center gap-[0.6rem] rounded-full px-[1.4rem] py-[0.7rem] text-[1.1rem] font-medium uppercase tracking-[0.08em] transition-colors max-md:px-3.5 max-md:py-2 max-md:text-xs",
                tag === t ? "bg-[var(--ink)] text-white" : "text-black/60 hover:bg-black/[0.05] hover:text-[var(--ink)]",
              )}
            >
              {t}
              <span className={cn("text-[0.95rem] tabular-nums max-md:text-[10px]", tag === t ? "text-[var(--accent)]" : "text-black/35")}>{count(t)}</span>
            </button>
          ))}
        </div>
        <span aria-live="polite" className="text-[1rem] uppercase tracking-[0.14em] text-black/45 max-md:hidden">
          {pages > 1
            ? `Showing ${(current - 1) * PAGE_SIZE + 1}–${Math.min(matching.length, current * PAGE_SIZE)} of ${matching.length} articles`
            : `Showing ${matching.length} ${matching.length === 1 ? "article" : "articles"}`}
        </span>
      </div>
      <div className="mt-[3rem] grid grid-cols-3 gap-[2.4rem] max-lg:grid-cols-2 max-md:mt-6 max-md:grid-cols-1 max-md:gap-4">
        {shown.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>

      {pages > 1 && (
        <nav aria-label="Blog pages" className="mt-[4rem] flex items-center justify-center gap-[0.6rem] max-md:mt-8 max-md:gap-1.5">
          <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => goTo(current - 1)} className={cn(pageBtn, "border border-black/15 hover:border-black disabled:pointer-events-none disabled:opacity-30")}>
            <ChevronLeft className="h-[1.4rem] w-[1.4rem] max-md:h-4 max-md:w-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === current ? "page" : undefined}
              onClick={() => goTo(p)}
              className={cn(pageBtn, p === current ? "bg-[var(--ink)] text-white" : "text-black/60 hover:bg-black/[0.05] hover:text-[var(--ink)]")}
            >
              {p}
            </button>
          ))}
          <button type="button" aria-label="Next page" disabled={current >= pages} onClick={() => goTo(current + 1)} className={cn(pageBtn, "border border-black/15 hover:border-black disabled:pointer-events-none disabled:opacity-30")}>
            <ChevronRight className="h-[1.4rem] w-[1.4rem] max-md:h-4 max-md:w-4" />
          </button>
        </nav>
      )}
    </>
  );
}
