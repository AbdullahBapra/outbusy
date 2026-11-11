import Link from "next/link";
import { Download, Search } from "lucide-react";
import { Pager, pageParam } from "@/components/admin/Pager";
import { LeadDrawer, type LeadDetail, type LeadEvent } from "@/components/admin/leads/LeadDrawer";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Leads" };

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
const TEMPS = ["hot", "warm", "cold"] as const;
const TEMP_DOT: Record<string, string> = { hot: "bg-[#e5484d]", warm: "bg-[#f5a524]", cold: "bg-black/20" };

type Params = { q?: string; status?: string; temp?: string; mine?: string; l?: string; page?: string };

const PAGE_SIZE = 25;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const member = await requireAdmin();
  const params = await searchParams;
  const db = await supabaseUser();
  const page = pageParam(params.page);

  let q = db
    .from("leads")
    .select("id, created_at, name, email, company, services, score, temperature, status, assigned_to, source, conversation_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (params.status && (STATUSES as readonly string[]).includes(params.status)) q = q.eq("status", params.status);
  if (params.temp && (TEMPS as readonly string[]).includes(params.temp)) q = q.eq("temperature", params.temp);
  if (params.mine) q = q.eq("assigned_to", member.id);
  const search = params.q?.trim().replace(/[%,()]/g, "").slice(0, 80);
  if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,problem.ilike.%${search}%`);

  const [{ data: leads, count }, { data: team }] = await Promise.all([q, db.from("profiles").select("id, full_name, email, active")]);
  const names = new Map((team ?? []).map((t) => [t.id, t.full_name || t.email]));

  let detail: LeadDetail | null = null;
  let events: LeadEvent[] = [];
  if (params.l && /^[0-9a-f-]{36}$/.test(params.l)) {
    const [{ data: lead }, { data: ev }] = await Promise.all([
      db.from("leads").select("*").eq("id", params.l).maybeSingle(),
      db.from("lead_events").select("id, type, data, actor_id, created_at").eq("lead_id", params.l).order("created_at", { ascending: false }).limit(100),
    ]);
    detail = (lead as LeadDetail | null) ?? null;
    events = ((ev ?? []) as LeadEvent[]).map((e) => ({ ...e, actor: e.actor_id ? names.get(e.actor_id) : undefined }));
  }

  const link = (patch: Partial<Params>) => {
    const next = new URLSearchParams(Object.entries({ ...params, l: undefined, page: undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/leads${next.size ? `?${next}` : ""}`;
  };
  const chip = (active: boolean) => cn("rounded-md px-3 py-1 text-xs capitalize transition", active ? "bg-[var(--ink)] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/10");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-black/55">Structured leads from chats and forms, scored automatically.</p>
        </div>
        <a href="/api/admin/leads/export" download className="flex h-9 items-center gap-1.5 rounded-md border border-black/15 px-3.5 text-sm transition hover:border-black">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="mt-6 space-y-3">
        <form className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input name="q" defaultValue={params.q} placeholder="Search name, email, company, problem" className="h-10 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--teal)]" />
          {params.status && <input type="hidden" name="status" value={params.status} />}
          {params.temp && <input type="hidden" name="temp" value={params.temp} />}
        </form>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href={link({ status: undefined })} className={chip(!params.status)}>
            All
          </Link>
          {STATUSES.map((s) => (
            <Link key={s} href={link({ status: s })} className={chip(params.status === s)}>
              {s}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-black/10" />
          {TEMPS.map((t) => (
            <Link key={t} href={link({ temp: params.temp === t ? undefined : t })} className={chip(params.temp === t)}>
              {t}
            </Link>
          ))}
          <Link href={link({ mine: params.mine ? undefined : "1" })} className={chip(!!params.mine)}>
            Assigned to me
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-black/[0.07] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-black/[0.07] text-[11px] uppercase tracking-[0.12em] text-black/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Needs</th>
              <th className="px-4 py-3 font-semibold">Score</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {(leads ?? []).map((l) => (
              <tr key={l.id} className={cn("transition hover:bg-black/[0.015]", params.l === l.id && "bg-[var(--mint-50)]")}>
                <td className="px-4 py-3">
                  <Link href={link({ l: l.id, page: params.page })} className="block">
                    <span className="block font-medium">{l.name || l.email || "Unnamed lead"}</span>
                    <span className="block text-xs text-black/45">{[l.email, l.company].filter(Boolean).join(" · ") || l.source}</span>
                  </Link>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-black/60">{(l.services as string[]).join(", ") || "–"}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <span className={cn("h-2 w-2 rounded-full", TEMP_DOT[l.temperature])} />
                    {l.score}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{l.status}</td>
                <td className="px-4 py-3 text-black/60">{l.assigned_to ? names.get(l.assigned_to) : "–"}</td>
                <td className="px-4 py-3 text-black/45">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!leads?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-black/45">
                  No leads match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} pageSize={PAGE_SIZE} total={count ?? 0} noun="leads" href={(p) => link({ page: p > 1 ? String(p) : undefined })} />

      {detail && <LeadDrawer lead={detail} events={events} team={(team ?? []).filter((t) => t.active)} closeHref={link({ page: params.page })} />}
    </div>
  );
}
