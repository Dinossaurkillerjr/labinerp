import { DEFAULT_SETTINGS, type Settings } from "./types";

export type SettingsAction =
  | { type: "HYDRATE"; state: Settings }
  | { type: "UPDATE_SETTINGS"; changes: Partial<Settings> };

export function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case "HYDRATE":
      // Merge over defaults so a settings shape from an older version never
      // ends up missing a newly-added field.
      return { ...DEFAULT_SETTINGS, ...action.state };
    case "UPDATE_SETTINGS":
      return { ...state, ...action.changes };
    default:
      return state;
  }
}
