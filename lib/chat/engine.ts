import { createUIMessageStream, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream, tool, type ModelMessage, type UIMessage } from "ai";
import { z } from "zod";
import { after } from "next/server";
import { brand } from "@/content/brand";
import { resolveChatModel } from "@/lib/chat/models";
import { SYSTEM_RULES, splitReply, turnContext } from "@/lib/chat/prompt";
import { getChatSettings, type ChatSettings } from "@/lib/chat/settings";
import { addMessage, recentMessages, updateConversation, type ConversationRow, type MessageRow } from "@/lib/chat/store";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { searchKnowledge, type KbHit } from "@/lib/kb/search";
import { upsertChatLead } from "@/lib/leads/chat";
import { alertTeam, type AlertReason } from "@/lib/notify";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * One visitor turn of the website chat, streamed with the AI SDK UI message protocol.
 *
 * Data parts sent to the widget (all transient):
 *   data-conversation { id, mode }           sent first, so the widget can remember the conversation
 *   data-handoff      { state, agent? }      "waiting" (team notified) | "human" (a person is handling it)
 *   data-lead         { saved, contact }     the lead was created/updated (contact = contact details saved)
 *   data-reply        { mood, chips }        the avatar mood and quick replies for this answer
 */
export type ChatDataParts = {
  conversation: { id: string; mode: "ai" | "human" };
  handoff: { state: "waiting" | "human"; agent?: string };
  lead: { saved: boolean; contact: boolean };
  reply: { mood: string | null; chips: string[] };
};
export type ChatUIMessage = UIMessage<never, ChatDataParts>;

export { isChatEnabled } from "@/lib/chat/models";

const MAX_OUTPUT_TOKENS = 4096; // replies are short; the cap bounds cost on a public endpoint
const HISTORY_LIMIT = 30;

type TurnInput = {
  conversation: ConversationRow;
  visitorId: string;
  message: string;
  page: string;
  engagement: number | null;
  /** True when this conversation was created by this request. */
  isNew: boolean;
};

/** Visitor/AI/agent history → model messages. Team replies are shown to the model as labelled assistant turns. */
function toModelMessages(history: MessageRow[]): ModelMessage[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of history) {
    if (m.role === "system") continue;
    const role = m.role === "visitor" ? "user" : "assistant";
    const content = m.role === "agent" ? `[A ${brand.name} team member replied]: ${m.content}` : m.content;
    const last = out.at(-1);
    if (last && last.role === role) last.content += `\n\n${content}`;
    else out.push({ role, content });
  }
  while (out[0]?.role === "assistant") out.shift(); // the API requires the visitor to speak first
  return out;
}

async function teamMemberName(id: string | null) {
  if (!id) return undefined;
  const { data } = await supabaseAdmin().from("profiles").select("full_name, email").eq("id", id).maybeSingle();
  return data ? (data.full_name || data.email).split(" ")[0] : undefined;
}

function wantsHuman(text: string, settings: ChatSettings) {
  const t = text.toLowerCase();
  return settings.handoff_keywords.some((k) => k && new RegExp(`\\b${k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t));
}

async function markWaiting(conversationId: string, reason: AlertReason, detail: string) {
  await updateConversation(conversationId, { status: "waiting_human", handoff_reason: reason });
  await addMessage(conversationId, { role: "system", content: `Handoff requested (${reason.replace("_", " ")}).` });
  after(() => alertTeam(conversationId, reason, detail).catch((err) => console.error("[chat] alert failed:", err)));
}

/** Streams the reply to one visitor message. The visitor message must already be saved. */
export async function chatTurn(input: TurnInput): Promise<Response> {
  const { conversation, visitorId, message, page, engagement } = input;
  const settings = await getChatSettings();

  const stream = createUIMessageStream<ChatUIMessage>({
    onError: (err) => {
      console.error("[chat] stream error:", err);
      return "Something went wrong on my side. Please try again, or use the form.";
    },
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "data-conversation", data: { id: conversation.id, mode: conversation.mode }, transient: true });

      // A person is handling this conversation: the AI stays silent.
      if (conversation.mode === "human") {
        writer.write({ type: "data-handoff", data: { state: "human", agent: await teamMemberName(conversation.taken_over_by) }, transient: true });
        writer.write({ type: "finish" });
        return;
      }

      // The AI is switched off in settings: hand the visitor to the team instead.
      if (!settings.ai_enabled) {
        if (conversation.status !== "waiting_human") await markWaiting(conversation.id, "visitor_asked", `Visitor wrote: "${message}"`);
        writer.write({ type: "data-handoff", data: { state: "waiting" }, transient: true });
        writer.write({ type: "finish" });
        return;
      }

      // Explicit request for a person (keyword match), handled even if the model wouldn't call the tool.
      let handoff: "none" | "waiting" | "just_requested" = conversation.status === "waiting_human" ? "waiting" : "none";
      if (handoff === "none" && wantsHuman(message, settings)) {
        await markWaiting(conversation.id, "visitor_asked", `Visitor wrote: "${message}"`);
        writer.write({ type: "data-handoff", data: { state: "waiting" }, transient: true });
        handoff = "just_requested";
      }

      // Retrieval: the latest message, plus the previous one when the latest is a short follow-up.
      const history = await recentMessages(conversation.id, HISTORY_LIMIT);
      const visitorTurns = history.filter((m) => m.role === "visitor");
      const query = message.length < 40 && visitorTurns.length > 1 ? `${visitorTurns.at(-2)?.content ?? ""}\n${message}` : message;
      let hits: KbHit[] = [];
      let confidence = 0;
      if (isEmbeddingConfigured()) {
        try {
          ({ hits, confidence } = await searchKnowledge(query, 6));
        } catch (err) {
          console.error("[chat] retrieval failed:", err);
        }
      }
      const lowConfidence = confidence < settings.low_confidence_threshold;

      const { data: lead } = await supabaseAdmin()
        .from("leads")
        .select("name, email, phone, company, services, problem, budget, timeline, goals, score")
        .eq("conversation_id", conversation.id)
        .maybeSingle();

      const visitorText = visitorTurns.map((m) => m.content).join("\n").toLowerCase();
      let handedOff = handoff !== "none";
      const toolLog: Record<string, unknown>[] = [];

      const tools = {
        update_lead: tool({
          description:
            "Save facts the visitor shared about their business and needs, as soon as you learn them. Pass only new or changed fields. Contact details are saved only when contact_consent is true.",
          inputSchema: z.object({
            services: z.array(z.string()).optional().describe(`${brand.name} services they're interested in`),
            problem: z.string().optional().describe("Their business and the problem or time sink, in one or two sentences"),
            goals: z.string().optional().describe("What they want to achieve"),
            budget: z.string().optional().describe("Budget in their words"),
            timeline: z.string().optional().describe("When they want to start, in their words"),
            name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            company: z.string().optional(),
            contact_consent: z.boolean().describe("True only if the visitor clearly agreed to be contacted by the team in this conversation"),
          }),
          execute: async ({ contact_consent, ...facts }) => {
            // Contact details must appear in what the visitor actually typed: never trust the model to have it right.
            for (const k of ["email", "phone"] as const) {
              const v = facts[k]?.trim().toLowerCase();
              if (v && !visitorText.includes(v.replace(/\s+/g, "").slice(0, 6)) && !visitorText.includes(v)) delete facts[k];
            }
            if (facts.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(facts.email)) delete facts.email;
            try {
              const res = await upsertChatLead(
                { conversationId: conversation.id, visitorId, page, engagement, consent: contact_consent, hotThreshold: settings.hot_score_threshold },
                facts,
              );
              toolLog.push({ tool: "update_lead", fields: Object.keys(facts), score: res.score });
              writer.write({ type: "data-lead", data: { saved: true, contact: res.savedContact }, transient: true });
              if (res.becameHot) {
                after(() => alertTeam(conversation.id, "hot_lead", `Score ${res.score}. ${facts.problem ?? lead?.problem ?? ""}`).catch(() => {}));
              }
              return { saved: true, contactSaved: res.savedContact, note: contact_consent ? undefined : "Contact details are only saved with consent." };
            } catch (err) {
              console.error("[chat] lead save failed:", err);
              writer.write({ type: "data-lead", data: { saved: false, contact: false }, transient: true });
              return { saved: false, note: `Couldn't save right now. Suggest emailing ${brand.email} or booking at ${brand.ctaHref}.` };
            }
          },
        }),
        request_human: tool({
          description: "Notify the team that this visitor needs a person. The team gets an alert and can join this chat.",
          inputSchema: z.object({
            reason: z.enum(["visitor_asked", "low_confidence", "hot_lead", "complaint"]),
            summary: z.string().describe("One sentence for the team: who this is and what they need"),
          }),
          execute: async ({ reason, summary }) => {
            if (handedOff) return { notified: true, note: "The team was already notified." };
            handedOff = true;
            await markWaiting(conversation.id, reason, summary);
            toolLog.push({ tool: "request_human", reason });
            writer.write({ type: "data-handoff", data: { state: "waiting" }, transient: true });
            return { notified: true };
          },
        }),
      };

      const chosen = resolveChatModel(settings.model);
      const result = streamText({
        model: chosen.model,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        providerOptions: chosen.providerOptions,
        // Fixed rules first (cached by Anthropic), then this turn's knowledge and conversation notes.
        instructions: [
          { role: "system", content: SYSTEM_RULES, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } },
          { role: "system", content: turnContext({ hits, confidence, lowConfidence, page, lead: lead ?? null, handoff }) },
        ],
        messages: toModelMessages(history),
        tools,
        stopWhen: isStepCount(4),
        maxRetries: 1, // the model chain already fails over to another model when one is busy
        onError: ({ error }) => console.error("[chat] model error:", error),
      });

      writer.merge(toUIMessageStream({ stream: result.stream, sendStart: false, sendFinish: false }));

      const raw = await result.text;
      const reply = splitReply(raw);
      writer.write({ type: "data-reply", data: { mood: reply.mood, chips: reply.chips }, transient: true });
      writer.write({ type: "finish" });

      if (reply.text) {
        const sources = hits.slice(0, 4).map((h) => ({ title: h.title, url: h.url, type: h.type, similarity: Number(h.similarity.toFixed(3)) }));
        await addMessage(conversation.id, {
          role: "ai",
          content: reply.text,
          sources,
          meta: { mood: reply.mood, chips: reply.chips, confidence: Number(confidence.toFixed(3)), tools: toolLog, model: chosen.id },
        });
      }
      if (lowConfidence && !handedOff) {
        after(() => alertTeam(conversation.id, "low_confidence", `Visitor asked: "${message}"`).catch(() => {}));
      }
    },
  });

  return createUIMessageStreamResponse({ stream, headers: { "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
