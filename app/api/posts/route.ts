import { isAdminRequest, requireAdminRequest } from "@/lib/api/auth";
import { CACHE_PUBLIC, CORS_READ_HEADERS, HttpError, ok, parseQuery, preflight, readJson, route } from "@/lib/api/http";
import { expireBlogCache } from "@/lib/blog/cache";
import { postToApi, rowToApi } from "@/lib/blog/mappers";
import { getPosts } from "@/lib/blog/queries";
import { listQuerySchema, postCreateSchema } from "@/lib/blog/schema";
import { createPost, listPostRows } from "@/lib/blog/service";
import { isAdminWriteConfigured } from "@/lib/supabase";

/** Signed-in admins also see drafts, so caches must key on the session cookie. */
const VARY = { Vary: "Cookie" };

/**
 * GET /api/posts — list posts.
 *   Public: published posts only (cached, CORS-enabled).
 *   Signed-in admin: any status via ?status=published|scheduled|draft|all.
 *   Query: ?tag=&q=&limit=1-50&offset=
 */
export const GET = route(async (req) => {
  const query = parseQuery(new URL(req.url), listQuerySchema);
  const authed = await isAdminRequest();

  if (query.status !== "published" && !authed) {
    throw new HttpError(401, "unauthorized", "Sign in as admin to list drafts or scheduled posts.");
  }

  if (authed && isAdminWriteConfigured()) {
    const { rows, total } = await listPostRows(query);
    return ok(rows.map(rowToApi), { headers: VARY, meta: { total, limit: query.limit, offset: query.offset } });
  }

  // Public path: the same cached reader the website uses (falls back to the built-in posts).
  const tag = query.tag?.toLowerCase();
  const q = query.q?.toLowerCase();
  const matches = (await getPosts()).filter(
    (p) => (!tag || p.tag.toLowerCase() === tag) && (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)),
  );
  const page = matches.slice(query.offset, query.offset + query.limit);
  return ok(page.map(postToApi), {
    cache: CACHE_PUBLIC,
    headers: VARY,
    meta: { total: matches.length, limit: query.limit, offset: query.offset },
  });
}, CORS_READ_HEADERS);

/** POST /api/posts — create a post (admin). Returns 201 with the post. */
export const POST = route(async (req) => {
  await requireAdminRequest(req);
  const input = await readJson(req, postCreateSchema);
  const row = await createPost(input);
  expireBlogCache("route");
  return ok(rowToApi(row), { status: 201, headers: { Location: `/api/posts/${row.slug}` } });
});

export const OPTIONS = preflight;
