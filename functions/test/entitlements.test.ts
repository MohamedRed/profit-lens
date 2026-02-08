import { beforeEach, describe, expect, it, vi } from "vitest";

const PRICE_TIER_9 = "price_test_9";
const PRICE_TIER_24 = "price_test_24";
const PRICE_TIER_34 = "price_test_34";

describe("entitlements", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.STRIPE_PRICE_TIER_9 = PRICE_TIER_9;
    process.env.STRIPE_PRICE_TIER_24 = PRICE_TIER_24;
    process.env.STRIPE_PRICE_TIER_34 = PRICE_TIER_34;
  });

  it("maps plan limits by id", async () => {
    vi.doMock("../src/firebase_admin", () => ({ db: {} }));
    const { getPlanById } = await import("../src/entitlements");

    expect(getPlanById("free").offerLimit).toBe(10);
    expect(getPlanById("tier_9").offerLimit).toBe(250);
    expect(getPlanById("tier_24").offerLimit).toBe(1000);
    expect(getPlanById("tier_34").offerLimit).toBeNull();
  });

  it("maps plan from Stripe price id", async () => {
    vi.doMock("../src/firebase_admin", () => ({ db: {} }));
    const { getPlanByPriceId } = await import("../src/entitlements");

    expect(getPlanByPriceId(PRICE_TIER_9)?.planId).toBe("tier_9");
    expect(getPlanByPriceId(PRICE_TIER_24)?.planId).toBe("tier_24");
    expect(getPlanByPriceId(PRICE_TIER_34)?.planId).toBe("tier_34");
    expect(getPlanByPriceId("unknown")).toBeNull();
  });

  it("builds free period boundaries in UTC", async () => {
    vi.doMock("../src/firebase_admin", () => ({ db: {} }));
    const { buildFreePeriod } = await import("../src/entitlements");

    const now = new Date(Date.UTC(2026, 1, 8, 12, 30, 0));
    const period = buildFreePeriod(now);

    expect(period.periodKey).toBe("2026-02");
    expect(period.periodStart.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(period.periodEnd.toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });

  it("builds Stripe period key from epoch seconds", async () => {
    vi.doMock("../src/firebase_admin", () => ({ db: {} }));
    const { buildStripePeriod } = await import("../src/entitlements");

    const start = Math.floor(Date.UTC(2026, 1, 1, 0, 0, 0) / 1000);
    const end = Math.floor(Date.UTC(2026, 2, 3, 0, 0, 0) / 1000);
    const period = buildStripePeriod(start, end);

    expect(period.periodStart.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(period.periodEnd.toISOString()).toBe("2026-03-03T00:00:00.000Z");
    expect(period.periodKey).toContain(period.periodStart.toISOString());
  });
});
