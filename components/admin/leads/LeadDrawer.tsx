"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, MessageSquare, X } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export type LeadDetail = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  services: string[];
  problem: string | null;
  budget: string | null;
  timeline: string | null;
  goals: string | null;
  score: number;
  temperature: "hot" | "warm" | "cold";
  status: string;
  assigned_to: string | null;
  source: string;
  page: string;
  conversation_id: string | null;
  consent_at: string | null;
};
export type LeadEvent = { id: string; type: string; data: Record<string, unknown>; actor_id: string | null; actor?: string; created_at: string };

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const FIELDS = [
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["company", "Company"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
] as const;

function describe(e: LeadEvent) {
  switch (e.type) {
    case "created":
      return "Lead created";
    case "status":
      return `Status: ${String(e.data.from)} → ${String(e.data.to)}`;
    case "assign":
      return e.data.to ? "Assigned" : "Unassigned";
    case "note":
      return String(e.data.note);
    default:
      return `Updated ${((e.data.fields as string[] | undefined) ?? []).join(", ") || "details"}`;
  }
}

/** Side panel for one lead: status, owner, editable details, notes and the activity timeline. */
export function LeadDrawer({ lead, events, team, closeHref }: { lead: LeadDetail; events: LeadEvent[]; team: { id: string; full_name: string; email: string }[]; closeHref: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: lead.name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    company: lead.company ?? "",
    budget: lead.budget ?? "",
    timeline: lead.timeline ?? "",
    services: lead.services.join(", "),
    problem: lead.problem ?? "",
    goals: lead.goals ?? "",
  });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const save = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setError("");
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "That didn't save. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const input = "mt-1 h-9 w-full rounded-md border border-black/10 px-2.5 text-sm outline-none focus:border-[var(--teal)]";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" role="dialog" aria-modal="true" aria-label="Lead details">
      <Link href={closeHref} className="flex-1" aria-label="Close" />
      <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-black/[0.07] p-5">
          <div>
            <h2 className="text-lg font-semibold">{lead.name || lead.email || "Unnamed lead"}</h2>
            <p className="text-sm text-black/50">
              Score {lead.score} · <span className="capitalize">{lead.temperature}</span> · from {lead.source}
              {lead.page && ` on ${lead.page}`}
            </p>
          </div>
          <Link href={closeHref} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5" aria-label="Close">
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-black/50">
              Status
              <select value={lead.status} disabled={!!busy} onChange={(e) => save("status", () => api.leads.update(lead.id, { status: e.target.value }))} className={cn(input, "capitalize")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-black/50">
              Owner
              <select value={lead.assigned_to ?? ""} disabled={!!busy} onChange={(e) => save("assign", () => api.leads.update(lead.id, { assignedTo: e.target.value || null }))} className={input}>
                <option value="">Unassigned</option>
                {team.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.email}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {lead.conversation_id && (
            <Link href={`/admin/inbox?c=${lead.conversation_id}`} className="flex items-center gap-1.5 text-sm font-medium text-[var(--teal)] hover:underline">
              <MessageSquare className="h-4 w-4" /> Open the conversation
            </Link>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save("details", () =>
                api.leads.update(lead.id, {
                  ...form,
                  services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
                }),
              );
            }}
            className="space-y-3"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(([k, label]) => (
                <label key={k} className="text-xs font-medium text-black/50">
                  {label}
                  <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={input} />
                </label>
              ))}
            </div>
            <label className="block text-xs font-medium text-black/50">
              Services (comma separated)
              <input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} className={input} />
            </label>
            <label className="block text-xs font-medium text-black/50">
              Problem
              <textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} rows={3} className="mt-1 w-full rounded-md border border-black/10 p-2.5 text-sm outline-none focus:border-[var(--teal)]" />
            </label>
            <label className="block text-xs font-medium text-black/50">
              Goals
              <textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} rows={2} className="mt-1 w-full rounded-md border border-black/10 p-2.5 text-sm outline-none focus:border-[var(--teal)]" />
            </label>
            <p className="text-[11px] text-black/40">{lead.consent_at ? `Consented to contact on ${new Date(lead.consent_at).toLocaleString()}.` : "No contact consent recorded in chat."}</p>
            <button type="submit" disabled={!!busy} className="flex h-9 items-center gap-1.5 rounded-md bg-[var(--ink)] px-4 text-sm font-medium text-white disabled:opacity-50">
              {busy === "details" && <Loader2 className="h-4 w-4 animate-spin" />} Save details
            </button>
          </form>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">Activity</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                void save("note", async () => {
                  await api.leads.addNote(lead.id, note);
                  setNote("");
                });
              }}
              className="mt-2 flex gap-2"
            >
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" className="h-9 flex-1 rounded-md border border-black/10 px-2.5 text-sm outline-none focus:border-[var(--teal)]" />
              <button type="submit" disabled={!note.trim() || !!busy} className="rounded-md border border-black/15 px-3 text-sm disabled:opacity-40">
                Add
              </button>
            </form>
            <ol className="mt-3 space-y-2.5 border-l border-black/10 pl-4">
              {events.map((e) => (
                <li key={e.id} className="text-sm">
                  <p className={cn(e.type === "note" ? "text-[var(--ink)]" : "text-black/60")}>{describe(e)}</p>
                  <p className="text-[11px] text-black/40">
                    {e.actor ?? (e.type === "created" || e.type === "update" ? "Assistant" : "Team")} · {new Date(e.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
