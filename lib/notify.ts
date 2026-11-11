import { emailLayout, sendEmail, siteUrl } from "@/lib/email";
import { getChatSettings } from "@/lib/chat/settings";
import { supabaseAdmin } from "@/lib/supabase";

export type AlertReason = "visitor_asked" | "low_confidence" | "hot_lead" | "complaint" | "waiting_message";

const COPY: Record<AlertReason, { subject: string; heading: string }> = {
  visitor_asked: { subject: "A visitor asked for a human", heading: "A visitor wants to talk to a person" },
  low_confidence: { subject: "The assistant couldn't answer a visitor", heading: "The assistant wasn't sure how to answer" },
  hot_lead: { subject: "Hot lead in the chat", heading: "A hot lead is chatting right now" },
  complaint: { subject: "Unhappy visitor in the chat", heading: "A visitor seems unhappy" },
  waiting_message: { subject: "A visitor is waiting for a reply", heading: "A visitor sent a message and is waiting" },
};

const THROTTLE_MS = 10 * 60 * 1000;

/**
 * Emails the team about a conversation that needs a person: every owner with alerts on, plus
 * the assigned team member. At most one email per conversation every 10 minutes.
 */
export async function alertTeam(conversationId: string, reason: AlertReason, detail: string) {
  const settings = await getChatSettings();
  const enabled =
    reason === "hot_lead" ? settings.alert_on_hot_lead : reason === "low_confidence" ? settings.alert_on_low_confidence : settings.alert_on_handoff;
  if (!enabled) return;

  const db = supabaseAdmin();
  const { data: conv } = await db.from("conversations").select("id, assigned_to, last_alert_at").eq("id", conversationId).maybeSingle();
  if (!conv) return;
  if (conv.last_alert_at && Date.now() - Date.parse(conv.last_alert_at) < THROTTLE_MS) return;

  const { data: team } = await db.from("profiles").select("id, email, role, active, alerts_enabled").eq("active", true).eq("alerts_enabled", true);
  const to = (team ?? []).filter((p) => p.role === "owner" || p.id === conv.assigned_to).map((p) => p.email);
  if (to.length === 0) return;

  // Claim the slot first so concurrent requests don't send duplicates.
  await db.from("conversations").update({ last_alert_at: new Date().toISOString() }).eq("id", conversationId);

  const copy = COPY[reason];
  await sendEmail({
    to,
    subject: copy.subject,
    ...emailLayout({
      heading: copy.heading,
      lines: [detail.slice(0, 600), "Open the inbox to read the conversation and take over."],
      button: { label: "Open conversation", href: `${siteUrl()}/admin/inbox?c=${conversationId}` },
    }),
  });
}
