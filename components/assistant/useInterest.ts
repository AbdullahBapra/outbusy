"use client";

import { useCallback, useRef, useState } from "react";
import { rememberedScore } from "./useVisitorMemory";

const KEY = "outbusy-interest";
const START = 25;

/** How interested this visitor looks, from their behaviour across the whole visit. */
export type InterestLevel = "cold" | "neutral" | "warm" | "hot";

export const levelOf = (score: number): InterestLevel => (score < 12 ? "cold" : score < 40 ? "neutral" : score < 70 ? "warm" : "hot");

/**
 * The score saved earlier in this visit; on a new visit, a warm start from the last one.
 * (The widget only renders in the browser.)
 */
function savedScore() {
  try {
    const saved = Number(sessionStorage.getItem(KEY));
    if (Number.isFinite(saved) && saved > 0) return saved;
  } catch {}
  return Math.max(START, Math.round(rememberedScore() * 0.6));
}

/**
 * A 0-100 lead-interest score for the current visit (kept in sessionStorage across pages).
 * Valuable actions (CTA clicks, pricing visits, reading) raise it; drifting away lowers it.
 * Each `key` can only score once per `cooldownMs` so hovering back and forth doesn't farm points.
 */
export function useInterest() {
  const [score, setScore] = useState(savedScore);
  const scoreRef = useRef(score);
  const lastScored = useRef(new Map<string, number>());

  const add = useCallback((points: number, key?: string, cooldownMs = 15_000) => {
    if (key) {
      const now = Date.now();
      if (now - (lastScored.current.get(key) ?? 0) < cooldownMs) return;
      lastScored.current.set(key, now);
    }
    const next = Math.max(0, Math.min(100, Math.round((scoreRef.current + points) * 10) / 10));
    if (next === scoreRef.current) return;
    scoreRef.current = next;
    setScore(next);
    try {
      sessionStorage.setItem(KEY, String(next));
    } catch {}
  }, []);

  const current = useCallback(() => scoreRef.current, []);

  return { score, level: levelOf(score), add, current };
}
