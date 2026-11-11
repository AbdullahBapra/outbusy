import { getTeamMember, isAdmin, type Role, type TeamMember } from "@/lib/admin-auth";
import { HttpError } from "@/lib/api/http";

/**
 * API auth = the team member's Supabase Auth session (cookies set by POST /api/auth/login).
 * The admin panel calls the API with those cookies, so there is one login for everything.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF guard for cookie-authenticated writes: the browser must say the request comes from
 * this site. (The session cookie is also SameSite=Lax and writes require a JSON body.)
 */
function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function assertSameOrigin(req: Request) {
  if (!SAFE_METHODS.has(req.method) && !isSameOrigin(req)) {
    throw new HttpError(403, "forbidden_origin", "Cross-site requests are not allowed.");
  }
}

/** True when the request carries a valid team session. */
export const isAdminRequest = () => isAdmin();

/** Use at the top of every admin API handler: same-origin check, then a valid team session (and role). */
export async function requireAdminRequest(req: Request, role: Role = "agent"): Promise<TeamMember> {
  assertSameOrigin(req);
  const member = await getTeamMember();
  if (!member) throw new HttpError(401, "unauthorized", "Sign in to the admin panel first.");
  if (role === "owner" && member.role !== "owner") throw new HttpError(403, "forbidden", "Only owners can do that.");
  return member;
}

/** Client IP from the proxy headers (best effort; used only for rate limiting). */
export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
