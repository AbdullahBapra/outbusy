/**
 * Client side of the chat API: reads the AI SDK UI message stream (server-sent events) from
 * POST /api/chat, and fetches conversation history for restoring a chat or live human replies.
 */

export type ChatStatus = {
  enabled: boolean;
  aiOn?: boolean;
  greeting?: string;
  chips?: string[];
  conversation?: { id: string; mode: "ai" | "human"; status: string } | null;
};

export type ServerMessage = {
  id: string;
  role: "visitor" | "ai" | "agent" | "system";
  content: string;
  createdAt: string;
  author?: string;
  mood: string | null;
};

export type ConversationSnapshot = { mode: "ai" | "human"; status: string; agent?: string; messages: ServerMessage[] };

type StreamHandlers = {
  onText: (delta: string) => void;
  onConversation: (c: { id: string; mode: "ai" | "human" }) => void;
  onHandoff: (h: { state: "waiting" | "human"; agent?: string }) => void;
  onLead: (l: { saved: boolean; contact: boolean }) => void;
  onReply: (r: { mood: string | null; chips: string[] }) => void;
};

type Chunk = { type: string; delta?: string; data?: unknown; errorText?: string };

export async function getChatStatus(): Promise<ChatStatus> {
  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    if (!res.ok) return { enabled: false };
    return ((await res.json()) as { data: ChatStatus }).data;
  } catch {
    return { enabled: false };
  }
}

export async function getConversation(id: string, after?: string): Promise<ConversationSnapshot | null> {
  const res = await fetch(`/api/chat/conversations/${id}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`, { cache: "no-store" });
  if (!res.ok) return null;
  return ((await res.json()) as { data: ConversationSnapshot }).data;
}

/** Sends one message and dispatches the streamed parts. Throws with a readable message on failure. */
export async function sendChatMessage(body: { message: string; conversationId?: string; page: string; score: number }, h: StreamHandlers) {
  const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok || !res.body) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? "I couldn't reach the team just now.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const handle = (payload: string) => {
    if (payload === "[DONE]") return;
    let chunk: Chunk;
    try {
      chunk = JSON.parse(payload) as Chunk;
    } catch {
      return;
    }
    switch (chunk.type) {
      case "text-delta":
        if (chunk.delta) h.onText(chunk.delta);
        break;
      case "data-conversation":
        h.onConversation(chunk.data as { id: string; mode: "ai" | "human" });
        break;
      case "data-handoff":
        h.onHandoff(chunk.data as { state: "waiting" | "human"; agent?: string });
        break;
      case "data-lead":
        h.onLead(chunk.data as { saved: boolean; contact: boolean });
        break;
      case "data-reply":
        h.onReply(chunk.data as { mood: string | null; chips: string[] });
        break;
      case "error":
        throw new Error(chunk.errorText || "Something went wrong.");
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Server-sent events are separated by a blank line; each carries "data: <json>".
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) >= 0) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of event.split("\n")) if (line.startsWith("data:")) handle(line.slice(5).trim());
    }
  }
}
