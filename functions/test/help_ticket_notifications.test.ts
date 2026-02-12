import { describe, expect, it } from "vitest";
import { hasDelivererStatusChanged } from "../src/help_ticket_notifications";

describe("hasDelivererStatusChanged", () => {
  it("returns true when status changes", () => {
    expect(hasDelivererStatusChanged("analyzing", "fix_ready")).toBe(true);
  });

  it("returns false when status is unchanged", () => {
    expect(hasDelivererStatusChanged("needs_info", "needs_info")).toBe(false);
  });

  it("returns false when both statuses are null", () => {
    expect(hasDelivererStatusChanged(null, null)).toBe(false);
  });
});
