"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client for the admin panel, signed in as the current team member (reads
 * the session cookies set at login). Used for live Realtime updates; RLS limits it to team data.
 */
export function supabaseBrowser() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
  return client;
}
