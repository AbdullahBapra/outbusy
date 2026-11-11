import type { PostBlock } from "@/content/pages";

/** One row of the `posts` table (see supabase/schema.sql). */
export type PostRow = {
  id: string;
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  content: string;
  read_time: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  author_name: string | null;
  author_role: string | null;
  takeaways: string[] | null;
  flow: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostStatus = "published" | "scheduled" | "draft";

/** Public JSON shape returned by /api/posts. */
export type ApiPost = {
  id: string | null;
  slug: string;
  url: string;
  title: string;
  tag: string;
  excerpt: string;
  /** Markdown source (see lib/markdown.ts for the supported syntax). */
  content: string;
  /** The same content, parsed into render-ready blocks. */
  blocks: PostBlock[];
  readTime: string;
  status: PostStatus;
  publishedAt: string | null;
  cover: { url: string; alt: string } | null;
  author: { name: string; role: string };
  takeaways: string[];
  flow: string[];
  createdAt: string | null;
  updatedAt: string | null;
};
