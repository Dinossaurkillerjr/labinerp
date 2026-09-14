"use client";

// Browser Supabase client — the only one every domain provider/repository
// should import. Never import the service-role key here; it must stay
// server-only (see supabase/seed-dev-data script).

import { createBrowserClient } from "@supabase/ssr";
import type { AnySupabaseClient } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

// No hand-maintained `Database` generic here: it would need to be regenerated
// from the real project schema (`supabase gen types typescript`) to stay
// accurate. Each repository module types its own rows explicitly instead
// (see lib/<domain>/repository.ts). The explicit `AnySupabaseClient`
// annotation (rather than `ReturnType<typeof createBrowserClient>`, which
// resolves against an overloaded signature) is what keeps `.auth`/`.from()`
// calls properly typed instead of silently collapsing to `any`.
let browserClient: AnySupabaseClient | undefined;

export function createClient(): AnySupabaseClient {
  browserClient ??= createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  return browserClient;
}
