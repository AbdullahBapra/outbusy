import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { upsertSource } from "@/lib/kb/ingest";
import { manualEntrySchema } from "@/lib/kb/schema";

/** POST /api/admin/kb/manual: adds a knowledge entry written by the team (owner). */
export const POST = route(async (req) => {
  const member = await requireAdminRequest(req, "owner");
  if (!isEmbeddingConfigured()) throw new HttpError(503, "embeddings_disabled", "Set VOYAGE_API_KEY to index the knowledge base.");
  const input = await readJson(req, manualEntrySchema);
  await upsertSource({ type: "manual", ref: crypto.randomUUID(), title: input.title, url: input.url, body: input.body, createdBy: member.id });
  return ok({ saved: true }, { status: 201 });
});
