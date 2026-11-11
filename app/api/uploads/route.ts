import { requireAdminRequest } from "@/lib/api/auth";
import { ok, readJson, route } from "@/lib/api/http";
import { uploadRequestSchema } from "@/lib/blog/schema";
import { createImageUpload } from "@/lib/blog/service";

/**
 * POST /api/uploads — get a one-time signed URL for uploading an image (admin).
 *
 * Body: { "contentType": "image/webp", "fileName": "team-photo.webp" }
 * Then: PUT the file bytes to `uploadUrl` with the same Content-Type, and use `publicUrl`
 * as a post's cover.url or in content as ![alt](publicUrl). Files never pass through this server.
 */
export const POST = route(async (req) => {
  await requireAdminRequest(req);
  const { contentType, fileName } = await readJson(req, uploadRequestSchema);
  const upload = await createImageUpload(contentType, fileName);
  return ok({ ...upload, method: "PUT", headers: { "Content-Type": contentType } }, { status: 201 });
});
