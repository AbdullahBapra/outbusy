import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { ok, readJson, route } from "@/lib/api/http";
import { DOC_TYPES, createDocumentUpload, type DocContentType } from "@/lib/kb/documents";

const schema = z.strictObject({
  contentType: z.enum(Object.keys(DOC_TYPES) as [DocContentType, ...DocContentType[]], { error: "Upload a PDF, Word (.docx), text or markdown file." }),
  fileName: z.string().trim().min(1).max(200),
});

/** POST /api/admin/kb/documents/upload: one-time signed URL for a knowledge document (owner, max 20 MB). */
export const POST = route(async (req) => {
  await requireAdminRequest(req, "owner");
  const { contentType, fileName } = await readJson(req, schema);
  return ok(await createDocumentUpload(contentType, fileName), { status: 201 });
});
