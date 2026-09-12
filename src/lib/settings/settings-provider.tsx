"use client";

import * as React from "react";
import { settingsReducer, type SettingsAction } from "./settings-reducer";
import { DEFAULT_SETTINGS, type Settings } from "./types";
import { usePersistentReducer } from "@/lib/persistent-reducer";

const STORAGE_KEY = "erp-settings-v1";

function seededState(): Settings {
  return DEFAULT_SETTINGS;
}

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (changes: Partial<Settings>) => void;
  toggleWidget: (widgetId: string) => void;
};

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = usePersistentReducer<Settings, SettingsAction>(
    settingsReducer,
    seededState,
    STORAGE_KEY,
    (hydrated) => ({ type: "HYDRATE" as const, state: hydrated })
  );

  const value = React.useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings(changes) {
        dispatch({ type: "UPDATE_SETTINGS", changes });
      },
      toggleWidget(widgetId) {
        const hidden = settings.hiddenDashboardWidgets.includes(widgetId)
          ? settings.hiddenDashboardWidgets.filter((id) => id !== widgetId)
          : [...settings.hiddenDashboardWidgets, widgetId];
        dispatch({ type: "UPDATE_SETTINGS", changes: { hiddenDashboardWidgets: hidden } });
      },
    }),
    [settings, dispatch]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
