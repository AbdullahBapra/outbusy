"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Small UI sounds, synthesised with the Web Audio API (no audio files to download).
 * Off by default; the visitor's choice is remembered in this browser. Audio only starts
 * after the visitor turns it on (a click), which also satisfies browser autoplay rules.
 */

export type Sound = "pop" | "chime" | "error";

const KEY = "outbusy-sound";

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

function savedPreference() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

/** One enveloped oscillator note: quick attack, exponential decay. */
function note(ctx: AudioContext, at: number, from: number, to: number, duration: number, type: OscillatorType, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + duration * 0.6);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

export function useSound() {
  const [enabled, setEnabled] = useState(savedPreference);
  const enabledRef = useRef(enabled);
  const ctxRef = useRef<AudioContext | null>(null);

  const context = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (sound: Sound) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      const t = ctx.currentTime + 0.01;
      if (sound === "pop") note(ctx, t, 620, 880, 0.14, "sine", 0.06);
      else if (sound === "chime") {
        note(ctx, t, 784, 784, 0.4, "triangle", 0.07); // G5
        note(ctx, t + 0.11, 1175, 1175, 0.5, "triangle", 0.06); // D6
      } else note(ctx, t, 330, 220, 0.26, "sine", 0.06);
    },
    [context],
  );

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    if (next) play("pop"); // confirms it's on, and unlocks audio from this click
  }, [play]);

  useEffect(
    () => () => {
      void ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  return { enabled, toggle, play };
}
