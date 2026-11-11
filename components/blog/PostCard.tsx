import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/content/pages";
import { formatPostDate } from "@/lib/blog/format";
import { ArrowCircleIcon } from "@/components/icons";
import { PostCover } from "@/components/blog/PostCover";
import mark from "@/public/images/outbusy-mark.png";

/** Article card: inset cover with the topic, date and read time, title, excerpt, author. */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-[1.875rem] border-[0.8px] border-black/15 bg-white p-[0.8rem] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-black/30 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] max-md:rounded-[1.4rem] max-md:p-2"
    >
      <div className="relative">
        <PostCover
          post={post}
          sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[16/10] rounded-[1.4rem] max-md:rounded-2xl"
        />
        <span className="absolute left-[1rem] top-[1rem] rounded-full bg-white px-[0.9rem] py-[0.35rem] text-[1rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-md:left-3 max-md:top-3 max-md:text-[10px]">
          {post.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-[1.4rem] pb-[1.4rem] pt-[1.8rem] max-md:px-3 max-md:pb-3 max-md:pt-4">
        <div className="flex items-center gap-[0.6rem] text-[1rem] uppercase tracking-[0.14em] text-black/45 max-md:text-[11px]">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span
            aria-hidden="true"
            className="h-[3px] w-[3px] rounded-full bg-black/25"
          />
          <span>{post.readTime} read</span>
        </div>
        <h3 className="mt-[0.8rem] text-[1.9rem] font-semibold uppercase leading-[1.18] text-[var(--ink)] transition-colors group-hover:text-[var(--teal)] max-lg:text-[2.2rem] max-md:text-[18px]">
          {post.title}
        </h3>
        <p className="mt-[0.8rem] line-clamp-2 text-[1.2rem] font-light leading-[1.6] text-black/60 max-lg:text-[1.5rem] max-md:text-[14px]">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-[1.8rem] max-md:pt-4">
          <div className="flex items-center justify-between border-t border-black/[0.08] pt-[1.4rem] max-md:pt-3">
            <span className="flex items-center gap-[0.6rem] text-[1.1rem] font-medium text-[var(--ink)] max-md:text-[13px]">
              <span className="flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-full bg-[var(--mint-50)] p-[0.4rem] ring-1 ring-black/5 max-md:h-7 max-md:w-7 max-md:p-1">
                <Image
                  src={mark}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
              {post.author.name}
            </span>
            <ArrowCircleIcon
              className="h-[2.8rem] w-[2.8rem] transition-transform duration-300 group-hover:-rotate-[40deg] max-md:h-8 max-md:w-8"
              circle="#00efd4"
              arrow="#ffffff"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
