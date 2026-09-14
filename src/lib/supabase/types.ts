import type { SupabaseClient } from "@supabase/supabase-js";

// Without a generated `Database` schema type, @supabase/supabase-js's own
// generic defaults for SupabaseClient are strict enough to reject `.upsert()`
// calls entirely (row type resolves to `never`) and disagree with each other
// depending on whether a client came from a bare call, one with options, or
// @supabase/ssr's createBrowserClient — three call shapes this app actually
// uses. `any` here is deliberate, not a shortcut: once someone runs
// `supabase gen types typescript` against the real project, swap this one
// alias for `SupabaseClient<Database>` and every repository gets real
// row-level typing for free.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberate, see comment above; the one place to upgrade once real generated types exist.
export type AnySupabaseClient = SupabaseClient<any, any, any, any, any>;
