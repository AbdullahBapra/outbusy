"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Bot, CheckCircle2, ChevronDown, Hand, Loader2, MessageSquare, RotateCcw, Search, Send, Trash2, UserRound, X } from "lucide-react";
import type { TeamMember } from "@/lib/admin-auth";
import { api, ApiClientError } from "@/lib/api/client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import {
  fetchConversationPage,
  fetchConversations,
  fetchInboxCounts,
  fetchMessagePage,
  matchesFilter,
  visitorLabel,
  type InboxConversation,
  type InboxFilter as Filter,
  type InboxMessage,
  type TeamMemberLite,
} from "./types";

const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: "all", label: "All open", hint: "Every conversation that isn't closed" },
  { id: "waiting", label: "Needs human", hint: "The visitor asked for a person, or the AI wasn't sure" },
  { id: "human", label: "With team", hint: "A team member is replying; the AI is paused" },
  { id: "ai", label: "AI", hint: "The AI assistant is handling these" },
  { id: "closed", label: "Closed", hint: "Finished conversations" },
];

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const TEMP: Record<string, string> = { hot: "bg-[#e5484d]", warm: "bg-[#f5a524]", cold: "bg-black/20" };

function StatusPill({ c }: { c: InboxConversation }) {
  const [label, cls] =
    c.status === "waiting_human"
      ? ["Needs human", "bg-[#fdecec] text-[#c4262c]"]
      : c.status === "closed"
        ? ["Closed", "bg-black/5 text-black/50"]
        : c.mode === "human"
          ? ["With team", "bg-[var(--mint-100)] text-[var(--teal)]"]
          : ["AI", "bg-black/5 text-black/60"];
  return <span className={cn("inline-flex h-5 flex-none items-center rounded px-1.5 text-[11px] font-semibold leading-none", cls)}>{label}</span>;
}

/** Plays a short two-note chime (no audio file needed). */
function chime() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.32);
    });
  } catch {}
}

type Page = { items: InboxConversation[]; hasMore: boolean };

const byActivity = (a: InboxConversation, b: InboxConversation) => b.last_message_at.localeCompare(a.last_message_at);

const actionBtn = "flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition disabled:opacity-50";

export function InboxClient({
  me,
  initial,
  initialFilter,
  initialCounts,
  linked,
  team,
}: {
  me: TeamMember;
  initial: Page;
  initialFilter: Filter;
  initialCounts: Record<Filter, number>;
  linked: InboxConversation | null;
  team: TeamMemberLite[];
}) {
  const [conversations, setConversations] = useState(() => (linked && !initial.items.some((c) => c.id === linked.id) ? [linked, ...initial.items] : initial.items));
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [cursor, setCursor] = useState(initial.items.at(-1)?.last_message_at);
  const [loadingList, setLoadingList] = useState(false);
  const [counts, setCounts] = useState(initialCounts);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(linked?.id ?? initial.items[0]?.id);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [hasEarlier, setHasEarlier] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notifyOn, setNotifyOn] = useState(false);
  const selectedRef = useRef(selectedId);
  const threadBox = useRef<HTMLDivElement>(null);
  const listEnd = useRef<HTMLLIElement>(null);
  const lastMessageId = useRef<string | undefined>(undefined);
  const listRequest = useRef(0);
  const firstLoad = useRef(true);
  const countsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const names = useMemo(() => new Map(team.map((t) => [t.id, t.full_name || t.email])), [team]);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    setNotifyOn(typeof Notification !== "undefined" && Notification.permission === "granted");
  }, []);

  const selected = conversations.find((c) => c.id === selectedId);

  const refreshCounts = useCallback(() => {
    clearTimeout(countsTimer.current);
    countsTimer.current = setTimeout(() => void fetchInboxCounts(supabaseBrowser()).then(setCounts), 1200);
  }, []);

  const refreshOne = useCallback(async (id: string) => {
    const [row] = await fetchConversations(supabaseBrowser(), [id]);
    if (!row) return;
    setConversations((list) => [row, ...list.filter((c) => c.id !== id)].sort(byActivity));
    return row;
  }, []);

  // Tab or search changed: load the first page from the database.
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const req = ++listRequest.current;
    setLoadingList(true);
    const t = setTimeout(
      () =>
        void fetchConversationPage(supabaseBrowser(), { filter, search: query }).then((page) => {
          if (req !== listRequest.current) return;
          setConversations(page.items);
          setHasMore(page.hasMore);
          setCursor(page.items.at(-1)?.last_message_at);
          setLoadingList(false);
        }),
      query ? 300 : 0,
    );
    return () => clearTimeout(t);
  }, [filter, query]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingList || !cursor) return;
    const req = listRequest.current;
    setLoadingList(true);
    const page = await fetchConversationPage(supabaseBrowser(), { filter, search: query, before: cursor });
    if (req !== listRequest.current) return;
    setConversations((list) => [...list, ...page.items.filter((c) => !list.some((x) => x.id === c.id))]);
    setHasMore(page.hasMore);
    setCursor(page.items.at(-1)?.last_message_at ?? cursor);
    setLoadingList(false);
  }, [cursor, filter, hasMore, loadingList, query]);

  // Infinite scroll: fetch the next page as the end of the list comes into view.
  useEffect(() => {
    const el = listEnd.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  // Load the selected thread (its latest page of messages).
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoadingThread(true);
    void fetchMessagePage(supabaseBrowser(), selectedId).then((page) => {
      if (cancelled) return;
      setMessages(page.items);
      setHasEarlier(page.hasMore);
      setLoadingThread(false);
    });
    void api.inbox.markRead(selectedId).catch(() => {});
    setConversations((list) => list.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c)));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const loadEarlier = async () => {
    if (!selectedId || !messages[0]) return;
    const box = threadBox.current;
    const fromBottom = box ? box.scrollHeight - box.scrollTop : 0;
    setLoadingEarlier(true);
    const page = await fetchMessagePage(supabaseBrowser(), selectedId, messages[0].created_at);
    setMessages((list) => [...page.items, ...list]);
    setHasEarlier(page.hasMore);
    setLoadingEarlier(false);
    // Keep the reader's place instead of jumping to the bottom.
    requestAnimationFrame(() => {
      if (box) box.scrollTop = box.scrollHeight - fromBottom;
    });
  };

  // Scroll to the bottom only when a newer message arrives, not when older ones load.
  useEffect(() => {
    const last = messages.at(-1)?.id;
    if (last && last !== lastMessageId.current) threadBox.current?.scrollTo({ top: threadBox.current.scrollHeight });
    lastMessageId.current = last;
  }, [messages]);

  // Live updates: new messages and conversation changes.
  useEffect(() => {
    const db = supabaseBrowser();
    const channel = db
      .channel("inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as InboxMessage;
        if (m.conversation_id === selectedRef.current) {
          setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list, m]));
          if (m.role === "visitor") void api.inbox.markRead(m.conversation_id).catch(() => {});
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, async (payload) => {
        const id = (payload.new as { id?: string })?.id;
        if (!id) return;
        const before = (payload.old as { status?: string })?.status;
        refreshCounts();
        const row = await refreshOne(id);
        if (row?.status === "waiting_human" && before !== "waiting_human") {
          chime();
          if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
            new Notification("A visitor needs a person", { body: `${visitorLabel(row)}: ${row.last_preview ?? ""}`, tag: row.id });
          }
        }
      })
      .subscribe();
    return () => {
      clearTimeout(countsTimer.current);
      void db.removeChannel(channel);
    };
  }, [refreshCounts, refreshOne]);

  // Live updates can bring in rows from other tabs; hide them, but keep the open one.
  const visible = useMemo(() => conversations.filter((c) => matchesFilter(c, filter) || c.id === selectedId), [conversations, filter, selectedId]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    if (!selected) return;
    setBusy(label);
    setError("");
    try {
      await fn();
      await refreshOne(selected.id);
      refreshCounts();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    const text = reply.trim();
    if (!text || !selected) return;
    await run("reply", async () => {
      await api.inbox.reply(selected.id, text);
      setReply("");
    });
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    setNotifyOn((await Notification.requestPermission()) === "granted");
  };

  const handlerName = selected?.taken_over_by ? (selected.taken_over_by === me.id ? "you" : names.get(selected.taken_over_by)) : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-black/55">Every visitor conversation, live. Join any chat and the AI steps back until you return it.</p>
        </div>
        {!notifyOn && (
          <button type="button" onClick={enableNotifications} className={cn(actionBtn, "border border-black/15 text-black/70 hover:border-black")}>
            <Bell className="h-4 w-4" /> Turn on desktop alerts
          </button>
        )}
      </div>

      <div className="mt-5 grid h-[calc(100vh-14rem)] min-h-[560px] grid-cols-[320px_minmax(0,1fr)_270px] overflow-hidden rounded-lg border border-black/[0.08] bg-white max-xl:grid-cols-[300px_minmax(0,1fr)] max-md:h-auto max-md:grid-cols-1">
        {/* ---------- List ---------- */}
        <aside className={cn("flex min-h-0 flex-col border-r border-black/[0.07]", selected && "max-md:hidden")}>
          <div className="space-y-2.5 border-b border-black/[0.07] p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, message"
                className="h-9 w-full rounded-md border border-black/10 pl-8 pr-3 text-[13px] outline-none focus:border-[var(--teal)]"
              />
            </label>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  title={f.hint}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium transition",
                    filter === f.id ? "bg-[var(--ink)] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]",
                    f.id === "waiting" && counts.waiting > 0 && filter !== f.id && "bg-[#fdecec] text-[#c4262c]",
                  )}
                >
                  {f.label}
                  <span className={cn("tabular-nums", filter === f.id ? "text-white/60" : "opacity-60")}>{counts[f.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 && !loadingList && <li className="p-6 text-center text-[13px] text-black/45">{query ? "No conversations match your search." : "No conversations here."}</li>}
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "relative block w-full border-b border-black/[0.05] px-3.5 py-2.5 text-left transition",
                    c.id === selectedId ? "bg-[var(--mint-50)] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[var(--teal)]" : "hover:bg-black/[0.02]",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {c.lead && <span className={cn("h-2 w-2 flex-none rounded-full", TEMP[c.lead.temperature])} title={`${c.lead.temperature} lead`} />}
                    <span className={cn("min-w-0 flex-1 truncate text-[13.5px]", c.unread_count ? "font-semibold" : "font-medium")}>{visitorLabel(c)}</span>
                    <span className="flex-none text-[11px] text-black/40">{timeAgo(c.last_message_at)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-black/55">
                      {c.last_role === "ai" ? "AI: " : c.last_role === "agent" ? "Team: " : ""}
                      {c.last_preview ?? "…"}
                    </span>
                    {c.unread_count > 0 && <span className="flex h-[18px] min-w-[18px] flex-none items-center justify-center rounded bg-[var(--teal)] px-1 text-[11px] font-semibold leading-none text-white">{c.unread_count}</span>}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5">
                    <StatusPill c={c} />
                    {c.assigned_to && <span className="truncate text-[11px] text-black/45">Assigned to {c.assigned_to === me.id ? "you" : names.get(c.assigned_to)}</span>}
                  </span>
                </button>
              </li>
            ))}
            {hasMore && (
              <li ref={listEnd} className="p-3">
                <button type="button" onClick={() => void loadMore()} disabled={loadingList} className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md text-[12px] text-black/55 hover:bg-black/[0.04]">
                  {loadingList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Load more conversations"}
                </button>
              </li>
            )}
            {loadingList && !hasMore && (
              <li className="flex justify-center p-4 text-black/40">
                <Loader2 className="h-4 w-4 animate-spin" />
              </li>
            )}
          </ul>
        </aside>

        {/* ---------- Thread ---------- */}
        <section className={cn("flex min-h-0 flex-col", !selected && "max-md:hidden")}>
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-black/45">
              <MessageSquare className="h-7 w-7" />
              <p className="mt-3 text-[13px]">Pick a conversation on the left to read it.</p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center gap-2 border-b border-black/[0.07] px-4 py-2.5">
                <button type="button" onClick={() => setSelectedId(undefined)} className="hidden h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 max-md:flex" aria-label="Back to list">
                  <X className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[15px] font-semibold">{visitorLabel(selected)}</h2>
                    <StatusPill c={selected} />
                  </div>
                  <p className="truncate text-[12px] text-black/45">
                    {selected.mode === "human" ? `Handled by ${handlerName ?? "the team"} · the AI is paused` : "The AI assistant is replying"}
                    {selected.page && ` · on ${selected.page}`}
                  </p>
                </div>
                {selected.mode === "ai" && selected.status !== "closed" && (
                  <button
                    type="button"
                    disabled={!!busy}
                    title="Reply yourself. The AI stops answering in this chat."
                    onClick={() => run("takeover", () => api.inbox.takeOver(selected.id))}
                    className={cn(actionBtn, "bg-[var(--ink)] text-white hover:bg-black/80")}
                  >
                    {busy === "takeover" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hand className="h-4 w-4" />}
                    {selected.status === "waiting_human" ? "Take over" : "Join chat"}
                  </button>
                )}
                {selected.mode === "human" && (
                  <button
                    type="button"
                    disabled={!!busy}
                    title="Hand the chat back. The AI answers the visitor again."
                    onClick={() => run("release", () => api.inbox.release(selected.id))}
                    className={cn(actionBtn, "border border-black/15 hover:border-black")}
                  >
                    {busy === "release" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                    Return to AI
                  </button>
                )}
                <label className="relative" title="Who on the team owns this chat">
                  <span className="sr-only">Assign to</span>
                  <select
                    value={selected.assigned_to ?? ""}
                    disabled={!!busy}
                    onChange={(e) => run("assign", () => api.inbox.update(selected.id, { assignedTo: e.target.value || null }))}
                    className="h-8 appearance-none rounded-md border border-black/15 bg-white pl-2.5 pr-7 text-[13px] outline-none"
                  >
                    <option value="">Unassigned</option>
                    {team.filter((t) => t.active).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id === me.id ? "Assigned to me" : t.full_name || t.email}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40" />
                </label>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => run("close", () => api.inbox.update(selected.id, { status: selected.status === "closed" ? "open" : "closed" }))}
                  className={cn(actionBtn, "text-black/60 hover:bg-black/5")}
                >
                  {selected.status === "closed" ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {selected.status === "closed" ? "Reopen" : "Close"}
                </button>
              </header>

              <div ref={threadBox} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#fafbfb] px-4 py-4">
                {loadingThread ? (
                  <div className="flex justify-center py-10 text-black/40">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <>
                    {hasEarlier && (
                      <div className="flex justify-center">
                        <button type="button" onClick={() => void loadEarlier()} disabled={loadingEarlier} className="flex h-7 items-center gap-1.5 rounded-md bg-white px-3 text-[12px] text-black/55 ring-1 ring-black/[0.08] hover:text-black">
                          {loadingEarlier && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Load earlier messages
                        </button>
                      </div>
                    )}
                    {messages.map((m) =>
                      m.role === "system" ? (
                        <p key={m.id} className="text-center text-[12px] text-black/45">
                          {m.content} · {timeAgo(m.created_at)}
                        </p>
                      ) : (
                        <div key={m.id} className={cn("flex", m.role === "visitor" ? "justify-start" : "justify-end")}>
                          <div className="max-w-[78%]">
                            <div className={cn("mb-1 px-0.5 text-[11px] text-black/45", m.role !== "visitor" && "text-right")}>
                              {m.role === "visitor" ? visitorLabel(selected) : m.role === "ai" ? "AI assistant" : (names.get(m.author_id ?? "") ?? "Team")} · {timeAgo(m.created_at)}
                            </div>
                            <p
                              className={cn(
                                "whitespace-pre-line break-words rounded-lg px-3 py-2 text-[13.5px] leading-[1.55]",
                                m.role === "visitor" ? "rounded-tl-sm bg-white ring-1 ring-black/[0.08]" : m.role === "ai" ? "rounded-tr-sm bg-[#eef1f1]" : "rounded-tr-sm bg-[var(--ink)] text-white",
                              )}
                            >
                              {m.content}
                            </p>
                            {m.role === "ai" && m.sources?.length > 0 && (
                              <details className="mt-1 px-0.5 text-right text-[11px] text-black/45">
                                <summary className="cursor-pointer list-none" title="Knowledge base entries the AI used for this answer">
                                  Based on {m.sources.length} source{m.sources.length > 1 ? "s" : ""}
                                  {typeof m.meta?.confidence === "number" && ` · ${(m.meta.confidence * 100).toFixed(0)}% match`}
                                </summary>
                                <ul className="mt-1 space-y-0.5">
                                  {m.sources.map((s, i) => (
                                    <li key={i}>
                                      {s.url ? (
                                        <Link href={s.url} target="_blank" className="underline underline-offset-2">
                                          {s.title}
                                        </Link>
                                      ) : (
                                        s.title
                                      )}{" "}
                                      <span className="opacity-70">({s.type})</span>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </>
                )}
              </div>

              {error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-[13px] text-red-700">{error}</p>}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="border-t border-black/[0.07] p-3"
              >
                <div className="flex items-end gap-2 rounded-md border border-black/15 py-1 pl-3 pr-1 focus-within:border-[var(--ink)]">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={2}
                    maxLength={4000}
                    disabled={selected.status === "closed"}
                    placeholder={selected.status === "closed" ? "Reopen the conversation to reply" : selected.mode === "human" ? "Reply to the visitor (Enter to send, Shift+Enter for a new line)" : "Reply as yourself (this takes over from the AI)"}
                    className="min-h-[40px] flex-1 resize-none bg-transparent py-1.5 text-[13.5px] outline-none placeholder:text-black/35"
                  />
                  <button type="submit" disabled={!reply.trim() || !!busy} aria-label="Send reply" className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ink)] text-white disabled:opacity-30">
                    {busy === "reply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

        {/* ---------- Details ---------- */}
        {selected && (
          <aside className="min-h-0 space-y-5 overflow-y-auto border-l border-black/[0.07] p-4 max-xl:hidden">
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">Visitor</h3>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[var(--mint-100)] text-[var(--teal)]">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold">{visitorLabel(selected)}</div>
                  <div className="text-[12px] text-black/45">First seen {selected.visitor ? new Date(selected.visitor.created_at).toLocaleDateString() : "–"}</div>
                </div>
              </div>
              <dl className="mt-3 space-y-1 text-[13px]">
                {[
                  ["Email", selected.visitor?.email],
                  ["Phone", selected.visitor?.phone],
                  ["Company", selected.visitor?.company],
                  ["Consent", selected.visitor?.consent_at ? new Date(selected.visitor.consent_at).toLocaleString() : null],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-16 flex-none text-black/45">{k}</dt>
                    <dd className="min-w-0 break-words">{v || <span className="text-black/30">–</span>}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">Lead</h3>
              {selected.lead ? (
                <div className="mt-2 rounded-md border border-black/[0.08] p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold capitalize">
                      <span className={cn("h-2 w-2 rounded-full", TEMP[selected.lead.temperature])} />
                      {selected.lead.temperature} · score {selected.lead.score}
                    </span>
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-[11px] capitalize text-black/60">{selected.lead.status}</span>
                  </div>
                  <dl className="mt-2 space-y-1.5 text-[12.5px]">
                    {[
                      ["Needs", selected.lead.services?.join(", ")],
                      ["Problem", selected.lead.problem],
                      ["Budget", selected.lead.budget],
                      ["Timeline", selected.lead.timeline],
                    ].map(([k, v]) =>
                      v ? (
                        <div key={k}>
                          <dt className="text-black/45">{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ) : null,
                    )}
                  </dl>
                  <Link href={`/admin/leads?l=${selected.lead.id}`} className="mt-3 block text-[12.5px] font-medium text-[var(--teal)] hover:underline">
                    Open lead →
                  </Link>
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-black/45">No lead details yet. The AI fills these in as the visitor shares them.</p>
              )}
            </section>

            {selected.handoff_reason && (
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">Why a human was asked</h3>
                <p className="mt-1 text-[13px] capitalize">{selected.handoff_reason.replace(/_/g, " ")}</p>
              </section>
            )}

            {me.role === "owner" && selected.visitor && (
              <section className="border-t border-black/[0.07] pt-4">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => {
                    if (!selected.visitor || !confirm("Delete this visitor's chats, messages and leads permanently? This can't be undone.")) return;
                    const vid = selected.visitor.id;
                    void run("delete", async () => {
                      await api.inbox.deleteVisitor(vid);
                      setConversations((list) => list.filter((c) => c.visitor?.id !== vid));
                      setSelectedId(undefined);
                    });
                  }}
                  className="flex items-center gap-1.5 text-[12.5px] text-red-600 hover:underline disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete visitor data
                </button>
                <p className="mt-1 text-[11px] leading-[1.45] text-black/40">For privacy requests. Removes everything stored about them.</p>
              </section>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
