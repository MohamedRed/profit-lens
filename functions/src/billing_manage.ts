import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
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
]);

type ManagedSubscriptionResponse = {
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndSec: number;
  currentPriceId: string;
  currentPlanId: string;
};

type ManagedSubscriptionStateResponse = ManagedSubscriptionResponse & {
  managedSubscriptions: ManagedSubscriptionResponse[];
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

const toManagedResponseSafe = (
  subscription: Stripe.Subscription
): ManagedSubscriptionResponse | null => {
  try {
    return toManagedResponse(subscription);
  } catch (error) {
    logger.warn("Skipping invalid Stripe subscription while building managed list.", {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

const reorderWithPrimaryFirst = (
  subscriptions: Stripe.Subscription[],
  primarySubscriptionId: string | null
): Stripe.Subscription[] => {
  if (!primarySubscriptionId) {
    return subscriptions;
  }
  return [...subscriptions].sort((left, right) => {
    const leftPrimary = left.id === primarySubscriptionId;
    const rightPrimary = right.id === primarySubscriptionId;
    if (leftPrimary === rightPrimary) {
      return 0;
    }
    return leftPrimary ? -1 : 1;
  });
};

const buildManagedStateResponse = (
  primary: Stripe.Subscription,
  subscriptions: Stripe.Subscription[]
): ManagedSubscriptionStateResponse => {
  const primarySnapshot = toManagedResponse(primary);
  const snapshots = subscriptions
    .map((subscription) => toManagedResponseSafe(subscription))
    .filter((snapshot): snapshot is ManagedSubscriptionResponse => Boolean(snapshot));
  const deduped = new Map<string, ManagedSubscriptionResponse>();
  snapshots.forEach((snapshot) => {
    deduped.set(snapshot.subscriptionId, snapshot);
  });
  if (!deduped.has(primarySnapshot.subscriptionId)) {
    deduped.set(primarySnapshot.subscriptionId, primarySnapshot);
  }
  const managedSubscriptions = [
    deduped.get(primarySnapshot.subscriptionId)!,
    ...Array.from(deduped.values()).filter(
      (snapshot) => snapshot.subscriptionId !== primarySnapshot.subscriptionId
    ),
  ];
  return {
    ...primarySnapshot,
    managedSubscriptions,
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

const listManagedSubscriptionsForCustomer = async (
  uid: string,
  stripe: Stripe,
  customerId: string,
  primarySubscriptionId: string | null
): Promise<Stripe.Subscription[]> => {
  const listed = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });
  const manageable = listed.data.filter((subscription) =>
    MANAGEABLE_STATUSES.has(subscription.status)
  );
  const managedForUid = manageable.filter(
    (subscription) => subscription.metadata?.uid === uid
  );
  const subscriptions = managedForUid.length > 0 ? managedForUid : manageable;
  return reorderWithPrimaryFirst(subscriptions, primarySubscriptionId);
};

const resolveManagedSubscriptions = async (
  uid: string,
  stripe: Stripe
): Promise<{
  customerId: string;
  subscriptions: Stripe.Subscription[];
}> => {
  const entitlement = await ensureEntitlement(uid);
  const customerId = entitlement.stripeCustomerId;
  if (!customerId) {
    throw new HttpsError("failed-precondition", "No Stripe customer is linked to this account.");
  }
  const preferredSubscriptionId = entitlement.stripeSubscriptionId ?? null;
  const subscriptions = await listManagedSubscriptionsForCustomer(
    uid,
    stripe,
    customerId,
    preferredSubscriptionId
  );
  if (subscriptions.length === 0) {
    throw new HttpsError(
      "failed-precondition",
      "No active subscription is available to manage."
    );
  }
  return {
    customerId,
    subscriptions,
  };
};

export const getManagedSubscriptionState = onCall(
  billingCallableConfig,
  async (request): Promise<ManagedSubscriptionStateResponse> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const stripe = getStripe();
    const { subscriptions } = await resolveManagedSubscriptions(uid, stripe);
    const currentSubscription = subscriptions[0];
    return buildManagedStateResponse(currentSubscription, subscriptions);
  }
);

export const changeSubscriptionPlan = onCall(
  billingCallableConfig,
  async (request): Promise<ManagedSubscriptionStateResponse> => {
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
    const { customerId, subscriptions } = await resolveManagedSubscriptions(uid, stripe);
    const currentSubscription = subscriptions[0];
    const currentItem = readPrimarySubscriptionItem(currentSubscription);
    const samePrice = currentItem.price.id === priceId;
    if (samePrice && currentSubscription.cancel_at_period_end === false) {
      return buildManagedStateResponse(currentSubscription, subscriptions);
    }

    const updatePayload: Stripe.SubscriptionUpdateParams = samePrice
      ? {
          cancel_at_period_end: false,
        }
      : {
          items: [
            {
              id: currentItem.id,
              price: priceId,
            },
          ],
          proration_behavior: "create_prorations",
          cancel_at_period_end: false,
        };

    const updated = await stripe.subscriptions.update(
      currentSubscription.id,
      updatePayload
    );
    await syncEntitlementFromSubscription(uid, updated);
    const subscriptionsAfterUpdate = await listManagedSubscriptionsForCustomer(
      uid,
      stripe,
      customerId,
      updated.id
    );
    return buildManagedStateResponse(
      updated,
      subscriptionsAfterUpdate.length > 0 ? subscriptionsAfterUpdate : [updated]
    );
  }
);

export const setSubscriptionCancellation = onCall(
  billingCallableConfig,
  async (request): Promise<ManagedSubscriptionStateResponse> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { cancelAtPeriodEnd?: boolean };
    if (typeof data?.cancelAtPeriodEnd !== "boolean") {
      throw new HttpsError("invalid-argument", "cancelAtPeriodEnd must be a boolean.");
    }

    const stripe = getStripe();
    const { customerId, subscriptions } = await resolveManagedSubscriptions(uid, stripe);
    const currentSubscription = subscriptions[0];
    if (currentSubscription.cancel_at_period_end === data.cancelAtPeriodEnd) {
      return buildManagedStateResponse(currentSubscription, subscriptions);
    }

    const updated = await stripe.subscriptions.update(currentSubscription.id, {
      cancel_at_period_end: data.cancelAtPeriodEnd,
    });
    await syncEntitlementFromSubscription(uid, updated);
    const subscriptionsAfterUpdate = await listManagedSubscriptionsForCustomer(
      uid,
      stripe,
      customerId,
      updated.id
    );
    return buildManagedStateResponse(
      updated,
      subscriptionsAfterUpdate.length > 0 ? subscriptionsAfterUpdate : [updated]
    );
  }
);
