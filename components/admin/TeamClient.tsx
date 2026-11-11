"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Loader2, UserPlus } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export type TeamRow = { id: string; email: string; full_name: string; role: "owner" | "agent"; active: boolean; alerts_enabled: boolean; created_at: string };

export function TeamClient({ me, members }: { me: string; members: TeamRow[] }) {
  const router = useRouter();
  const [invite, setInvite] = useState({ email: "", fullName: "", role: "agent" as "owner" | "agent" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState("");

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const field = "h-10 rounded-md border border-black/10 px-3 text-sm outline-none focus:border-[var(--teal)]";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Team</h1>
      <p className="mt-1 text-black/55">
        Who can sign in to the admin. <strong className="font-semibold">Owners</strong> manage settings, knowledge and the team; <strong className="font-semibold">agents</strong> handle chats and leads.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run("invite", async () => {
            const res = await api.team.invite(invite);
            setInvite({ email: "", fullName: "", role: "agent" });
            if (res.link) setLink(res.link);
            else setNotice("Invite sent. They'll get an email to choose their password.");
          });
        }}
        className="mt-6 flex flex-wrap items-end gap-2 rounded-lg border border-black/[0.07] bg-white p-5"
      >
        <label className="text-xs font-medium text-black/50">
          Name
          <input required value={invite.fullName} onChange={(e) => setInvite({ ...invite, fullName: e.target.value })} className={cn(field, "mt-1 block w-48")} />
        </label>
        <label className="text-xs font-medium text-black/50">
          Email
          <input required type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} className={cn(field, "mt-1 block w-64")} />
        </label>
        <label className="text-xs font-medium text-black/50">
          Role
          <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as "owner" | "agent" })} className={cn(field, "mt-1 block")}>
            <option value="agent">Agent</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <button type="submit" disabled={busy === "invite"} className="flex h-10 items-center gap-1.5 rounded-md bg-[var(--ink)] px-4 text-sm font-medium text-white disabled:opacity-50">
          {busy === "invite" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Invite
        </button>
      </form>

      {notice && <p className="mt-4 rounded-lg bg-[var(--mint-100)] px-4 py-3 text-sm text-[#0b4f47]">{notice}</p>}
      {link && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p>Email isn&apos;t set up yet, so send this one-time invite link to them yourself (it expires in 24 hours):</p>
          <div className="mt-2 flex gap-2">
            <input readOnly value={link} className="h-9 flex-1 rounded-md border border-amber-200 bg-white px-2 font-mono text-xs" />
            <button type="button" onClick={() => void navigator.clipboard.writeText(link)} className="flex items-center gap-1 rounded-md border border-amber-300 px-3 text-xs">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-black/[0.07] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/[0.07] text-[11px] uppercase tracking-[0.12em] text-black/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Alerts</th>
              <th className="px-4 py-3 font-semibold">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {members.map((m) => (
              <tr key={m.id} className={cn(!m.active && "opacity-50")}>
                <td className="px-4 py-3">
                  <span className="block font-medium">
                    {m.full_name || m.email} {m.id === me && <span className="text-xs font-normal text-black/40">(you)</span>}
                  </span>
                  <span className="text-xs text-black/45">{m.email}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={m.role}
                    disabled={!!busy}
                    onChange={(e) => run(`role-${m.id}`, () => api.team.update(m.id, { role: e.target.value as "owner" | "agent" }).then(() => {}))}
                    className="h-8 rounded-md border border-black/10 px-2 text-sm"
                  >
                    <option value="agent">Agent</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-black/60">{m.alerts_enabled ? "On" : "Off"}</td>
                <td className="px-4 py-3">
                  {m.id !== me && (
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => {
                        if (m.active && !confirm(`Remove ${m.full_name || m.email}'s access? They'll be signed out immediately.`)) return;
                        void run(`active-${m.id}`, () => api.team.update(m.id, { active: !m.active }).then(() => {}));
                      }}
                      className={cn("rounded-md px-3 py-1 text-xs", m.active ? "text-red-600 hover:bg-red-50" : "text-[var(--teal)] hover:bg-[var(--mint-50)]")}
                    >
                      {m.active ? "Remove access" : "Restore access"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
