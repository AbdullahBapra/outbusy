"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { authButton, authInput, authLabel } from "@/components/admin/AuthCard";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState("");

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setState("pending");
    setError("");
    try {
      await api.auth.forgot(email);
      setState("sent");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-md bg-[var(--mint-50)] px-3 py-3 text-sm leading-relaxed text-[#1b3b37]">
          If that email belongs to an active team account, a reset link is on its way. It expires in one hour.
        </p>
        <Link href="/admin/login" className="block text-center text-sm font-medium text-[var(--teal)] hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className={authLabel}>Email</span>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} />
        </div>
      </label>
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={state === "pending"} className={authButton}>
        {state === "pending" && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>
      <Link href="/admin/login" className="block text-center text-sm text-black/50 hover:text-black">
        Back to sign in
      </Link>
    </form>
  );
}
