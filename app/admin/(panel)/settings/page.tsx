import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin-auth";
import { hasClaude, hasGemini } from "@/lib/chat/models";
import { CHAT_MODELS, DEFAULT_SETTINGS, type ChatSettings } from "@/lib/chat/settings";
import { isEmailConfigured } from "@/lib/email";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { supabaseUser } from "@/lib/supabase/server";

export const metadata = { title: "Chatbot settings" };

export default async function SettingsPage() {
  await requireAdmin("owner");
  const { data } = await (await supabaseUser()).from("chat_settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) } as ChatSettings;

  const checks = [
    { label: "Gemini (GEMINI_API_KEY)", ok: hasGemini() },
    { label: "Claude (ANTHROPIC_API_KEY)", ok: hasClaude() },
    { label: "Knowledge search (VOYAGE_API_KEY)", ok: isEmbeddingConfigured() },
    { label: "Email alerts (RESEND_API_KEY + ALERT_FROM_EMAIL)", ok: isEmailConfigured() },
    { label: "Visitor cookie secret (CHAT_VISITOR_SECRET)", ok: Boolean(process.env.CHAT_VISITOR_SECRET) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chatbot settings</h1>
      <p className="mt-1 text-black/55">How the website assistant behaves, and when the team is alerted.</p>

      <section className="mt-6 rounded-lg border border-black/[0.07] bg-white p-5">
        <h2 className="font-semibold">Setup</h2>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-sm">
              <span className={c.ok ? "h-2 w-2 rounded-full bg-[var(--teal)]" : "h-2 w-2 rounded-full bg-[#e5484d]"} />
              {c.label}
              <span className="text-black/40">{c.ok ? "connected" : "missing"}</span>
            </li>
          ))}
        </ul>
      </section>

      <SettingsForm initial={settings} models={[...CHAT_MODELS]} />
    </div>
  );
}
