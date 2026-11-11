"use client";

import { useEffect, useRef } from "react";

/**
 * Animated wireframe wave field drawn on canvas — a lightweight stand-in for a
 * looping background video. Teal lines on black, slowly undulating.
 */
export function WaveCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const LINES = 46;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1);
        const alpha = 0.08 + 0.5 * Math.sin(Math.PI * p) ** 2;
        ctx.strokeStyle = `rgba(0, 239, 212, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const nx = x / w;
          const y =
            h * (0.35 + p * 0.55) +
            Math.sin(nx * 5 + t * 0.0006 + p * 3.2) * h * 0.09 * (0.4 + p) +
            Math.sin(nx * 11 - t * 0.0004 + p * 6) * h * 0.025 +
            Math.cos(nx * 2.2 + t * 0.0003) * h * 0.06 * (1 - p);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
