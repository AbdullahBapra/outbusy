import { aiLogos, type AiLogo } from "@/content/aiLogos";

/**
 * AI assistants that can open with a pre-filled prompt via a URL. Used by the footer's
 * "Explore AI summary" block and the blog's "Summarize with AI" control.
 * These query-string formats are each provider's; if one changes, update it here.
 */
export type AiAssistant = { id: string; name: string; logo: AiLogo; url: (prompt: string) => string };

const q = (prompt: string) => encodeURIComponent(prompt);

export const aiAssistants: AiAssistant[] = [
  { id: "chatgpt", name: "ChatGPT", logo: aiLogos.chatgpt, url: (p) => `https://chatgpt.com/?q=${q(p)}` },
  { id: "claude", name: "Claude", logo: aiLogos.claude, url: (p) => `https://claude.ai/new?q=${q(p)}` },
  { id: "perplexity", name: "Perplexity", logo: aiLogos.perplexity, url: (p) => `https://www.perplexity.ai/search/new?q=${q(p)}` },
  { id: "google", name: "Google AI", logo: aiLogos.gemini, url: (p) => `https://www.google.com/search?udm=50&q=${q(p)}` },
  { id: "grok", name: "Grok", logo: aiLogos.grok, url: (p) => `https://grok.com/?q=${q(p)}` },
  { id: "copilot", name: "Copilot", logo: aiLogos.copilot, url: (p) => `https://copilot.microsoft.com/?q=${q(p)}` },
];

export const aiAssistant = (id: string) => aiAssistants.find((a) => a.id === id) ?? aiAssistants[0];
