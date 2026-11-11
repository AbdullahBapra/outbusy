import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseUser } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set<EmailOtpType>(["invite", "recovery"]);

/**
 * GET /auth/confirm?token_hash=…&type=invite|recovery&next=/admin/…
 * Verifies the one-time link from an invite or reset email, signs the member in, and sends
 * them on to choose a password. `next` is restricted to admin paths (no open redirect).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/admin";
  const next = nextParam.startsWith("/admin") && !nextParam.startsWith("//") ? nextParam : "/admin";

  if (tokenHash && type && ALLOWED_TYPES.has(type)) {
    const { error } = await (await supabaseUser()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/admin/login?link=expired", origin));
}
