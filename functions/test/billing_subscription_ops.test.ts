import { describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import {
  enforceSingleManagedSubscription,
  listManagedSubscriptionsForCustomer,
  selectPrimarySubscription,
} from "../src/billing_subscription_ops";

const buildSubscription = (params: {
  id: string;
  status?: Stripe.Subscription.Status;
  cancelAtPeriodEnd?: boolean;
  uid?: string;
}): Stripe.Subscription => {
  return {
    id: params.id,
    status: params.status ?? "active",
    cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
    current_period_end: 1_717_200_000,
    current_period_start: 1_714_608_000,
    customer: "cus_test",
    metadata: params.uid ? { uid: params.uid } : {},
    items: {
      object: "list",
      data: [
        {
          id: `si_${params.id}`,
          object: "subscription_item",
          created: 0,
          metadata: {},
          plan: null as never,
          price: {
            id: "price_test",
            object: "price",
          } as Stripe.Price,
          quantity: 1,
          subscription: params.id,
          tax_rates: [],
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "",
    },
  } as Stripe.Subscription;
};

describe("billing subscription ops", () => {
  it("selects preferred subscription when available", () => {
    const first = buildSubscription({ id: "sub_first" });
    const second = buildSubscription({ id: "sub_second" });
    const selected = selectPrimarySubscription([first, second], "sub_second");
    expect(selected.id).toBe("sub_second");
  });

  it("falls back to first subscription when preferred id is missing", () => {
    const first = buildSubscription({ id: "sub_first" });
    const second = buildSubscription({ id: "sub_second" });
    const selected = selectPrimarySubscription([first, second], "sub_missing");
    expect(selected.id).toBe("sub_first");
  });

  it("lists manageable subscriptions and prefers uid-scoped subscriptions", async () => {
    const forUser = buildSubscription({ id: "sub_uid", status: "active", uid: "user_1" });
    const forOtherUser = buildSubscription({
      id: "sub_other",
      status: "active",
      uid: "user_2",
    });
    const canceled = buildSubscription({
      id: "sub_canceled",
      status: "canceled",
      uid: "user_1",
    });
    const stripe = {
      subscriptions: {
        list: vi.fn().mockResolvedValue({
          data: [forOtherUser, canceled, forUser],
        }),
      },
    } as unknown as Stripe;
    const subscriptions = await listManagedSubscriptionsForCustomer({
      uid: "user_1",
      stripe,
      customerId: "cus_1",
      preferredSubscriptionId: null,
    });
    expect(subscriptions.map((item) => item.id)).toEqual(["sub_uid"]);
  });

  it("schedules cancellation for every non-primary duplicate subscription", async () => {
    const primary = buildSubscription({ id: "sub_primary", cancelAtPeriodEnd: false });
    const duplicateOne = buildSubscription({ id: "sub_dup_one", cancelAtPeriodEnd: false });
    const duplicateTwo = buildSubscription({ id: "sub_dup_two", cancelAtPeriodEnd: true });
    const updates = new Map<string, Stripe.Subscription>([
      [primary.id, primary],
      [duplicateOne.id, duplicateOne],
      [duplicateTwo.id, duplicateTwo],
    ]);
    const update = vi.fn(async (subscriptionId: string) => {
      const current = updates.get(subscriptionId);
      if (!current) {
        throw new Error("Missing subscription in test map.");
      }
      const next = {
        ...current,
        cancel_at_period_end: true,
      } as Stripe.Subscription;
      updates.set(subscriptionId, next);
      return next;
    });
    const stripe = {
      subscriptions: {
        update,
      },
    } as unknown as Stripe;
    const normalized = await enforceSingleManagedSubscription({
      uid: "user_1",
      stripe,
      subscriptions: [primary, duplicateOne, duplicateTwo],
      preferredSubscriptionId: primary.id,
    });
    expect(normalized.primarySubscription.id).toBe(primary.id);
    expect(normalized.duplicateCleanupScheduledCount).toBe(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(duplicateOne.id, {
      cancel_at_period_end: true,
    });
    const duplicates = normalized.subscriptions.filter(
      (subscription) => subscription.id !== primary.id
    );
    expect(duplicates.every((subscription) => subscription.cancel_at_period_end)).toBe(true);
  });
});
