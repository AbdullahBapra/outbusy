import { HttpError, ok, route } from "@/lib/api/http";
import { currentVisitorId, getOwnConversation } from "@/lib/chat/store";
import { supabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/chat/conversations/:id/messages?after=<ISO time>
 * The visitor's own conversation: its mode and the messages after `after`. The widget polls
 * this while a team member is handling the chat, so their replies appear live.
 */
export const GET = route(async (req, ctx: Ctx) => {
  const visitorId = await currentVisitorId();
  const conversation = visitorId ? await getOwnConversation(visitorId, (await ctx.params).id) : null;
  if (!conversation) throw new HttpError(404, "not_found", "Conversation not found.");

  const afterParam = new URL(req.url).searchParams.get("after");
  const afterTime = afterParam && !Number.isNaN(Date.parse(afterParam)) ? new Date(afterParam).toISOString() : null;

  const db = supabaseAdmin();
  let query = db
    .from("messages")
    .select("id, role, content, author_id, created_at, meta")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (afterTime) query = query.gt("created_at", afterTime);
  const { data: rows } = await query;

  const authorIds = [...new Set((rows ?? []).map((r) => r.author_id).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (authorIds.length) {
    const { data: people } = await db.from("profiles").select("id, full_name, email").in("id", authorIds);
    for (const p of people ?? []) names.set(p.id, (p.full_name || p.email).split(" ")[0]);
  }
  const agent = conversation.taken_over_by ? (names.get(conversation.taken_over_by) ?? (await db.from("profiles").select("full_name, email").eq("id", conversation.taken_over_by).maybeSingle()).data?.full_name?.split(" ")[0]) : undefined;

  // Visitors see the conversation, plus join/leave notes, but never internal system details.
  const messages = (rows ?? [])
    .filter((r) => r.role !== "system" || (r.meta as { public?: boolean } | null)?.public)
    .map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      createdAt: r.created_at,
      author: r.author_id ? names.get(r.author_id) : undefined,
      mood: (r.meta as { mood?: string } | null)?.mood ?? null,
    }));

  return ok({ mode: conversation.mode, status: conversation.status, agent, messages });
});
