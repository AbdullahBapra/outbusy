import { supabaseAdmin } from "@/lib/supabase";

/** Models the owner can pick in settings. */
export const CHAT_MODELS = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"] as const;

export type ChatSettings = {
  ai_enabled: boolean;
  model: string;
  greeting: string;
  starter_chips: string[];
  hot_score_threshold: number;
  low_confidence_threshold: number;
  handoff_keywords: string[];
  alert_on_handoff: boolean;
  alert_on_hot_lead: boolean;
  alert_on_low_confidence: boolean;
};

export const DEFAULT_SETTINGS: ChatSettings = {
  ai_enabled: true,
  model: "gemini-3.5-flash",
  greeting: "Hi! I'm the Outbusy AI assistant. Ask me anything about automating your business.",
  starter_chips: ["What can you automate?", "How much does it cost?", "Talk to a human"],
  hot_score_threshold: 70,
  low_confidence_threshold: 0.45,
  handoff_keywords: ["human", "real person", "agent", "speak to someone", "call me"],
  alert_on_handoff: true,
  alert_on_hot_lead: true,
  alert_on_low_confidence: false,
};

let cached: { at: number; value: ChatSettings } | null = null;
const TTL_MS = 15_000;

/** The single settings row, cached for a few seconds per server instance. */
export async function getChatSettings(): Promise<ChatSettings> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  const { data } = await supabaseAdmin().from("chat_settings").select("*").eq("id", 1).maybeSingle();
  const value = { ...DEFAULT_SETTINGS, ...(data ?? {}) } as ChatSettings;
  cached = { at: Date.now(), value };
  return value;
}

export const clearSettingsCache = () => {
  cached = null;
};
