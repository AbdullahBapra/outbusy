import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { ok, readJson, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { CHAT_MODELS, clearSettingsCache } from "@/lib/chat/settings";
import { supabaseAdmin } from "@/lib/supabase";

const schema = z.strictObject({
  ai_enabled: z.boolean().optional(),
  model: z.enum(CHAT_MODELS).optional(),
  greeting: z.string().trim().min(5).max(300).optional(),
  starter_chips: z.array(z.string().trim().min(1).max(40)).max(4).optional(),
  hot_score_threshold: z.number().int().min(30).max(100).optional(),
  low_confidence_threshold: z.number().min(0).max(1).optional(),
  handoff_keywords: z.array(z.string().trim().min(2).max(40)).max(20).optional(),
  alert_on_handoff: z.boolean().optional(),
  alert_on_hot_lead: z.boolean().optional(),
  alert_on_low_confidence: z.boolean().optional(),
});

/** PATCH /api/admin/settings: chatbot settings (owner). */
export const PATCH = route(async (req) => {
  const member = await requireAdminRequest(req, "owner");
  const patch = await readJson(req, schema);
  await supabaseAdmin()
    .from("chat_settings")
    .update({ ...patch, updated_at: new Date().toISOString(), updated_by: member.id })
    .eq("id", 1);
  clearSettingsCache();
  await audit(member.id, "settings.update", undefined, patch);
  return ok({ updated: true });
});
