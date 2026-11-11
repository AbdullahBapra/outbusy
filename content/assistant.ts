// Copy for the floating assistant (Kirby). Edit freely — the widget reads everything from here.

/** Moods a nudge can show (a subset of the avatar's animations). */
export type NudgeMood = "curious" | "proud" | "thinking" | "excited" | "happy" | "playful";

/**
 * A page-specific speech bubble. `prompt` is sent to the chat when the bubble is clicked
 * (AI mode); leave it empty to just open the chat.
 */
export type PageNudge = { match: RegExp; text: string; prompt: string; mood: NudgeMood };

/** First match wins, so put specific paths before general ones. */
export const pageNudges: PageNudge[] = [
  { match: /^\/pricing/, text: "Not sure which plan fits? I can tell you in 30 seconds.", prompt: "Which plan would fit my business?", mood: "curious" },
  { match: /^\/case-studies\/./, text: "Want results like this for your business?", prompt: "Could you build something like this for my business?", mood: "proud" },
  { match: /^\/case-studies/, text: "Want to see what we'd build for you?", prompt: "What would you build for a business like mine?", mood: "proud" },
  { match: /^\/blog\/./, text: "Want me to check if this applies to your business?", prompt: "Does this apply to my business?", mood: "thinking" },
  { match: /^\/services\/[^/]+\/./, text: "Curious what this would cost for you?", prompt: "What would this service cost for my business?", mood: "curious" },
  { match: /^\/services/, text: "Not sure which service you need? Ask me.", prompt: "Which service fits my business best?", mood: "curious" },
  { match: /^\/industries\/./, text: "Want to know what we'd automate first in your industry?", prompt: "What would you automate first in my industry?", mood: "excited" },
  { match: /^\/roi-calculator/, text: "Want help reading your savings estimate?", prompt: "Can you help me estimate what I'd save?", mood: "thinking" },
  { match: /^\/contact/, text: "Rather chat than fill in a form? I'm here.", prompt: "I'd like a free audit", mood: "happy" },
  { match: /.*/, text: "Questions about automating your business? Ask me.", prompt: "", mood: "excited" },
];

/**
 * Section-specific bubbles: offered once per visit when the visitor lingers on a section
 * (any page). Keys match the section topics detected from headings.
 */
export const sectionNudges: Record<"pricing" | "results" | "faq" | "process" | "industries" | "services" | "contact", Omit<PageNudge, "match">> = {
  pricing: { text: "Want help picking a plan? I can compare them for you.", prompt: "Which plan would fit my business?", mood: "curious" },
  results: { text: "Want numbers like these for your business?", prompt: "What results could you get for my business?", mood: "proud" },
  process: { text: "Curious how fast we could start for you?", prompt: "How fast could you start for my business?", mood: "excited" },
  faq: { text: "Got a question that isn't listed? Ask me.", prompt: "", mood: "thinking" },
  industries: { text: "Is your industry here? I can tell you what we'd automate first.", prompt: "What would you automate first in my industry?", mood: "curious" },
  services: { text: "Not sure which of these fits you? Ask me.", prompt: "Which service fits my business best?", mood: "playful" },
  contact: { text: "Rather chat than fill in a form? I'm here.", prompt: "I'd like a free audit", mood: "happy" },
};

/** Opening reply chips, by how interested the visitor looks (see useInterest). */
export const starterChips: Record<"cold" | "neutral" | "warm" | "hot", string[]> = {
  cold: ["What do you do?", "Show me an example", "How does it work?"],
  neutral: ["What can you automate?", "How much does it cost?", "Get a free audit"],
  warm: ["What would it cost me?", "How fast can you start?", "Get a free audit"],
  hot: ["Book my free audit", "Get a quote", "Talk to a person"],
};

/** Shown to hot leads when the AI's own suggestions don't include a next step. */
export const hotLeadChip = "Book my free audit";
