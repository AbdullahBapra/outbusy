"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { api } from "@/lib/api/client";

/** Lets each team member turn their own email alerts on or off. */
export function AlertsToggle({ memberId, initial }: { memberId: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    try {
      await api.team.update(memberId, { alertsEnabled: !on });
      setOn(!on);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      className="flex h-9 items-center gap-1.5 rounded-md border border-black/15 px-3.5 text-sm text-black/70 transition hover:border-black disabled:opacity-50"
    >
      {on ? <Bell className="h-4 w-4 text-[var(--teal)]" /> : <BellOff className="h-4 w-4" />}
      Email alerts {on ? "on" : "off"}
    </button>
  );
}
