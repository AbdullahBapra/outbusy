import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { emailLayout, isEmailConfigured, sendEmail, siteUrl } from "@/lib/email";
import { brand } from "@/content/brand";
import { supabaseAdmin } from "@/lib/supabase";

const schema = z.strictObject({
  email: z.email("Enter a valid email.").max(254),
  fullName: z.string().trim().min(1, "Enter their name.").max(80),
  role: z.enum(["owner", "agent"]),
});

/**
 * POST /api/admin/team: invites a team member (owner). They get an email with a one-time link
 * to choose their password. Without email configured, the link is returned to show the owner.
 */
export const POST = route(async (req) => {
  const member = await requireAdminRequest(req, "owner");
  const input = await readJson(req, schema);
  const email = input.email.toLowerCase();
  const db = supabaseAdmin();

  const { data: existing } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) throw new HttpError(409, "exists", "That person is already on the team.");

  const { data, error } = await db.auth.admin.generateLink({ type: "invite", email });
  if (error || !data.properties) throw new HttpError(400, "invite_failed", error?.message ?? "Couldn't create the invite.");

  const { error: profileError } = await db.from("profiles").insert({ id: data.user.id, email, full_name: input.fullName, role: input.role, active: true });
  if (profileError) throw new HttpError(500, "database", profileError.message);

  const link = `${siteUrl()}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=invite&next=/admin/set-password`;
  const sent = await sendEmail({
    to: email,
    subject: `You're invited to the ${brand.name} admin`,
    ...emailLayout({
      heading: `Join the ${brand.name} team inbox`,
      lines: [`${member.fullName} invited you as ${input.role === "owner" ? "an owner" : "an agent"}. Use the button to choose your password. The link works once and expires in 24 hours.`],
      button: { label: "Accept invite", href: link },
    }),
  });

  await audit(member.id, "team.invite", email, { role: input.role });
  // Only hand the link back when it couldn't be emailed, so the owner can pass it on securely.
  return ok({ invited: true, ...(sent || isEmailConfigured() ? {} : { link }) }, { status: 201 });
});
