import { describe, expect, it, vi } from "vitest";
import { createFakeDb, getStoreValue } from "./helpers/fake_firestore";

describe("offer usage", () => {
  it("increments usage within the limit", async () => {
    const store = new Map<string, Record<string, any>>();
    const fakeDb = createFakeDb(store);
    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({ db: fakeDb }));

    const { saveOfferWithUsage } = await import("../src/offer_usage");

    const uid = "user-1";
    const periodKey = "2026-02";
    const entitlement = {
      planId: "free",
      status: "free",
      offerLimit: 10,
      deviceLimit: 1,
      periodStart: new Date("2026-02-01T00:00:00Z"),
      periodEnd: new Date("2026-03-01T00:00:00Z"),
      periodKey,
      source: "free" as const,
    };
    const docRef = fakeDb
      .collection("users")
      .doc(uid)
      .collection("offers")
      .doc("offer-1");

    await saveOfferWithUsage({
      uid,
      entitlement,
      docRef,
      document: { id: "offer-1" },
    });

    const usageRef = fakeDb
      .collection("users")
      .doc(uid)
      .collection("usage")
      .doc(periodKey);
    const usage = getStoreValue(store, usageRef);
    expect(usage?.offerCount).toBe(1);
  });

  it("blocks when the limit is reached", async () => {
    const store = new Map<string, Record<string, any>>();
    const fakeDb = createFakeDb(store);
    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({ db: fakeDb }));

    const { saveOfferWithUsage } = await import("../src/offer_usage");

    const uid = "user-2";
    const periodKey = "2026-02";
    const usageRef = fakeDb
      .collection("users")
      .doc(uid)
      .collection("usage")
      .doc(periodKey);
    store.set(usageRef.path, { offerCount: 1 });

    const entitlement = {
      planId: "tier_9",
      status: "active",
      offerLimit: 1,
      deviceLimit: 1,
      periodStart: new Date("2026-02-01T00:00:00Z"),
      periodEnd: new Date("2026-03-01T00:00:00Z"),
      periodKey,
      source: "stripe" as const,
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_123",
    };
    const docRef = fakeDb
      .collection("users")
      .doc(uid)
      .collection("offers")
      .doc("offer-2");

    await expect(
      saveOfferWithUsage({
        uid,
        entitlement,
        docRef,
        document: { id: "offer-2" },
      })
    ).rejects.toHaveProperty("code", "resource-exhausted");
  });

  it("allows unlimited plans", async () => {
    const store = new Map<string, Record<string, any>>();
    const fakeDb = createFakeDb(store);
    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({ db: fakeDb }));

    const { saveOfferWithUsage } = await import("../src/offer_usage");

    const uid = "user-3";
    const periodKey = "2026-02";
    const entitlement = {
      planId: "tier_34",
      status: "active",
      offerLimit: null,
      deviceLimit: 1,
      periodStart: new Date("2026-02-01T00:00:00Z"),
      periodEnd: new Date("2026-03-01T00:00:00Z"),
      periodKey,
      source: "stripe" as const,
    };
    const docRef = fakeDb
      .collection("users")
      .doc(uid)
      .collection("offers")
      .doc("offer-3");

    await saveOfferWithUsage({
      uid,
      entitlement,
      docRef,
      document: { id: "offer-3" },
    });

    const usageRef = fakeDb
      .collection("users")
      .doc(uid)
      .collection("usage")
      .doc(periodKey);
    const usage = getStoreValue(store, usageRef);
    expect(usage?.offerCount).toBe(1);
  });
});
