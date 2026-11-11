import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { syncType } from "@/lib/kb/ingest";
import { blogDocs, siteDocs } from "@/lib/kb/sources";

export const maxDuration = 300;

const schema = z.strictObject({ scope: z.enum(["site", "blog", "all"]).default("all") });

/** POST /api/admin/kb/sync: re-indexes website content and/or blog posts (owner). Unchanged items are skipped. */
export const POST = route(async (req) => {
  const member = await requireAdminRequest(req, "owner");
  if (!isEmbeddingConfigured()) throw new HttpError(503, "embeddings_disabled", "Set VOYAGE_API_KEY to index the knowledge base.");
  const { scope } = await readJson(req, schema);
  const result: Record<string, Awaited<ReturnType<typeof syncType>>> = {};
  if (scope !== "blog") result.site = await syncType("site", siteDocs());
  if (scope !== "site") result.blog = await syncType("blog", await blogDocs());
  await audit(member.id, "kb.sync", scope, result);
  return ok(result);
});
