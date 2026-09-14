"use client";

import * as React from "react";
import { createClient } from "./client";

export type SupabaseUserState = {
  userId: string | undefined;
  email: string | undefined;
  /** True until the first session check resolves. Every domain provider waits on this before fetching. */
  loading: boolean;
};

/**
 * The single source of "who is signed in" for every domain provider — each
 * one waits for `loading === false` before fetching its Supabase-backed
 * state, and re-fetches whenever `userId` changes (sign-in/sign-out).
 */
export function useSupabaseUser(): SupabaseUserState {
  const [state, setState] = React.useState<SupabaseUserState>({
    userId: undefined,
    email: undefined,
    loading: true,
  });

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setState({ userId: data.user?.id, email: data.user?.email, loading: false });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({ userId: session?.user.id, email: session?.user.email, loading: false });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
