import { HttpsError, onCall } from "firebase-functions/v2/https";
import Stripe from "stripe";
import {
  ensureEntitlement,
  getPlanByPriceId,
  syncStripeEntitlementForUid,
} from "./entitlements";
import { getStripe, stripeSecretKey } from "./billing_core";

const billingCallableConfig = {
  cors: true,
  secrets: [stripeSecretKey],
  minInstances: 1,
  timeoutSeconds: 20,
  memory: "256MiB" as const,
  region: "europe-west1",
};

const MANAGEABLE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
]);

type ManagedSubscriptionResponse = {
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndSec: number;
  currentPriceId: string;
  currentPlanId: string;
};

const readCustomerId = (customer: string | Stripe.Customer | Stripe.DeletedCustomer): string => {
  if (typeof customer === "string") {
    return customer;
  }
  return customer.id;
};

const readPrimarySubscriptionItem = (subscription: Stripe.Subscription): Stripe.SubscriptionItem => {
  const item = subscription.items.data[0];
  if (!item?.id || !item.price?.id) {
    throw new HttpsError("failed-precondition", "Subscription is missing an active price item.");
  }
  return item;
};

const toManagedResponse = (subscription: Stripe.Subscription): ManagedSubscriptionResponse => {
  const item = readPrimarySubscriptionItem(subscription);
  const priceId = item.price.id;
  const plan = getPlanByPriceId(priceId);
  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEndSec: subscription.current_period_end,
    currentPriceId: priceId,
    currentPlanId: plan?.planId ?? "unknown",
  };
};

const syncEntitlementFromSubscription = async (uid: string, subscription: Stripe.Subscription) => {
  const item = readPrimarySubscriptionItem(subscription);
  await syncStripeEntitlementForUid({
    uid,
    customerId: readCustomerId(subscription.customer),
    subscriptionId: subscription.id,
    priceId: item.price.id,
    status: subscription.status,
    periodStartSec: subscription.current_period_start,
    periodEndSec: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAtSec: subscription.canceled_at,
  });
};

const resolveManagedSubscription = async (
  uid: string,
  stripe: Stripe
): Promise<Stripe.Subscription> => {
  const entitlement = await ensureEntitlement(uid);
  const customerId = entitlement.stripeCustomerId;
  if (!customerId) {
    throw new HttpsError("failed-precondition", "No Stripe customer is linked to this account.");
  }

  const entitlementSubscriptionId = entitlement.stripeSubscriptionId;
  if (entitlementSubscriptionId) {
    try {
      const byEntitlement = await stripe.subscriptions.retrieve(entitlementSubscriptionId);
      if (MANAGEABLE_STATUSES.has(byEntitlement.status)) {
        return byEntitlement;
      }
    } catch {
      // Subscription can be replaced/removed on Stripe side. We resolve from customer list below.
    }
  }

  const listed = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });
  const managed = listed.data.find((subscription) =>
    MANAGEABLE_STATUSES.has(subscription.status)
  );
  if (!managed) {
    throw new HttpsError(
      "failed-precondition",
      "No active subscription is available to manage."
    );
  }
  return managed;
};

export const changeSubscriptionPlan = onCall(
  billingCallableConfig,
  async (request): Promise<ManagedSubscriptionResponse> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { priceId?: string };
    const priceId = data?.priceId?.trim();
    if (!priceId) {
      throw new HttpsError("invalid-argument", "Missing priceId.");
    }
    const targetPlan = getPlanByPriceId(priceId);
    if (!targetPlan) {
      throw new HttpsError("invalid-argument", "Unsupported priceId.");
    }

    const stripe = getStripe();
    const currentSubscription = await resolveManagedSubscription(uid, stripe);
    const currentItem = readPrimarySubscriptionItem(currentSubscription);
    const isNoop =
      currentItem.price.id === priceId && currentSubscription.cancel_at_period_end === false;
    if (isNoop) {
      return toManagedResponse(currentSubscription);
    }

    const updated = await stripe.subscriptions.update(currentSubscription.id, {
      items: [
        {
          id: currentItem.id,
          price: priceId,
        },
      ],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
    });
    await syncEntitlementFromSubscription(uid, updated);
    return toManagedResponse(updated);
  }
);

export const setSubscriptionCancellation = onCall(
  billingCallableConfig,
  async (request): Promise<ManagedSubscriptionResponse> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { cancelAtPeriodEnd?: boolean };
    if (typeof data?.cancelAtPeriodEnd !== "boolean") {
      throw new HttpsError("invalid-argument", "cancelAtPeriodEnd must be a boolean.");
    }

    const stripe = getStripe();
    const currentSubscription = await resolveManagedSubscription(uid, stripe);
    if (currentSubscription.cancel_at_period_end === data.cancelAtPeriodEnd) {
      return toManagedResponse(currentSubscription);
    }

    const updated = await stripe.subscriptions.update(currentSubscription.id, {
      cancel_at_period_end: data.cancelAtPeriodEnd,
    });
    await syncEntitlementFromSubscription(uid, updated);
    return toManagedResponse(updated);
  }
);
