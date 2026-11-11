import { revalidatePath, revalidateTag, updateTag } from "next/cache";

/** Cache tag on every cached blog read (see lib/blog/queries.ts). */
export const POSTS_TAG = "posts";

/**
 * Expire cached blog data everywhere: blog pages, the home/service sliders and the
 * Resources menu. Server Actions use `updateTag` (read-your-own-writes); Route Handlers
 * must use `revalidateTag(…, { expire: 0 })` — `updateTag` only works inside actions.
 */
export function expireBlogCache(from: "action" | "route") {
  if (from === "action") updateTag(POSTS_TAG);
  else revalidateTag(POSTS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
