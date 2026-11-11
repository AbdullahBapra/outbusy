"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const report = (err: unknown) => alert(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, start] = useTransition();
  const pending = busy || refreshing;

  const toggle = async () => {
    setBusy(true);
    try {
      await api.posts.setPublished(id, !published);
      start(() => router.refresh());
    } catch (err) {
      report(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      aria-label={published ? "Unpublish" : "Publish"}
      title={published ? "Published — click to unpublish" : "Draft — click to publish"}
      disabled={pending}
      onClick={toggle}
      className={cn("relative mr-1 h-6 w-11 flex-none rounded-full transition-colors disabled:opacity-60", published ? "bg-[var(--teal)]" : "bg-black/15")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]", published ? "left-[1.375rem]" : "left-0.5")} />
    </button>
  );
}

export function DeletePostButton({ id, title, label }: { id: string; title: string; label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const remove = async () => {
    if (!confirm(`Delete “${title}”? This can't be undone.`)) return;
    setPending(true);
    try {
      await api.posts.remove(id);
      router.push("/admin/posts?deleted=1");
      router.refresh();
    } catch (err) {
      report(err);
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Delete “${title}”`}
      onClick={remove}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md text-black/45 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60",
        label ? "h-10 px-4 text-sm font-medium" : "h-9 w-9",
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {label}
    </button>
  );
}

export function ImportStarterButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = async () => {
    setPending(true);
    try {
      await api.posts.importStarter();
      router.push("/admin/posts?imported=1");
      router.refresh();
    } catch (err) {
      report(err);
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="flex h-11 items-center gap-2 rounded-md border border-black/15 bg-white px-5 text-sm font-semibold uppercase tracking-wide transition hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Import example posts
    </button>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);
    try {
      await api.auth.logout();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-black/60 transition hover:bg-black/5 hover:text-black disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span className="max-sm:hidden">Sign out</span>
    </button>
  );
}
