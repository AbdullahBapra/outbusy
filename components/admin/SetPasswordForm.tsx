"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { authButton, authInput, authLabel } from "@/components/admin/AuthCard";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (password !== confirm) return setError("The two passwords don't match.");
    setPending(true);
    setError("");
    try {
      await api.auth.setPassword(password);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't save the password. Please try again.");
      setPending(false);
    }
  };

  const field = (label: string, value: string, set: (v: string) => void, autoFocus = false) => (
    <label className="block">
      <span className={authLabel}>{label}</span>
      <div className="relative mt-2">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
        <input type="password" required minLength={12} maxLength={128} autoFocus={autoFocus} autoComplete="new-password" value={value} onChange={(e) => set(e.target.value)} className={authInput} />
      </div>
    </label>
  );

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {field("New password", password, setPassword, true)}
      {field("Repeat password", confirm, setConfirm)}
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={authButton}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save password
      </button>
    </form>
  );
}
