import { unstable_cache } from "next/cache";
import { posts as starterPosts, type Post } from "@/content/pages";
import { POSTS_TAG } from "@/lib/blog/cache";
import { rowToPost } from "@/lib/blog/mappers";
import type { PostRow } from "@/lib/blog/types";
import { POSTS_TABLE, isSupabaseConfigured, supabasePublic } from "@/lib/supabase";

/**
 * Public, read-only blog queries used by pages and the public API.
 * Only published posts whose publish date has passed are ever returned.
 */

const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date);
const builtIn = () => [...starterPosts].sort(byDateDesc);

/** Published posts from Supabase, newest first. Cached under the "posts" tag; writes expire it. */
const getDbPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const { data, error } = await supabasePublic()
      .from(POSTS_TABLE)
      .select("*")
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    if (error) {
      // Keep the public site up if the database is unreachable or not set up yet.
      console.error("[blog] Supabase read failed, using built-in posts:", error.message);
      return builtIn();
    }
    return (data as PostRow[]).map(rowToPost);
  },
  ["blog-posts"],
  { tags: [POSTS_TAG], revalidate: 300 },
);

/** Published posts, newest first: Supabase when configured, otherwise the built-in posts in content/pages.ts. */
export async function getPosts(): Promise<Post[]> {
  return isSupabaseConfigured() ? getDbPosts() : builtIn();
}

export async function getPost(slug: string) {
  const all = await getPosts();
  const index = all.findIndex((p) => p.slug === slug);
  return index < 0 ? null : { post: all[index], index, all };
}
