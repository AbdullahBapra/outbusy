// Case studies: Problem → System built → Results.
//
// PLACEHOLDERS: these are illustrative examples written for the template. They are
// flagged `sample: true`, which shows an "Example project" label on the site.
// Replace them with real client work (and set `sample: false`) before launch.

export type CaseStudy = {
  slug: string;
  sample: boolean;
  client: string;
  industry: string;
  title: string;
  tint: string;
  headlineStat: { value: string; label: string };
  problem: string;
  system: { title: string; body: string }[];
  results: { value: string; label: string }[];
  stack: string[];
  /** Photo of the business moment; the live workflow card floats over it. */
  image?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "dental-clinic-voice-receptionist",
    image: "/images/cases/dental-clinic-voice-receptionist.webp",
    sample: true,
    client: "Multi-location dental group",
    industry: "Dental & Healthcare",
    title: "AI Receptionist For A Dental Group",
    tint: "#97FFF4",
    headlineStat: { value: "0", label: "missed calls after go-live" },
    problem:
      "Three clinics shared one front desk team. At peak times calls went unanswered, and after-hours callers had no way to book.",
    system: [
      { title: "Voice receptionist", body: "Answers every call, books and reschedules in the practice calendar." },
      { title: "Reminder flows", body: "SMS confirmations and reminders before each appointment." },
      { title: "CRM logging", body: "Call summaries saved against each patient record." },
    ],
    results: [
      { value: "24/7", label: "booking availability" },
      { value: "-35%", label: "no-shows (target)" },
      { value: "15h", label: "front-desk time freed weekly" },
    ],
    stack: ["Retell", "ElevenLabs", "Twilio", "n8n", "Cal.com"],
  },
  {
    slug: "real-estate-speed-to-lead",
    image: "/images/cases/real-estate-speed-to-lead.webp",
    sample: true,
    client: "Residential estate agency",
    industry: "Real Estate",
    title: "60-Second Lead Response For Estate Agents",
    tint: "#D9FFFB",
    headlineStat: { value: "<60s", label: "first response to every lead" },
    problem: "Portal enquiries waited hours for a callback while agents were on viewings, and many buyers had already booked elsewhere.",
    system: [
      { title: "Speed-to-lead agent", body: "Calls each new enquiry within a minute and books viewings." },
      { title: "Lead enrichment", body: "Budget, timeline and area captured and scored." },
      { title: "CRM routing", body: "Qualified buyers assigned to the right agent instantly." },
    ],
    results: [
      { value: "<60s", label: "response time" },
      { value: "2x", label: "viewings booked (target)" },
      { value: "100%", label: "leads contacted" },
    ],
    stack: ["Vapi", "Twilio", "HubSpot", "n8n"],
  },
  {
    slug: "home-services-missed-calls",
    image: "/images/cases/home-services-missed-calls.webp",
    sample: true,
    client: "Plumbing & heating company",
    industry: "Home Services",
    title: "Never-Miss-A-Call System For Trades",
    tint: "#D9FFFB",
    headlineStat: { value: "100%", label: "of calls answered" },
    problem: "Engineers couldn't answer the phone on jobs, so new customers went to the next company on Google.",
    system: [
      { title: "AI receptionist", body: "Qualifies the job, checks the area and books a slot." },
      { title: "Quote automation", body: "Quotes generated and sent the same day." },
      { title: "Review requests", body: "Automatic review request after each completed job." },
    ],
    results: [
      { value: "100%", label: "calls answered" },
      { value: "Same day", label: "quotes sent" },
      { value: "3x", label: "reviews per month (target)" },
    ],
    stack: ["Retell", "Jobber", "Make", "Twilio"],
  },
  {
    slug: "law-firm-intake",
    image: "/images/cases/law-firm-intake.webp",
    sample: true,
    client: "Boutique law firm",
    industry: "Law Firms",
    title: "Client Intake Automation For A Law Firm",
    tint: "#97FFF4",
    headlineStat: { value: "8h", label: "saved per fee earner monthly" },
    problem: "Partners spent hours on intake calls for matters the firm couldn't take, and document prep was fully manual.",
    system: [
      { title: "Intake agent", body: "Screens enquiries and books consultations for suitable matters." },
      { title: "Document automation", body: "Engagement letters drafted from intake data for review." },
      { title: "Knowledge assistant", body: "Private search across the firm's precedents." },
    ],
    results: [
      { value: "8h", label: "saved per fee earner (target)" },
      { value: "Minutes", label: "to draft engagement letters" },
      { value: "EU", label: "hosted, GDPR-aligned" },
    ],
    stack: ["Claude", "n8n", "SharePoint", "Vapi"],
  },
  {
    slug: "ecommerce-support-ai",
    image: "/images/cases/ecommerce-support-ai.webp",
    sample: true,
    client: "Direct-to-consumer skincare brand",
    industry: "E-commerce",
    title: "Support AI For A Growing Online Store",
    tint: "#D9FFFB",
    headlineStat: { value: "60%", label: "of tickets resolved by AI" },
    problem: "Order-status and returns questions flooded the support inbox every time a campaign went live.",
    system: [
      { title: "Support AI", body: "Answers order, shipping and product questions from live data." },
      { title: "Returns flow", body: "Eligible returns processed automatically." },
      { title: "WhatsApp agent", body: "Order updates and questions on WhatsApp." },
    ],
    results: [
      { value: "60%", label: "tickets auto-resolved (target)" },
      { value: "<1 min", label: "first reply" },
      { value: "24/7", label: "coverage" },
    ],
    stack: ["Gorgias", "Shopify", "OpenAI", "n8n", "WhatsApp API"],
  },
  {
    slug: "agency-reporting-automation",
    image: "/images/cases/agency-reporting-automation.webp",
    sample: true,
    client: "Performance marketing agency",
    industry: "Marketing Agencies",
    title: "Automated Client Reporting For An Agency",
    tint: "#97FFF4",
    headlineStat: { value: "40h", label: "reporting time saved monthly" },
    problem: "Account managers spent the first days of every month building client reports by hand.",
    system: [
      { title: "Data pipeline", body: "Ad, analytics and CRM data pulled into one warehouse." },
      { title: "Live dashboards", body: "Client-facing dashboards that update daily." },
      { title: "AI summaries", body: "Monthly commentary drafted for manager review." },
    ],
    results: [
      { value: "40h", label: "saved monthly (target)" },
      { value: "Daily", label: "data refresh" },
      { value: "0", label: "manual spreadsheets" },
    ],
    stack: ["n8n", "BigQuery", "Looker Studio", "Claude"],
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
