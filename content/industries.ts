// Industry pages: problem → three systems → related case study.

export type Industry = {
  slug: string;
  name: string;
  icon: string;
  short: string;
  headline: string;
  problem: { title: string; body: string; points: string[] };
  systems: { title: string; body: string; serviceHref: string }[];
  caseStudy: string; // case study slug
};

export const industries: Industry[] = [
  {
    slug: "dental-healthcare",
    name: "Dental & Healthcare",
    icon: "Stethoscope",
    short: "Fill the diary, cut no-shows, free up the front desk.",
    headline: "Patients booked. Phones answered. Staff freed.",
    problem: {
      title: "Front desks are the bottleneck",
      body: "Clinics lose bookings to missed calls and slow replies, while reception spends the day on reminders, rescheduling and paperwork.",
      points: ["Missed calls during busy hours", "No-shows and late cancellations", "Manual intake forms and insurance checks"],
    },
    systems: [
      { title: "AI Voice Receptionist", body: "Answers every call, books into your practice calendar and handles rescheduling.", serviceHref: "/services/ai-agents/ai-voice-agents" },
      { title: "Reminder & Recall Automation", body: "SMS and WhatsApp reminders, confirmations and recall campaigns that run themselves.", serviceHref: "/services/ai-agents/whatsapp-sms-agents" },
      { title: "Digital Intake", body: "Forms and documents processed and synced to your practice software automatically.", serviceHref: "/services/workflow-automation/document-automation" },
    ],
    caseStudy: "dental-clinic-voice-receptionist",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "Home",
    short: "Respond to every enquiry first and keep deals moving.",
    headline: "Every enquiry answered before your competitors call back.",
    problem: {
      title: "Leads go cold fast",
      body: "Portal enquiries arrive around the clock, agents are out on viewings, and slow follow-up hands deals to faster agencies.",
      points: ["Portal leads waiting hours for a reply", "Viewings booked by phone tag", "Admin eating into agent selling time"],
    },
    systems: [
      { title: "Speed-to-Lead Agent", body: "Calls or texts every portal lead within a minute and books viewings.", serviceHref: "/services/ai-agents/speed-to-lead-agents" },
      { title: "Lead-to-CRM Pipeline", body: "Portal, ad and website leads enriched and routed to the right agent.", serviceHref: "/services/workflow-automation/lead-to-crm-automation" },
      { title: "Listing Chatbot", body: "Answers property questions on your website and captures buyer details.", serviceHref: "/services/ai-websites/websites-with-ai-chatbot" },
    ],
    caseStudy: "real-estate-speed-to-lead",
  },
  {
    slug: "home-services",
    name: "Home Services",
    icon: "Hammer",
    short: "Never miss a job while you're on the tools.",
    headline: "Book more jobs while your team is on site.",
    problem: {
      title: "Calls come in while you're working",
      body: "Plumbers, electricians and cleaners miss calls on the job, quotes go out late, and reviews never get requested.",
      points: ["Missed calls while on site", "Slow quotes and follow-ups", "Few reviews despite happy customers"],
    },
    systems: [
      { title: "AI Receptionist", body: "Answers calls, qualifies the job and books it into your schedule.", serviceHref: "/services/ai-agents/ai-voice-agents" },
      { title: "Quote & Invoice Automation", body: "Quotes, invoices and payment reminders sent automatically.", serviceHref: "/services/workflow-automation/business-systems" },
      { title: "Review Requests", body: "Automatic review requests after every completed job.", serviceHref: "/services/ai-agents/whatsapp-sms-agents" },
    ],
    caseStudy: "home-services-missed-calls",
  },
  {
    slug: "law-firms",
    name: "Law Firms",
    icon: "Scale",
    short: "Faster intake and less admin, with confidentiality built in.",
    headline: "Client intake and admin, handled with care.",
    problem: {
      title: "Admin crowds out billable work",
      body: "Intake calls, conflict checks, document prep and follow-ups consume hours that fee earners could bill.",
      points: ["Long intake calls for unsuitable matters", "Manual document drafting and filing", "Knowledge locked in past files"],
    },
    systems: [
      { title: "Intake Agent", body: "Screens new enquiries by phone or chat and books consultations.", serviceHref: "/services/ai-agents/ai-voice-agents" },
      { title: "Document Automation", body: "Extracts, drafts and files documents with human review built in.", serviceHref: "/services/workflow-automation/document-automation" },
      { title: "Private Knowledge Assistant", body: "Secure search across precedents and internal guidance.", serviceHref: "/services/ai-agents/internal-knowledge-ai" },
    ],
    caseStudy: "law-firm-intake",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    icon: "ShoppingCart",
    short: "Support, orders and ops that scale with sales.",
    headline: "Scale sales without scaling support.",
    problem: {
      title: "Growth multiplies repetitive work",
      body: "Order questions, returns, stock updates and reporting grow with every sale — and so does the support queue.",
      points: ["'Where is my order?' tickets", "Manual returns and refunds", "Stock and order data out of sync"],
    },
    systems: [
      { title: "Support AI", body: "Answers order and product questions and triages the rest.", serviceHref: "/services/ai-agents/customer-support-ai" },
      { title: "Ops Integrations", body: "Store, inventory, shipping and accounting kept in sync.", serviceHref: "/services/workflow-automation/integrations-api" },
      { title: "WhatsApp & DM Agent", body: "Product questions and order updates in customers' favourite apps.", serviceHref: "/services/ai-agents/whatsapp-sms-agents" },
    ],
    caseStudy: "ecommerce-support-ai",
  },
  {
    slug: "marketing-agencies",
    name: "Marketing Agencies",
    icon: "Megaphone",
    short: "Deliver more for clients — or resell AI under your brand.",
    headline: "Deliver more for clients without adding headcount.",
    problem: {
      title: "Delivery doesn't scale linearly",
      body: "Reporting, onboarding and client comms eat margin, and clients increasingly ask for AI you can't yet deliver.",
      points: ["Hours spent on monthly reports", "Inconsistent client onboarding", "Clients asking for AI services"],
    },
    systems: [
      { title: "Automated Reporting", body: "Client dashboards and reports that build themselves.", serviceHref: "/services/workflow-automation/business-systems" },
      { title: "Client Onboarding Flows", body: "Contracts, access requests and kickoff handled automatically.", serviceHref: "/services/workflow-automation/n8n-automation" },
      { title: "White-Label AI", body: "Resell chatbots, voice agents and automations under your brand.", serviceHref: "/services/ai-consulting/white-label-for-agencies" },
    ],
    caseStudy: "agency-reporting-automation",
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
