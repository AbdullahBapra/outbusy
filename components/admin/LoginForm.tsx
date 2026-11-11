"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { authButton, authInput, authLabel } from "@/components/admin/AuthCard";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await api.auth.login(email, password);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Sign-in failed. Please try again.");
      setPassword("");
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className={authLabel}>Email</span>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input type="email" name="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} />
        </div>
      </label>
      <label className="block">
        <span className="flex items-center justify-between">
          <span className={authLabel}>Password</span>
          <Link href="/admin/forgot" className="text-xs font-medium text-[var(--teal)] hover:underline">
            Forgot password?
          </Link>
        </span>
        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInput}
          />
        </div>
      </label>
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={authButton}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>
    </form>
  );
}
