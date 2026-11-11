"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ChatSettings } from "@/lib/chat/settings";
import { api, ApiClientError } from "@/lib/api/client";

const list = (s: string) =>
  s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);

export function SettingsForm({ initial, models }: { initial: ChatSettings; models: string[] }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [chips, setChips] = useState(initial.starter_chips.join("\n"));
  const [keywords, setKeywords] = useState(initial.handoff_keywords.join(", "));
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const save = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setState("saving");
    setError("");
    try {
      await api.settings.update({
        ai_enabled: s.ai_enabled,
        model: s.model,
        greeting: s.greeting,
        starter_chips: list(chips),
        hot_score_threshold: s.hot_score_threshold,
        low_confidence_threshold: s.low_confidence_threshold,
        handoff_keywords: list(keywords),
        alert_on_handoff: s.alert_on_handoff,
        alert_on_hot_lead: s.alert_on_hot_lead,
        alert_on_low_confidence: s.alert_on_low_confidence,
      });
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't save the settings.");
      setState("idle");
    }
  };

  const card = "rounded-lg border border-black/[0.07] bg-white p-5";
  const label = "block text-sm font-medium";
  const help = "mt-0.5 text-xs text-black/45";
  const field = "mt-2 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-[var(--teal)]";
  const toggle = (key: "ai_enabled" | "alert_on_handoff" | "alert_on_hot_lead" | "alert_on_low_confidence", title: string, desc: string) => (
    <label className="flex items-start gap-3">
      <input type="checkbox" checked={s[key]} onChange={(e) => setS({ ...s, [key]: e.target.checked })} className="mt-1 h-4 w-4 accent-[var(--teal)]" />
      <span>
        <span className={label}>{title}</span>
        <span className={help}>{desc}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={save} className="mt-4 space-y-4">
      <section className={card}>
        <h2 className="font-semibold">Assistant</h2>
        <div className="mt-4 space-y-4">
          {toggle("ai_enabled", "AI replies on", "When off, visitors' messages go straight to the team inbox and nobody is answered automatically.")}
          <label className={label}>
            Model
            <select value={s.model} onChange={(e) => setS({ ...s, model: e.target.value })} className={`${field} h-10`}>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className={help}>Flash models are fastest and cheapest; Pro and Opus give the most careful answers. If a provider has no API key, the assistant uses the one that does.</span>
          </label>
          <label className={label}>
            Greeting
            <input value={s.greeting} onChange={(e) => setS({ ...s, greeting: e.target.value })} maxLength={300} className={`${field} h-10`} />
          </label>
          <label className={label}>
            Starter replies (one per line, up to 4)
            <textarea value={chips} onChange={(e) => setChips(e.target.value)} rows={4} className={`${field} py-2`} />
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Handoff and lead rules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Hot lead score
            <input type="number" min={30} max={100} value={s.hot_score_threshold} onChange={(e) => setS({ ...s, hot_score_threshold: Number(e.target.value) })} className={`${field} h-10`} />
            <span className={help}>Leads at or above this score are marked hot and alert the team.</span>
          </label>
          <label className={label}>
            Minimum knowledge match ({Math.round(s.low_confidence_threshold * 100)}%)
            <input type="range" min={0.2} max={0.8} step={0.05} value={s.low_confidence_threshold} onChange={(e) => setS({ ...s, low_confidence_threshold: Number(e.target.value) })} className="mt-3 w-full accent-[var(--teal)]" />
            <span className={help}>Below this, the assistant says it isn&apos;t sure and offers a person instead of guessing.</span>
          </label>
          <label className={`${label} sm:col-span-2`}>
            Words that mean “get me a person” (comma separated)
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className={`${field} h-10`} />
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Email alerts</h2>
        <p className={help}>Sent to owners and the assigned team member, at most once every 10 minutes per conversation.</p>
        <div className="mt-4 space-y-3">
          {toggle("alert_on_handoff", "A visitor asks for a person", "Also when a visitor writes again while waiting.")}
          {toggle("alert_on_hot_lead", "A lead becomes hot", "Based on the hot lead score above.")}
          {toggle("alert_on_low_confidence", "The assistant can't answer", "Useful for finding gaps in the knowledge base. Can be noisy.")}
        </div>
      </section>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={state === "saving"} className="flex h-11 items-center gap-2 rounded-md bg-[var(--ink)] px-6 text-sm font-medium text-white disabled:opacity-50">
        {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <CheckCircle2 className="h-4 w-4" /> : null}
        {state === "saved" ? "Saved" : "Save settings"}
      </button>
    </form>
  );
}
