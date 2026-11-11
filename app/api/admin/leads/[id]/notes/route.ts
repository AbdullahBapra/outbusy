import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { supabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.strictObject({ note: z.string().trim().min(1, "Write a note first.").max(2000) });

/** POST /api/admin/leads/:id/notes: adds a note to the lead's timeline. */
export const POST = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  const id = (await ctx.params).id;
  const { note } = await readJson(req, schema);
  const db = supabaseAdmin();
  const { data: lead } = await db.from("leads").select("id").eq("id", id).maybeSingle();
  if (!lead) throw new HttpError(404, "not_found", "Lead not found.");
  await db.from("lead_events").insert({ lead_id: id, actor_id: member.id, type: "note", data: { note } });
  return ok({ added: true }, { status: 201 });
});
