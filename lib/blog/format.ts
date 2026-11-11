import type { Post, PostBlock } from "@/content/pages";

/** Cover gradients, assigned to posts in order (swap for real cover images any time). */
export const postCovers = [
  "linear-gradient(135deg,#0b2a27,#00897a)",
  "linear-gradient(135deg,#1a1b1f,#3a3d45)",
  "linear-gradient(135deg,#00897a,#00efd4)",
  "linear-gradient(135deg,#040404,#0b2a27)",
  "linear-gradient(135deg,#3a3d45,#00897a)",
];

/** Stable fallback gradient per post (derived from the slug, so it never changes between renders). */
export const coverFor = (post: Pick<Post, "slug">) => {
  let h = 0;
  for (const c of post.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return postCovers[h % postCovers.length];
};

/** Fixed locale + UTC so server and client always render the same string. */
export const formatPostDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Table-of-contents entries: every `h2` block in the body. */
export const postToc = (body: PostBlock[]) =>
  body.filter((b): b is Extract<PostBlock, { type: "h2" }> => b.type === "h2").map((b) => ({ id: headingId(b.text), text: b.text }));

/**
 * next/image can only optimise local files and images in our Supabase Storage (see
 * next.config.ts). Images on any other host are rendered unoptimised instead of erroring.
 */
export const canOptimizeImage = (url: string) =>
  url.startsWith("/") || /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(url);
