import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import { ensureEntitlement, getPlanByPriceId } from "./entitlements";

const MANAGEABLE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
]);

export type ManagedSubscriptionResponse = {
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndSec: number;
  currentPriceId: string;
  currentPlanId: string;
};

export type ManagedSubscriptionStateResponse = ManagedSubscriptionResponse & {
  managedSubscriptions: ManagedSubscriptionResponse[];
  duplicateCleanupScheduledCount: number;
};

export const readCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): string => {
  if (typeof customer === "string") {
    return customer;
  }
  return customer.id;
};

export const readPrimarySubscriptionItem = (
  subscription: Stripe.Subscription
): Stripe.SubscriptionItem => {
  const item = subscription.items.data[0];
  if (!item?.id || !item.price?.id) {
    throw new HttpsError(
      "failed-precondition",
      "Subscription is missing an active price item."
    );
  }
  return item;
};

export const toManagedResponse = (
  subscription: Stripe.Subscription
): ManagedSubscriptionResponse => {
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

export const selectPrimarySubscription = (
  subscriptions: Stripe.Subscription[],
  preferredSubscriptionId: string | null
): Stripe.Subscription => {
  if (subscriptions.length === 0) {
    throw new HttpsError(
      "failed-precondition",
      "No active subscription is available to manage."
    );
  }
  const preferred = preferredSubscriptionId
    ? subscriptions.find((subscription) => subscription.id === preferredSubscriptionId)
    : null;
  return preferred ?? subscriptions[0];
};

export const listManagedSubscriptionsForCustomer = async (params: {
  uid: string;
  stripe: Stripe;
  customerId: string;
  preferredSubscriptionId: string | null;
}): Promise<Stripe.Subscription[]> => {
  const listed = await params.stripe.subscriptions.list({
    customer: params.customerId,
    status: "all",
    limit: 20,
  });
  const manageable = listed.data.filter((subscription) =>
    MANAGEABLE_STATUSES.has(subscription.status)
  );
  const managedForUid = manageable.filter(
    (subscription) => subscription.metadata?.uid === params.uid
  );
  const picked = managedForUid.length > 0 ? managedForUid : manageable;
  return reorderWithPrimaryFirst(picked, params.preferredSubscriptionId);
};

export const resolveManagedSubscriptionsForBillingAction = async (params: {
  uid: string;
  stripe: Stripe;
}): Promise<{
  customerId: string;
  preferredSubscriptionId: string | null;
  subscriptions: Stripe.Subscription[];
}> => {
  const entitlement = await ensureEntitlement(params.uid);
  const customerId = entitlement.stripeCustomerId;
  if (!customerId) {
    throw new HttpsError(
      "failed-precondition",
      "No Stripe customer is linked to this account."
    );
  }
  const preferredSubscriptionId = entitlement.stripeSubscriptionId ?? null;
  const subscriptions = await listManagedSubscriptionsForCustomer({
    uid: params.uid,
    stripe: params.stripe,
    customerId,
    preferredSubscriptionId,
  });
  if (subscriptions.length === 0) {
    throw new HttpsError(
      "failed-precondition",
      "No active subscription is available to manage."
    );
  }
  return {
    customerId,
    preferredSubscriptionId,
    subscriptions,
  };
};

export const enforceSingleManagedSubscription = async (params: {
  uid: string;
  stripe: Stripe;
  subscriptions: Stripe.Subscription[];
  preferredSubscriptionId: string | null;
}): Promise<{
  duplicateCleanupScheduledCount: number;
  primarySubscription: Stripe.Subscription;
  subscriptions: Stripe.Subscription[];
}> => {
  const primary = selectPrimarySubscription(
    params.subscriptions,
    params.preferredSubscriptionId
  );
  let duplicateCleanupScheduledCount = 0;
  const normalized = await Promise.all(
    params.subscriptions.map(async (subscription) => {
      if (subscription.id === primary.id) {
        return subscription;
      }
      if (subscription.cancel_at_period_end) {
        return subscription;
      }
      const updated = await params.stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      duplicateCleanupScheduledCount += 1;
      logger.info("Scheduled duplicate subscription cancellation at period end.", {
        uid: params.uid,
        primarySubscriptionId: primary.id,
        scheduledSubscriptionId: subscription.id,
      });
      return updated;
    })
  );
  const primarySubscription = selectPrimarySubscription(normalized, primary.id);
  return {
    duplicateCleanupScheduledCount,
    primarySubscription,
    subscriptions: reorderWithPrimaryFirst(normalized, primary.id),
  };
};

export const buildManagedStateResponse = (params: {
  primarySubscription: Stripe.Subscription;
  subscriptions: Stripe.Subscription[];
  duplicateCleanupScheduledCount: number;
}): ManagedSubscriptionStateResponse => {
  const primarySnapshot = toManagedResponse(params.primarySubscription);
  const snapshots = params.subscriptions
    .map((subscription) => toManagedResponseSafe(subscription))
    .filter((snapshot): snapshot is ManagedSubscriptionResponse => Boolean(snapshot));
  const deduped = new Map<string, ManagedSubscriptionResponse>();
  snapshots.forEach((snapshot) => {
    deduped.set(snapshot.subscriptionId, snapshot);
  });
  if (!deduped.has(primarySnapshot.subscriptionId)) {
    deduped.set(primarySnapshot.subscriptionId, primarySnapshot);
  }
  return {
    ...primarySnapshot,
    duplicateCleanupScheduledCount: params.duplicateCleanupScheduledCount,
    managedSubscriptions: [
      deduped.get(primarySnapshot.subscriptionId)!,
      ...Array.from(deduped.values()).filter(
        (snapshot) => snapshot.subscriptionId !== primarySnapshot.subscriptionId
      ),
    ],
  };
};
