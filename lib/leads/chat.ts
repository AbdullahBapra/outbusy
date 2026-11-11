import { supabaseAdmin } from "@/lib/supabase";
import { scoreLead, type LeadFacts } from "@/lib/leads/score";

export type ChatLeadUpdate = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  services?: string[];
  problem?: string;
  budget?: string;
  timeline?: string;
  goals?: string;
};

const CONTACT_FIELDS = ["name", "email", "phone", "company"] as const;
const clean = (v: string | undefined, max: number) => (v?.trim() ? v.trim().slice(0, max) : undefined);

/**
 * Creates or updates the structured lead for a chat conversation (one lead per conversation).
 * Contact details are dropped unless the visitor has consented to being contacted.
 * Returns the new score/temperature and whether this update made the lead hot.
 */
export async function upsertChatLead(
  ctx: { conversationId: string; visitorId: string; page: string; engagement: number | null; consent: boolean; hotThreshold: number },
  update: ChatLeadUpdate,
) {
  const db = supabaseAdmin();
  const { data: existing } = await db.from("leads").select("*").eq("conversation_id", ctx.conversationId).maybeSingle();

  const incoming: Record<string, unknown> = {
    services: update.services?.map((s) => s.trim().slice(0, 60)).filter(Boolean).slice(0, 6),
    problem: clean(update.problem, 1000),
    budget: clean(update.budget, 120),
    timeline: clean(update.timeline, 120),
    goals: clean(update.goals, 600),
  };
  if (ctx.consent) {
    incoming.name = clean(update.name, 80);
    incoming.email = clean(update.email?.toLowerCase(), 254);
    incoming.phone = clean(update.phone, 40);
    incoming.company = clean(update.company, 120);
  }
  // Only overwrite fields the model actually filled in.
  const patch = Object.fromEntries(Object.entries(incoming).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)));
  const merged = { ...(existing ?? {}), ...patch } as LeadFacts & Record<string, unknown>;

  const { score, temperature } = scoreLead({ ...merged, engagement: ctx.engagement });
  const hot = score >= ctx.hotThreshold;
  const row = {
    ...patch,
    score,
    temperature: hot ? "hot" : temperature === "hot" ? "warm" : temperature,
    engagement_score: ctx.engagement,
    interest: (merged.services as string[] | undefined)?.join(", ").slice(0, 80) || (existing?.interest ?? ""),
    message: (merged.problem as string | undefined) ?? existing?.message ?? "",
    updated_at: new Date().toISOString(),
    ...(ctx.consent && !existing?.consent_at ? { consent_at: new Date().toISOString() } : {}),
  };

  let leadId: string;
  if (existing) {
    await db.from("leads").update(row).eq("id", existing.id);
    leadId = existing.id;
    await db.from("lead_events").insert({ lead_id: leadId, type: "update", data: { fields: Object.keys(patch), score } });
  } else {
    const { data, error } = await db
      .from("leads")
      .insert({ ...row, conversation_id: ctx.conversationId, visitor_id: ctx.visitorId, page: ctx.page, source: "chat" })
      .select("id")
      .single();
    if (error || !data) throw new Error(`Couldn't save the lead: ${error?.message}`);
    leadId = data.id;
    await db.from("lead_events").insert({ lead_id: leadId, type: "created", data: { score } });
  }

  // Mirror consented contact details onto the visitor, so the inbox shows who they are.
  if (ctx.consent) {
    const contact = Object.fromEntries(CONTACT_FIELDS.map((k) => [k, patch[k]]).filter(([, v]) => v));
    if (Object.keys(contact).length) await db.from("visitors").update({ ...contact, consent_at: new Date().toISOString() }).eq("id", ctx.visitorId);
  }

  const wasHot = (existing?.score ?? 0) >= ctx.hotThreshold;
  return { leadId, score, temperature: row.temperature as string, becameHot: hot && !wasHot, savedContact: ctx.consent && CONTACT_FIELDS.some((k) => patch[k]) };
}
