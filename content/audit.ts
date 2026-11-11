// Free automation audit — questions, scoring rules and recommendations.
// Everything is rule-based (no AI call): edit the numbers here to tune the report.

export type Option = { id: string; label: string; icon?: string };
export type Question = {
  id: string;
  label: string; // short label for the progress bar
  title: string;
  help?: string;
  type: "single" | "multi";
  max?: number; // max picks for multi
  options: Option[];
};

export const questions: Question[] = [
  {
    id: "industry",
    label: "Industry",
    title: "Which industry is your business in?",
    type: "single",
    options: [
      { id: "dental-healthcare", label: "Dental & Healthcare", icon: "Stethoscope" },
      { id: "real-estate", label: "Real Estate", icon: "Home" },
      { id: "home-services", label: "Home Services", icon: "Hammer" },
      { id: "law-firms", label: "Legal", icon: "Scale" },
      { id: "ecommerce", label: "E-commerce", icon: "ShoppingCart" },
      { id: "marketing-agencies", label: "Marketing Agency", icon: "Megaphone" },
      { id: "other", label: "Something else", icon: "Building2" },
    ],
  },
  {
    id: "team",
    label: "Team",
    title: "How many people work in the business?",
    type: "single",
    options: [
      { id: "1-5", label: "1–5" },
      { id: "6-20", label: "6–20" },
      { id: "21-50", label: "21–50" },
      { id: "51-200", label: "51–200" },
      { id: "200+", label: "200+" },
    ],
  },
  {
    id: "hours",
    label: "Manual work",
    title: "Roughly how many hours a week does each person spend on repetitive admin?",
    help: "Copy-pasting, chasing, data entry, follow-ups, reporting.",
    type: "single",
    options: [
      { id: "lt2", label: "Less than 2 hours" },
      { id: "2-5", label: "2–5 hours" },
      { id: "5-10", label: "5–10 hours" },
      { id: "10+", label: "More than 10 hours" },
    ],
  },
  {
    id: "leads",
    label: "Leads",
    title: "How many new enquiries or leads do you get per month?",
    type: "single",
    options: [
      { id: "lt20", label: "Fewer than 20" },
      { id: "20-100", label: "20–100" },
      { id: "100-500", label: "100–500" },
      { id: "500+", label: "500+" },
    ],
  },
  {
    id: "speed",
    label: "Response",
    title: "How quickly do new leads usually hear back from you?",
    type: "single",
    options: [
      { id: "5min", label: "Within 5 minutes" },
      { id: "1h", label: "Within an hour" },
      { id: "sameday", label: "Same day" },
      { id: "later", label: "Next day or later" },
    ],
  },
  {
    id: "pains",
    label: "Pain points",
    title: "What slows your team down the most?",
    help: "Pick up to 3.",
    type: "multi",
    max: 3,
    options: [
      { id: "calls", label: "Missed calls & bookings", icon: "PhoneCall" },
      { id: "followup", label: "Slow lead follow-up", icon: "Timer" },
      { id: "entry", label: "Manual data entry between tools", icon: "Repeat" },
      { id: "support", label: "Answering the same questions", icon: "MessagesSquare" },
      { id: "reporting", label: "Building reports by hand", icon: "LineChart" },
      { id: "docs", label: "Processing invoices & documents", icon: "FileText" },
      { id: "onboarding", label: "Onboarding new clients", icon: "UserPlus" },
      { id: "broken", label: "Existing automations that break", icon: "Wrench" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    title: "Which tools does your team use day to day?",
    help: "Pick all that apply.",
    type: "multi",
    options: [
      { id: "crm", label: "A CRM (HubSpot, Pipedrive…)" },
      { id: "workspace", label: "Google Workspace or Microsoft 365" },
      { id: "nocode", label: "Zapier, Make or n8n" },
      { id: "helpdesk", label: "A helpdesk or live chat" },
      { id: "shop", label: "An online store platform" },
      { id: "sheets", label: "Mostly spreadsheets" },
    ],
  },
  {
    id: "sync",
    label: "Connected",
    title: "How well are those tools connected to each other?",
    type: "single",
    options: [
      { id: "full", label: "Fully — data flows automatically" },
      { id: "partly", label: "Partly — some things are synced" },
      { id: "none", label: "Not at all — we re-type data" },
      { id: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "ai",
    label: "AI today",
    title: "How are you using AI today?",
    type: "single",
    options: [
      { id: "none", label: "Not at all yet" },
      { id: "chat", label: "Individuals use ChatGPT/Claude ad hoc" },
      { id: "some", label: "It's built into a few workflows" },
      { id: "core", label: "It's core to how we operate" },
    ],
  },
  {
    id: "goal",
    label: "Goal",
    title: "What would make the biggest difference in the next 90 days?",
    type: "single",
    options: [
      { id: "time", label: "Give the team time back", icon: "Clock" },
      { id: "leads", label: "Convert more leads", icon: "Target" },
      { id: "cx", label: "Faster, better customer service", icon: "Headphones" },
      { id: "costs", label: "Lower operating costs", icon: "Calculator" },
      { id: "scale", label: "Grow without hiring", icon: "Rocket" },
    ],
  },
  {
    id: "budget",
    label: "Budget",
    title: "What budget feels right for a first automation project?",
    type: "single",
    options: [
      { id: "lt2.5", label: "Under €2,500" },
      { id: "2.5-7.5", label: "€2,500 – €7,500" },
      { id: "7.5+", label: "€7,500+" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
];

/**
 * One-line, plain-language note shown after a visitor picks an answer
 * (keyed "questionId:optionId"). Keep them short, practical and free of made-up stats.
 */
export const insights: Record<string, string> = {
  "hours:lt2": "Lean already — we'll focus on the few tasks that still eat time.",
  "hours:2-5": "A few hours each adds up fast across a team — usually the easiest wins.",
  "hours:5-10": "That's up to a full day a week per person — plenty to win back.",
  "hours:10+": "That's a quarter of the working week — automation pays off quickly here.",
  "leads:500+": "At this volume, even small improvements in follow-up make a big difference.",
  "speed:5min": "Great — fast replies are one of the biggest drivers of winning work.",
  "speed:1h": "Good, but enquiries often go to whoever answers first.",
  "speed:sameday": "Leads cool off quickly — instant first replies are often the quickest win.",
  "speed:later": "The first business to reply usually wins the job — this is often the quickest win.",
  "sync:full": "Nice — connected tools make every next automation easier.",
  "sync:partly": "Partly connected tools usually mean someone is still copying data by hand.",
  "sync:none": "Re-typing data between tools is one of the simplest things to automate.",
  "sync:unsure": "No problem — mapping how your tools connect is the first step of every project.",
  "ai:none": "You're early — a small, well-chosen first project builds confidence fast.",
  "ai:chat": "Ad-hoc AI use is a great start — the next step is building it into workflows.",
  "ai:some": "You've started — now it's about connecting the pieces end to end.",
  "ai:core": "You're ahead — we'd look at reliability, monitoring and the next big gains.",
  "budget:lt2.5": "That's enough for one focused automation that pays for itself.",
  "budget:2.5-7.5": "A good range for a connected system across one area of the business.",
  "budget:7.5+": "Room for a multi-step system with agents, integrations and reporting.",
  "budget:unsure": "That's fine — your report will help you size the first project.",
};

export type Answers = Record<string, string[]>;

// ---------- Scoring ----------

const teamSize: Record<string, number> = { "1-5": 3, "6-20": 12, "21-50": 35, "51-200": 90, "200+": 150 };
const hoursEach: Record<string, number> = { lt2: 1, "2-5": 3.5, "5-10": 7.5, "10+": 12 };

/** Services that solve each pain point (paths to service pages). */
const painToServices: Record<string, string[]> = {
  calls: ["/services/ai-agents/ai-voice-agents"],
  followup: ["/services/ai-agents/speed-to-lead-agents", "/services/workflow-automation/lead-to-crm-automation"],
  entry: ["/services/workflow-automation/integrations-api", "/services/workflow-automation/n8n-automation"],
  support: ["/services/ai-agents/customer-support-ai", "/services/ai-agents/rag-chatbots"],
  reporting: ["/services/workflow-automation/business-systems"],
  docs: ["/services/workflow-automation/document-automation"],
  onboarding: ["/services/workflow-automation/business-systems"],
  broken: ["/services/ai-consulting/workflow-audit", "/services/workflow-automation/automation-maintenance"],
};

/** Why we recommend each service (shown in the report). */
export const reasons: Record<string, string> = {
  "/services/ai-agents/ai-voice-agents": "Answers every call and books appointments 24/7, so missed calls stop costing you work.",
  "/services/ai-agents/speed-to-lead-agents": "Calls or texts every new lead within a minute — while they're still interested.",
  "/services/workflow-automation/lead-to-crm-automation": "Captures, enriches and routes every lead into your CRM automatically.",
  "/services/workflow-automation/integrations-api": "Connects your tools so data flows between them instead of being re-typed.",
  "/services/workflow-automation/n8n-automation": "Builds reliable workflows for repetitive admin — without per-task fees.",
  "/services/ai-agents/customer-support-ai": "Resolves common questions instantly and routes the rest to your team.",
  "/services/ai-agents/rag-chatbots": "A chatbot trained on your own content that answers accurately, 24/7.",
  "/services/workflow-automation/business-systems": "Turns onboarding, invoicing and reporting into systems that run themselves.",
  "/services/workflow-automation/document-automation": "Reads invoices and documents and files the data — humans only check exceptions.",
  "/services/ai-consulting/workflow-audit": "Finds and fixes what's breaking in your current automations.",
  "/services/workflow-automation/automation-maintenance": "Monitoring and fixes so your automations keep running.",
  "/services/ai-consulting/ai-automation-audit": "Maps your processes and ranks every automation idea by ROI.",
  "/services/ai-consulting/ai-roadmap": "A 90-day plan that turns scattered AI use into measurable wins.",
};

const HOURLY_COST = 35; // € per hour used for the value estimate
const AUTOMATABLE_SHARE = 0.5; // share of repetitive hours we assume can be automated

export type Report = {
  score: number;
  level: "Early opportunity" | "Strong opportunity" | "High-impact opportunity";
  hoursPerWeek: number;
  monthlyValue: number;
  recommendations: { href: string; reason: string }[];
  industry: string | null;
};

export function scoreAudit(a: Answers): Report {
  const one = (id: string) => a[id]?.[0];
  const many = (id: string) => a[id] ?? [];

  const people = teamSize[one("team") ?? "1-5"] ?? 3;
  const hours = hoursEach[one("hours") ?? "2-5"] ?? 3.5;
  const pains = many("pains");

  // Opportunity score (0–100)
  let score = 0;
  score += { lt2: 8, "2-5": 18, "5-10": 28, "10+": 35 }[one("hours") ?? ""] ?? 15;
  score += Math.min(pains.length, 3) * 8;
  score += { "5min": 0, "1h": 5, sameday: 10, later: 15 }[one("speed") ?? ""] ?? 5;
  score += { full: 0, partly: 6, none: 12, unsure: 8 }[one("sync") ?? ""] ?? 6;
  score += { none: 8, chat: 6, some: 3, core: 0 }[one("ai") ?? ""] ?? 4;
  score += { lt20: 1, "20-100": 3, "100-500": 5, "500+": 6 }[one("leads") ?? ""] ?? 2;
  score = Math.max(12, Math.min(98, Math.round(score)));

  const level = score >= 70 ? "High-impact opportunity" : score >= 40 ? "Strong opportunity" : "Early opportunity";

  // Time & value estimate
  const hoursPerWeek = Math.round(people * hours * AUTOMATABLE_SHARE);
  const monthlyValue = Math.round((hoursPerWeek * 4.3 * HOURLY_COST) / 10) * 10;

  // Recommendations: rank services by how many signals point to them
  const weight = new Map<string, number>();
  const add = (href: string, w: number) => weight.set(href, (weight.get(href) ?? 0) + w);
  pains.forEach((p, i) => painToServices[p]?.forEach((h, j) => add(h, 3 - i * 0.3 - j * 0.5)));
  const speed = one("speed");
  if (speed === "sameday" || speed === "later") add("/services/ai-agents/speed-to-lead-agents", 2);
  const sync = one("sync");
  if (sync === "none" || sync === "partly") add("/services/workflow-automation/integrations-api", 1.5);
  const goal = one("goal");
  if (goal === "leads") add("/services/workflow-automation/lead-to-crm-automation", 1.5);
  if (goal === "cx") add("/services/ai-agents/customer-support-ai", 1.5);
  if (goal === "time" || goal === "costs") add("/services/workflow-automation/n8n-automation", 1);
  if (goal === "scale") add("/services/ai-consulting/ai-roadmap", 1);
  if (one("ai") === "none" || one("ai") === "chat") add("/services/ai-consulting/ai-automation-audit", 0.8);

  const ranked = [...weight.entries()].sort((x, y) => y[1] - x[1]).map(([href]) => href);
  for (const fallback of ["/services/ai-consulting/ai-automation-audit", "/services/workflow-automation/n8n-automation", "/services/ai-agents/rag-chatbots"]) {
    if (ranked.length >= 3) break;
    if (!ranked.includes(fallback)) ranked.push(fallback);
  }

  const industry = one("industry");
  return {
    score,
    level,
    hoursPerWeek,
    monthlyValue,
    recommendations: ranked.slice(0, 3).map((href) => ({ href, reason: reasons[href] ?? "" })),
    industry: industry && industry !== "other" ? industry : null,
  };
}

export const auditFaqs = [
  { q: "Is it really free?", a: "Yes. The audit and the report are free, and there's no obligation to book a call afterwards." },
  { q: "How accurate are the estimates?", a: "They're directional — based on your answers and typical results, not a quote. A strategy call turns them into real numbers for your business." },
  { q: "What happens to my answers?", a: "We use them only to prepare your report and, if you book a call, to come prepared. We never sell or share them." },
  { q: "How long does it take?", a: "About five minutes — eleven short questions, most of them one tap." },
];
