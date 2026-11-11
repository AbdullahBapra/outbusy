// Legal pages. IMPORTANT: these are starting-point templates, not legal advice.
// Have them reviewed by a qualified lawyer for your jurisdiction before launch,
// and fill in the [bracketed] details.

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

const company = "Outbusy ([legal entity name]), [registered address], [registration number]";

export const legalDocs: LegalDoc[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    updated: "[Date]",
    sections: [
      { heading: "Who we are", body: [`This website is operated by ${company}. We are the controller of personal data collected through this website.`] },
      { heading: "Data we collect", body: ["Contact details you submit through forms (name, email, phone, company, message).", "Booking details when you schedule a call.", "Technical data such as IP address, browser type and pages visited, where you consent to analytics cookies.", "Conversation data when you use our demo chatbot or voice agent."] },
      { heading: "How we use it", body: ["To respond to enquiries and deliver our services (contract / pre-contract steps).", "To send resources you request, such as templates (consent).", "To improve our website (legitimate interest or consent for analytics)."] },
      {
        heading: "Website chat assistant",
        body: [
          "The chat on this website is an AI assistant. It answers from information we publish about our services, and a member of our team may read the conversation or join it to help you.",
          "We store your messages so we can reply and follow up. To recognise your browser when you come back, we set one strictly necessary cookie holding a random identifier (no name or email).",
          "We only save your name, email, phone or company if you share them and agree to be contacted. Information you share about your business (needs, timeline, budget) helps us prepare a useful reply.",
          "Chats that don't lead to an enquiry are deleted automatically after 12 months. To have your chat history deleted sooner, email [privacy email].",
          "Messages are processed by our AI provider (Anthropic) and our database and hosting providers under data processing agreements, and are not used to train AI models.",
        ],
      },
      { heading: "Sharing", body: ["We use trusted processors (e.g. hosting, email, CRM and AI providers) under data processing agreements. We do not sell your data."] },
      { heading: "International transfers", body: ["Where data leaves the EU/UK, we rely on adequacy decisions or Standard Contractual Clauses."] },
      { heading: "Retention", body: ["We keep enquiry data for up to [24 months] unless a client relationship requires longer retention."] },
      { heading: "Your rights", body: ["You can request access, correction, deletion, restriction, portability or object to processing by emailing [privacy email]. You may also complain to your local data protection authority."] },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    updated: "[Date]",
    sections: [
      { heading: "What cookies are", body: ["Cookies are small files stored on your device that help websites work and understand how they're used."] },
      { heading: "Cookies we use", body: ["Strictly necessary: required for the site to function (no consent needed).", "Analytics: help us understand usage — only set with your consent.", "Marketing: used to measure campaigns — only set with your consent."] },
      { heading: "Managing cookies", body: ["You can change your choices at any time via the cookie settings link in the footer or through your browser settings."] },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    updated: "[Date]",
    sections: [
      { heading: "Agreement", body: [`These terms govern your use of this website and our services provided by ${company}. Project work is also governed by the proposal or statement of work you sign.`] },
      { heading: "Services", body: ["We provide AI consulting, automation, AI agents and website services as described in each proposal. Timelines and deliverables are defined per project."] },
      { heading: "Fees & payment", body: ["Fees are set out in each proposal. Unless agreed otherwise, invoices are due within [14] days."] },
      { heading: "Intellectual property", body: ["On full payment, you own the deliverables created specifically for you. We retain rights to our pre-existing tools, templates and know-how."] },
      { heading: "Third-party tools", body: ["Our builds rely on third-party platforms (e.g. automation and AI providers) whose own terms and availability apply."] },
      { heading: "Liability", body: ["To the extent permitted by law, our total liability is limited to the fees paid for the relevant project in the preceding [12] months."] },
      { heading: "Governing law", body: ["These terms are governed by the laws of [jurisdiction]."] },
    ],
  },
  {
    slug: "dpa",
    title: "Data Processing Agreement",
    updated: "[Date]",
    sections: [
      { heading: "Purpose", body: ["This Data Processing Agreement (DPA) applies where we process personal data on behalf of EU/UK clients, in line with Article 28 GDPR and the UK GDPR."] },
      { heading: "Roles", body: ["The client is the controller; we act as processor and only process personal data on documented instructions."] },
      { heading: "Security", body: ["We apply appropriate technical and organisational measures, including encryption in transit, least-privilege access, EU hosting options and logging."] },
      { heading: "Sub-processors", body: ["We maintain a list of sub-processors (e.g. hosting, automation and AI providers) and notify clients of changes in advance."] },
      { heading: "Assistance & breaches", body: ["We assist with data subject requests and notify clients without undue delay after becoming aware of a personal data breach."] },
      { heading: "Deletion", body: ["At the end of the engagement we delete or return personal data, unless retention is required by law."] },
      { heading: "Signing", body: ["To sign our DPA, email [legal email] and we'll send you the full agreement for countersignature."] },
    ],
  },
];

export const getLegalDoc = (slug: string) => legalDocs.find((d) => d.slug === slug);
