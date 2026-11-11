import { HttpError } from "@/lib/api/http";
import type { TeamMember } from "@/lib/admin-auth";
import { audit } from "@/lib/audit";
import { brand } from "@/content/brand";
import { addMessage } from "@/lib/chat/store";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Team actions on a conversation. Callers authorise first (requireAdminRequest).
 * "Public" system messages (meta.public) are shown to the visitor as small status notes.
 */

async function load(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(404, "not_found", "Conversation not found.");
  const { data } = await supabaseAdmin().from("conversations").select("id, mode, status, taken_over_by, assigned_to").eq("id", id).maybeSingle();
  if (!data) throw new HttpError(404, "not_found", "Conversation not found.");
  return data;
}

const firstName = (m: TeamMember) => m.fullName.split(" ")[0];

/** A team member takes over (or joins) the chat: the AI stops replying in it. */
export async function takeOver(id: string, member: TeamMember) {
  const conv = await load(id);
  if (conv.mode === "human" && conv.taken_over_by === member.id) return;
  await supabaseAdmin()
    .from("conversations")
    .update({ mode: "human", status: "human", taken_over_by: member.id, taken_over_at: new Date().toISOString(), assigned_to: conv.assigned_to ?? member.id, unread_count: 0 })
    .eq("id", id);
  await addMessage(id, { role: "system", content: `${firstName(member)} from ${brand.name} joined the chat.`, authorId: member.id, meta: { public: true, event: "takeover" } });
  await audit(member.id, "conversation.takeover", id);
}

/** Hands the chat back to the AI assistant. */
export async function returnToAi(id: string, member: TeamMember) {
  await load(id);
  await supabaseAdmin().from("conversations").update({ mode: "ai", status: "open", taken_over_by: null, handoff_reason: null }).eq("id", id);
  await addMessage(id, { role: "system", content: "You're back with the AI assistant. The team can still see this chat.", authorId: member.id, meta: { public: true, event: "release" } });
  await audit(member.id, "conversation.release", id);
}

/** A team member replies to the visitor. Replying takes over the chat if nobody has yet. */
export async function replyAsAgent(id: string, member: TeamMember, content: string) {
  const conv = await load(id);
  if (conv.status === "closed") throw new HttpError(409, "closed", "This conversation is closed. Reopen it to reply.");
  if (conv.mode !== "human") await takeOver(id, member);
  else if (conv.taken_over_by && conv.taken_over_by !== member.id) {
    // Someone else is handling it: join silently as the new handler.
    await supabaseAdmin().from("conversations").update({ taken_over_by: member.id }).eq("id", id);
  }
  const msg = await addMessage(id, { role: "agent", content, authorId: member.id });
  await supabaseAdmin().from("conversations").update({ unread_count: 0 }).eq("id", id);
  return msg;
}

export async function updateConversationMeta(id: string, member: TeamMember, patch: { status?: "open" | "closed"; assignedTo?: string | null }) {
  const conv = await load(id);
  const db = supabaseAdmin();
  const update: Record<string, unknown> = {};
  if (patch.status === "closed") Object.assign(update, { status: "closed", mode: "ai", taken_over_by: null });
  if (patch.status === "open") Object.assign(update, { status: conv.mode === "human" ? "human" : "open" });
  if (patch.assignedTo !== undefined) {
    if (patch.assignedTo) {
      const { data: target } = await db.from("profiles").select("id, active").eq("id", patch.assignedTo).maybeSingle();
      if (!target?.active) throw new HttpError(400, "invalid_assignee", "That team member isn't active.");
    }
    update.assigned_to = patch.assignedTo;
  }
  if (Object.keys(update).length === 0) return;
  await db.from("conversations").update(update).eq("id", id);
  if (patch.status === "closed") await addMessage(id, { role: "system", content: "The team closed this conversation.", authorId: member.id, meta: { public: true, event: "close" } });
  await audit(member.id, "conversation.update", id, patch);
}

export async function markRead(id: string) {
  await load(id);
  await supabaseAdmin().from("conversations").update({ unread_count: 0 }).eq("id", id);
}

/** Deletes everything stored about a visitor: conversations, messages and leads (owner only). */
export async function deleteVisitorData(visitorId: string, member: TeamMember) {
  if (!/^[0-9a-f-]{36}$/.test(visitorId)) throw new HttpError(404, "not_found", "Visitor not found.");
  const db = supabaseAdmin();
  await db.from("leads").delete().eq("visitor_id", visitorId);
  await db.from("visitors").delete().eq("id", visitorId); // cascades to conversations and messages
  await audit(member.id, "visitor.delete", visitorId);
}
