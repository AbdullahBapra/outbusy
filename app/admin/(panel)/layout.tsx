import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/PostRowActions";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseUser } from "@/lib/supabase/server";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const member = await requireAdmin();
  const { count } = await (await supabaseUser()).from("conversations").select("id", { count: "exact", head: true }).eq("status", "waiting_human");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <BrandLogo tone="dark" className="h-7" />
            <span className="rounded-md bg-[var(--mint-100)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--teal)]">Admin</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden text-sm text-black/50 md:inline">
              {member.fullName} · <span className="capitalize">{member.role}</span>
            </span>
            <Link href="/" target="_blank" className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-black/60 transition hover:bg-black/5 hover:text-black">
              <ExternalLink className="h-4 w-4" />
              <span className="max-sm:hidden">View site</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6">
          <AdminNav role={member.role} initialWaiting={count ?? 0} />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
    </>
  );
}
