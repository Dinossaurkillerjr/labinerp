import { describe, expect, it } from "vitest";
import { settingsReducer } from "./settings-reducer";
import { DEFAULT_SETTINGS } from "./types";

describe("settingsReducer", () => {
  it("UPDATE_SETTINGS aplica só as mudanças informadas", () => {
    const state = settingsReducer(DEFAULT_SETTINGS, { type: "UPDATE_SETTINGS", changes: { marginThresholdPercent: 25 } });
    expect(state.marginThresholdPercent).toBe(25);
    expect(state.dashboardDetailed).toBe(DEFAULT_SETTINGS.dashboardDetailed);
  });

  it("HYDRATE preenche campos ausentes com os padrões (compatibilidade)", () => {
    const state = settingsReducer(DEFAULT_SETTINGS, {
      type: "HYDRATE",
      state: { marginThresholdPercent: 30 } as never,
    });
    expect(state.marginThresholdPercent).toBe(30);
    expect(state.hiddenDashboardWidgets).toEqual(DEFAULT_SETTINGS.hiddenDashboardWidgets);
  });
});
