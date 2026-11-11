"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Vertical tab list for mega menus.
 * - A single white highlight slides between items (instead of jumping).
 * - Hover intent: switching waits ~90ms, so moving the pointer diagonally towards the
 *   content column doesn't flip to a different tab on the way.
 * - Arrow Up/Down move focus between tabs; focusing a tab activates it.
 */
export function TabRail<T>({
  items,
  active,
  onActivate,
  getKey,
  getHref,
  label,
  children,
}: {
  items: T[];
  active: number;
  onActivate: (i: number) => void;
  getKey: (item: T) => string;
  getHref: (item: T) => string;
  label: string;
  children: (item: T, on: boolean) => ReactNode;
}) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setPill({ top: el.offsetTop, height: el.offsetHeight });
  }, [active, items.length]);

  const schedule = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onActivate(i), 90);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="relative flex flex-col gap-[0.2rem]" onMouseLeave={cancel}>
      {pill && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 rounded-[0.8rem] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,height] duration-200 ease-out motion-reduce:transition-none"
          style={{ height: pill.height, transform: `translateY(${pill.top}px)`, top: 0 }}
        />
      )}
      {items.map((item, i) => {
        const on = i === active;
        return (
          <Link
            key={getKey(item)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            href={getHref(item)}
            role="tab"
            aria-selected={on}
            onMouseEnter={() => schedule(i)}
            onFocus={() => {
              cancel();
              onActivate(i);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative rounded-[0.8rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]",
              !on && "hover:bg-black/[0.03]",
            )}
          >
            {children(item, on)}
          </Link>
        );
      })}
    </div>
  );
}
