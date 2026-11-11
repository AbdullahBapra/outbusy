"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, FileText, Inbox, LayoutDashboard, Settings, Users, UserRoundSearch } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/leads", label: "Leads", icon: UserRoundSearch },
  { href: "/admin/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/admin/posts", label: "Blog", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings, owner: true },
  { href: "/admin/team", label: "Team", icon: Users, owner: true },
];

/** Admin section tabs, with a live count of conversations waiting for a person. */
export function AdminNav({ role, initialWaiting }: { role: "owner" | "agent"; initialWaiting: number }) {
  const pathname = usePathname();
  const [waiting, setWaiting] = useState(initialWaiting);

  useEffect(() => {
    const db = supabaseBrowser();
    const refresh = async () => {
      const { count } = await db.from("conversations").select("id", { count: "exact", head: true }).eq("status", "waiting_human");
      setWaiting(count ?? 0);
    };
    const channel = db.channel("admin-nav").on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void refresh()).subscribe();
    return () => void db.removeChannel(channel);
  }, []);

  useEffect(() => {
    document.title = waiting > 0 ? `(${waiting}) Admin` : "Admin";
  }, [waiting]);

  return (
    <nav aria-label="Admin sections" className="-mx-1 flex gap-1 overflow-x-auto px-1">
      {ITEMS.filter((i) => !i.owner || role === "owner").map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 flex-none items-center gap-1.5 rounded-md px-3 text-sm transition",
              active ? "bg-[var(--ink)] text-white" : "text-black/60 hover:bg-black/5 hover:text-black",
            )}
          >
            <i.icon className="h-4 w-4" />
            {i.label}
            {i.href === "/admin/inbox" && waiting > 0 && (
              <span className="ml-0.5 rounded-md bg-[#e5484d] px-1.5 text-[11px] font-semibold leading-[18px] text-white" aria-label={`${waiting} waiting for a person`}>
                {waiting}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
