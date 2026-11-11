import { isAdminRequest, requireAdminRequest } from "@/lib/api/auth";
import { CACHE_PUBLIC, CORS_READ_HEADERS, HttpError, noContent, ok, preflight, readJson, route } from "@/lib/api/http";
import { expireBlogCache } from "@/lib/blog/cache";
import { postToApi, rowToApi } from "@/lib/blog/mappers";
import { getPost } from "@/lib/blog/queries";
import { postUpdateSchema } from "@/lib/blog/schema";
import { deletePost, getPostRowOrThrow, updatePost } from "@/lib/blog/service";
import { isAdminWriteConfigured } from "@/lib/supabase";

/** `:slug` accepts a post's slug or its UUID (UUIDs stay stable if the slug changes). */
type Ctx = { params: Promise<{ slug: string }> };

const VARY = { Vary: "Cookie" };

/** GET /api/posts/:slug — public for published posts; signed-in admins see any status. */
export const GET = route<Ctx>(async (req, { params }) => {
  const { slug } = await params;

  if ((await isAdminRequest()) && isAdminWriteConfigured()) {
    return ok(rowToApi(await getPostRowOrThrow(slug)), { headers: VARY });
  }

  const found = await getPost(slug);
  if (!found) throw new HttpError(404, "not_found", `No published post found for "${slug}".`);
  return ok(postToApi(found.post), { cache: CACHE_PUBLIC, headers: VARY });
}, CORS_READ_HEADERS);

/** PATCH /api/posts/:slug — partial update (admin). */
export const PATCH = route<Ctx>(async (req, { params }) => {
  await requireAdminRequest(req);
  const { slug } = await params;
  const input = await readJson(req, postUpdateSchema);
  const row = await updatePost(slug, input);
  expireBlogCache("route");
  return ok(rowToApi(row));
});

/** DELETE /api/posts/:slug — permanently delete (admin). Returns 204. */
export const DELETE = route<Ctx>(async (req, { params }) => {
  await requireAdminRequest(req);
  const { slug } = await params;
  await deletePost(slug);
  expireBlogCache("route");
  return noContent();
});

export const OPTIONS = preflight;
