import { BrandLogo } from "@/components/BrandLogo";

/** Centered card shell shared by the sign-in, forgot-password and set-password pages. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden="true" className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)] opacity-20 blur-[120px]" />
      <div aria-hidden="true" className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[var(--teal)] opacity-15 blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <BrandLogo tone="dark" priority className="mx-auto h-10" />
        <div className="mt-8 rounded-xl border border-black/10 bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-black/55">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export const authInput =
  "h-12 w-full rounded-lg border border-black/15 bg-white pl-11 pr-4 text-base outline-none transition focus:border-[var(--teal)] focus:ring-4 focus:ring-[var(--accent)]/20";
export const authLabel = "text-xs font-semibold uppercase tracking-[0.15em] text-black/50";
export const authButton =
  "flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--teal)] text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#006e62] disabled:opacity-60";
