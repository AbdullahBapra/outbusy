import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { searchKnowledge } from "@/lib/kb/search";

const schema = z.strictObject({ query: z.string().trim().min(2).max(500) });

/** POST /api/admin/kb/search: test which knowledge the assistant would retrieve for a question (team). */
export const POST = route(async (req) => {
  await requireAdminRequest(req);
  if (!isEmbeddingConfigured()) throw new HttpError(503, "embeddings_disabled", "Set VOYAGE_API_KEY to search the knowledge base.");
  const { query } = await readJson(req, schema);
  return ok(await searchKnowledge(query, 8));
});
