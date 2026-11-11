import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { scoreLead } from "@/lib/leads/score";
import { supabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

const text = (max: number) => z.string().trim().max(max).nullable().optional();
const schema = z.strictObject({
  status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
  assignedTo: z.uuid().nullable().optional(),
  name: text(80),
  email: z.union([z.email().max(254), z.literal("")]).nullable().optional(),
  phone: text(40),
  company: text(120),
  services: z.array(z.string().trim().max(60)).max(8).optional(),
  problem: text(1000),
  budget: text(120),
  timeline: text(120),
  goals: text(600),
});

/** PATCH /api/admin/leads/:id: edit a lead's status, owner or details. The score is recalculated. */
export const PATCH = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  const id = (await ctx.params).id;
  const input = await readJson(req, schema);
  const db = supabaseAdmin();
  const { data: lead } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) throw new HttpError(404, "not_found", "Lead not found.");

  const { status, assignedTo, ...fields } = input;
  const patch: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (assignedTo !== undefined) patch.assigned_to = assignedTo;
  if (Object.keys(fields).length) {
    const { score, temperature } = scoreLead({ ...lead, ...fields, engagement: lead.engagement_score });
    Object.assign(patch, { score, temperature });
  }
  await db.from("leads").update(patch).eq("id", id);

  const events = [];
  if (status && status !== lead.status) events.push({ lead_id: id, actor_id: member.id, type: "status", data: { from: lead.status, to: status } });
  if (assignedTo !== undefined && assignedTo !== lead.assigned_to) events.push({ lead_id: id, actor_id: member.id, type: "assign", data: { to: assignedTo } });
  if (Object.keys(fields).length) events.push({ lead_id: id, actor_id: member.id, type: "update", data: { fields: Object.keys(fields) } });
  if (events.length) await db.from("lead_events").insert(events);
  return ok({ updated: true });
});
