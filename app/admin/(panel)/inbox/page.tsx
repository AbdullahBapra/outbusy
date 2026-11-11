import { InboxClient } from "@/components/admin/inbox/InboxClient";
import { fetchConversationPage, fetchConversations, fetchInboxCounts, type InboxFilter, type TeamMemberLite } from "@/components/admin/inbox/types";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseUser } from "@/lib/supabase/server";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const member = await requireAdmin();
  const db = await supabaseUser();
  const { c } = await searchParams;

  const counts = await fetchInboxCounts(db);
  // Open on "Needs human" when someone is waiting, so it's the first thing you see.
  const filter: InboxFilter = counts.waiting > 0 ? "waiting" : "all";
  const [page, { data: team }, linked] = await Promise.all([
    fetchConversationPage(db, { filter }),
    db.from("profiles").select("id, full_name, email, active").order("full_name"),
    c && /^[0-9a-f-]{36}$/.test(c) ? fetchConversations(db, [c]) : Promise.resolve([]),
  ]);

  return (
    <InboxClient
      me={member}
      initial={page}
      initialFilter={filter}
      initialCounts={counts}
      linked={linked[0] ?? null}
      team={(team ?? []) as TeamMemberLite[]}
    />
  );
}
