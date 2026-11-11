import { after } from "next/server";
import { rowToPost, statusOf } from "@/lib/blog/mappers";
import type { PostRow } from "@/lib/blog/types";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { removeSource, upsertSource } from "@/lib/kb/ingest";
import { postDoc } from "@/lib/kb/sources";

/**
 * Keeps the chatbot's knowledge in step with the blog. Runs after the response is sent
 * (next/server `after`), so saving a post never waits on embeddings.
 * Scheduled posts are indexed by the next full sync after they go live.
 */
export function syncPostToKnowledge(row: PostRow, previousSlug?: string) {
  if (!isEmbeddingConfigured()) return;
  after(async () => {
    try {
      if (previousSlug && previousSlug !== row.slug) await removeSource("blog", previousSlug);
      if (statusOf(row) === "published") await upsertSource(postDoc(rowToPost(row)));
      else await removeSource("blog", row.slug);
    } catch (err) {
      console.error(`[kb] blog sync failed for "${row.slug}":`, err);
    }
  });
}

export function removePostFromKnowledge(slug: string) {
  if (!isEmbeddingConfigured()) return;
  after(() => removeSource("blog", slug).catch((err) => console.error(`[kb] blog removal failed for "${slug}":`, err)));
}
