import { HttpsError, onCall } from "firebase-functions/v2/https";
import { ensureEntitlement, getPlanByPriceId } from "./entitlements";
import { getStripe, stripeSecretKey } from "./billing_core";
import { syncEntitlementFromSubscription } from "./billing_entitlement_sync";
import {
  buildManagedStateResponse,
  enforceSingleManagedSubscription,
  listManagedSubscriptionsForCustomer,
  readPrimarySubscriptionItem,
  resolveManagedSubscriptionsForBillingAction,
  selectPrimarySubscription,
} from "./billing_subscription_ops";

const billingCallableConfig = {
  cors: true,
  secrets: [stripeSecretKey],
  minInstances: 1,
  timeoutSeconds: 20,
  memory: "256MiB" as const,
  region: "europe-west1",
};

const loadManagedStateWithCleanup = async (params: {
  uid: string;
  customerId: string;
  preferredSubscriptionId: string | null;
}) => {
  const stripe = getStripe();
  const listed = await listManagedSubscriptionsForCustomer({
    uid: params.uid,
    stripe,
    customerId: params.customerId,
    preferredSubscriptionId: params.preferredSubscriptionId,
  });
  if (listed.length === 0) {
    throw new HttpsError(
      "failed-precondition",
      "No active subscription is available to manage."
    );
  }
  const normalized = await enforceSingleManagedSubscription({
    uid: params.uid,
    stripe,
    subscriptions: listed,
    preferredSubscriptionId: params.preferredSubscriptionId,
  });
  await syncEntitlementFromSubscription(params.uid, normalized.primarySubscription);
  return buildManagedStateResponse({
    primarySubscription: normalized.primarySubscription,
    subscriptions: normalized.subscriptions,
    duplicateCleanupScheduledCount: normalized.duplicateCleanupScheduledCount,
  });
};

export const checkSubscriptionEligibility = onCall(
  billingCallableConfig,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const stripe = getStripe();
    const entitlement = await ensureEntitlement(uid);
    const customerId = entitlement.stripeCustomerId;
    if (!customerId) {
      return {
        eligibleForCheckout: true,
        manageableSubscriptionCount: 0,
        duplicateSubscriptionCount: 0,
        primarySubscriptionId: null,
      };
    }
    const subscriptions = await listManagedSubscriptionsForCustomer({
      uid,
      stripe,
      customerId,
      preferredSubscriptionId: entitlement.stripeSubscriptionId ?? null,
    });
    const primarySubscription =
      subscriptions.length > 0
        ? selectPrimarySubscription(
            subscriptions,
            entitlement.stripeSubscriptionId ?? null
          )
        : null;
    return {
      eligibleForCheckout: subscriptions.length === 0,
      manageableSubscriptionCount: subscriptions.length,
      duplicateSubscriptionCount: Math.max(0, subscriptions.length - 1),
      primarySubscriptionId: primarySubscription?.id ?? null,
    };
  }
);

export const getManagedSubscriptionState = onCall(
  billingCallableConfig,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const stripe = getStripe();
    const resolved = await resolveManagedSubscriptionsForBillingAction({
      uid,
      stripe,
    });
    const normalized = await enforceSingleManagedSubscription({
      uid,
      stripe,
      subscriptions: resolved.subscriptions,
      preferredSubscriptionId: resolved.preferredSubscriptionId,
    });
    await syncEntitlementFromSubscription(uid, normalized.primarySubscription);
    return buildManagedStateResponse({
      primarySubscription: normalized.primarySubscription,
      subscriptions: normalized.subscriptions,
      duplicateCleanupScheduledCount: normalized.duplicateCleanupScheduledCount,
    });
  }
);

export const changeSubscriptionPlan = onCall(
  billingCallableConfig,
  async (request) => {
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
    const resolved = await resolveManagedSubscriptionsForBillingAction({
      uid,
      stripe,
    });
    const currentSubscription = selectPrimarySubscription(
      resolved.subscriptions,
      resolved.preferredSubscriptionId
    );
    const currentItem = readPrimarySubscriptionItem(currentSubscription);
    const samePrice = currentItem.price.id === priceId;
    if (!samePrice || currentSubscription.cancel_at_period_end) {
      const updatePayload = samePrice
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
            proration_behavior: "create_prorations" as const,
            cancel_at_period_end: false,
          };
      await stripe.subscriptions.update(currentSubscription.id, updatePayload);
    }
    return await loadManagedStateWithCleanup({
      uid,
      customerId: resolved.customerId,
      preferredSubscriptionId: currentSubscription.id,
    });
  }
);

export const setSubscriptionCancellation = onCall(
  billingCallableConfig,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { cancelAtPeriodEnd?: boolean };
    if (typeof data?.cancelAtPeriodEnd !== "boolean") {
      throw new HttpsError("invalid-argument", "cancelAtPeriodEnd must be a boolean.");
    }

    const stripe = getStripe();
    const resolved = await resolveManagedSubscriptionsForBillingAction({
      uid,
      stripe,
    });
    const currentSubscription = selectPrimarySubscription(
      resolved.subscriptions,
      resolved.preferredSubscriptionId
    );
    if (currentSubscription.cancel_at_period_end !== data.cancelAtPeriodEnd) {
      await stripe.subscriptions.update(currentSubscription.id, {
        cancel_at_period_end: data.cancelAtPeriodEnd,
      });
    }
    return await loadManagedStateWithCleanup({
      uid,
      customerId: resolved.customerId,
      preferredSubscriptionId: currentSubscription.id,
    });
  }
);
