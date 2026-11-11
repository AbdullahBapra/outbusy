import Image from "next/image";
import type { Post } from "@/content/pages";
import { canOptimizeImage, coverFor } from "@/lib/blog/format";
import { cn } from "@/lib/utils";

/**
 * A post's cover: the uploaded image, or the brand gradient with a faint grid and the
 * post's automation flow written as a pipeline — so posts without art still look designed.
 */
export function PostCover({
  post,
  sizes,
  priority,
  className,
}: {
  post: Post;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={post.cover ? undefined : { background: coverFor(post) }}>
      {post.cover ? (
        <Image
          src={post.cover.url}
          alt={post.cover.alt}
          fill
          priority={priority}
          unoptimized={!canOptimizeImage(post.cover.url)}
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:2.4rem_2.4rem] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {post.flow.length > 0 && (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center p-[8%]">
              <div className="flex flex-wrap items-center justify-center gap-[0.6rem]">
                {post.flow.slice(0, 3).map((step, i) => (
                  <span key={step} className="flex items-center gap-[0.6rem]">
                    {i > 0 && <span className="h-px w-[1.6rem] bg-[var(--accent)]/70 max-md:w-3" />}
                    <span
                      className={cn(
                        "rounded-full border px-[1rem] py-[0.4rem] text-[1rem] font-medium uppercase tracking-[0.12em] backdrop-blur-sm max-md:px-2.5 max-md:py-1 max-md:text-[10px]",
                        i === 1 ? "border-[var(--accent)] bg-[var(--accent)] text-[#040404]" : "border-white/25 bg-white/10 text-white",
                      )}
                    >
                      {step}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
