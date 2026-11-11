import type { Post } from "@/content/pages";
import { parseMarkdown, readTimeFor, toMarkdown } from "@/lib/markdown";
import type { ApiPost, PostRow, PostStatus } from "@/lib/blog/types";

const fallbackFlow = (tag: string) => ["New Request", "AI Agent", tag, "CRM", "Report"];

export function statusOf(row: Pick<PostRow, "published" | "published_at">, now = Date.now()): PostStatus {
  if (!row.published) return "draft";
  return row.published_at && Date.parse(row.published_at) > now ? "scheduled" : "published";
}

/** Database row → the shape the site's components render. */
export function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    slug: r.slug,
    tag: r.tag,
    title: r.title,
    excerpt: r.excerpt,
    readTime: r.read_time || readTimeFor(r.content),
    date: (r.published_at ?? r.created_at).slice(0, 10),
    author: { name: r.author_name || "Outbusy Team", role: r.author_role || "AI automation specialists" },
    cover: r.cover_url ? { url: r.cover_url, alt: r.cover_alt ?? "" } : undefined,
    flow: r.flow?.length ? r.flow : fallbackFlow(r.tag),
    takeaways: r.takeaways ?? [],
    body: parseMarkdown(r.content),
  };
}

/** Database row → API JSON (used for authenticated requests, which can see drafts). */
export function rowToApi(r: PostRow): ApiPost {
  const post = rowToPost(r);
  return {
    id: r.id,
    slug: r.slug,
    url: `/blog/${r.slug}`,
    title: r.title,
    tag: r.tag,
    excerpt: r.excerpt,
    content: r.content,
    blocks: post.body,
    readTime: post.readTime,
    status: statusOf(r),
    publishedAt: r.published_at,
    cover: post.cover ?? null,
    author: post.author,
    takeaways: post.takeaways,
    flow: r.flow ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Published post (from the cached public reader) → API JSON. */
export function postToApi(p: Post): ApiPost {
  return {
    id: p.id ?? null,
    slug: p.slug,
    url: `/blog/${p.slug}`,
    title: p.title,
    tag: p.tag,
    excerpt: p.excerpt,
    content: toMarkdown(p.body),
    blocks: p.body,
    readTime: p.readTime,
    status: "published",
    publishedAt: new Date(`${p.date}T12:00:00Z`).toISOString(),
    cover: p.cover ?? null,
    author: p.author,
    takeaways: p.takeaways,
    flow: p.flow,
    createdAt: null,
    updatedAt: null,
  };
}
