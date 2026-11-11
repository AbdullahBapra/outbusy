// Copy for the home page and the standalone pages (pricing, FAQ, company, resources).

// ---------- Home ----------
export const home = {
  hero: {
    bigLine: "Automate",
    subStrong: "The Busywork.",
    subLight: "Keep the growth.",
    paragraphs: [
      "Outbusy builds AI agents, voice receptionists and workflow automations that answer leads in seconds, book appointments around the clock and remove hours of manual admin every week.",
      "Start with a free AI audit — we'll show you exactly what to automate first and what it's worth.",
    ],
    primary: { label: "Book Free AI Audit", href: "/contact" },
    secondary: { label: "See Case Studies", href: "/case-studies" },
  },
  // PLACEHOLDER numbers — replace with your real figures before launch.
  proof: [
    { value: "40+", label: "Clients served" },
    { value: "12,000+", label: "Hours saved yearly" },
    { value: "250+", label: "Workflows built" },
    { value: "24/7", label: "Agents answering" },
    { value: "<60s", label: "Lead response time" },
  ],
  services: {
    top: "What We",
    big: "Automate",
    strong: "Four Ways",
    light: "we put AI to work for you",
    intro: "Pick a starting point — every engagement begins with understanding where automation pays off most.",
  },
  process: {
    top: "How We",
    big: "Work",
    strong: "Audit to Optimize",
    light: "in five clear steps",
    intro: "A simple, transparent process — you always know what's being built, why, and what it's worth.",
  },
  industries: {
    top: "Built For",
    big: "Your Industry",
    light: "systems proven in businesses like yours",
    intro: "Every industry has its own bottlenecks. These are the ones we solve most often.",
  },
  cases: { big: "Results", strong: "Case Studies", light: "problem, system, outcome" },
  stack: {
    top: "Our",
    big: "Stack",
    strong: "Best-in-Class Tools",
    light: "chosen for each job",
    intro: "We're tool-agnostic and pick the right platform for your volume, budget and data requirements.",
    items: ["n8n", "Make", "Zapier", "OpenAI", "Claude", "Retell", "Vapi", "ElevenLabs"],
  },
  cta: {
    lead: "Ready to",
    big: "Automate",
    tail: "Your Growth?",
    title: "Get Your Free AI Audit",
    body: "In one call we'll map your biggest time sinks, show you what's automatable and give you an honest estimate — no obligation.",
    button: "Book Free AI Audit",
  },
};

export const processSteps = [
  { title: "Audit", body: "We map your processes, tools and bottlenecks and rank opportunities by ROI.", points: ["Stakeholder interviews", "Process & tool mapping", "ROI-ranked opportunity list"] },
  { title: "Blueprint", body: "A clear build plan: architecture, scope, timeline and fixed price.", points: ["System design & data flow", "Fixed scope and price", "Success metrics agreed"] },
  { title: "Build", body: "We build, test and document your automations and agents.", points: ["Weekly progress demos", "Testing on real scenarios", "Security & privacy checks"] },
  { title: "Launch", body: "Go live safely, with your team trained and monitoring in place.", points: ["Parallel run & sign-off", "Team training", "Monitoring & alerts"] },
  { title: "Optimize", body: "We measure results and keep improving what works.", points: ["Monthly performance review", "Prompt & flow tuning", "New opportunities added"] },
];

// ---------- Pricing ----------
export const pricing = {
  audit: {
    title: "AI Audit",
    price: "€990",
    note: "Credited in full toward your build",
    points: ["Process & tool mapping", "ROI-ranked opportunity list", "Blueprint for your first build", "Fixed-price quote"],
  },
  packages: [
    {
      name: "Starter",
      price: "from €2,500",
      desc: "One focused automation or agent, live in 2–3 weeks.",
      points: ["1 core workflow or chatbot", "Up to 3 tool integrations", "Documentation & handover", "30 days of support"],
      style: "white",
    },
    {
      name: "Growth",
      price: "from €7,500",
      desc: "A connected system across sales, support or operations.",
      points: ["Multiple workflows & agents", "Voice or chat agent included", "CRM & reporting integration", "60 days of support"],
      style: "accent",
      featured: true,
    },
    {
      name: "Custom",
      price: "Let's talk",
      desc: "Complex, multi-department or regulated builds.",
      points: ["Custom agents & apps", "EU self-hosting options", "Security & DPA review", "Dedicated project lead"],
      style: "mint",
    },
  ],
  care: [
    { name: "Care Basic", price: "€290/mo", points: ["Monitoring & alerts", "Fixes within 2 business days", "Monthly report"] },
    { name: "Care Plus", price: "€690/mo", points: ["Everything in Basic", "4 improvement hours", "Fixes within 1 business day"] },
    { name: "Care Pro", price: "€1,490/mo", points: ["Everything in Plus", "12 improvement hours", "Same-day priority fixes"] },
  ],
  // PLACEHOLDER prices — adjust to your own rates.
};

// ---------- FAQ ----------
export const faqs = [
  { q: "What does Outbusy actually do?", a: "We're an AI automation agency. We design and build systems that take repetitive work off your team — workflows that move data between tools, AI agents that answer and book, and chatbots trained on your knowledge." },
  { q: "How do I know what to automate first?", a: "That's what the AI audit is for. We map your processes and rank opportunities by time saved, revenue impact and build effort." },
  { q: "How long does a typical project take?", a: "Starter builds usually go live in two to three weeks. Larger systems are delivered in phases, with something live within the first month." },
  { q: "Do you work with our existing tools?", a: "Yes. We build around the CRM, inbox, calendar and software you already use, and only suggest new tools when there's a clear benefit." },
  { q: "Is our data safe and GDPR-compliant?", a: "We follow least-privilege access, can host on EU servers, sign a Data Processing Agreement and choose AI providers that don't train on your data." },
  { q: "Will AI replace my staff?", a: "Our goal is to remove repetitive work so your people can focus on customers and higher-value tasks. Most clients redeploy time rather than cut roles." },
  { q: "What happens after launch?", a: "You own everything we build. Optional care plans cover monitoring, fixes and monthly improvements." },
  { q: "Do you offer white-label services?", a: "Yes — agencies can resell our automation, chatbot and voice agent builds under their own brand." },
];

// ---------- Blog ----------
/** One block of article body. `h2` blocks become table-of-contents entries. */
export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "tip"; title: string; text: string }
  | { type: "image"; url: string; alt: string; caption?: string };

export type Post = {
  /** Database id (absent for the built-in example posts). */
  id?: string;
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  author: { name: string; role: string };
  /** Cover photo. Without one, the post falls back to a gradient + animated workflow. */
  cover?: { url: string; alt: string };
  /** Labels for the cover's animated workflow: trigger, core, then up to three outputs. */
  flow: string[];
  takeaways: string[];
  body: PostBlock[];
};

// PLACEHOLDER authors — swap for your real team.
const team = {
  strategy: { name: "Outbusy Strategy Team", role: "AI automation consultants" },
  build: { name: "Outbusy Build Team", role: "Automation engineers" },
};

export const posts: Post[] = [
  {
    slug: "what-to-automate-first",
    tag: "Strategy",
    title: "What To Automate First In Your Business",
    excerpt: "A simple framework for ranking automation ideas by time saved, revenue impact and effort.",
    readTime: "6 min",
    date: "2026-09-02",
    author: team.strategy,
    flow: ["Idea List", "Score", "Quick Wins", "Roadmap", "Backlog"],
    takeaways: [
      "Score every idea on frequency, time per task and cost of mistakes.",
      "Daily, revenue-touching tasks almost always go first.",
      "Ship one workflow, measure it, and let the result fund the next.",
    ],
    body: [
      { type: "p", text: "Most businesses have dozens of automation ideas and no way to choose between them. Everyone has a favourite, the loudest request wins, and six months later the team has three half-finished projects and no measurable result." },
      { type: "h2", text: "Score ideas, don't debate them" },
      { type: "p", text: "The trick is to score each idea on three things: how often the task happens, how long it takes, and what it costs when it goes wrong. Multiply frequency by minutes to get hours per month, then add a weight for risk and revenue impact." },
      { type: "list", items: ["Frequency — how many times per week does this happen?", "Duration — how many minutes does one run take a person?", "Impact — does a delay or mistake cost money, customers or reputation?"] },
      { type: "h2", text: "What usually wins" },
      { type: "p", text: "Tasks that happen daily, take more than a few minutes and directly affect revenue — like responding to new leads — almost always win. Rare, complex tasks with many exceptions usually don't, because the build effort outweighs the hours saved." },
      { type: "quote", text: "The best first automation is boring, frequent and close to revenue." },
      { type: "h2", text: "Start small, then compound" },
      { type: "p", text: "Start with one high-frequency workflow, measure the time saved, and use that result to fund the next step. A single well-run automation builds trust with the team faster than any strategy deck." },
      { type: "tip", title: "Quick test", text: "If you can describe the task as a checklist with fewer than ten steps and few exceptions, it is a strong candidate for your first build." },
    ],
  },
  {
    slug: "n8n-vs-make-vs-zapier",
    tag: "Tools",
    title: "n8n vs Make vs Zapier: Which One Fits?",
    excerpt: "How to choose an automation platform based on volume, complexity, cost and data requirements.",
    readTime: "8 min",
    date: "2026-08-19",
    author: team.build,
    flow: ["Trigger", "Platform", "n8n", "Make", "Zapier"],
    takeaways: [
      "Zapier: fastest start, biggest app library, priciest at volume.",
      "Make: visual control and better value for multi-step flows.",
      "n8n: self-hostable, no per-task fees, best for AI agents and sensitive data.",
    ],
    body: [
      { type: "p", text: "Choosing an automation platform feels like a big decision, but the right answer mostly comes down to four questions: how many runs per month, how complex the logic is, what it will cost at scale, and where your data is allowed to live." },
      { type: "h2", text: "The short version" },
      { type: "p", text: "Zapier is the fastest to start with and has the largest app library. Make offers more visual control at a lower price per operation. n8n can be self-hosted, has no per-task pricing and handles complex logic well." },
      { type: "list", items: ["Low volume and simple flows: Zapier is fine.", "Visual multi-step scenarios on a budget: Make.", "High volume, sensitive data or AI agents: n8n."] },
      { type: "h2", text: "Where costs surprise people" },
      { type: "p", text: "Per-task pricing looks cheap until a workflow loops over hundreds of records. A flow that touches every row of a spreadsheet can multiply your bill overnight. Model your expected monthly runs before you commit." },
      { type: "quote", text: "Pick the platform for the workflow you'll have in a year, not the one you have today." },
      { type: "h2", text: "Mixing platforms is fine" },
      { type: "p", text: "Many teams end up with a mix — and that's perfectly fine if each workflow is documented and monitored. What hurts is undocumented automations nobody owns." },
      { type: "tip", title: "Our default", text: "We start most AI-heavy builds on n8n and keep simple marketing zaps where they already work. Migrating for its own sake rarely pays off." },
    ],
  },
  {
    slug: "ai-voice-receptionist-guide",
    tag: "Voice AI",
    title: "A Practical Guide To AI Voice Receptionists",
    excerpt: "What voice agents can handle today, where they struggle, and how to roll one out safely.",
    readTime: "7 min",
    date: "2026-08-05",
    author: team.build,
    flow: ["Inbound Call", "Voice Agent", "Calendar", "CRM", "SMS"],
    takeaways: [
      "Voice agents can answer, qualify and book with natural speech.",
      "Clear rules on booking, transfers and promises keep them safe.",
      "Launch on after-hours calls first, then expand coverage.",
    ],
    body: [
      { type: "p", text: "Missed calls are missed revenue. For clinics, trades and service businesses, a phone that rings out at lunchtime or after hours is a lead handed to a competitor. Voice agents have quietly become good enough to fix that." },
      { type: "h2", text: "What they handle well today" },
      { type: "p", text: "Modern voice agents can answer calls, answer common questions, check availability and book appointments with natural-sounding speech." },
      { type: "list", items: ["Answering FAQs about hours, prices and location", "Booking, moving and cancelling appointments", "Taking messages and qualifying new enquiries", "Sending a confirmation SMS after the call"] },
      { type: "h2", text: "Set clear rules" },
      { type: "p", text: "They work best with clear rules: what they can book, when to transfer, and what to never promise. Start with after-hours calls, review transcripts weekly, then expand coverage." },
      { type: "quote", text: "Always give callers a way to reach a human — it builds trust and catches the edge cases." },
      { type: "h2", text: "Rolling out safely" },
      { type: "p", text: "Run the agent in parallel with your team for the first weeks. Read every transcript, tighten the instructions, and only then route daytime overflow to it." },
      { type: "tip", title: "Measure this", text: "Track answered-call rate, bookings per week and transfer rate. If transfers climb, your agent's instructions need work — not more AI." },
    ],
  },
  {
    slug: "rag-chatbots-explained",
    tag: "Chatbots",
    title: "RAG Chatbots Explained In Plain English",
    excerpt: "Why retrieval-augmented chatbots give better answers than generic AI — and how to keep them accurate.",
    readTime: "5 min",
    date: "2026-07-22",
    author: team.build,
    flow: ["Question", "Retrieve", "Your Docs", "Answer", "Citation"],
    takeaways: [
      "RAG looks up your own documents before answering.",
      "Answer quality follows source quality — clean docs win.",
      "Citations, a human fallback and gap reviews keep it accurate.",
    ],
    body: [
      { type: "p", text: "Generic AI chatbots are confident, fluent and sometimes wrong about your business. Retrieval-augmented generation — RAG — fixes that by making the bot read before it speaks." },
      { type: "h2", text: "How it works" },
      { type: "p", text: "A RAG chatbot looks up relevant passages from your own documents before answering, so its replies are grounded in your content rather than general internet knowledge." },
      { type: "list", items: ["Your documents are split into small passages and indexed.", "A question finds the most relevant passages.", "The AI writes an answer using only those passages."] },
      { type: "h2", text: "Accuracy starts with content" },
      { type: "p", text: "Accuracy depends on the quality of your source content. Clean, up-to-date docs produce better answers than any prompt trick." },
      { type: "quote", text: "The questions your bot can't answer are a free map of your documentation gaps." },
      { type: "h2", text: "Keep it honest" },
      { type: "p", text: "Add citations, a clear fallback to a human, and review the questions it couldn't answer — those are your documentation gaps." },
      { type: "tip", title: "Before you launch", text: "Write twenty real customer questions and check every answer by hand. If more than two are wrong, fix the source docs first." },
    ],
  },
  {
    slug: "speed-to-lead",
    tag: "Sales",
    title: "Why Speed-To-Lead Wins Deals",
    excerpt: "Responding to leads within minutes changes conversion rates. Here's how to automate it.",
    readTime: "4 min",
    date: "2026-07-08",
    author: team.strategy,
    flow: ["New Lead", "Instant Reply", "Call", "SMS", "CRM"],
    takeaways: [
      "Leads are most receptive in the first minutes after enquiring.",
      "An automated first touch keeps the conversation warm.",
      "Qualify automatically so sales only talks to real buyers.",
    ],
    body: [
      { type: "p", text: "Leads are most receptive in the first minutes after they enquire. Every hour of delay makes them harder to reach and more likely to choose a competitor." },
      { type: "h2", text: "The first minute matters" },
      { type: "p", text: "When someone fills in a form, they are thinking about your offer right now. By the time a busy team calls back the next morning, they have already spoken to two other companies." },
      { type: "h2", text: "Automate the first touch" },
      { type: "p", text: "An automated first response — a call or text within a minute — keeps the conversation warm until a person can take over." },
      { type: "list", items: ["Instant SMS or email confirming the enquiry", "An AI call that answers questions and books a slot", "The lead and conversation logged in your CRM automatically"] },
      { type: "quote", text: "You don't need to be the best option. You need to be the first good one." },
      { type: "h2", text: "Qualify, then hand over" },
      { type: "p", text: "Combine instant response with qualification questions so your sales team only spends time on real opportunities." },
      { type: "tip", title: "Benchmark", text: "Measure the median minutes from enquiry to first reply. If it is over five, that is your highest-ROI automation." },
    ],
  },
];

// ---------- Company ----------
export const about = {
  big: "About",
  strong: "Automation Engineers",
  light: "with a business-first mindset",
  intro:
    "Outbusy is a small, senior team of automation engineers, AI specialists and designers. We started because we kept seeing talented people buried in admin — and knew the right systems could give them their time back.",
  values: [
    { title: "ROI First", body: "We only build what pays for itself. If automation isn't the answer, we'll say so." },
    { title: "Plain Language", body: "No jargon. You'll always understand what we're building and why." },
    { title: "You Own It", body: "Every workflow, prompt and line of code is yours at handover." },
    { title: "Privacy by Default", body: "EU hosting, least-privilege access and signed DPAs as standard." },
  ],
};

export const careers = {
  intro: "At Outbusy we're always keen to meet people who love building systems that make work easier.",
  roles: [
    { title: "Automation Engineer (n8n / Make)", type: "Remote · EU time zones", body: "Design and build production workflows and integrations for clients." },
    { title: "AI Agent Developer", type: "Remote · EU time zones", body: "Build voice and chat agents with tool use, evaluation and guardrails." },
    { title: "Solutions Consultant", type: "Remote · Part-time or full-time", body: "Run AI audits, scope projects and turn business problems into blueprints." },
  ],
};

export const templates = [
  { title: "Lead-to-CRM Starter", desc: "Capture form leads, enrich them and create CRM contacts.", tools: "n8n · HubSpot" },
  { title: "AI Email Triage", desc: "Classify incoming email and draft replies with AI.", tools: "n8n · Gmail · OpenAI" },
  { title: "Invoice Data Extractor", desc: "Pull line items from PDF invoices into a spreadsheet.", tools: "n8n · Claude · Sheets" },
  { title: "Missed-Call Text Back", desc: "Send an instant SMS when a call goes unanswered.", tools: "n8n · Twilio" },
  { title: "Weekly KPI Digest", desc: "Collect metrics and post an AI summary to Slack.", tools: "n8n · Slack · OpenAI" },
  { title: "RAG Knowledge Bot", desc: "Answer questions from your Google Drive documents.", tools: "n8n · Drive · Pinecone" },
];
