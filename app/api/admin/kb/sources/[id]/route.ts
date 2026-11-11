import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, noContent, ok, readJson, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { deleteDocumentFile } from "@/lib/kb/documents";
import { upsertSource } from "@/lib/kb/ingest";
import { manualEntrySchema } from "@/lib/kb/schema";
import { supabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

async function load(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(404, "not_found", "Knowledge source not found.");
  const { data } = await supabaseAdmin().from("kb_sources").select("id, type, ref, file_path").eq("id", id).maybeSingle();
  if (!data) throw new HttpError(404, "not_found", "Knowledge source not found.");
  return data;
}

/** PATCH /api/admin/kb/sources/:id: edits a manual entry and re-indexes it (owner). */
export const PATCH = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req, "owner");
  const source = await load((await ctx.params).id);
  if (source.type !== "manual") throw new HttpError(400, "not_editable", "Only manual entries can be edited here. Website and blog content sync from the site.");
  const input = await readJson(req, manualEntrySchema);
  await upsertSource({ type: "manual", ref: source.ref, title: input.title, url: input.url, body: input.body, createdBy: member.id });
  return ok({ saved: true });
});

/** DELETE /api/admin/kb/sources/:id: removes a manual entry or uploaded document (owner). */
export const DELETE = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req, "owner");
  const source = await load((await ctx.params).id);
  if (source.type === "site" || source.type === "blog") {
    throw new HttpError(400, "not_deletable", "Website and blog content follow the site. Edit or unpublish it there instead.");
  }
  if (source.file_path) await deleteDocumentFile(source.file_path);
  await supabaseAdmin().from("kb_sources").delete().eq("id", source.id);
  await audit(member.id, "kb.delete", source.ref, { type: source.type });
  return noContent();
});
