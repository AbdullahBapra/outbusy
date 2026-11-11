import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** "1–25 of 140" with previous/next links. Renders nothing when everything fits on one page. */
export function Pager({ page, pageSize, total, href, noun = "items" }: { page: number; pageSize: number; total: number; href: (page: number) => string; noun?: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = (enabled: boolean) =>
    cn("flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 text-[13px] transition", enabled ? "hover:border-black/40" : "pointer-events-none opacity-40");

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3 text-[13px] text-black/55">
      <span className="tabular-nums">
        {from}–{to} of {total} {noun}
      </span>
      <span className="flex items-center gap-2">
        <span className="tabular-nums max-sm:hidden">
          Page {page} of {pages}
        </span>
        <Link href={href(page - 1)} aria-disabled={page <= 1} className={btn(page > 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Link>
        <Link href={href(page + 1)} aria-disabled={page >= pages} className={btn(page < pages)}>
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      </span>
    </nav>
  );
}

/** Reads a 1-based page number from a search param, clamped to a sane range. */
export const pageParam = (value: string | undefined) => Math.min(10_000, Math.max(1, Number.parseInt(value ?? "", 10) || 1));
