// Shared content used by the inner-page sections (service, category and industry pages).

/** Pitfalls grid — each card flips to reveal how we handle it. */
export const pitfalls = [
  { title: "Silent Failures", sub: "Broken runs nobody notices", fix: "Every workflow ships with error handling, retries and alerts to Slack or email the moment something fails." },
  { title: "Unclear ROI", sub: "Automating the wrong things", fix: "We score each opportunity by hours saved and revenue impact before building, then measure it after launch." },
  { title: "Messy Data", sub: "Garbage in, garbage out", fix: "Validation steps clean and check data at every hand-off so bad records never spread between tools." },
  { title: "Tool Sprawl", sub: "Too many disconnected apps", fix: "We connect what you already use and only add a new tool when it clearly earns its place." },
  { title: "Low Adoption", sub: "Systems the team ignores", fix: "We design around how your team actually works and train them, so the automation becomes the default." },
  { title: "Data Privacy", sub: "Risky handling of client data", fix: "Least-privilege access, EU hosting options, signed DPAs and AI providers that don't train on your data." },
];

/** "Every build includes" marquee cards. */
export const includedWithEveryBuild = [
  { title: "Clear Documentation", body: "Plain-language docs for every workflow, agent and integration we build." },
  { title: "Monitoring & Alerts", body: "Know instantly when something needs attention — before customers do." },
  { title: "Error Handling", body: "Retries, fallbacks and human hand-offs built into every flow." },
  { title: "Team Training", body: "Short, practical sessions so your team knows how to use and adjust it." },
  { title: "Full Ownership", body: "Workflows, prompts and code live in your accounts — you own everything." },
  { title: "Post-Launch Support", body: "Included support after go-live, with optional monthly care plans." },
];

/**
 * Impact stats per service category.
 * PLACEHOLDER targets — replace with figures from your own client results.
 */
export const categoryImpact: Record<string, { lead: string; stats: { value: string; label: string }[] }> = {
  "ai-consulting": {
    lead: "A clear plan turns scattered AI experiments into measurable, compounding wins across the business.",
    stats: [
      { value: "90", label: "Day roadmap" },
      { value: "3x", label: "ROI target on first build" },
    ],
  },
  "workflow-automation": {
    lead: "Connected tools and automated hand-offs give your team back the hours lost to copy-paste and chasing.",
    stats: [
      { value: "10h+", label: "Saved per person weekly (target)" },
      { value: "0", label: "Manual re-typing" },
    ],
  },
  "ai-agents": {
    lead: "Agents answer, qualify and book around the clock, so no lead or customer waits for office hours.",
    stats: [
      { value: "24/7", label: "Always answering" },
      { value: "<60s", label: "Response time" },
    ],
  },
  "ai-websites": {
    lead: "A site that answers questions and books calls converts more of the traffic you already have.",
    stats: [
      { value: "24/7", label: "Lead capture" },
      { value: "2–4", label: "Weeks to launch" },
    ],
  },
};
