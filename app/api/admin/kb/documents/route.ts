import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { ingestDocument } from "@/lib/kb/documents";

export const maxDuration = 120;

const schema = z.strictObject({ path: z.string().min(3).max(300), title: z.string().trim().min(2).max(160) });

/** POST /api/admin/kb/documents: extracts and indexes a document after it was uploaded (owner). */
export const POST = route(async (req) => {
  const member = await requireAdminRequest(req, "owner");
  if (!isEmbeddingConfigured()) throw new HttpError(503, "embeddings_disabled", "Set VOYAGE_API_KEY to index the knowledge base.");
  const { path, title } = await readJson(req, schema);
  try {
    await ingestDocument({ path, title, createdBy: member.id });
  } catch (err) {
    throw new HttpError(422, "ingest_failed", err instanceof Error ? err.message : "Couldn't index that document.");
  }
  await audit(member.id, "kb.document", path, { title });
  return ok({ indexed: true }, { status: 201 });
});
