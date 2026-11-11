import { getTeamMember } from "@/lib/admin-auth";
import { HttpError, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { supabaseAdmin } from "@/lib/supabase";

const COLUMNS = ["created_at", "name", "email", "phone", "company", "services", "problem", "budget", "timeline", "goals", "score", "temperature", "status", "source", "page"] as const;

/** Quotes a CSV cell, and neutralises spreadsheet formulas (=, +, -, @) in user-supplied text. */
function cell(v: unknown) {
  let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** GET /api/admin/leads/export: all leads as CSV (team). */
export const GET = route(async () => {
  const member = await getTeamMember();
  if (!member) throw new HttpError(401, "unauthorized", "Sign in to the admin panel first.");
  const { data, error } = await supabaseAdmin().from("leads").select(COLUMNS.join(", ")).order("created_at", { ascending: false }).limit(10_000);
  if (error) throw new HttpError(500, "database", error.message);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\r\n");
  await audit(member.id, "leads.export", undefined, { rows: rows.length });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
