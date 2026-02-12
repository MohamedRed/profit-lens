import { describe, expect, it } from "vitest";
import { resolveHelpTicketTitle } from "../src/help_ticket_title";

describe("resolveHelpTicketTitle", () => {
  it("uses model title when present", () => {
    const title = resolveHelpTicketTitle({
      title: "Checkout bloqué après abonnement.",
      summary: "Summary fallback",
      locale: "fr",
    });
    expect(title).toBe("Checkout bloqué après abonnement");
  });

  it("falls back to summary when title is empty", () => {
    const title = resolveHelpTicketTitle({
      title: "   ",
      summary: "Impossible de finaliser le paiement après la mise à jour.",
      locale: "fr",
    });
    expect(title).toBe("Impossible de finaliser le paiement après la mise à jour");
  });

  it("returns localized default when model output is missing", () => {
    const title = resolveHelpTicketTitle({
      title: "",
      summary: "",
      locale: "ar",
    });
    expect(title).toBe("طلب دعم");
  });
});
