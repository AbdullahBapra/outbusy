import { z } from "zod";
import { after } from "next/server";
import { assertSameOrigin, clientIp } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { chatTurn, isChatEnabled } from "@/lib/chat/engine";
import { getChatSettings } from "@/lib/chat/settings";
import { addMessage, createConversation, currentVisitorId, ensureVisitor, getOwnConversation } from "@/lib/chat/store";
import { alertTeam } from "@/lib/notify";
import { rateLimited } from "@/lib/security/limits";
import { isAdminWriteConfigured, supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 60;

const chatSchema = z.strictObject({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.uuid().optional(),
  page: z.string().max(300).default(""),
  score: z.number().int().min(0).max(100).optional(),
});

/**
 * GET /api/chat: whether the AI assistant is on, its greeting and starter chips, and the
 * visitor's open conversation (so the widget can pick up where they left off).
 */
export const GET = route(async () => {
  const enabled = isChatEnabled() && isAdminWriteConfigured();
  if (!enabled) return ok({ enabled: false });
  const settings = await getChatSettings();
  const visitorId = await currentVisitorId();
  let conversation: { id: string; mode: string; status: string } | null = null;
  if (visitorId) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabaseAdmin()
      .from("conversations")
      .select("id, mode, status")
      .eq("visitor_id", visitorId)
      .neq("status", "closed")
      .gte("last_message_at", since)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    conversation = data;
  }
  return ok({ enabled: true, aiOn: settings.ai_enabled, greeting: settings.greeting, chips: settings.starter_chips, conversation });
});

/**
 * POST /api/chat: one visitor message. The server keeps the history (the client sends only
 * the new message), stores it, and streams the reply as an AI SDK UI message stream.
 */
export const POST = route(async (req) => {
  if (!isChatEnabled() || !isAdminWriteConfigured()) throw new HttpError(503, "ai_disabled", "The AI assistant isn't configured.");
  assertSameOrigin(req);
  if (await rateLimited(`chat:${clientIp(req)}`, 30, 10 * 60 * 1000)) {
    throw new HttpError(429, "rate_limited", "You've sent a lot of messages. Please wait a few minutes.");
  }

  const body = await readJson(req, chatSchema);
  const visitorId = await ensureVisitor({ userAgent: req.headers.get("user-agent"), referrer: req.headers.get("referer") });

  let conversation = body.conversationId ? await getOwnConversation(visitorId, body.conversationId) : null;
  const isNew = !conversation || conversation.status === "closed";
  if (isNew) conversation = await createConversation(visitorId, body.page);
  if (!conversation) throw new HttpError(500, "conversation_failed", "Couldn't start the conversation.");

  await addMessage(conversation.id, { role: "visitor", content: body.message }, { page: body.page, unreadForTeam: true });

  // Waiting for a person who hasn't joined yet: remind the team (throttled in alertTeam).
  if (conversation.status === "waiting_human" && conversation.mode === "ai") {
    const id = conversation.id;
    after(() => alertTeam(id, "waiting_message", `Visitor wrote: "${body.message}"`).catch(() => {}));
  }

  return chatTurn({ conversation, visitorId, message: body.message, page: body.page, engagement: body.score ?? null, isNew });
});
