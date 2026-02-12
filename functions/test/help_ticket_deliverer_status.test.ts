import { describe, expect, it } from "vitest";
import { resolveDelivererStatus } from "../src/help_ticket_deliverer_status";

describe("help ticket deliverer status resolver", () => {
  it("maps resolved status first", () => {
    const result = resolveDelivererStatus({
      status: "resolved",
      codingAgentStatus: "running",
      locale: "en",
    });

    expect(result.delivererStatus).toBe("resolved");
    expect(result.delivererStatusMessage).toBe("This ticket is resolved.");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("maps pr_created to fix_ready", () => {
    const result = resolveDelivererStatus({
      status: "in_progress",
      codingAgentStatus: "pr_created",
      locale: "fr",
    });

    expect(result.delivererStatus).toBe("fix_ready");
    expect(result.delivererStatusMessage).toBe(
      "Une correction est prête et en validation."
    );
  });

  it("maps no_changes to needs_info", () => {
    const result = resolveDelivererStatus({
      status: "in_progress",
      codingAgentStatus: "no_changes",
      locale: "en",
    });

    expect(result.delivererStatus).toBe("needs_info");
  });

  it("maps failed coding status to analyzing", () => {
    const result = resolveDelivererStatus({
      status: "open",
      codingAgentStatus: "failed",
      locale: "en",
    });

    expect(result.delivererStatus).toBe("analyzing");
    expect(result.delivererStatusMessage).toBe("Analysis in progress.");
  });

  it("uses arabic localization", () => {
    const result = resolveDelivererStatus({
      status: "awaiting_response",
      locale: "ar",
    });

    expect(result.delivererStatus).toBe("needs_info");
    expect(result.delivererStatusMessage).toBe(
      "نحتاج إلى معلومات إضافية للمتابعة."
    );
  });
});
