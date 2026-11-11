import { requireAdminRequest } from "@/lib/api/auth";
import { ok, route } from "@/lib/api/http";
import { expireBlogCache } from "@/lib/blog/cache";
import { importStarterPosts } from "@/lib/blog/service";

/** POST /api/posts/import — copy the built-in example posts into the database (admin). */
export const POST = route(async (req) => {
  await requireAdminRequest(req);
  const imported = await importStarterPosts();
  expireBlogCache("route");
  return ok({ imported });
});
