import type { SupabaseClient } from "@supabase/supabase-js";

export type InboxConversation = {
  id: string;
  status: "open" | "waiting_human" | "human" | "closed";
  mode: "ai" | "human";
  assigned_to: string | null;
  taken_over_by: string | null;
  handoff_reason: string | null;
  page: string;
  last_preview: string | null;
  last_role: string | null;
  last_message_at: string;
  created_at: string;
  unread_count: number;
  message_count: number;
  visitor: { id: string; name: string | null; email: string | null; phone: string | null; company: string | null; created_at: string; consent_at: string | null } | null;
  lead: { id: string; score: number; temperature: "hot" | "warm" | "cold"; status: string; services: string[]; problem: string | null; budget: string | null; timeline: string | null } | null;
};

export type InboxMessage = {
  id: string;
  conversation_id: string;
  role: "visitor" | "ai" | "agent" | "system";
  content: string;
  author_id: string | null;
  sources: { title: string; url: string | null; type: string; similarity?: number }[];
  meta: { confidence?: number; public?: boolean; tools?: { tool: string }[] };
  created_at: string;
};

export type TeamMemberLite = { id: string; full_name: string; email: string; active: boolean };

const SELECT =
  "id, status, mode, assigned_to, taken_over_by, handoff_reason, page, last_preview, last_role, last_message_at, created_at, unread_count, message_count, visitor:visitors(id, name, email, phone, company, created_at, consent_at), lead:leads(id, score, temperature, status, services, problem, budget, timeline)";

type Row = Omit<InboxConversation, "lead" | "visitor"> & { visitor: InboxConversation["visitor"]; lead: InboxConversation["lead"][] | InboxConversation["lead"] };

const normalize = (rows: Row[]): InboxConversation[] => rows.map((r) => ({ ...r, lead: Array.isArray(r.lead) ? (r.lead[0] ?? null) : r.lead }));

/** Specific conversations by id (latest activity first), read as the signed-in team member (RLS). */
export async function fetchConversations(db: SupabaseClient, ids: string[]): Promise<InboxConversation[]> {
  if (!ids.length) return [];
  const { data } = await db.from("conversations").select(SELECT).in("id", ids).order("last_message_at", { ascending: false });
  return normalize((data ?? []) as unknown as Row[]);
}

export type InboxFilter = "all" | "waiting" | "human" | "ai" | "closed";
export const INBOX_FILTERS: InboxFilter[] = ["all", "waiting", "human", "ai", "closed"];
export const INBOX_PAGE_SIZE = 30;

/** Column rules per filter tab: [operator, column, value]. Mirrors `matchesFilter` below. */
const RULES: Record<InboxFilter, ["eq" | "neq", string, string][]> = {
  all: [["neq", "status", "closed"]],
  waiting: [["eq", "status", "waiting_human"]],
  human: [["eq", "mode", "human"], ["neq", "status", "closed"]],
  ai: [["eq", "mode", "ai"], ["eq", "status", "open"]],
  closed: [["eq", "status", "closed"]],
};

export const matchesFilter = (c: InboxConversation, f: InboxFilter) => RULES[f].every(([op, col, val]) => (c[col as "status" | "mode"] === val) === (op === "eq"));

const cleanSearch = (s?: string) => s?.trim().replace(/[%,()*\\]/g, " ").replace(/\s+/g, " ").slice(0, 80) ?? "";

/**
 * One page of the inbox list, newest activity first. Filtering and search run in the
 * database so the browser only ever holds a page or two. `before` is the cursor:
 * the `last_message_at` of the last row already loaded.
 */
export async function fetchConversationPage(
  db: SupabaseClient,
  { filter = "all", search, before }: { filter?: InboxFilter; search?: string; before?: string },
): Promise<{ items: InboxConversation[]; hasMore: boolean }> {
  let q = db.from("conversations").select(SELECT).order("last_message_at", { ascending: false }).limit(INBOX_PAGE_SIZE + 1);
  for (const [op, col, val] of RULES[filter]) q = op === "eq" ? q.eq(col, val) : q.neq(col, val);
  if (before) q = q.lt("last_message_at", before);

  const s = cleanSearch(search);
  if (s) {
    // Match the visitor's details or any message in the chat, then filter conversations by those ids.
    const [{ data: people }, { data: hits }] = await Promise.all([
      db.from("visitors").select("id").or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%`).limit(100),
      db.from("messages").select("conversation_id").ilike("content", `%${s}%`).order("created_at", { ascending: false }).limit(200),
    ]);
    const visitorIds = (people ?? []).map((p) => p.id as string);
    const convIds = [...new Set((hits ?? []).map((m) => m.conversation_id as string))];
    q = q.or(
      [`last_preview.ilike.%${s}%`, ...(visitorIds.length ? [`visitor_id.in.(${visitorIds.join(",")})`] : []), ...(convIds.length ? [`id.in.(${convIds.join(",")})`] : [])].join(","),
    );
  }

  const { data } = await q;
  const rows = normalize((data ?? []) as unknown as Row[]);
  return { items: rows.slice(0, INBOX_PAGE_SIZE), hasMore: rows.length > INBOX_PAGE_SIZE };
}

/** Tab counts, as cheap head-only count queries. */
export async function fetchInboxCounts(db: SupabaseClient): Promise<Record<InboxFilter, number>> {
  const counts = await Promise.all(
    INBOX_FILTERS.map(async (f) => {
      let q = db.from("conversations").select("id", { count: "exact", head: true });
      for (const [op, col, val] of RULES[f]) q = op === "eq" ? q.eq(col, val) : q.neq(col, val);
      const { count } = await q;
      return [f, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<InboxFilter, number>;
}

export const MESSAGE_PAGE_SIZE = 50;

/** The latest messages of a thread (oldest first), or the page before `before`. */
export async function fetchMessagePage(db: SupabaseClient, conversationId: string, before?: string): Promise<{ items: InboxMessage[]; hasMore: boolean }> {
  let q = db
    .from("messages")
    .select("id, conversation_id, role, content, author_id, sources, meta, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_PAGE_SIZE + 1);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  const rows = (data ?? []) as InboxMessage[];
  return { items: rows.slice(0, MESSAGE_PAGE_SIZE).reverse(), hasMore: rows.length > MESSAGE_PAGE_SIZE };
}

export const visitorLabel = (c: InboxConversation) => c.visitor?.name || c.visitor?.email || `Visitor ${c.visitor?.id.slice(0, 4).toUpperCase() ?? ""}`;
