import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Visitor identity and conversation storage for the public chat.
 * The visitor gets an anonymous id in an httpOnly signed cookie; every conversation request
 * checks that the conversation belongs to that visitor, so ids alone can't read other chats.
 */

const COOKIE = "ob_vid";
const MAX_AGE = 60 * 60 * 24 * 365;

export type ConversationRow = {
  id: string;
  visitor_id: string;
  status: "open" | "waiting_human" | "human" | "closed";
  mode: "ai" | "human";
  taken_over_by: string | null;
  assigned_to: string | null;
  handoff_reason: string | null;
  last_alert_at: string | null;
  message_count: number;
};
export type MessageRow = { id: string; role: "visitor" | "ai" | "agent" | "system"; content: string; author_id: string | null; created_at: string; meta: Record<string, unknown> };

function secret() {
  const s = process.env.CHAT_VISITOR_SECRET;
  if (!s) throw new Error("CHAT_VISITOR_SECRET is not set.");
  return s;
}
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

function verify(raw: string | undefined): string | null {
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(id));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

/** The visitor id from the signed cookie, if the visitor still exists. */
export async function currentVisitorId(): Promise<string | null> {
  const id = verify((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  const { data } = await supabaseAdmin().from("visitors").select("id").eq("id", id).maybeSingle();
  return data?.id ?? null;
}

/** Returns the visitor id, creating the visitor (and cookie) on first chat. */
export async function ensureVisitor(meta: { userAgent: string | null; referrer: string | null }): Promise<string> {
  const existing = await currentVisitorId();
  const db = supabaseAdmin();
  if (existing) {
    await db.from("visitors").update({ last_seen_at: new Date().toISOString() }).eq("id", existing);
    return existing;
  }
  const { data, error } = await db
    .from("visitors")
    .insert({ user_agent: meta.userAgent?.slice(0, 300) ?? null, referrer: meta.referrer?.slice(0, 300) ?? null })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Couldn't create the visitor: ${error?.message}`);
  (await cookies()).set(COOKIE, `${data.id}.${sign(data.id)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return data.id;
}

const CONVERSATION_COLUMNS = "id, visitor_id, status, mode, taken_over_by, assigned_to, handoff_reason, last_alert_at, message_count";

/** Loads a conversation only if it belongs to this visitor. */
export async function getOwnConversation(visitorId: string, conversationId: string): Promise<ConversationRow | null> {
  if (!/^[0-9a-f-]{36}$/.test(conversationId)) return null;
  const { data } = await supabaseAdmin().from("conversations").select(CONVERSATION_COLUMNS).eq("id", conversationId).eq("visitor_id", visitorId).maybeSingle();
  return (data as ConversationRow | null) ?? null;
}

export async function createConversation(visitorId: string, page: string): Promise<ConversationRow> {
  const { data, error } = await supabaseAdmin().from("conversations").insert({ visitor_id: visitorId, page }).select(CONVERSATION_COLUMNS).single();
  if (error || !data) throw new Error(`Couldn't start the conversation: ${error?.message}`);
  return data as ConversationRow;
}

/** Appends a message and bumps the conversation's counters. */
export async function addMessage(
  conversationId: string,
  msg: { role: MessageRow["role"]; content: string; authorId?: string | null; sources?: unknown[]; meta?: Record<string, unknown> },
  opts: { page?: string; unreadForTeam?: boolean } = {},
) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("messages")
    .insert({ conversation_id: conversationId, role: msg.role, content: msg.content, author_id: msg.authorId ?? null, sources: msg.sources ?? [], meta: msg.meta ?? {} })
    .select("id, created_at")
    .single();
  if (error || !data) throw new Error(`Couldn't save the message: ${error?.message}`);

  const { data: conv } = await db.from("conversations").select("message_count, unread_count").eq("id", conversationId).single();
  await db
    .from("conversations")
    .update({
      last_message_at: data.created_at,
      message_count: (conv?.message_count ?? 0) + 1,
      ...(msg.role !== "system" ? { last_preview: msg.content.slice(0, 160), last_role: msg.role } : {}),
      ...(opts.unreadForTeam ? { unread_count: (conv?.unread_count ?? 0) + 1 } : {}),
      ...(opts.page ? { page: opts.page } : {}),
    })
    .eq("id", conversationId);
  return data;
}

/** The last `limit` messages, oldest first. */
export async function recentMessages(conversationId: string, limit = 30): Promise<MessageRow[]> {
  const { data } = await supabaseAdmin()
    .from("messages")
    .select("id, role, content, author_id, created_at, meta")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as MessageRow[] | null) ?? []).reverse();
}

export async function updateConversation(id: string, patch: Partial<Omit<ConversationRow, "id" | "visitor_id">> & Record<string, unknown>) {
  await supabaseAdmin().from("conversations").update(patch).eq("id", id);
}
