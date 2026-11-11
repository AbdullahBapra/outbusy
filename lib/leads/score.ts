/**
 * Deterministic lead score (0-100), so the team can trust and explain it. Each signal adds
 * points; the total maps to hot / warm / cold. The AI only fills in the facts, never the score.
 */
export type LeadFacts = {
  services?: string[];
  problem?: string | null;
  budget?: string | null;
  timeline?: string | null;
  goals?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  /** 0-100 behaviour score from the site (pages, clicks, time). */
  engagement?: number | null;
};

const URGENT = /\b(asap|urgent|immediately|this (week|month)|now|right away|next (week|month)|\d+\s*(day|week)s?)\b/i;
const SOON = /\b(quarter|q[1-4]|\d+\s*months?|soon|this year)\b/i;
const NO_BUDGET = /\b(no budget|free|nothing|zero|0)\b/i;

export function scoreLead(f: LeadFacts): { score: number; temperature: "hot" | "warm" | "cold"; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  if (f.services?.length) add(15, "Knows which service they need");
  if (f.problem && f.problem.length > 15) add(15, "Described a concrete problem");
  if (f.goals) add(5, "Shared goals");
  if (f.budget) {
    if (NO_BUDGET.test(f.budget)) add(-10, "No budget");
    else add(20, "Has a budget");
  }
  if (f.timeline) {
    if (URGENT.test(f.timeline)) add(20, "Wants to start soon");
    else if (SOON.test(f.timeline)) add(10, "Timeline within months");
    else add(4, "Gave a timeline");
  }
  if (f.email) add(10, "Left an email");
  if (f.phone) add(5, "Left a phone number");
  if (f.company) add(5, "Named their company");
  if (f.engagement) add(Math.round(Math.min(f.engagement, 100) * 0.15), "Engaged on the site");

  score = Math.max(0, Math.min(100, score));
  return { score, temperature: score >= 70 ? "hot" : score >= 40 ? "warm" : "cold", reasons };
}
