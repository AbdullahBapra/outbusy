import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/content/pages";
import { formatPostDate } from "@/lib/blog/format";
import { ArrowCircleIcon } from "@/components/icons";
import { PostCover } from "@/components/blog/PostCover";
import mark from "@/public/images/outbusy-mark.png";

/** Lead story (the newest post) with the next few as a numbered "also new" list. */
export function FeaturedPosts({ lead, more }: { lead: Post; more: Post[] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-[2.4rem] max-lg:grid-cols-1">
      <Link
        href={`/blog/${lead.slug}`}
        className="group grid grid-rows-[auto_1fr] rounded-[1.875rem] border-[0.8px] border-black/15 bg-white p-[0.8rem] transition-[border-color,box-shadow] duration-300 hover:border-black/30 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] max-md:rounded-[1.4rem] max-md:p-2"
      >
        <div className="relative">
          <PostCover post={lead} priority sizes="(max-width: 1024px) 100vw, 60vw" className="aspect-[16/8.5] rounded-[1.4rem] max-md:aspect-[16/10] max-md:rounded-2xl" />
          <span className="absolute left-[1.2rem] top-[1.2rem] flex items-center gap-[0.5rem] rounded-full bg-[#040404] px-[1rem] py-[0.4rem] text-[1rem] font-semibold uppercase tracking-[0.14em] text-white max-md:left-3 max-md:top-3 max-md:text-[10px]">
            <span aria-hidden="true" className="h-[0.6rem] w-[0.6rem] rounded-full bg-[var(--accent)] max-md:h-1.5 max-md:w-1.5" />
            Latest
          </span>
        </div>
        <div className="flex flex-col px-[2rem] pb-[2rem] pt-[2.4rem] max-md:px-3 max-md:pb-3 max-md:pt-4">
          <div className="flex flex-wrap items-center gap-[0.6rem] text-[1rem] uppercase tracking-[0.14em] text-black/45 max-md:text-[11px]">
            <span className="font-semibold text-[var(--teal)]">{lead.tag}</span>
            <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-black/25" />
            <time dateTime={lead.date}>{formatPostDate(lead.date)}</time>
            <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-black/25" />
            <span>{lead.readTime} read</span>
          </div>
          <h3 className="mt-[1rem] max-w-[56rem] text-balance text-[3.2rem] font-semibold uppercase leading-[1.06] text-[var(--ink)] transition-colors group-hover:text-[var(--teal)] max-lg:text-[3.4rem] max-md:text-[22px] max-md:leading-[1.15]">
            {lead.title}
          </h3>
          <p className="mt-[1rem] max-w-[56rem] text-[1.3rem] font-light leading-[1.6] text-black/60 max-lg:text-[1.6rem] max-md:text-[14px]">{lead.excerpt}</p>
          <div className="mt-auto flex items-center justify-between pt-[2rem] max-md:pt-4">
            <span className="flex items-center gap-[0.6rem] text-[1.1rem] font-medium text-[var(--ink)] max-md:text-[13px]">
              <span className="flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-full bg-[var(--mint-50)] p-[0.4rem] ring-1 ring-black/5 max-md:h-7 max-md:w-7 max-md:p-1">
                <Image src={mark} alt="" className="h-full w-full object-contain" />
              </span>
              {lead.author.name}
            </span>
            <span className="flex items-center gap-[0.8rem] text-[1.1rem] font-medium uppercase text-[var(--ink)] max-md:text-xs">
              Read article
              <ArrowCircleIcon
                className="h-[3rem] w-[3rem] transition-transform duration-300 group-hover:-rotate-[40deg] max-md:h-8 max-md:w-8"
                circle="#00efd4"
                arrow="#ffffff"
              />
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col rounded-[1.875rem] bg-[#fafbfb] p-[2.4rem] ring-1 ring-black/[0.06] max-md:rounded-[1.4rem] max-md:p-5">
        <div className="text-[1rem] font-semibold uppercase tracking-[0.16em] text-black/45 max-md:text-[11px]">Also new</div>
        <ol className="mt-[0.8rem] flex flex-1 flex-col divide-y divide-black/[0.08]">
          {more.map((p, i) => (
            <li key={p.slug} className="flex-1">
              <Link href={`/blog/${p.slug}`} className="group flex h-full gap-[1.4rem] py-[1.8rem] max-md:gap-3 max-md:py-4">
                <span className="w-[2.4rem] flex-none pt-[0.2rem] text-[1.3rem] font-semibold tabular-nums text-[var(--teal)] max-md:w-6 max-md:text-[13px]">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1rem] uppercase tracking-[0.14em] text-black/45 max-md:text-[11px]">
                    {p.tag} · {p.readTime} read
                  </span>
                  <span className="mt-[0.5rem] block text-[1.6rem] font-semibold uppercase leading-[1.25] text-[var(--ink)] transition-colors group-hover:text-[var(--teal)] max-lg:text-[1.9rem] max-md:text-[16px]">
                    {p.title}
                  </span>
                </span>
                <ArrowCircleIcon
                  className="mt-[0.2rem] h-[2.6rem] w-[2.6rem] flex-none opacity-0 transition-[opacity,transform] duration-300 group-hover:-rotate-[40deg] group-hover:opacity-100 max-lg:opacity-100 max-md:h-7 max-md:w-7"
                  circle="#00efd4"
                  arrow="#ffffff"
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
