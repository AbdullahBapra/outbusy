// Service catalogue — every /services page is generated from this file.
// Add, remove or edit an entry and the page, nav menu and footer links update.

export type Service = {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  intro: string;
  problems: string[];
  deliverables: { title: string; body: string }[];
  tools: string[];
  outcomes: string[];
  faqs: { q: string; a: string }[];
};

export type ServiceCategory = {
  slug: string;
  number: string;
  title: string;
  short: string;
  icon: string;
  tint: string;
  headline: { big: string; strong: string; light: string };
  intro: string;
  services: Service[];
};

export const categories: ServiceCategory[] = [
  {
    slug: "ai-consulting",
    number: "01",
    title: "AI Consulting & Strategy",
    short: "Find where AI pays off, then plan it properly.",
    icon: "Brain",
    tint: "#F2FEFD",
    headline: { big: "Strategy", strong: "AI Consulting", light: "that starts with ROI, not hype" },
    intro:
      "Before anything gets built, we map how your business actually runs, find the processes where automation returns the most, and turn that into a plan your team can act on.",
    services: [
      {
        slug: "ai-automation-audit",
        title: "AI Automation Audit",
        icon: "Search",
        summary: "Map your processes and find the highest-ROI automation opportunities.",
        intro:
          "A structured review of how work moves through your business — who does what, in which tools, and how long it takes. You get a ranked list of automation opportunities with estimated time saved and build effort.",
        problems: [
          "You know AI could help, but not where to start",
          "Teams lose hours to copy-paste, follow-ups and manual data entry",
          "Past tool purchases never got properly adopted",
        ],
        deliverables: [
          { title: "Process map", body: "Visual map of your core workflows, handoffs and tools." },
          { title: "Opportunity scorecard", body: "Every idea ranked by hours saved, cost and complexity." },
          { title: "Quick wins", body: "Two or three automations you can ship within weeks." },
          { title: "Build estimate", body: "Clear scope and price for the recommended first phase." },
        ],
        tools: ["Miro", "Loom", "n8n", "Make", "Zapier", "OpenAI", "Claude"],
        outcomes: [
          "A prioritised backlog instead of a wish list",
          "Audit fee credited toward your first build",
          "Clarity on what to automate — and what not to",
        ],
        faqs: [
          { q: "How long does the audit take?", a: "Typically one to two weeks, including interviews with the people who do the work." },
          { q: "Is the audit fee credited?", a: "Yes — if you go ahead with a build, the audit fee is credited against it." },
        ],
      },
      {
        slug: "workflow-audit",
        title: "Workflow Audit",
        icon: "Wrench",
        summary: "Review and fix your existing Zapier, Make and n8n setups.",
        intro:
          "Automations that grew organically tend to break quietly. We review your existing scenarios, find failures, duplicates and cost leaks, then fix or rebuild what matters.",
        problems: [
          "Zaps and scenarios fail without anyone noticing",
          "Task and operation costs keep creeping up",
          "Nobody remembers how the original setup works",
        ],
        deliverables: [
          { title: "Health report", body: "Every workflow checked for errors, retries and edge cases." },
          { title: "Cost review", body: "Where you're paying for wasted tasks, polls and duplicates." },
          { title: "Fixes & rebuilds", body: "Critical issues fixed, fragile flows rebuilt properly." },
          { title: "Documentation", body: "Plain-language docs so your team knows what runs where." },
        ],
        tools: ["Zapier", "Make", "n8n", "Airtable", "Google Sheets", "Slack"],
        outcomes: [
          "Reliable automations with alerting on failure",
          "Lower monthly platform bills",
          "A setup your team understands",
        ],
        faqs: [
          { q: "Do you need admin access?", a: "Read access is enough for the review; we request edit access only for agreed fixes." },
          { q: "Can you migrate us to n8n?", a: "Yes — migration is often the outcome when costs or limits are the main issue." },
        ],
      },
      {
        slug: "ai-roadmap",
        title: "AI Roadmap",
        icon: "Map",
        summary: "A practical 90-day AI implementation plan.",
        intro:
          "A phased, 90-day plan that sequences automations, agents and training so each step builds on the last — with owners, milestones and success metrics.",
        problems: [
          "Leadership wants an AI plan but nobody owns it",
          "Pilots start and stall without clear success criteria",
          "Teams worry AI will be forced on them",
        ],
        deliverables: [
          { title: "90-day plan", body: "Three 30-day phases with scoped deliverables." },
          { title: "KPIs", body: "Measurable targets for time saved, response speed and cost." },
          { title: "Tool selection", body: "Recommended stack with data-privacy considerations." },
          { title: "Change plan", body: "How to introduce each change to the people affected." },
        ],
        tools: ["Notion", "Miro", "OpenAI", "Claude", "n8n"],
        outcomes: ["A plan leadership can sign off", "Momentum from early wins", "Clear ownership at every step"],
        faqs: [
          { q: "Do you build the roadmap items too?", a: "We can, or your internal team can — the plan is written to be executable either way." },
          { q: "Is it tailored to our industry?", a: "Yes. Recommendations reflect your tools, regulations and customer journey." },
        ],
      },
      {
        slug: "custom-ai-solutions",
        title: "Custom AI Solutions",
        icon: "Sparkles",
        summary: "Bespoke builds for problems no standard package fits.",
        intro:
          "Some problems don't fit a template. We design and build custom AI systems — combining automation, agents, data pipelines and interfaces — around your exact process.",
        problems: [
          "Off-the-shelf tools cover 70% of the need, never 100%",
          "Your process has rules that generic tools ignore",
          "You need AI connected to internal systems",
        ],
        deliverables: [
          { title: "Solution design", body: "Architecture, data flow and guardrails, agreed up front." },
          { title: "Prototype", body: "A working proof of concept on your real data." },
          { title: "Production build", body: "Hardened, monitored and documented system." },
          { title: "Handover", body: "Training and runbooks for your team." },
        ],
        tools: ["n8n", "Python", "OpenAI", "Claude", "Supabase", "Vercel"],
        outcomes: ["A system shaped around your process", "Ownership of the code and workflows", "Room to extend later"],
        faqs: [
          { q: "Who owns what you build?", a: "You do — code, workflows and prompts are handed over at the end of the project." },
          { q: "Can you work with our developers?", a: "Yes, we regularly build alongside internal engineering teams." },
        ],
      },
      {
        slug: "ai-workshops-training",
        title: "AI Workshops & Training",
        icon: "GraduationCap",
        summary: "Hands-on team training on AI tools and automation.",
        intro:
          "Practical, role-specific sessions that get your team using AI and automation confidently — built around your tools and real tasks, not generic slides.",
        problems: [
          "Staff use AI inconsistently or not at all",
          "Concerns about data privacy slow adoption",
          "No one internally can maintain automations",
        ],
        deliverables: [
          { title: "Workshops", body: "Half-day or full-day sessions, remote or on-site." },
          { title: "Prompt library", body: "Tested prompts for your team's recurring tasks." },
          { title: "Automation basics", body: "Build-along training in n8n, Make or Zapier." },
          { title: "Usage policy", body: "A simple AI usage policy your team can follow." },
        ],
        tools: ["ChatGPT", "Claude", "n8n", "Make", "Zapier", "Microsoft Copilot"],
        outcomes: ["Confident, consistent AI use", "Internal automation champions", "Clear rules on data and privacy"],
        faqs: [
          { q: "Can training be tailored per department?", a: "Yes — sales, support, ops and leadership sessions are adapted to their daily work." },
          { q: "Do you record sessions?", a: "Recordings and materials are included so new hires can catch up." },
        ],
      },
      {
        slug: "white-label-for-agencies",
        title: "White-Label for Agencies",
        icon: "Handshake",
        summary: "We build, you resell under your own brand.",
        intro:
          "Offer AI automation, chatbots and voice agents to your clients without hiring a team. We build behind the scenes under NDA; you own the relationship.",
        problems: [
          "Clients ask for AI and you can't deliver it yet",
          "Hiring specialists is slow and expensive",
          "You need reliable delivery under your brand",
        ],
        deliverables: [
          { title: "Unbranded delivery", body: "Everything built and documented under your name." },
          { title: "Sales support", body: "Scoping help and technical answers for your pitches." },
          { title: "Partner pricing", body: "Wholesale rates that leave room for your margin." },
          { title: "Ongoing care", body: "Maintenance your clients never see us for." },
        ],
        tools: ["n8n", "Make", "Retell", "Vapi", "OpenAI", "GoHighLevel"],
        outcomes: ["New revenue line without new hires", "Consistent delivery quality", "Your brand, our engineering"],
        faqs: [
          { q: "Will you ever contact our clients?", a: "Only if you ask us to, and always under your brand." },
          { q: "Is there a minimum volume?", a: "No minimum — many partners start with a single project." },
        ],
      },
    ],
  },
  {
    slug: "workflow-automation",
    number: "02",
    title: "Workflow Automation",
    short: "Connect your tools and remove repetitive work.",
    icon: "Workflow",
    tint: "#D9FFFB",
    headline: { big: "Automate", strong: "Workflow Automation", light: "that runs quietly in the background" },
    intro:
      "We connect the tools you already use so data flows automatically — leads, invoices, onboarding, reporting — with monitoring so nothing breaks silently.",
    services: [
      {
        slug: "n8n-automation",
        title: "n8n Automation",
        icon: "Workflow",
        summary: "n8n builds, EU self-hosting and n8n AI agents.",
        intro:
          "n8n gives you powerful automation without per-task pricing. We build production workflows, self-host n8n on EU servers for data control, and create AI agents that run inside it.",
        problems: [
          "Per-task pricing makes scaling automation expensive",
          "Data must stay inside the EU",
          "Simple no-code tools can't handle your logic",
        ],
        deliverables: [
          { title: "Workflow builds", body: "Robust n8n workflows with error handling and retries." },
          { title: "EU self-hosting", body: "Secure n8n on EU infrastructure, backups included." },
          { title: "n8n AI agents", body: "Agents with tools, memory and guardrails inside n8n." },
          { title: "Monitoring", body: "Alerts when executions fail or slow down." },
        ],
        tools: ["n8n", "Docker", "Hetzner", "PostgreSQL", "OpenAI", "Claude"],
        outcomes: ["Predictable costs at any volume", "Full control over your data", "Complex logic, cleanly built"],
        faqs: [
          { q: "Cloud or self-hosted?", a: "Both work. Self-hosting suits data-sensitive or high-volume teams; n8n Cloud suits everyone else." },
          { q: "Who maintains the server?", a: "We can, through a care plan, or hand it over with documentation." },
        ],
      },
      {
        slug: "make-automation",
        title: "Make Automation",
        icon: "Repeat",
        summary: "Make.com scenarios built properly.",
        intro:
          "Make is ideal for visual, multi-step automations. We design clean scenarios with routers, error handlers and sensible operation usage.",
        problems: ["Scenarios are messy and hard to follow", "Operations run out mid-month", "Errors stop whole processes"],
        deliverables: [
          { title: "Scenario design", body: "Readable, modular scenarios that are easy to extend." },
          { title: "Error handling", body: "Fallbacks and alerts instead of silent failures." },
          { title: "Operation tuning", body: "Fewer wasted operations, lower bills." },
          { title: "Docs & training", body: "So your team can make small changes safely." },
        ],
        tools: ["Make", "Airtable", "Google Workspace", "HubSpot", "OpenAI"],
        outcomes: ["Reliable scenarios", "Lower operation usage", "Easy future changes"],
        faqs: [
          { q: "Can you fix scenarios someone else built?", a: "Yes — we audit, clean up and document existing setups." },
          { q: "Make or n8n?", a: "We'll recommend based on volume, complexity and data requirements." },
        ],
      },
      {
        slug: "zapier-automation",
        title: "Zapier Automation",
        icon: "Zap",
        summary: "Zapier builds plus migration to n8n.",
        intro:
          "Zapier is the fastest way to connect popular apps. We build reliable Zaps — and when volume or cost outgrows Zapier, we migrate you to n8n without downtime.",
        problems: ["Zapier bills climb with every new Zap", "Multi-step logic gets unwieldy", "You need features Zapier can't do"],
        deliverables: [
          { title: "Zap builds", body: "Clean, well-named Zaps with filters and paths." },
          { title: "Cost audit", body: "Identify expensive Zaps and cheaper alternatives." },
          { title: "n8n migration", body: "Rebuild in n8n, run in parallel, then switch over." },
          { title: "Handover", body: "Documentation for every workflow." },
        ],
        tools: ["Zapier", "n8n", "Google Sheets", "Slack", "Pipedrive"],
        outcomes: ["Stable, documented Zaps", "Clear path to lower costs", "Zero-downtime migration"],
        faqs: [
          { q: "Will migration interrupt our processes?", a: "No — new workflows run alongside the old ones until verified." },
          { q: "Should everything move to n8n?", a: "Not always. Low-volume Zaps are often fine where they are." },
        ],
      },
      {
        slug: "business-systems",
        title: "Business Systems",
        icon: "Building2",
        summary: "Onboarding, invoicing, reporting and ops systems.",
        intro:
          "End-to-end systems for the operational backbone of your business — client onboarding, invoicing, reporting and internal ops — so work moves without chasing.",
        problems: ["Onboarding is a checklist someone forgets", "Invoices go out late", "Reports take a day to compile"],
        deliverables: [
          { title: "Client onboarding", body: "Contracts, forms, folders and kickoff — triggered automatically." },
          { title: "Invoicing", body: "Invoices created, sent and chased on schedule." },
          { title: "Reporting", body: "Dashboards that update themselves." },
          { title: "Ops workflows", body: "Approvals, handoffs and reminders built in." },
        ],
        tools: ["n8n", "Airtable", "Notion", "Stripe", "Xero", "Looker Studio"],
        outcomes: ["Consistent client experience", "Faster cash collection", "Live visibility into the business"],
        faqs: [
          { q: "Can you work with our accounting tool?", a: "Most accounting platforms have APIs we can connect to." },
          { q: "Do we need to change tools?", a: "Usually not — we build around what you already use." },
        ],
      },
      {
        slug: "integrations-api",
        title: "Integrations & APIs",
        icon: "Plug",
        summary: "Connect CRMs, ERPs, Sheets, Airtable, Slack and custom APIs.",
        intro:
          "When tools don't talk to each other, people become the integration. We connect CRMs, ERPs, spreadsheets, databases and custom APIs so data stays in sync.",
        problems: ["Data is re-typed between systems", "Records disagree across tools", "A key tool has no native integration"],
        deliverables: [
          { title: "Two-way sync", body: "Keep records consistent across systems." },
          { title: "Custom connectors", body: "Integrations for tools without native connectors." },
          { title: "Webhooks & APIs", body: "Real-time triggers instead of slow polling." },
          { title: "Data validation", body: "Checks that stop bad data spreading." },
        ],
        tools: ["REST APIs", "Webhooks", "HubSpot", "Salesforce", "Airtable", "Slack"],
        outcomes: ["One source of truth", "No more double entry", "Real-time data everywhere"],
        faqs: [
          { q: "What if a tool has no API?", a: "We look at exports, email parsing or browser automation as fallbacks." },
          { q: "Is our data secure in transit?", a: "Yes — encrypted connections and least-privilege credentials throughout." },
        ],
      },
      {
        slug: "lead-to-crm-automation",
        title: "Lead-to-CRM Automation",
        icon: "UserPlus",
        summary: "Forms, ads and calls → enriched → into your CRM automatically.",
        intro:
          "Every lead — from forms, ads, calls or chat — captured, enriched, scored and routed into your CRM in seconds, with the right person notified.",
        problems: ["Leads sit in inboxes for hours", "CRM data is incomplete", "Sales doesn't know which leads to call first"],
        deliverables: [
          { title: "Lead capture", body: "Forms, ad platforms, calls and chat feeding one pipeline." },
          { title: "Enrichment", body: "Company and contact data added automatically." },
          { title: "Scoring & routing", body: "Hot leads to the right rep instantly." },
          { title: "Follow-up", body: "Automatic first touch by email or SMS." },
        ],
        tools: ["HubSpot", "Pipedrive", "GoHighLevel", "Meta Lead Ads", "Clay", "n8n"],
        outcomes: ["Faster first response", "Complete CRM records", "No lead left behind"],
        faqs: [
          { q: "Which CRMs do you support?", a: "HubSpot, Pipedrive, Salesforce, GoHighLevel, Close and most others with an API." },
          { q: "Can it call new leads?", a: "Yes — pair it with our speed-to-lead voice agents." },
        ],
      },
      {
        slug: "document-automation",
        title: "Document Automation",
        icon: "FileText",
        summary: "AI processing for invoices, PDFs and contracts.",
        intro:
          "AI that reads invoices, receipts, PDFs and contracts, extracts the data you need, checks it, and files it in the right system — with humans reviewing only the exceptions.",
        problems: ["Staff key in data from PDFs all day", "Errors creep into accounting", "Contracts are hard to search"],
        deliverables: [
          { title: "Data extraction", body: "Fields pulled from invoices, forms and contracts." },
          { title: "Validation", body: "Totals, dates and references checked automatically." },
          { title: "Human review", body: "Low-confidence items routed for a quick check." },
          { title: "Filing & sync", body: "Data sent to your accounting or document system." },
        ],
        tools: ["OpenAI", "Claude", "Google Document AI", "n8n", "Xero", "SharePoint"],
        outcomes: ["Hours of manual entry removed", "Fewer data-entry errors", "Searchable documents"],
        faqs: [
          { q: "How accurate is extraction?", a: "Accuracy depends on document quality; low-confidence fields always go to human review." },
          { q: "Where are documents processed?", a: "We can keep processing within the EU for GDPR-sensitive data." },
        ],
      },
      {
        slug: "automation-maintenance",
        title: "Automation Maintenance",
        icon: "LifeBuoy",
        summary: "Monthly monitoring and support retainer.",
        intro:
          "APIs change and tools update. Our care plans monitor your automations, fix issues before you notice, and include hours for small improvements each month.",
        problems: ["Automations break when apps update", "No one owns fixing them", "Small improvements never get done"],
        deliverables: [
          { title: "Monitoring", body: "Execution checks and failure alerts." },
          { title: "Fixes", body: "Issues resolved within agreed response times." },
          { title: "Improvement hours", body: "Monthly time for tweaks and new small flows." },
          { title: "Monthly report", body: "What ran, what broke, what we improved." },
        ],
        tools: ["n8n", "Make", "Zapier", "Better Stack", "Slack"],
        outcomes: ["Peace of mind", "Predictable monthly cost", "Continuous improvement"],
        faqs: [
          { q: "Do you maintain automations you didn't build?", a: "Yes, after a short onboarding review." },
          { q: "Is there a minimum term?", a: "Care plans run month to month after the first three months." },
        ],
      },
    ],
  },
  {
    slug: "ai-agents",
    number: "03",
    title: "AI Agents & Chatbots",
    short: "Agents that answer, book, follow up and act.",
    icon: "Bot",
    tint: "#C0FFF8",
    headline: { big: "Agents", strong: "AI Agents & Chatbots", light: "that work every channel, 24/7" },
    intro:
      "Voice agents, chatbots and autonomous agents trained on your business — answering questions, booking appointments, qualifying leads and taking action in your tools.",
    services: [
      {
        slug: "rag-chatbots",
        title: "RAG Chatbots",
        icon: "MessagesSquare",
        summary: "Chatbots trained on your company docs and data.",
        intro:
          "Chatbots that answer from your own knowledge — help docs, policies, product data — using retrieval-augmented generation, so answers are grounded and cite their source.",
        problems: ["Generic chatbots make things up", "Support repeats the same answers daily", "Knowledge is spread across many docs"],
        deliverables: [
          { title: "Knowledge base", body: "Your docs, sites and data indexed and kept fresh." },
          { title: "Grounded answers", body: "Responses with sources, and a fallback to humans." },
          { title: "Lead capture", body: "Collects contact details when intent is high." },
          { title: "Analytics", body: "See what people ask and where answers are missing." },
        ],
        tools: ["OpenAI", "Claude", "Pinecone", "Supabase", "n8n", "Voiceflow"],
        outcomes: ["Instant, accurate answers", "Fewer repetitive tickets", "Insight into customer questions"],
        faqs: [
          { q: "Will it make up answers?", a: "It's instructed to answer only from your content and hand off when unsure." },
          { q: "How is it kept up to date?", a: "Sources re-sync on a schedule or whenever content changes." },
        ],
      },
      {
        slug: "ai-voice-agents",
        title: "AI Voice Agents",
        icon: "PhoneCall",
        summary: "Inbound receptionist, booking and follow-up calls.",
        intro:
          "Natural-sounding voice agents that answer calls, book appointments into your calendar, qualify callers and make follow-up calls — day and night.",
        problems: ["Missed calls become missed revenue", "Front desk is overwhelmed at peak times", "After-hours callers hang up"],
        deliverables: [
          { title: "AI receptionist", body: "Answers, routes and takes messages in your voice." },
          { title: "Booking", body: "Checks availability and books into your calendar." },
          { title: "Outbound follow-up", body: "Reminder, confirmation and re-engagement calls." },
          { title: "Call summaries", body: "Transcripts and summaries pushed to your CRM." },
        ],
        tools: ["Retell", "Vapi", "ElevenLabs", "Twilio", "Cal.com", "n8n"],
        outcomes: ["Every call answered", "More booked appointments", "Staff freed for in-person work"],
        faqs: [
          { q: "Can callers reach a human?", a: "Yes — the agent transfers calls based on rules you set." },
          { q: "Can I keep my number?", a: "Yes, via call forwarding or porting to a supported provider." },
        ],
      },
      {
        slug: "custom-ai-agents",
        title: "Custom AI Agents",
        icon: "Bot",
        summary: "Multi-step agents that take actions in your tools.",
        intro:
          "Agents that go beyond chat — researching, deciding and acting across your CRM, inbox, calendar and databases, with approvals where it matters.",
        problems: ["Multi-step tasks still need a human to click through", "Research and prep eat hours", "Simple automations can't handle judgement calls"],
        deliverables: [
          { title: "Agent design", body: "Goals, tools, permissions and guardrails defined." },
          { title: "Tool connections", body: "Secure access to the systems the agent uses." },
          { title: "Human-in-the-loop", body: "Approval steps for sensitive actions." },
          { title: "Evaluation", body: "Test sets and logs to measure reliability." },
        ],
        tools: ["Claude", "OpenAI", "n8n", "LangGraph", "MCP", "Supabase"],
        outcomes: ["Complex tasks handled end to end", "Consistent decisions", "Full audit trail"],
        faqs: [
          { q: "How do you keep agents safe?", a: "Scoped permissions, approval steps and logging on every action." },
          { q: "Which model do you use?", a: "We choose per task, balancing quality, speed, cost and data policy." },
        ],
      },
      {
        slug: "whatsapp-sms-agents",
        title: "WhatsApp & SMS Agents",
        icon: "MessageCircle",
        summary: "WhatsApp, SMS and Instagram DM agents.",
        intro:
          "Meet customers in the apps they already use. AI agents that reply on WhatsApp, SMS and Instagram DMs — answering, booking and qualifying around the clock.",
        problems: ["DMs pile up unanswered", "Customers expect instant replies", "Messages live outside your CRM"],
        deliverables: [
          { title: "Messaging agents", body: "On-brand replies across WhatsApp, SMS and Instagram." },
          { title: "Bookings & orders", body: "Take appointments or orders inside the chat." },
          { title: "CRM sync", body: "Every conversation logged against the contact." },
          { title: "Human handoff", body: "Seamless takeover by your team when needed." },
        ],
        tools: ["WhatsApp Business API", "Twilio", "ManyChat", "OpenAI", "GoHighLevel"],
        outcomes: ["Instant replies on every channel", "More conversations converted", "All messages in one place"],
        faqs: [
          { q: "Do you handle WhatsApp approval?", a: "Yes, we guide you through Business API setup and template approval." },
          { q: "Can it send broadcasts?", a: "Yes, within each platform's messaging rules." },
        ],
      },
      {
        slug: "email-ai-agents",
        title: "Email AI Agents",
        icon: "Mail",
        summary: "Inbox triage and AI-drafted replies.",
        intro:
          "An agent that reads incoming email, labels and prioritises it, drafts replies in your tone, and routes requests to the right person or system.",
        problems: ["Shared inboxes overflow", "Important emails get buried", "Replies are slow and inconsistent"],
        deliverables: [
          { title: "Triage", body: "Emails categorised, prioritised and routed." },
          { title: "Draft replies", body: "Context-aware drafts ready to review and send." },
          { title: "Actions", body: "Create tasks, tickets or CRM updates from email." },
          { title: "Summaries", body: "Daily digests of what needs attention." },
        ],
        tools: ["Gmail", "Outlook", "OpenAI", "Claude", "n8n"],
        outcomes: ["Inbox under control", "Faster, consistent replies", "Nothing important missed"],
        faqs: [
          { q: "Does it send emails on its own?", a: "Only if you allow it — most teams start with drafts for review." },
          { q: "Is our email data stored?", a: "Only what's needed for processing, under agreed retention rules." },
        ],
      },
      {
        slug: "customer-support-ai",
        title: "Customer Support AI",
        icon: "Headphones",
        summary: "Ticket triage and AI support agents.",
        intro:
          "AI that triages tickets, answers common questions, suggests replies to agents and escalates the tricky ones — inside your existing helpdesk.",
        problems: ["Ticket queues keep growing", "Agents answer the same questions repeatedly", "Response times hurt satisfaction"],
        deliverables: [
          { title: "Auto-triage", body: "Tickets tagged, prioritised and assigned." },
          { title: "AI answers", body: "Common questions resolved automatically." },
          { title: "Agent assist", body: "Suggested replies grounded in your docs." },
          { title: "Insights", body: "Trends in what customers need help with." },
        ],
        tools: ["Zendesk", "Intercom", "Freshdesk", "Gorgias", "OpenAI", "Claude"],
        outcomes: ["Shorter response times", "Lighter ticket load", "Happier customers and agents"],
        faqs: [
          { q: "Does it work with our helpdesk?", a: "We integrate with the major helpdesks via their APIs." },
          { q: "Can it handle refunds?", a: "With rules and approvals, yes — or it can prepare them for an agent." },
        ],
      },
      {
        slug: "speed-to-lead-agents",
        title: "Speed-to-Lead Agents",
        icon: "Timer",
        summary: "AI calls or texts new leads within 60 seconds.",
        intro:
          "The first business to respond usually wins. Our agents call or text every new lead within a minute, qualify them and book a meeting while interest is highest.",
        problems: ["Leads go cold before sales calls back", "After-hours leads wait until morning", "Reps waste time on unqualified leads"],
        deliverables: [
          { title: "Instant response", body: "Call or text within 60 seconds of opt-in." },
          { title: "Qualification", body: "Asks your key questions and scores the lead." },
          { title: "Booking", body: "Books qualified leads straight into calendars." },
          { title: "Nurture", body: "Follow-up sequences for leads not ready yet." },
        ],
        tools: ["Retell", "Vapi", "Twilio", "HubSpot", "GoHighLevel", "Cal.com"],
        outcomes: ["Every lead contacted fast", "More booked meetings", "Reps focus on closing"],
        faqs: [
          { q: "Is it compliant to call leads automatically?", a: "We configure consent capture and follow the calling rules of your region." },
          { q: "Can it hand over to a rep live?", a: "Yes, hot leads can be transferred mid-call." },
        ],
      },
      {
        slug: "internal-knowledge-ai",
        title: "Internal Knowledge AI",
        icon: "BookOpen",
        summary: "A private AI assistant for staff — SOPs, docs and policies.",
        intro:
          "A secure assistant that answers staff questions from your SOPs, wikis and documents — respecting permissions, so people find answers without interrupting colleagues.",
        problems: ["New hires constantly ask the same questions", "SOPs exist but nobody finds them", "Expert knowledge sits in a few heads"],
        deliverables: [
          { title: "Private assistant", body: "Chat in Slack, Teams or a web app." },
          { title: "Permission-aware", body: "Staff only see answers from content they can access." },
          { title: "Source citations", body: "Every answer links to the original document." },
          { title: "Gap reports", body: "See which questions your docs don't answer yet." },
        ],
        tools: ["Slack", "Microsoft Teams", "Notion", "Google Drive", "Claude", "OpenAI"],
        outcomes: ["Faster onboarding", "Fewer interruptions", "Knowledge that stays when people leave"],
        faqs: [
          { q: "Is our data used to train models?", a: "No — we use providers and settings that exclude your data from training." },
          { q: "Where is it hosted?", a: "EU hosting is available for data-sensitive teams." },
        ],
      },
    ],
  },
  {
    slug: "ai-websites",
    number: "04",
    title: "AI-Powered Websites",
    short: "Websites that answer, qualify and book for you.",
    icon: "Globe",
    tint: "#97FFF4",
    headline: { big: "Websites", strong: "AI-Powered Websites", light: "that convert visitors into bookings" },
    intro:
      "Fast, modern websites with AI built in — chatbots, voice receptionists and funnels connected to your CRM — so your site works as hard as your best salesperson.",
    services: [
      {
        slug: "ai-website-development",
        title: "AI Website Development",
        icon: "Globe",
        summary: "Fast, AI-assisted business websites.",
        intro:
          "Modern business websites designed and built quickly with AI-assisted workflows — fast to load, easy to edit and ready for SEO from day one.",
        problems: ["Your site looks dated", "Pages are slow and hard to update", "The site doesn't generate leads"],
        deliverables: [
          { title: "Design", body: "A clean, on-brand design that builds trust." },
          { title: "Build", body: "Fast, responsive pages on a modern stack." },
          { title: "SEO foundations", body: "Structure, metadata and speed done right." },
          { title: "Easy editing", body: "Update content without a developer." },
        ],
        tools: ["Next.js", "Webflow", "Framer", "Vercel", "Figma"],
        outcomes: ["A site you're proud to share", "Better search visibility", "More enquiries"],
        faqs: [
          { q: "How long does a website take?", a: "Most business sites launch in two to four weeks." },
          { q: "Can I edit it myself?", a: "Yes — we set up an editor your team can use." },
        ],
      },
      {
        slug: "websites-with-voice-agent",
        title: "Websites with Voice Agent",
        icon: "Mic",
        summary: "A website with an embedded AI voice receptionist.",
        intro:
          "Visitors click to talk and get instant spoken answers — then book, enquire or get transferred. A voice receptionist built into your website.",
        problems: ["Visitors leave with unanswered questions", "Forms feel slow and impersonal", "Phone lines are busy"],
        deliverables: [
          { title: "Website", body: "A modern site designed around conversion." },
          { title: "Embedded voice agent", body: "Click-to-talk receptionist on every page." },
          { title: "Booking", body: "Appointments booked directly from the conversation." },
          { title: "CRM logging", body: "Every conversation saved with a summary." },
        ],
        tools: ["Retell", "Vapi", "ElevenLabs", "Next.js", "Cal.com"],
        outcomes: ["Instant answers for visitors", "More bookings from the same traffic", "A memorable experience"],
        faqs: [
          { q: "Does it work on mobile?", a: "Yes — the voice widget works in modern mobile browsers." },
          { q: "Can it speak multiple languages?", a: "Yes, multilingual voices are supported." },
        ],
      },
      {
        slug: "websites-with-ai-chatbot",
        title: "Websites with AI Chatbot",
        icon: "MessageSquare",
        summary: "A website plus a RAG chatbot that captures leads.",
        intro:
          "A new website with a chatbot trained on your services, pricing and FAQs — answering questions accurately and capturing qualified leads around the clock.",
        problems: ["Visitors can't find answers quickly", "Leads arrive outside office hours", "Your team repeats the same answers"],
        deliverables: [
          { title: "Website", body: "Built for clarity, speed and conversion." },
          { title: "Trained chatbot", body: "Answers grounded in your own content." },
          { title: "Lead capture", body: "Collects details and books calls." },
          { title: "Conversation insights", body: "Learn what visitors really ask." },
        ],
        tools: ["Next.js", "OpenAI", "Claude", "Voiceflow", "HubSpot"],
        outcomes: ["24/7 lead capture", "Better-informed prospects", "Fewer repetitive enquiries"],
        faqs: [
          { q: "Can I add the chatbot to my existing site?", a: "Yes — see our RAG chatbot service for standalone installs." },
          { q: "Can it hand over to WhatsApp?", a: "Yes, conversations can continue on WhatsApp or email." },
        ],
      },
      {
        slug: "landing-pages",
        title: "Landing Pages",
        icon: "LayoutTemplate",
        summary: "High-converting campaign pages.",
        intro:
          "Focused landing pages for ads and campaigns — one message, one action — built fast, tested, and connected to your CRM and analytics.",
        problems: ["Ads send traffic to a generic homepage", "Pages take weeks to launch", "You can't tell what's converting"],
        deliverables: [
          { title: "Conversion copy", body: "Messaging structured around one clear offer." },
          { title: "Page build", body: "Fast, mobile-first pages." },
          { title: "Tracking", body: "Analytics and ad pixels set up correctly." },
          { title: "A/B testing", body: "Variants to find what converts best." },
        ],
        tools: ["Next.js", "Framer", "Google Analytics", "Meta Pixel", "HubSpot"],
        outcomes: ["Higher conversion rates", "Faster campaign launches", "Clear performance data"],
        faqs: [
          { q: "How fast can a landing page launch?", a: "Often within a week once the offer is clear." },
          { q: "Do you write the copy?", a: "Yes, copywriting is included." },
        ],
      },
      {
        slug: "funnel-websites",
        title: "Funnel Websites",
        icon: "Filter",
        summary: "Multi-step funnels connected to your CRM.",
        intro:
          "Multi-step funnels — opt-in, qualify, book, follow up — with every step connected to your CRM and automations, so leads keep moving.",
        problems: ["Leads drop off between steps", "Follow-up depends on someone remembering", "Tools in the funnel aren't connected"],
        deliverables: [
          { title: "Funnel strategy", body: "Steps mapped to your sales process." },
          { title: "Funnel pages", body: "Opt-in, application, booking and thank-you pages." },
          { title: "Automated follow-up", body: "Email, SMS and voice sequences." },
          { title: "Reporting", body: "See conversion at every step." },
        ],
        tools: ["GoHighLevel", "Next.js", "n8n", "Stripe", "Cal.com"],
        outcomes: ["Fewer drop-offs", "Consistent follow-up", "Predictable pipeline"],
        faqs: [
          { q: "Can it take payments?", a: "Yes, with Stripe or your preferred payment provider." },
          { q: "Do you run the ads too?", a: "We focus on the funnel and automation, and work with your ad team." },
        ],
      },
      {
        slug: "web-apps-portals",
        title: "Web Apps & Portals",
        icon: "LayoutDashboard",
        summary: "Client portals, dashboards and internal tools.",
        intro:
          "Custom web apps — client portals, dashboards and internal tools — with automation and AI built in, so clients and staff self-serve instead of emailing.",
        problems: ["Clients email for status updates", "Data lives in spreadsheets", "Internal tools are cobbled together"],
        deliverables: [
          { title: "Client portals", body: "Secure logins for files, status and invoices." },
          { title: "Dashboards", body: "Live metrics from your connected tools." },
          { title: "Internal tools", body: "Purpose-built apps for your team's workflows." },
          { title: "AI features", body: "Search, summaries and assistants inside the app." },
        ],
        tools: ["Next.js", "Supabase", "Retool", "Softr", "Stripe", "Vercel"],
        outcomes: ["Self-serve clients", "One place for your data", "Tools that fit your process"],
        faqs: [
          { q: "Custom code or low-code?", a: "Whichever fits — we'll recommend based on complexity and budget." },
          { q: "Who hosts the app?", a: "We deploy to your accounts so you own everything." },
        ],
      },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getService(categorySlug: string, serviceSlug: string) {
  const category = getCategory(categorySlug);
  const service = category?.services.find((s) => s.slug === serviceSlug);
  return category && service ? { category, service } : undefined;
}

export const serviceHref = (c: ServiceCategory, s?: Service) =>
  s ? `/services/${c.slug}/${s.slug}` : `/services/${c.slug}`;
