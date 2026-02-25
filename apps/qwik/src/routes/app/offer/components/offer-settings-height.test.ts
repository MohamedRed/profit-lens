import { describe, expect, it } from "vitest";
import { resolveOfferSettingsViewportHeight } from "./offer-settings-height";

describe("offer-settings-height", () => {
  it("caps billing view height to available screen space", () => {
    const result = resolveOfferSettingsViewportHeight({
      view: "billing",
      viewportHeight: 800,
      contentHeight: 1400,
      panelChromeHeight: 140,
    });

    expect(result).toBe(658);
  });

  it("keeps billing minimum height when content is short", () => {
    const result = resolveOfferSettingsViewportHeight({
      view: "billing",
      viewportHeight: 900,
      contentHeight: 500,
      panelChromeHeight: 100,
    });

    expect(result).toBe(756);
  });

  it("clamps setup view by ratio limit", () => {
    const result = resolveOfferSettingsViewportHeight({
      view: "setup",
      viewportHeight: 800,
      contentHeight: 700,
      panelChromeHeight: 100,
    });

    expect(result).toBe(576);
  });

  it("never drops below the minimum viewport floor", () => {
    const result = resolveOfferSettingsViewportHeight({
      view: "billing",
      viewportHeight: 180,
      contentHeight: 100,
      panelChromeHeight: 240,
    });

    expect(result).toBe(220);
  });
});
