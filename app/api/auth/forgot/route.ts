import { z } from "zod";
import { assertSameOrigin, clientIp } from "@/lib/api/auth";
import { ok, readJson, route } from "@/lib/api/http";
import { emailLayout, sendEmail, siteUrl } from "@/lib/email";
import { rateLimited } from "@/lib/security/limits";
import { supabaseAdmin } from "@/lib/supabase";

const schema = z.strictObject({ email: z.email("Enter your email address.").max(254) });

/**
 * POST /api/auth/forgot: emails a password-reset link to an active team member.
 * Always answers the same way, so it can't be used to find out which emails have accounts.
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const email = (await readJson(req, schema)).email.toLowerCase();
  const done = ok({ sent: true });

  const ip = clientIp(req);
  if ((await rateLimited(`forgot:ip:${ip}`, 10, 60 * 60 * 1000)) || (await rateLimited(`forgot:email:${email}`, 3, 60 * 60 * 1000))) return done;

  const db = supabaseAdmin();
  const { data: member } = await db.from("profiles").select("id, active").eq("email", email).maybeSingle();
  if (!member?.active) return done;

  const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data.properties) {
    console.error("[auth] recovery link failed:", error?.message);
    return done;
  }
  const link = `${siteUrl()}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery&next=/admin/set-password`;
  await sendEmail({
    to: email,
    subject: "Reset your admin password",
    ...emailLayout({
      heading: "Reset your password",
      lines: ["Someone asked to reset the password for your admin account. If that was you, use the button below. The link expires in one hour.", "If it wasn't you, ignore this email; your password stays the same."],
      button: { label: "Choose a new password", href: link },
    }),
  });
  return done;
});
