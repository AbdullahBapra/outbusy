"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Loader2, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { Kirby, type AnimationName, type AvatarHandle } from "@/components/avatar/kirby";
import { brand } from "@/content/brand";
import { hotLeadChip, pageNudges, sectionNudges, starterChips } from "@/content/assistant";
import { cn } from "@/lib/utils";
import { tokenizeInline } from "@/lib/markdown";
import { useReaction, useScrollMilestones, useVisitorActivity, type Milestone } from "./useVisitorActivity";
import { useSiteInteractions, type SectionTopic, type SiteSignal, type Target } from "./useSiteInteractions";
import { levelOf, useInterest, type InterestLevel } from "./useInterest";
import { useVisitorMemory } from "./useVisitorMemory";
import { useGesture } from "./useGesture";
import { useSound } from "./useSound";
import { useCalm } from "./useCalm";
import { useNudges } from "./useNudges";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { getChatStatus, getConversation, sendChatMessage, type ConversationSnapshot } from "./chatClient";

type Mode = "chat" | "form";
type Step = "name" | "interest" | "email" | "message" | "sending" | "done" | "error";
type Status = "idle" | "sending" | "done" | "error";
/**
 * `raw` is what was actually said (AI replies include a trailing [[mood|chips]] tag).
 * "agent" is a team member replying in person; "note" is a small status line (e.g. "Sara joined").
 */
type Message = { id: number; from: "kirby" | "user" | "agent" | "note"; text: string; raw?: string; author?: string };
/** Who is answering the visitor right now. */
type Handler = "ai" | "waiting" | "human";
type Lead = { name: string; email: string; interest: string; message: string };

const INTERESTS = ["Lead follow-up", "AI receptionist", "Website chatbot", "Workflow automation", "Not sure yet"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PICK_UP_CHIP = "Pick up where I left off";
const GLANCED_PATHS_KEY = "kirby-glanced-paths";
/** When Kirby glances at a new page's headline (after any peek-in has finished). */
const GLANCE_DELAY_MS = 2600;
const GLANCE_HOLD_MS = 1700;
/** Seconds of *visible* time on a page before its page-specific bubble is offered. */
const PAGE_NUDGE_DELAY_MS = 8000;
/** How long the visitor stays on a section before its section bubble is offered. */
const SECTION_DWELL_MS = 2500;

/** Bubble priorities (higher wins when several are waiting). See useNudges for the rules. */
const PRIORITY = { exit: 6, help: 5, welcome: 4, page: 3, section: 2, milestone: 1 } as const;

const MILESTONE_BUBBLES: Partial<Record<Milestone, { text: string; mood: AnimationName }>> = {
  50: { mood: "curious", text: "Seeing something you'd like to automate? Ask me." },
  100: { mood: "proud", text: "You made it to the end. Want a free automation plan?" },
};

/**
 * How Kirby reacts to what the visitor does, and how much it says about their interest:
 * [mood, duration ms, interest points, per-key cooldown ms].
 */
const HOVER: Record<Target, [AnimationName, number, number, number]> = {
  audit: ["excited", 2200, 3, 20_000],
  cta: ["excited", 1600, 1.5, 10_000],
  link: ["curious", 1200, 0.3, 4_000],
};
const CLICK: Record<Target, [AnimationName, number, number, number]> = {
  audit: ["celebrate", 3200, 12, 30_000],
  cta: ["happy", 1800, 5, 10_000],
  link: ["happy", 1400, 2, 5_000],
};
const SECTION: Record<SectionTopic, [AnimationName, number]> = {
  pricing: ["excited", 4],
  results: ["proud", 3],
  contact: ["happy", 3],
  faq: ["thinking", 2],
  process: ["curious", 2],
  industries: ["curious", 2],
  services: ["curious", 1],
};
/** Pages that signal buying intent when visited. */
const HIGH_INTENT = /^\/(pricing|contact|free-audit|case-studies|roi-calculator)(\/|$)/;
/** Kirby's resting face for each interest level: drifting away → sad, hot lead → excited. */
const RESTING: Record<InterestLevel, AnimationName> = { cold: "sad", neutral: "idle", warm: "happy", hot: "excited" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const typingDelay = (text: string) => Math.min(450 + text.length * 14, 1500);

/** POST /api/leads. Throws with a readable message on failure. */
async function sendLead(lead: Lead, startedAt: number, honeypot: string, score: number) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, page: window.location.pathname, elapsedMs: Date.now() - startedAt, website: honeypot, score: Math.round(score) }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "Something went wrong. Please try again.");
  }
}

const AI_MOODS = new Set<AnimationName>(["happy", "excited", "curious", "thinking", "proud", "shy", "confused", "sad", "celebrate", "playful", "surprised"]);

/** Hides the assistant's trailing [[mood:…|chips:…]] line, including while it's still streaming in. */
const visibleText = (raw: string) => raw.replace(/\[\[[^\]]*\]\]/g, "").split("[[")[0].trim();

function parseUiTag(raw: string): { mood: AnimationName | null; chips: string[] } {
  const last = [...raw.matchAll(/\[\[mood:([a-z]+)\|chips:([^\]]*)\]\]/g)].at(-1);
  if (!last) return { mood: null, chips: [] };
  const mood = AI_MOODS.has(last[1] as AnimationName) ? (last[1] as AnimationName) : null;
  const chips = last[2]
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c && c.length <= 40)
    .slice(0, 3);
  return { mood, chips };
}

/** Renders **bold**, *italic* and [links](url) in assistant replies. */
function RichText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  return (
    <>
      {tokenizeInline(text).map((t, i) => {
        if (t.kind === "bold") return <strong key={i} className="font-semibold">{t.text}</strong>;
        if (t.kind === "italic") return <em key={i}>{t.text}</em>;
        if (t.kind === "link") {
          return t.href.startsWith("/") ? (
            <Link key={i} href={t.href} onClick={onNavigate} className="font-medium text-[var(--teal)] underline underline-offset-2">
              {t.text}
            </Link>
          ) : (
            <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--teal)] underline underline-offset-2">
              {t.text}
            </a>
          );
        }
        return t.text;
      })}
    </>
  );
}

/**
 * Floating "Kirby" assistant: an animated avatar that reacts to how the visitor uses the
 * site, and opens a panel with a short guided chat or a plain form. Leads go to /api/leads.
 */
export function KirbyAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [hoverLauncher, setHoverLauncher] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("name");
  const [kirbyTyping, setKirbyTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [input, setInput] = useState("");
  const [customInterest, setCustomInterest] = useState(false);
  const [hint, setHint] = useState("");

  // Form
  const [form, setForm] = useState<Lead>({ name: "", email: "", interest: "", message: "" });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Lead, string>>>({});
  const [formStatus, setFormStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");

  const [celebrating, setCelebrating] = useState(false);

  // AI chat (when ANTHROPIC_API_KEY is configured on the server)
  const [ai, setAi] = useState<boolean | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const messagesRef = useRef<Message[]>([]);
  /** The stored conversation this chat belongs to (created by the server on the first message). */
  const conversationId = useRef<string | undefined>(undefined);
  const [handler, setHandler] = useState<Handler>("ai");
  const [agentName, setAgentName] = useState<string | undefined>(undefined);
  /** Newest server message time and the ids already shown, for picking up team replies. */
  const lastServerAt = useRef<string | undefined>(undefined);
  const seenServerIds = useRef(new Set<string>());

  const answers = useRef<Lead>({ name: "", interest: "", email: "", message: "" });
  const nextId = useRef(1);
  const openedAt = useRef(0);
  const started = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef<HTMLSpanElement>(null);
  const headerAvatarRef = useRef<HTMLSpanElement>(null);
  const launcherKirby = useRef<AvatarHandle>(null);
  const headerKirby = useRef<AvatarHandle>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** The visitor sent a lead: no more nudges this visit. */
  const converted = useRef(false);
  /** The section in the middle of the screen, and the timer that offers its bubble. */
  const currentSection = useRef<SectionTopic | null>(null);
  const sectionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const panelRef = useRef<HTMLElement>(null);
  const launcherButton = useRef<HTMLButtonElement>(null);
  /** A question to send once the chat has finished greeting (from a clicked bubble). */
  const pendingPrompt = useRef("");
  /** What a chip sends when its label differs from the message (e.g. "Pick up where I left off"). */
  const chipPayload = useRef(new Map<string, string>());
  /** While a glance is playing, cursor tracking pauses until this time. */
  const glanceUntil = useRef(0);
  const lastPointerAt = useRef(0);

  const { attention, scrollMode } = useVisitorActivity();
  const { reaction, react, clear: clearReaction } = useReaction<AnimationName>();
  const interest = useInterest();
  const currentInterest = interest.current;
  const pathname = usePathname();
  const { returning } = useVisitorMemory(pathname, interest.score);
  const { enabled: soundOn, toggle: toggleSound, play } = useSound();
  const { isBusy } = useCalm(rootRef);
  const reducedMotion = usePrefersReducedMotion();

  // Screen-reader announcements: one polite live region, re-announced even when text repeats.
  const [announcement, setAnnouncement] = useState({ text: "", n: 0 });
  const announce = useCallback((text: string) => setAnnouncement((a) => ({ text, n: a.n + 1 })), []);

  // ---------- Speech bubbles (see useNudges for the scheduling rules) ----------
  const nudges = useNudges<AnimationName>({
    pathname,
    canShow: () => !open && !converted.current,
    isBusy,
    onShow: (m) => react(m, 3200),
  });
  const bubble = nudges.bubble;

  // The back-to-top button shares this corner; it steps aside while a bubble is showing.
  useEffect(() => {
    const root = document.documentElement;
    if (bubble && !open) root.dataset.kirbyBubble = "";
    else delete root.dataset.kirbyBubble;
    return () => {
      delete root.dataset.kirbyBubble;
    };
  }, [bubble, open]);

  useScrollMilestones((m) => {
    interest.add(2, `milestone:${m}:${window.location.pathname}`, 10 * 60_000);
    const b = MILESTONE_BUBBLES[m];
    if (b) nudges.request({ id: `milestone-${m}`, ...b, priority: PRIORITY.milestone, onceKey: `milestone:${m}:${window.location.pathname}`, ttlMs: 20_000 });
  });

  // ---------- What the visitor does on the site ----------
  const onSignal = (signal: SiteSignal) => {
    switch (signal.kind) {
      case "hover":
      case "click": {
        const [mood, ms, points, cooldown] = (signal.kind === "hover" ? HOVER : CLICK)[signal.target];
        interest.add(points, `${signal.kind}:${signal.target}`, cooldown);
        if (!open) react(mood, ms);
        return;
      }
      case "section": {
        const [mood, points] = SECTION[signal.topic];
        interest.add(points, `section:${signal.topic}:${window.location.pathname}`, 5 * 60_000);
        if (!open) react(mood, 2400);
        const topic = signal.topic;
        currentSection.current = topic;
        clearTimeout(sectionTimer.current);
        sectionTimer.current = setTimeout(() => {
          if (currentSection.current !== topic) return; // they scrolled on
          const n = sectionNudges[topic];
          nudges.request({ id: "section", text: n.text, prompt: n.prompt || undefined, mood: n.mood, priority: PRIORITY.section, onceKey: `section:${topic}`, ttlMs: 20_000 });
        }, SECTION_DWELL_MS);
        return;
      }
      case "select-text":
        interest.add(2, "select", 10_000);
        if (!open) react("thinking", 2600);
        return;
      case "copy":
        interest.add(4, "copy", 10_000);
        if (!open) react("proud", 2200);
        return;
      case "rage-click":
        interest.add(-4);
        nudges.request({ id: "help", text: "Something not working? I can help.", mood: "confused", priority: PRIORITY.help, urgent: true, ttlMs: 10_000 });
        return;
      case "exit-intent":
        interest.add(-6, "exit", 30_000);
        nudges.request({ id: "exit", text: "Before you go: want a free plan for what to automate first?", mood: "sad", priority: PRIORITY.exit, urgent: true, onceKey: "exit", ttlMs: 8_000 });
        return;
    }
  };

  /** Eyes and head follow the cursor (or look straight back at the visitor when it rests). */
  const onPointer = (p: { x: number; y: number } | null) => {
    if (p) lastPointerAt.current = Date.now();
    if (reducedMotion || Date.now() < glanceUntil.current) return;
    const aim = (el: HTMLElement | null, kirby: AvatarHandle | null) => {
      if (!el || !kirby) return;
      if (!p) return kirby.lookAt(0, 0);
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      kirby.lookAt(clamp((p.x - (r.left + r.width / 2)) / 420), clamp((p.y - (r.top + r.height / 2)) / 320));
    };
    aim(lookRef.current, launcherKirby.current);
    aim(headerAvatarRef.current, headerKirby.current);
  };

  const { fieldFocused } = useSiteInteractions(onSignal, onPointer, rootRef);

  // Time on site: engaged minutes slowly build interest, drifting off loses it.
  const addInterest = interest.add;
  useEffect(() => {
    const t = setInterval(() => {
      if (attention === "active") addInterest(0.4);
      else if (attention !== "waking") addInterest(-1.5);
    }, 10_000);
    return () => clearInterval(t);
  }, [attention, addInterest]);

  // Visiting pages that signal buying intent.
  useEffect(() => {
    if (HIGH_INTENT.test(pathname)) {
      interest.add(8, `page:${pathname}`, 10 * 60_000);
      react("excited", 2600);
    } else if (/^\/blog\/./.test(pathname)) {
      interest.add(3, `page:${pathname}`, 10 * 60_000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react to navigation only
  }, [pathname]);

  // Kirby glances at a new page: headline first, then (on the home page) the stats strip.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const glance = (el: Element) => {
      const anchor = lookRef.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!anchor) return;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      launcherKirby.current?.lookAt(clamp((r.left + r.width / 2 - (anchor.left + anchor.width / 2)) / 420), clamp((r.top + r.height / 2 - (anchor.top + anchor.height / 2)) / 320));
    };
    const visible = (el: Element | null): el is Element => {
      const r = el?.getBoundingClientRect();
      return !!r && r.bottom > 0 && r.top < window.innerHeight;
    };
    timers.push(
      setTimeout(() => {
        let glanced: string[] = [];
        try {
          glanced = JSON.parse(sessionStorage.getItem(GLANCED_PATHS_KEY) ?? "[]") as string[];
        } catch {}
        const headline = document.querySelector("main h1");
        // Skip if already done here, motion is reduced, the chat is open, or the mouse is busy.
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (glanced.includes(pathname) || reduce || open || !visible(headline) || Date.now() - lastPointerAt.current < 1500) return;
        try {
          sessionStorage.setItem(GLANCED_PATHS_KEY, JSON.stringify([...glanced, pathname].slice(-50)));
        } catch {}

        const stats = document.querySelector("main section .marquee-wrap");
        glanceUntil.current = Date.now() + GLANCE_HOLD_MS * (visible(stats) ? 2 : 1) + 200;
        glance(headline);
        react("curious", GLANCE_HOLD_MS);
        if (visible(stats)) {
          timers.push(
            setTimeout(() => {
              glance(stats);
              react("surprised", GLANCE_HOLD_MS);
            }, GLANCE_HOLD_MS),
          );
        }
        // Then back to looking at the visitor.
        timers.push(setTimeout(() => launcherKirby.current?.lookAt(0, 0), glanceUntil.current - Date.now()));
      }, GLANCE_DELAY_MS),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per page
  }, [pathname]);

  // ---------- Mood: what Kirby feels right now ----------
  const sending = step === "sending" || formStatus === "sending";
  const failed = (mode === "chat" && step === "error") || (mode === "form" && formStatus === "error");
  const done = (mode === "chat" && step === "done") || (mode === "form" && formStatus === "done");

  const mood: AnimationName = (() => {
    if (attention === "waking") return "waking";
    if (!open) {
      if (hoverLauncher) return "curious";
      if (reaction) return reaction;
      if (attention === "asleep") return "sleeping";
      if (attention === "drowsy") return "drowsy";
      if (attention === "bored") return "bored";
      if (fieldFocused) return "listening";
      if (scrollMode === "fast") return "searching";
      if (scrollMode === "up") return "curious";
      if (scrollMode === "reading") return "listening";
      if (bubble) return "playful";
      return RESTING[interest.level];
    }
    if (reaction) return reaction;
    if (celebrating) return "celebrate";
    if (sending) return "working";
    if (failed || hoverClose) return "sad";
    if (greeting) return "happy";
    if (kirbyTyping) return "thinking";
    if (aiStreaming) return "curious";
    if (userTyping) return "listening";
    if (attention === "asleep") return "sleeping";
    if (attention === "drowsy") return "drowsy";
    if (attention === "bored") return "bored";
    if (done) return "happy";
    return input ? "curious" : interest.level === "cold" ? "idle" : RESTING[interest.level];
  })();

  const { gesture, onGestureEnd } = useGesture(mood);
  /** Clears the gesture when its own animation ends (not a child's). */
  const endGesture = (e: React.AnimationEvent) => {
    if (e.target === e.currentTarget) onGestureEnd();
  };
  const bodyGesture = gesture && gesture !== "peek" ? `kirby-g-${gesture}` : undefined;

  // ---------- Chat ----------
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const push = (from: Message["from"], text: string) => setMessages((m) => [...m, { id: nextId.current++, from, text }]);

  const say = useCallback(async (...lines: string[]) => {
    setSpeaking(true);
    for (const [i, line] of lines.entries()) {
      setKirbyTyping(true);
      await wait(typingDelay(line));
      setKirbyTyping(false);
      setMessages((m) => [...m, { id: nextId.current++, from: "kirby", text: line }]);
      play("pop");
      announce(line);
      if (i < lines.length - 1) await wait(180);
    }
    setSpeaking(false);
  }, [play, announce]);

  const firstName = (name: string) => name.split(/\s+/)[0] || "there";

  const startChat = useCallback(async () => {
    started.current = true;
    setGreeting(true);
    const hello = returning ? (returning.topic ? `Welcome back! Last time you looked at ${returning.topic}.` : "Welcome back! Good to see you again.") : `Hi, welcome to ${brand.name}.`;
    await say(hello, "Tell me a little about your business and we'll send you a free plan for what to automate first.", "What's your name?");
    setGreeting(false);
  }, [say, returning]);

  const startAi = useCallback(async () => {
    started.current = true;
    setGreeting(true);
    const starters = starterChips[levelOf(currentInterest())];
    if (returning?.topic) {
      await say("Welcome back!", `Last time you were looking at ${returning.topic}. Want to pick up where you left off?`);
      chipPayload.current.set(PICK_UP_CHIP, `Tell me more about ${returning.topic}`);
      setGreeting(false);
      setChips([PICK_UP_CHIP, ...starters.slice(0, 2)]);
      return;
    }
    await say(
      returning ? "Welcome back! Good to see you again." : `Hi, welcome to ${brand.name}.`,
      "Ask me anything about automating your business, or tell me what's taking up your team's time.",
    );
    setGreeting(false);
    setChips(starters);
  }, [say, currentInterest, returning]);

  /** Shows a stored conversation again (returning visitor), including who is handling it. */
  const restore = useCallback((snap: ConversationSnapshot) => {
    const restored: Message[] = [];
    for (const m of snap.messages) {
      seenServerIds.current.add(m.id);
      lastServerAt.current = m.createdAt;
      if (m.role === "system") continue;
      restored.push({ id: nextId.current++, from: m.role === "visitor" ? "user" : m.role === "agent" ? "agent" : "kirby", text: m.content, raw: m.content, author: m.author });
    }
    restored.push({ id: nextId.current++, from: "note", text: "Welcome back. Your conversation is below." });
    setMessages(restored);
    setHandler(snap.mode === "human" ? "human" : snap.status === "waiting_human" ? "waiting" : "ai");
    setAgentName(snap.agent);
  }, []);

  /** First open: ask the server whether the AI assistant is on, restore an open chat, or greet. */
  const begin = useCallback(async () => {
    started.current = true;
    const status = await getChatStatus();
    setAi(status.enabled);
    if (!status.enabled) return startChat();
    if (status.conversation) {
      const snap = await getConversation(status.conversation.id).catch(() => null);
      if (snap && snap.messages.some((m) => m.role === "visitor")) {
        conversationId.current = status.conversation.id;
        restore(snap);
        return;
      }
    }
    await startAi();
  }, [startAi, startChat, restore]);

  const sendAi = async (raw: string) => {
    const text = raw.trim();
    if (!text || aiBusy || speaking) return;
    if (text === "Use the form instead") {
      setMode("form");
      return;
    }
    setInput("");
    setChips([]);
    setHint("");
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text, raw: text }]);
    setAiBusy(true);
    setKirbyTyping(true);

    const replyId = nextId.current++;
    let reply = "";
    let teamNotified = false;
    let replyUi: { mood: string | null; chips: string[] } = { mood: null, chips: [] };
    const appendReply = (delta: string) => {
      if (!reply) play("pop");
      setKirbyTyping(false);
      setAiStreaming(true);
      reply += delta;
      const shown = visibleText(reply);
      const raw = reply;
      setMessages((m) =>
        m.some((x) => x.id === replyId) ? m.map((x) => (x.id === replyId ? { ...x, text: shown, raw } : x)) : [...m, { id: replyId, from: "kirby", text: shown, raw }],
      );
    };

    try {
      await sendChatMessage(
        { message: text, conversationId: conversationId.current, page: window.location.pathname, score: Math.round(interest.current()) },
        {
          onText: appendReply,
          onConversation: (c) => {
            conversationId.current = c.id;
            if (c.mode === "human") setHandler("human");
          },
          onHandoff: (h) => {
            if (h.state === "human") {
              setHandler("human");
              if (h.agent) setAgentName(h.agent);
            } else {
              teamNotified = true;
              setHandler((cur) => (cur === "human" ? cur : "waiting"));
            }
          },
          onLead: (l) => {
            if (l.saved && l.contact) celebrate();
            else if (!l.saved) {
              react("sad", 3000);
              play("error");
            }
          },
          onReply: (r) => {
            replyUi = r;
          },
        },
      );
      if (!reply && teamNotified) {
        // No AI reply (e.g. the AI is switched off): tell the visitor what happens next.
        push("note", "We've let the team know. Someone will reply right here soon.");
      }
      // Read the finished reply once (streaming text isn't announced word by word).
      if (reply) announce(visibleText(reply));
      const mood = replyUi.mood && AI_MOODS.has(replyUi.mood as AnimationName) ? (replyUi.mood as AnimationName) : parseUiTag(reply).mood;
      if (mood) react(mood, 4500);
      const next = replyUi.chips.length ? replyUi.chips.filter((c) => c.length <= 40).slice(0, 3) : parseUiTag(reply).chips;
      const hot = levelOf(interest.current()) === "hot";
      setChips(hot && !next.some((c) => /audit|book|quote|call/i.test(c)) ? [...next.slice(0, 2), hotLeadChip] : next);
    } catch (err) {
      react("sad", 3000);
      play("error");
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      announce(msg);
      setMessages((m) => [...m.filter((x) => x.id !== replyId || x.text), { id: nextId.current++, from: "kirby", text: msg, raw: "" }]);
      setChips(["Use the form instead"]);
    } finally {
      setAiBusy(false);
      setAiStreaming(false);
      setKirbyTyping(false);
    }
  };

  const restartChat = () => {
    if (ai) {
      // A fresh conversation on the next message; the old one stays in the team's inbox.
      conversationId.current = undefined;
      lastServerAt.current = undefined;
      seenServerIds.current.clear();
      setHandler("ai");
      setAgentName(undefined);
      setMessages([]);
      setChips([]);
      setInput("");
      void startAi();
      return;
    }
    answers.current = { name: "", interest: "", email: "", message: "" };
    setMessages([]);
    setStep("name");
    setInput("");
    setHint("");
    setCustomInterest(false);
    void startChat();
  };

  /** A lead was sent: Kirby celebrates, and this visitor is now a hot lead. */
  const celebrate = () => {
    converted.current = true;
    interest.add(40);
    play("chime");
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 5000);
  };

  const submitChat = async () => {
    setStep("sending");
    setKirbyTyping(true);
    try {
      await sendLead(answers.current, openedAt.current, honeypot.current?.value ?? "", interest.current());
      setKirbyTyping(false);
      setStep("done");
      celebrate();
      await say(`Thanks, ${firstName(answers.current.name)}. That's everything we need.`, "We'll reply within one business day. If you'd rather talk now, book a call below.");
    } catch (err) {
      setKirbyTyping(false);
      setStep("error");
      play("error");
      await say(err instanceof Error ? err.message : "I couldn't send that just now.");
    }
  };

  const answer = async (raw: string) => {
    const value = raw.trim();
    if (speaking || kirbyTyping) return;

    if (step === "name") {
      if (!value) return setHint("Your first name is fine.");
      answers.current.name = value.slice(0, 80);
      push("user", value);
      setInput("");
      react("happy", 2200);
      setStep("interest");
      await say(`Nice to meet you, ${firstName(value)}. What would you like to automate first?`);
      return;
    }
    if (step === "interest") {
      if (!value) return setHint("Pick an option or describe it in a few words.");
      answers.current.interest = value.slice(0, 80);
      push("user", value);
      setInput("");
      setCustomInterest(false);
      react("excited", 2000);
      setStep("email");
      await say(value === "Not sure yet" ? "No problem, that's what the free audit is for. Where should we send it?" : "Good choice, we build a lot of those. Where should we send your plan?");
      return;
    }
    if (step === "email") {
      if (!EMAIL.test(value)) {
        react("confused", 3000);
        return setHint("That email doesn't look right. Could you check it?");
      }
      answers.current.email = value;
      push("user", value);
      setInput("");
      react("happy", 1800);
      setStep("message");
      await say("Anything else we should know? This part is optional.");
      return;
    }
    if (step === "message") {
      answers.current.message = value.slice(0, 2000);
      push("user", value || "Nothing else for now");
      setInput("");
      await submitChat();
    }
  };

  // ---------- Form ----------
  const updateForm = (key: keyof Lead, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
    onType();
  };

  const submitForm = async () => {
    const errors: Partial<Record<keyof Lead, string>> = {};
    if (!form.name.trim()) errors.name = "Please add your name.";
    if (!EMAIL.test(form.email.trim())) errors.email = "Please add a valid email.";
    if (!form.interest) errors.interest = "Please choose one.";
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      react("confused", 2600);
      announce(`Please check the form: ${Object.values(errors).join(" ")}`);
      return;
    }
    setFormStatus("sending");
    setFormError("");
    try {
      await sendLead({ ...form, name: form.name.trim(), email: form.email.trim(), message: form.message.trim() }, openedAt.current, honeypot.current?.value ?? "", interest.current());
      setFormStatus("done");
      celebrate();
      announce(`Thanks, ${firstName(form.name)}. Your message was sent. We'll reply within one business day.`);
    } catch (err) {
      setFormStatus("error");
      play("error");
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setFormError(msg);
      announce(msg);
    }
  };

  // ---------- Open / close ----------
  const openPanel = (initial: Mode = mode, prompt = "") => {
    pendingPrompt.current = prompt;
    nudges.hide();
    setOpen(true);
    setMode(initial);
    clearReaction();
    interest.add(6, "open", 60_000);
    if (!openedAt.current) openedAt.current = Date.now();
    if (!started.current) void begin();
  };

  /** Closes the panel and returns keyboard focus to the launcher it came from. */
  const closePanel = useCallback(() => {
    setOpen(false);
    setHoverClose(false);
    setTimeout(() => launcherButton.current?.focus({ preventScroll: true }), 0);
  }, []);


  // Page-specific (and welcome-back) bubbles after 8s of *visible* time on each page.
  useEffect(() => {
    currentSection.current = null;
    clearTimeout(sectionTimer.current);
    let visibleMs = 0;
    const t = setInterval(() => {
      if (document.hidden) return;
      visibleMs += 500;
      if (visibleMs < PAGE_NUDGE_DELAY_MS) return;
      clearInterval(t);
      if (returning?.topic) {
        const topic = returning.topic;
        nudges.request({ id: "welcome", text: `Welcome back! Want to pick up on ${topic}?`, prompt: `Tell me more about ${topic}`, mood: "happy", priority: PRIORITY.welcome, onceKey: "welcome", ttlMs: 45_000 });
      }
      const nudge = pageNudges.find((n) => n.match.test(pathname));
      if (nudge) nudges.request({ id: "page", text: nudge.text, prompt: nudge.prompt || undefined, mood: nudge.mood, priority: PRIORITY.page, onceKey: `page:${pathname}`, ttlMs: 45_000 });
    }, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run per page only
  }, [pathname]);

  useEffect(
    () => () => {
      clearTimeout(typingTimer.current);
      clearTimeout(sectionTimer.current);
    },
    [],
  );

  // A clicked bubble's question is sent as soon as the AI greeting has finished.
  useEffect(() => {
    if (!open || ai !== true || speaking || aiBusy || !pendingPrompt.current) return;
    const prompt = pendingPrompt.current;
    pendingPrompt.current = "";
    void sendAi(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sendAi reads fresh state via refs
  }, [open, ai, speaking, aiBusy]);

  // Live team replies: while the panel is open, check the stored conversation for messages from
  // a team member (fast while a person is involved, slowly otherwise so the team can join any chat).
  useEffect(() => {
    if (!open || ai !== true) return;
    let stopped = false;
    const tick = async () => {
      const id = conversationId.current;
      if (!id) return;
      const snap = await getConversation(id, lastServerAt.current).catch(() => null);
      if (stopped || !snap) return;
      for (const m of snap.messages) {
        lastServerAt.current = m.createdAt;
        if (seenServerIds.current.has(m.id)) continue;
        seenServerIds.current.add(m.id);
        // Visitor and AI messages from this tab are already on screen; only add the team's.
        if (m.role === "agent") {
          setMessages((list) => [...list, { id: nextId.current++, from: "agent", text: m.content, raw: m.content, author: m.author }]);
          play("pop");
          announce(`${m.author ?? "The team"}: ${m.content}`);
        } else if (m.role === "system") {
          setMessages((list) => [...list, { id: nextId.current++, from: "note", text: m.content }]);
        }
      }
      if (snap.mode === "human") {
        setHandler("human");
        setAgentName(snap.agent);
        setChips([]);
      } else setHandler(snap.status === "waiting_human" ? "waiting" : "ai");
    };
    void tick();
    const timer = setInterval(tick, handler === "ai" ? 8000 : 2500);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [open, ai, handler, play, announce]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  // Opening moves keyboard focus into the panel (the chat input takes over once ready).
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, kirbyTyping, step]);

  useEffect(() => {
    if (open && mode === "chat" && !speaking) inputRef.current?.focus({ preventScroll: true });
  }, [open, mode, speaking, step, customInterest]);

  function onType() {
    setUserTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setUserTyping(false), 1200);
  }

  const canType = ai === true || step === "name" || step === "email" || step === "message" || (step === "interest" && customInterest);
  const field =
    "mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3.5 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-black/35 focus:border-[var(--ink)]";

  return (
    <div ref={rootRef} className="kirby-assistant font-sans" data-mood={mood} data-interest={interest.score}>
      {/* Screen-reader announcer for Kirby's messages and form results */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        <span key={announcement.n}>{announcement.text}</span>
      </div>

      {/* Honeypot shared by chat and form: invisible to people, tempting for bots */}
      <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="fixed left-[-9999px] top-0 h-px w-px opacity-0" />

      {/* ---------- Speech bubble ---------- */}
      {bubble && !open && (
        <div
          key={bubble.id + bubble.text}
          role="status"
          onMouseEnter={() => nudges.setHovering(true)}
          onMouseLeave={() => nudges.setHovering(false)}
          onFocus={() => nudges.setHovering(true)}
          onBlur={() => nudges.setHovering(false)}
          className="kirby-pop fixed bottom-[140px] right-[26px] z-[60] w-[276px] max-sm:bottom-[104px] max-sm:right-[14px] max-sm:w-[min(276px,calc(100vw-28px))]"
        >
          <div className="relative rounded-[18px] border border-[#e4e8e8] bg-white shadow-[0_1px_2px_rgba(16,24,24,0.06),0_14px_36px_-12px_rgba(16,24,24,0.22)]">
            {/* The text opens the chat; the actions below are the keyboard path. */}
            <p
              onClick={() => openPanel("chat", bubble.prompt)}
              className="cursor-pointer px-4 pb-3 pt-3.5 text-[14.5px] leading-[1.5] text-[var(--ink)]"
            >
              {bubble.text.split(" ").map((word, i) => (
                <span key={i} className="kirby-word inline-block whitespace-pre" style={{ animationDelay: `${80 + i * 32}ms` }}>
                  {word}{" "}
                </span>
              ))}
            </p>
            <div className="flex items-center justify-between border-t border-[#eef1f1] px-4 py-2.5">
              <button
                type="button"
                onClick={() => openPanel("chat", bubble.prompt)}
                className="group/cta inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--teal)] transition-colors hover:text-[var(--ink)]"
              >
                {bubble.prompt ? "Ask now" : "Open chat"}
                <ArrowUpRight className="h-[15px] w-[15px] transition-transform duration-200 group-hover/cta:-translate-y-px group-hover/cta:translate-x-px" strokeWidth={2.2} />
              </button>
              <button type="button" onClick={nudges.dismiss} className="text-[12.5px] text-black/40 transition-colors hover:text-black/70">
                Not now
              </button>
            </div>
            {/* Tail: part of the card (same border + fill), pointing down at Kirby */}
            <span aria-hidden="true" className="absolute -bottom-[6px] right-[40px] h-3 w-3 rotate-45 border-b border-r border-[#e4e8e8] bg-white max-sm:right-[28px]" />
          </div>
        </div>
      )}

      {/* ---------- Panel ---------- */}
      {open && (
        <section
          ref={panelRef}
          id="kirby-panel"
          role="dialog"
          aria-label={`Contact ${brand.name}`}
          tabIndex={-1}
          className="kirby-pop fixed bottom-[136px] right-[24px] z-[60] flex h-[min(620px,calc(100dvh-160px))] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_24px_64px_-16px_rgba(0,0,0,0.3)] max-sm:inset-x-[8px] max-sm:bottom-[8px] max-sm:h-[min(90dvh,640px)] max-sm:w-auto"
        >
          <header className="flex flex-none items-center gap-3 border-b border-black/[0.07] px-4 py-2.5">
            <span ref={headerAvatarRef} aria-hidden="true" className={cn("flex-none", bodyGesture)} onAnimationEnd={endGesture}>
              <Kirby ref={headerKirby} animation={mood} size={52} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold leading-tight text-[var(--ink)]">{brand.name}</div>
              <div className="truncate text-[12px] text-black/50">{hoverClose ? "Leaving already?" : "Replies within one business day"}</div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
              title={soundOn ? "Sound on" : "Sound off"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-black/45 transition hover:bg-black/5 hover:text-black"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            {mode === "chat" && (ai ? messages.length > 2 : step !== "name") && (
              <button type="button" onClick={restartChat} aria-label="Start over" title="Start over" className="flex h-8 w-8 items-center justify-center rounded-full text-black/45 transition hover:bg-black/5 hover:text-black">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closePanel}
              onMouseEnter={() => setHoverClose(true)}
              onMouseLeave={() => setHoverClose(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-black/45 transition hover:bg-black/5 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Chat | Form */}
          <div className="flex-none px-4 pt-3">
            <div
              role="tablist"
              aria-label="How would you like to reach us?"
              onKeyDown={(e) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                e.preventDefault();
                const next: Mode = e.key === "Home" ? "chat" : e.key === "End" ? "form" : mode === "chat" ? "form" : "chat";
                setMode(next);
                document.getElementById(`kirby-tab-${next}`)?.focus();
              }}
              className="grid grid-cols-2 rounded-full bg-black/[0.05] p-1 text-[13px] font-medium"
            >
              {(["chat", "form"] as const).map((m) => (
                <button
                  key={m}
                  id={`kirby-tab-${m}`}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  aria-controls="kirby-tabpanel"
                  tabIndex={mode === m ? 0 : -1}
                  onClick={() => setMode(m)}
                  className={cn("rounded-full py-1.5 transition", mode === m ? "bg-white text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-black/50 hover:text-black")}
                >
                  {m === "chat" ? "Chat" : "Form"}
                </button>
              ))}
            </div>
          </div>

          <div role="tabpanel" id="kirby-tabpanel" aria-labelledby={`kirby-tab-${mode}`} className="flex min-h-0 flex-1 flex-col">
          {mode === "chat" ? (
            <>
              {/* Visual transcript; screen readers hear messages through the announcer below */}
              <div ref={listRef} role="log" aria-live="off" aria-label="Conversation" tabIndex={0} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {messages.filter((m) => m.text).map((m) =>
                  m.from === "note" ? (
                    <div key={m.id} className="kirby-msg flex justify-center py-1">
                      <p className="rounded-full bg-[var(--mint-50)] px-3 py-1 text-center text-[12px] leading-[1.4] text-[#1b3b37] ring-1 ring-[#d3f1ec]">{m.text}</p>
                    </div>
                  ) : (
                    <div key={m.id} className={cn("kirby-msg flex", m.from === "user" ? "justify-end" : "justify-start")}>
                      <div className="max-w-[85%]">
                        {m.from === "agent" && (
                          <span className="mb-1 block px-1 text-[11px] font-medium text-black/45">
                            {m.author ?? "Team"} · {brand.name} team
                          </span>
                        )}
                        <p
                          className={cn(
                            "whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.45]",
                            m.from === "user"
                              ? "rounded-br-md bg-[var(--ink)] text-white"
                              : m.from === "agent"
                                ? "rounded-bl-md bg-white text-[var(--ink)] ring-1 ring-[var(--teal)]/30"
                                : "rounded-bl-md bg-[#f1f3f3] text-[var(--ink)]",
                          )}
                        >
                          {m.from === "user" ? m.text : <RichText text={m.text} onNavigate={closePanel} />}
                        </p>
                      </div>
                    </div>
                  ),
                )}
                {kirbyTyping && (
                  <div className="kirby-msg flex justify-start" aria-hidden="true">
                    <span className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#f1f3f3] px-4 py-3.5">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="kirby-dot h-1.5 w-1.5 rounded-full bg-black/40" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </span>
                  </div>
                )}

                {!ai && step === "interest" && !speaking && !customInterest && (
                  <div role="group" aria-label="What would you like to automate?" className="kirby-msg flex flex-wrap justify-end gap-1.5 pt-1">
                    {INTERESTS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => void answer(opt)}
                        onMouseEnter={() => react("curious", 1200)}
                        className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-[13px] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
                      >
                        {opt}
                      </button>
                    ))}
                    <button type="button" onClick={() => setCustomInterest(true)} className="rounded-full px-3 py-1.5 text-[13px] text-black/50 underline-offset-2 transition hover:text-black hover:underline">
                      Something else
                    </button>
                  </div>
                )}

                {!ai && step === "done" && !speaking && (
                  <div className="kirby-msg flex justify-end pt-1">
                    <Link href={brand.ctaHref} onClick={closePanel} className="rounded-full bg-[var(--ink)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black/80">
                      Book a call
                    </Link>
                  </div>
                )}
                {!ai && step === "error" && !speaking && (
                  <div className="kirby-msg flex justify-end gap-1.5 pt-1">
                    <button type="button" onClick={() => setMode("form")} className="rounded-full border border-black/15 px-4 py-2 text-[13px] text-[var(--ink)] transition hover:border-[var(--ink)]">
                      Use the form
                    </button>
                    <button type="button" onClick={() => void submitChat()} className="rounded-full bg-[var(--ink)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black/80">
                      Try again
                    </button>
                  </div>
                )}
                {ai && chips.length > 0 && !aiBusy && !speaking && (
                  <div role="group" aria-label="Suggested replies" className="kirby-msg flex flex-wrap justify-end gap-1.5 pt-1">
                    {chips.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => void sendAi(chipPayload.current.get(c) ?? c)}
                        onMouseEnter={() => react("curious", 1200)}
                        className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-[13px] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {canType && (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    void (ai ? sendAi(input) : answer(input));
                  }}
                  className="flex-none border-t border-black/[0.07] px-3 py-3"
                >
                  {hint && (
                    <p role="alert" className="mb-1.5 px-1 text-[12px] text-[#b42318]">
                      {hint}
                    </p>
                  )}
                  <div className="flex items-end gap-2 rounded-2xl border border-black/15 py-1 pl-3.5 pr-1 transition focus-within:border-[var(--ink)]">
                    {ai || step === "message" ? (
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setHint("");
                          onType();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void (ai ? sendAi(input) : answer(input));
                          }
                        }}
                        rows={ai ? 1 : 2}
                        maxLength={2000}
                        readOnly={speaking || aiBusy}
                        aria-busy={speaking || aiBusy}
                        placeholder={ai ? "Ask anything about automating your business" : "For example: we miss calls after 6pm"}
                        aria-label={ai ? "Your message" : "Anything else"}
                        className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[14px] leading-[1.4] text-[var(--ink)] outline-none placeholder:text-black/35"
                      />
                    ) : (
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setHint("");
                          onType();
                        }}
                        onFocus={() => step === "email" && react("shy", 2000)}
                        type={step === "email" ? "email" : "text"}
                        inputMode={step === "email" ? "email" : "text"}
                        autoComplete={step === "email" ? "email" : step === "name" ? "given-name" : "off"}
                        maxLength={step === "email" ? 254 : 80}
                        readOnly={speaking || aiBusy}
                        aria-busy={speaking || aiBusy}
                        placeholder={step === "name" ? "Your name" : step === "email" ? "you@company.com" : "What would you like to automate?"}
                        aria-label={step === "name" ? "Your name" : step === "email" ? "Your email" : "What you'd like to automate"}
                        className="h-10 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-black/35"
                      />
                    )}
                    <button type="submit" disabled={speaking || aiBusy} aria-label="Send" className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--ink)] text-white transition hover:bg-black/80 disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                  {!ai && step === "message" && (
                    <button type="button" onClick={() => void answer("")} disabled={speaking || aiBusy} className="mt-1.5 px-1 text-[12px] text-black/45 transition hover:text-black disabled:opacity-40">
                      Skip and send
                    </button>
                  )}
                  {ai && (
                    <p className="mt-1.5 px-1 text-[11px] leading-[1.4] text-black/40">
                      {handler === "human" ? (
                        <>You&apos;re chatting with {agentName ?? "a team member"} from {brand.name}</>
                      ) : handler === "waiting" ? (
                        <>A team member has been notified and will reply here</>
                      ) : (
                        <>AI assistant</>
                      )}
                      {" · "}Chats are saved to help us reply ·{" "}
                      <Link href="/privacy-policy" onClick={closePanel} className="underline underline-offset-2 hover:text-black">
                        Privacy
                      </Link>
                    </p>
                  )}
                </form>
              )}
            </>
          ) : formStatus === "done" ? (
            <div className="kirby-msg flex flex-1 flex-col items-center justify-center px-8 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mint-100)] text-[var(--teal)]">
                <Check className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[17px] font-semibold text-[var(--ink)]">Thanks, {firstName(form.name)}.</h3>
              <p className="mt-1 text-[14px] leading-[1.5] text-black/55">We&apos;ll reply within one business day. Prefer to talk now?</p>
              <Link href={brand.ctaHref} onClick={closePanel} className="mt-5 rounded-full bg-[var(--ink)] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-black/80">
                Book a call
              </Link>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void submitForm();
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 space-y-3 overflow-hidden px-4 pt-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block min-w-0">
                    <span className="text-[12px] font-medium text-black/60">Name</span>
                    <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} autoComplete="name" maxLength={80} required aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? "kirby-err-name" : undefined} className={cn(field, "h-10", formErrors.name && "border-[#b42318]")} />
                    {formErrors.name && <span id="kirby-err-name" className="mt-0.5 block text-[11px] text-[#b42318]">{formErrors.name}</span>}
                  </label>
                  <label className="block min-w-0">
                    <span className="text-[12px] font-medium text-black/60">Work email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      onFocus={() => react("shy", 1800)}
                      onBlur={() => form.email && !EMAIL.test(form.email.trim()) && react("confused", 2400)}
                      autoComplete="email"
                      maxLength={254}
                      required
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? "kirby-err-email" : undefined}
                      className={cn(field, "h-10", formErrors.email && "border-[#b42318]")}
                    />
                    {formErrors.email && <span id="kirby-err-email" className="mt-0.5 block text-[11px] text-[#b42318]">{formErrors.email}</span>}
                  </label>
                </div>
                <label className="block">
                  <span className="text-[12px] font-medium text-black/60">What do you need help with?</span>
                  <select
                    value={form.interest}
                    onChange={(e) => {
                      updateForm("interest", e.target.value);
                      if (e.target.value) react("excited", 1600);
                    }}
                    required
                    aria-invalid={!!formErrors.interest}
                    aria-describedby={formErrors.interest ? "kirby-err-interest" : undefined}
                    className={cn(field, "h-10", !form.interest && "text-black/40", formErrors.interest && "border-[#b42318]")}
                  >
                    <option value="">Choose one</option>
                    {INTERESTS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {formErrors.interest && <span id="kirby-err-interest" className="mt-0.5 block text-[11px] text-[#b42318]">{formErrors.interest}</span>}
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-black/60">
                    Message <span className="font-normal text-black/40">(optional)</span>
                  </span>
                  <textarea
                    value={form.message}
                    onChange={(e) => updateForm("message", e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="A sentence or two about your business helps"
                    className={cn(field, "resize-none py-2 leading-[1.45]")}
                  />
                </label>
                {formStatus === "error" && (
                  <p role="alert" className="text-[12px] text-[#b42318]">
                    {formError}
                  </p>
                )}
              </div>
              <div className="flex-none px-4 pb-3 pt-2">
                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[14px] font-medium text-white transition hover:bg-black/80 disabled:opacity-60"
                >
                  {formStatus === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send message
                </button>
                <p className="mt-1.5 text-center text-[11px] text-black/40">We only use your details to reply.</p>
              </div>
            </form>
          )}
          </div>
        </section>
      )}

      {/* ---------- Launcher: Kirby itself is the button ---------- */}
      <div
        className={cn("fixed bottom-[24px] right-[24px] z-[60] max-sm:bottom-[16px] max-sm:right-[16px]", open && "max-sm:hidden", gesture === "peek" && "kirby-g-peek")}
        onAnimationEnd={endGesture}
      >
        <button
          type="button"
          onClick={open ? closePanel : () => openPanel("chat")}
          onMouseEnter={() => setHoverLauncher(true)}
          onMouseLeave={() => setHoverLauncher(false)}
          aria-label={open ? "Close chat" : `Chat with ${brand.name}`}
          aria-expanded={open}
          aria-controls="kirby-panel"
          aria-haspopup="dialog"
          ref={launcherButton}
          className="group relative flex h-[96px] w-[96px] cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)] max-sm:h-[72px] max-sm:w-[72px]"
        >
          {open ? (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)] transition group-hover:scale-105">
              <X className="h-5 w-5" />
            </span>
          ) : (
            <>
              {/* Idle cue (no words): a thought bubble that looks like Kirby is typing */}
              {!hoverLauncher && !bubble && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                  <span className="kirby-think absolute -left-[30px] -top-[22px] block max-sm:-left-[24px] max-sm:-top-[20px]">
                    <span className="flex items-center gap-[3px] rounded-full border border-black/10 bg-white px-2.5 py-2 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.25)]">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="kirby-dot h-[5px] w-[5px] rounded-full bg-[var(--ink)]" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </span>
                    <span className="absolute -bottom-[7px] right-[2px] h-[8px] w-[8px] rounded-full border border-black/10 bg-white" />
                    <span className="absolute -bottom-[13px] right-[-4px] h-[5px] w-[5px] rounded-full border border-black/10 bg-white" />
                  </span>
                </span>
              )}
              <span aria-hidden="true" className="kirby-shadow absolute bottom-[4px] left-1/2 h-[9px] w-[56px] -translate-x-1/2 rounded-full bg-black/20 blur-[3px] max-sm:w-[42px]" />
              {/* Float with a little attention hop every few seconds */}
              <span className="kirby-float relative block transition-transform duration-300 group-hover:scale-110">
                <span ref={lookRef} className={cn("block", bodyGesture)} onAnimationEnd={endGesture}>
                  <Kirby ref={launcherKirby} animation={mood} size={96} className="max-sm:!h-[72px] max-sm:!w-[72px]" />
                </span>
              </span>
              {/* Tiny greeting on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-[22px] top-[2px] origin-bottom-right scale-50 rounded-full rounded-br-sm bg-[var(--ink)] px-2.5 py-1 text-[12px] font-semibold text-white opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100 max-sm:hidden"
              >
                Hi!
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
