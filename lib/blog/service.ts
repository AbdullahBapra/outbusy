import { posts as starterPosts } from "@/content/pages";
import { slugify, readTimeFor, toMarkdown } from "@/lib/markdown";
import { IMAGE_TYPES, type ListQuery, type PostCreateInput, type PostUpdateInput } from "@/lib/blog/schema";
import type { PostRow } from "@/lib/blog/types";
import { BLOG_BUCKET, POSTS_TABLE, isAdminWriteConfigured, supabaseAdmin } from "@/lib/supabase";
import { removePostFromKnowledge, syncPostToKnowledge } from "@/lib/kb/blog-sync";

/**
 * Privileged blog data access (service-role key). Server-only.
 * Callers MUST authorise first — the admin panel via requireAdmin(), the API via requireAdminRequest().
 */

export type BlogErrorCode = "not_found" | "conflict" | "invalid" | "not_configured" | "database";

export class BlogError extends Error {
  constructor(
    readonly code: BlogErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "BlogError";
  }
}

function db() {
  if (!isAdminWriteConfigured()) {
    throw new BlogError("not_configured", "The blog database isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return supabaseAdmin();
}

type DbError = { code?: string; message: string } | null;

function fail(error: DbError, context: string): never {
  if (error?.code === "23505") throw new BlogError("conflict", "Another post already uses this slug.", "slug");
  console.error(`[blog] ${context}:`, error?.message);
  throw new BlogError("database", `Database error while trying to ${context}.`);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Midday UTC for bare dates so they never shift a day across time zones. */
const toTimestamp = (v: string) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00Z` : v).toISOString();

/** Maps validated input (camelCase) onto table columns (snake_case). Only keys present in `input` are written. */
function toColumns(input: PostUpdateInput): Partial<PostRow> {
  const row: Partial<PostRow> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.tag !== undefined) row.tag = input.tag;
  if (input.excerpt !== undefined) row.excerpt = input.excerpt;
  if (input.content !== undefined) row.content = input.content;
  if (input.readTime !== undefined) row.read_time = input.readTime;
  if (input.cover !== undefined) {
    row.cover_url = input.cover?.url ?? null;
    row.cover_alt = input.cover?.alt || null;
  }
  if (input.author !== undefined) {
    row.author_name = input.author?.name ?? null;
    row.author_role = input.author?.role ?? null;
  }
  if (input.takeaways !== undefined) row.takeaways = input.takeaways;
  if (input.flow !== undefined) row.flow = input.flow;
  if (input.published !== undefined) row.published = input.published;
  if (input.publishedAt !== undefined) row.published_at = input.publishedAt ? toTimestamp(input.publishedAt) : null;
  return row;
}

// ---------- Reads ----------

export async function listPostRows(query: ListQuery): Promise<{ rows: PostRow[]; total: number }> {
  const now = new Date().toISOString();
  let req = db().from(POSTS_TABLE).select("*", { count: "exact" });

  if (query.status === "published") req = req.eq("published", true).lte("published_at", now);
  if (query.status === "scheduled") req = req.eq("published", true).gt("published_at", now);
  if (query.status === "draft") req = req.eq("published", false);
  if (query.tag) req = req.ilike("tag", query.tag.replace(/[%_\\]/g, "\\$&"));
  if (query.q) req = req.ilike("title", `%${query.q.replace(/[%_\\]/g, "\\$&")}%`);

  const { data, error, count } = await req
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("updated_at", { ascending: false })
    .range(query.offset, query.offset + query.limit - 1);
  if (error) fail(error, "list posts");
  return { rows: (data ?? []) as PostRow[], total: count ?? 0 };
}

/** All rows, most recently edited first (admin dashboard). */
export type PostListRow = Pick<PostRow, "id" | "slug" | "title" | "tag" | "excerpt" | "cover_url" | "published" | "published_at" | "updated_at">;

/** One page of posts for the admin list (no bodies), plus totals for the stat cards. */
export async function listPostRowsPage(page: number, pageSize: number): Promise<{ rows: PostListRow[]; total: number; published: number }> {
  const [list, pub] = await Promise.all([
    db()
      .from(POSTS_TABLE)
      .select("id, slug, title, tag, excerpt, cover_url, published, published_at, updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1),
    db().from(POSTS_TABLE).select("id", { count: "exact", head: true }).eq("published", true),
  ]);
  if (list.error) fail(list.error, "list posts");
  return { rows: (list.data ?? []) as PostListRow[], total: list.count ?? 0, published: pub.count ?? 0 };
}

/** Finds a post by UUID or slug, any status. */
export async function findPostRow(ref: string): Promise<PostRow | null> {
  const column = UUID.test(ref) ? "id" : "slug";
  const { data, error } = await db().from(POSTS_TABLE).select("*").eq(column, ref).maybeSingle();
  if (error) fail(error, "load the post");
  return (data as PostRow | null) ?? null;
}

export async function getPostRowOrThrow(ref: string): Promise<PostRow> {
  const row = await findPostRow(ref);
  if (!row) throw new BlogError("not_found", `No post found for "${ref}".`);
  return row;
}

export async function listTags(): Promise<string[]> {
  const { data, error } = await db().from(POSTS_TABLE).select("tag");
  if (error) fail(error, "list categories");
  return [...new Set((data ?? []).map((r) => (r as { tag: string }).tag).filter(Boolean))].sort();
}

// ---------- Writes ----------

export async function createPost(input: PostCreateInput): Promise<PostRow> {
  const slug = input.slug ?? slugify(input.title);
  if (!slug) throw new BlogError("invalid", "Couldn't build a slug from the title — send one explicitly.", "slug");

  const columns = toColumns(input);
  const published = input.published ?? false;
  const row = {
    ...columns,
    slug,
    excerpt: input.excerpt ?? "",
    takeaways: input.takeaways ?? [],
    flow: input.flow ?? [],
    published,
    read_time: columns.read_time ?? readTimeFor(input.content),
    // Publishing without a date publishes now.
    published_at: columns.published_at ?? (published ? new Date().toISOString() : null),
  };

  const { data, error } = await db().from(POSTS_TABLE).insert(row).select("*").single();
  if (error) fail(error, "create the post");
  syncPostToKnowledge(data as PostRow);
  return data as PostRow;
}

export async function updatePost(ref: string, input: PostUpdateInput): Promise<PostRow> {
  const current = await getPostRowOrThrow(ref);
  const patch: Partial<PostRow> = { ...toColumns(input), updated_at: new Date().toISOString() };

  // Recalculate the read time when the content changes and no explicit value was sent.
  if (input.content !== undefined && input.readTime === undefined && !current.read_time) patch.read_time = readTimeFor(input.content);
  // First publish without a date → publish now.
  if (input.published === true && input.publishedAt === undefined && !current.published_at) patch.published_at = new Date().toISOString();

  const { data, error } = await db().from(POSTS_TABLE).update(patch).eq("id", current.id).select("*").single();
  if (error) fail(error, "update the post");
  syncPostToKnowledge(data as PostRow, current.slug);
  return data as PostRow;
}

/** Replaces every editable field (admin form saves the whole post). */
export async function replacePost(ref: string, input: PostCreateInput): Promise<PostRow> {
  return updatePost(ref, {
    ...input,
    slug: input.slug ?? slugify(input.title),
    excerpt: input.excerpt ?? "",
    takeaways: input.takeaways ?? [],
    flow: input.flow ?? [],
    published: input.published ?? false,
    readTime: input.readTime ?? readTimeFor(input.content),
    cover: input.cover ?? null,
    author: input.author ?? null,
    publishedAt: input.publishedAt ?? null,
  });
}

export async function setPublished(ref: string, published: boolean): Promise<PostRow> {
  return updatePost(ref, { published });
}

export async function deletePost(ref: string): Promise<void> {
  const current = await getPostRowOrThrow(ref);
  const { error } = await db().from(POSTS_TABLE).delete().eq("id", current.id);
  if (error) fail(error, "delete the post");
  removePostFromKnowledge(current.slug);
}

/** Copies the built-in example posts into the database (existing slugs are left untouched). */
export async function importStarterPosts(): Promise<number> {
  const rows = starterPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    tag: p.tag,
    excerpt: p.excerpt,
    content: toMarkdown(p.body),
    read_time: p.readTime,
    author_name: p.author.name,
    author_role: p.author.role,
    takeaways: p.takeaways,
    flow: p.flow,
    published: true,
    published_at: toTimestamp(p.date),
  }));
  const { data, error } = await db().from(POSTS_TABLE).upsert(rows, { onConflict: "slug", ignoreDuplicates: true }).select("id");
  if (error) fail(error, "import the example posts");
  return data?.length ?? 0;
}

// ---------- Images ----------

export type ImageUpload = { path: string; token: string; uploadUrl: string; publicUrl: string };

/**
 * One-time signed upload URL in the public `blog` bucket. The client PUTs the file to
 * `uploadUrl` (or calls supabase-js `uploadToSignedUrl(path, token, file)`), then uses `publicUrl`.
 */
export async function createImageUpload(contentType: keyof typeof IMAGE_TYPES, fileName: string): Promise<ImageUpload> {
  const ext = IMAGE_TYPES[contentType];
  const month = new Date().toISOString().slice(0, 7);
  const base = slugify(fileName.replace(/\.[a-z0-9]+$/i, "")) || "image";
  const path = `${month}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const storage = db().storage.from(BLOG_BUCKET);
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error) fail(error, "prepare the image upload");
  return { path: data.path, token: data.token, uploadUrl: data.signedUrl, publicUrl: storage.getPublicUrl(data.path).data.publicUrl };
}
