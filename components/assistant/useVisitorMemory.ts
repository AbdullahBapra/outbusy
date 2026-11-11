"use client";

import { useEffect, useState } from "react";

/**
 * Remembers, in this browser only (localStorage), which pages a visitor looked at and how
 * engaged they were, so Kirby can say "welcome back" with context on their next visit.
 * Stores page titles and a score, never personal data.
 */

const KEY = "outbusy-visitor-v1";
const SESSION_KEY = "outbusy-visit";
/** A gap longer than this between page views counts as a new visit. */
const NEW_VISIT_GAP_MS = 30 * 60 * 1000;
const MAX_TOPICS = 5;

/** Pages worth remembering as "what they were looking at". */
const MEMORABLE = /^\/(services\/.+|industries\/.+|case-studies\/.+|blog\/.+|pricing|roi-calculator)$/;

type Memory = { visits: number; lastSeen: number; topics: { path: string; label: string }[]; lastScore: number };
/** What we know about a returning visitor at the start of this visit. */
export type ReturningVisitor = { visits: number; topic: string | null; lastScore: number };

const empty: Memory = { visits: 0, lastSeen: 0, topics: [], lastScore: 0 };

function read(): Memory {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Memory> | null;
    if (!raw || typeof raw !== "object") return empty;
    return {
      visits: Number(raw.visits) || 0,
      lastSeen: Number(raw.lastSeen) || 0,
      topics: Array.isArray(raw.topics) ? raw.topics.filter((t) => t && typeof t.label === "string" && typeof t.path === "string").slice(-MAX_TOPICS) : [],
      lastScore: Number(raw.lastScore) || 0,
    };
  } catch {
    return empty;
  }
}

function write(m: Memory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {}
}

/** The visitor's last score from a previous visit (used to warm-start the interest score). */
export function rememberedScore() {
  return read().lastScore;
}

/** Turns the page's <title> ("AI Voice Agents | Outbusy") into a short topic label. */
function topicLabel(pathname: string) {
  if (pathname === "/pricing") return "our pricing";
  if (pathname === "/roi-calculator") return "the ROI calculator";
  const title = document.title.split(" | ")[0]?.trim();
  return title && title.length <= 70 ? title : null;
}

/**
 * Counts this visit once, works out whether the visitor is returning (and what they looked
 * at last time), and records memorable pages as they browse.
 */
function startVisit(): ReturningVisitor | null {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return JSON.parse(existing) as ReturningVisitor | null;
  } catch {}

  const memory = read();
  const now = Date.now();
  const returning = memory.visits > 0 && now - memory.lastSeen > NEW_VISIT_GAP_MS;
  const result: ReturningVisitor | null = returning
    ? { visits: memory.visits + 1, topic: memory.topics.at(-1)?.label ?? null, lastScore: memory.lastScore }
    : null;

  write({ ...memory, visits: memory.visits + (memory.visits === 0 || returning ? 1 : 0), lastSeen: now });
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
  } catch {}
  return result;
}

export function useVisitorMemory(pathname: string, score: number) {
  const [returning] = useState(startVisit);

  // Remember memorable pages (once the new page's title has rendered).
  useEffect(() => {
    const t = setTimeout(() => {
      const memory = read();
      const next: Memory = { ...memory, lastSeen: Date.now() };
      if (MEMORABLE.test(pathname)) {
        const label = topicLabel(pathname);
        if (label) next.topics = [...memory.topics.filter((t) => t.path !== pathname), { path: pathname, label }].slice(-MAX_TOPICS);
      }
      write(next);
    }, 600);
    return () => clearTimeout(t);
  }, [pathname]);

  // Keep the latest engagement score for next time (debounced).
  useEffect(() => {
    const t = setTimeout(() => write({ ...read(), lastScore: Math.round(score) }), 1500);
    return () => clearTimeout(t);
  }, [score]);

  return { returning };
}
