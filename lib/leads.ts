import { z } from "zod";
import { brand } from "@/content/brand";
import { isAdminWriteConfigured, supabaseAdmin } from "@/lib/supabase";

/**
 * Leads captured by the Kirby chat assistant (and any other lightweight form).
 * Each lead is stored in Supabase (`leads` table) and/or forwarded to
 * `brand.contactWebhookUrl` (e.g. an n8n webhook → CRM), whichever is configured.
 */

export const LEADS_TABLE = "leads";

export const leadSchema = z.strictObject({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  email: z.email("That email doesn't look right.").max(254),
  interest: z.string().trim().min(1).max(80),
  message: z.string().trim().max(2000).default(""),
  page: z.string().trim().max(300).default(""),
  source: z.enum(["kirby"]).default("kirby"),
  /** Honeypot — real visitors never see or fill this field. */
  website: z.string().max(0).optional(),
  /** 0-100 interest score from on-site behaviour (see components/assistant/useInterest.ts). */
  score: z.number().int().min(0).max(100).optional(),
  /** ms since the chat opened; bots submit instantly. */
  elapsedMs: z.number().int().min(0).max(86_400_000),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadResult = { stored: boolean; forwarded: boolean };

export class LeadDeliveryError extends Error {}

/** Saves and/or forwards a lead. Throws LeadDeliveryError if every configured destination fails. */
export async function deliverLead(lead: LeadInput, meta: { userAgent: string | null }): Promise<LeadResult> {
  const record = {
    name: lead.name,
    email: lead.email.toLowerCase(),
    interest: lead.interest,
    message: lead.message,
    page: lead.page,
    source: lead.source,
    engagement_score: lead.score ?? null,
    user_agent: meta.userAgent?.slice(0, 300) ?? null,
  };

  const tasks: Promise<"stored" | "forwarded">[] = [];

  if (isAdminWriteConfigured()) {
    tasks.push(
      (async () => {
        const { error } = await supabaseAdmin().from(LEADS_TABLE).insert(record);
        if (error) throw new Error(`Supabase: ${error.message}`);
        return "stored" as const;
      })(),
    );
  }

  if (brand.contactWebhookUrl) {
    tasks.push(
      (async () => {
        const res = await fetch(brand.contactWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...record, submittedAt: new Date().toISOString() }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
        return "forwarded" as const;
      })(),
    );
  }

  if (tasks.length === 0) {
    // Nothing configured yet (local development): keep the lead visible in the server log.
    console.warn("[leads] No destination configured (Supabase leads table or brand.contactWebhookUrl). Lead:", record);
    return { stored: false, forwarded: false };
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((r) => r.status === "rejected" && console.error("[leads] delivery failed:", r.reason));
  const done = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (done.length === 0) throw new LeadDeliveryError("We couldn't send your message right now.");
  return { stored: done.includes("stored"), forwarded: done.includes("forwarded") };
}
