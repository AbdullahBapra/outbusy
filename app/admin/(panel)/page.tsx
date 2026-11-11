import Link from "next/link";
import { ArrowRight, Flame, Hand, MessageSquare, Target, TrendingUp, UserRoundCheck } from "lucide-react";
import { AlertsToggle } from "@/components/admin/AlertsToggle";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseUser } from "@/lib/supabase/server";

export const metadata = { title: "Overview" };

const DAY = 24 * 60 * 60 * 1000;
/** Start of the reporting window (a request-time value, so it lives outside the component). */
const windowStart = (days: number) => new Date(Date.now() - days * DAY).toISOString();

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const member = await requireAdmin();
  const { denied } = await searchParams;
  const db = await supabaseUser();
  const since = windowStart(30);
  const head = { count: "exact" as const, head: true };

  const [conversations, handoffs, leads, withContact, qualified, won, waiting, hot] = await Promise.all([
    db.from("conversations").select("id", head).gte("created_at", since),
    db.from("conversations").select("id", head).gte("created_at", since).not("handoff_reason", "is", null),
    db.from("leads").select("id", head).gte("created_at", since),
    db.from("leads").select("id", head).gte("created_at", since).neq("email", ""),
    db.from("leads").select("id", head).gte("created_at", since).in("status", ["qualified", "proposal", "won"]),
    db.from("leads").select("id", head).gte("created_at", since).eq("status", "won"),
    db.from("conversations").select("id, last_preview, last_message_at, visitor:visitors(name, email)").eq("status", "waiting_human").order("last_message_at", { ascending: false }).limit(5),
    db.from("leads").select("id, name, email, score, services, created_at").eq("temperature", "hot").not("status", "in", "(won,lost)").order("score", { ascending: false }).limit(5),
  ]);

  const total = conversations.count ?? 0;
  const pct = (n: number | null, d: number) => (d ? `${Math.round(((n ?? 0) / d) * 100)}%` : "–");
  const kpis = [
    { label: "Conversations", value: total, icon: MessageSquare, note: "last 30 days" },
    { label: "Leads captured", value: withContact.count ?? 0, icon: UserRoundCheck, note: `${pct(withContact.count, total)} of chats` },
    { label: "Qualified leads", value: qualified.count ?? 0, icon: Target, note: `${leads.count ?? 0} leads in total` },
    { label: "Won", value: won.count ?? 0, icon: TrendingUp, note: `${pct(won.count, leads.count ?? 0)} of leads` },
    { label: "Handed to a person", value: handoffs.count ?? 0, icon: Hand, note: `AI handled ${pct(total - (handoffs.count ?? 0), total)} alone` },
  ];

  type Waiting = { id: string; last_preview: string | null; last_message_at: string; visitor: { name: string | null; email: string | null } | null };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {member.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-black/55">How the website assistant is doing over the last 30 days.</p>
        </div>
        <AlertsToggle memberId={member.id} initial={member.alertsEnabled} />
      </div>

      {denied && <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">That page is for owners only.</p>}

      <div className="mt-8 grid grid-cols-5 gap-3 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-black/[0.07] bg-white p-4">
            <k.icon className="h-5 w-5 text-[var(--teal)]" />
            <div className="mt-3 text-2xl font-bold tabular-nums">{k.value}</div>
            <div className="text-sm font-medium">{k.label}</div>
            <div className="mt-0.5 text-xs text-black/45">{k.note}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <section className="rounded-lg border border-black/[0.07] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Hand className="h-4 w-4 text-[#c4262c]" /> Waiting for a person
            </h2>
            <Link href="/admin/inbox" className="flex items-center gap-1 text-sm text-[var(--teal)] hover:underline">
              Inbox <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-black/[0.06]">
            {((waiting.data ?? []) as unknown as Waiting[]).map((c) => (
              <li key={c.id}>
                <Link href={`/admin/inbox?c=${c.id}`} className="block py-2.5 hover:opacity-80">
                  <div className="text-sm font-medium">{c.visitor?.name || c.visitor?.email || "Visitor"}</div>
                  <div className="truncate text-[13px] text-black/50">{c.last_preview}</div>
                </Link>
              </li>
            ))}
            {!waiting.data?.length && <li className="py-6 text-center text-sm text-black/45">Nobody is waiting. Nice.</li>}
          </ul>
        </section>

        <section className="rounded-lg border border-black/[0.07] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Flame className="h-4 w-4 text-[#e5484d]" /> Hot leads to follow up
            </h2>
            <Link href="/admin/leads?temp=hot" className="flex items-center gap-1 text-sm text-[var(--teal)] hover:underline">
              Leads <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-black/[0.06]">
            {(hot.data ?? []).map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads?l=${l.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{l.name || l.email || "Unnamed lead"}</span>
                    <span className="block truncate text-[13px] text-black/50">{(l.services as string[]).join(", ") || "No service named yet"}</span>
                  </span>
                  <span className="flex-none rounded-md bg-[#fdecec] px-2 py-0.5 text-xs font-semibold text-[#c4262c]">{l.score}</span>
                </Link>
              </li>
            ))}
            {!hot.data?.length && <li className="py-6 text-center text-sm text-black/45">No hot leads right now.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
