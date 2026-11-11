import { Database } from "lucide-react";

const steps = [
  { title: "Create a free Supabase project", body: "Go to supabase.com → New project. Any region close to your visitors works." },
  { title: "Create the blog table and image bucket", body: "In Supabase open SQL Editor → New query, paste the contents of supabase/schema.sql from this project and click Run." },
  {
    title: "Add your keys",
    body: "Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY (Project Settings → API). Add the same variables in Vercel.",
  },
  { title: "Restart the dev server", body: "Stop npm run dev and start it again so the new keys load. Then come back here and import the example posts." },
];

/** Shown in the admin when Supabase keys are missing. */
export function SetupGuide() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--mint-100)] text-[var(--teal)]">
        <Database className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">Connect your database</h1>
      <p className="mt-2 text-black/55">
        The blog is running on the built-in example posts. Connect Supabase to write, edit and publish your own articles with images.
      </p>
      <ol className="mt-8 space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-lg border border-black/[0.07] bg-white p-5">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[var(--teal)] text-sm font-bold text-white">{i + 1}</span>
            <div>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-black/55">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
