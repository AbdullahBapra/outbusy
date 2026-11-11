import { assertSameOrigin } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { LeadDeliveryError, deliverLead, leadSchema } from "@/lib/leads";

/** Best-effort per-instance rate limit: 5 leads per IP per 10 minutes. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > MAX_PER_WINDOW;
}

/**
 * POST /api/leads — the Kirby chat assistant's lead form.
 * Body: { name, email, interest, message?, page?, elapsedMs, website? (honeypot) }
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) throw new HttpError(429, "rate_limited", "Too many messages — please try again in a few minutes.");

  const lead = await readJson(req, leadSchema);

  // Bots: filled the hidden field or answered the whole chat in under 3 seconds.
  // Pretend success so they don't learn what tripped the filter.
  if (lead.website || lead.elapsedMs < 3000) return ok({ received: true }, { status: 202 });

  try {
    await deliverLead(lead, { userAgent: req.headers.get("user-agent") });
  } catch (err) {
    if (err instanceof LeadDeliveryError) throw new HttpError(502, "delivery_failed", err.message);
    throw err;
  }
  return ok({ received: true }, { status: 201 });
});
