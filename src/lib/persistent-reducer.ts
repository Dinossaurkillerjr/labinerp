"use client";

import * as React from "react";

/**
 * useReducer backed by localStorage, safe for SSR/hydration: the reducer
 * always starts from the same deterministic `seed` on server and client (so
 * the first client render matches the server-rendered HTML), then — once
 * mounted in the browser — reads whatever was actually persisted and applies
 * it via a "HYDRATE" action. Persistence writes are held back until that
 * hydration pass has run, so they never clobber real data with the seed.
 */
export function usePersistentReducer<State, Action extends { type: string }>(
  reducer: (state: State, action: Action) => State,
  seed: () => State,
  storageKey: string,
  hydrateAction: (state: State) => Action
) {
  const [state, dispatch] = React.useReducer(reducer, undefined, seed);
  const hasRun = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as State;
          dispatch(hydrateAction(parsed));
        }
      } catch {
        // Corrupt or unavailable storage — keep the seed.
      }
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, ready, storageKey]);

  return [state, dispatch] as const;
}
