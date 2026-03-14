import { onCall, HttpsError } from "firebase-functions/v2/https";
import { ensureEntitlement, getPlanById } from "./entitlements";
import { getOrCreateCustomerId, getStripe, stripeSecretKey } from "./billing_core";
import { syncEntitlementFromSubscription } from "./billing_entitlement_sync";
import {
  enforceSingleManagedSubscription,
  listManagedSubscriptionsForCustomer,
} from "./billing_subscription_ops";

const ANDROID_BILLING_ALLOWED_HOSTS = new Set([
  "profit-lens-prod-2e417.web.app",
  "profit-lens-prod-2e417.firebaseapp.com",
]);
const ANDROID_BILLING_PATH = "/android-return/billing";

const billingAndroidConfig = {
  cors: true,
  secrets: [stripeSecretKey],
  timeoutSeconds: 20 as const,
  memory: "256MiB" as const,
  region: "europe-west1" as const,
};

export const createAndroidCheckoutSession = onCall(
  billingAndroidConfig,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { planId?: string; returnUrl?: string };
    const planId = data?.planId?.trim();
    const returnUrl = validateAndroidReturnUrl(data?.returnUrl);
    if (!planId) {
      throw new HttpsError("invalid-argument", "Missing planId.");
    }
    const plan = getPlanById(planId);
    if (plan.planId === "free" || !plan.priceId) {
      throw new HttpsError("invalid-argument", "Unsupported Android billing plan.");
    }

    const stripe = getStripe();
    const customerId = await getOrCreateCustomerId(uid, stripe);
    const entitlement = await ensureEntitlement(uid);
    const existingSubscriptions = await listManagedSubscriptionsForCustomer({
      uid,
      stripe,
      customerId,
      preferredSubscriptionId: entitlement.stripeSubscriptionId ?? null,
    });
    if (existingSubscriptions.length > 0) {
      const normalized = await enforceSingleManagedSubscription({
        uid,
        stripe,
        subscriptions: existingSubscriptions,
        preferredSubscriptionId: entitlement.stripeSubscriptionId ?? null,
      });
      await syncEntitlementFromSubscription(uid, normalized.primarySubscription);
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: withStatus(returnUrl, "portal"),
      });
      return {
        url: session.url,
        redirectMode: "manage",
        duplicateCleanupScheduledCount: normalized.duplicateCleanupScheduledCount,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          uid,
          planId: plan.planId,
        },
      },
      success_url: withStatus(returnUrl, "success"),
      cancel_url: withStatus(returnUrl, "cancel"),
      client_reference_id: uid,
      allow_promotion_codes: true,
      metadata: {
        uid,
        planId: plan.planId,
      },
    });
    if (!session.url) {
      throw new HttpsError("internal", "Missing checkout URL.");
    }
    return {
      url: session.url,
      redirectMode: "checkout",
      duplicateCleanupScheduledCount: 0,
    };
  },
);

export const createAndroidCustomerPortalSession = onCall(
  billingAndroidConfig,
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { returnUrl?: string };
    const returnUrl = validateAndroidReturnUrl(data?.returnUrl);
    const stripe = getStripe();
    const customerId = await getOrCreateCustomerId(uid, stripe);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: withStatus(returnUrl, "portal"),
    });
    return { url: session.url };
  },
);

export function validateAndroidReturnUrl(value?: string): string {
  if (!value?.trim()) {
    throw new HttpsError("invalid-argument", "Missing returnUrl.");
  }
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new HttpsError("invalid-argument", "Invalid returnUrl.");
  }
  if (parsed.protocol !== "https:") {
    throw new HttpsError("invalid-argument", "returnUrl must use HTTPS.");
  }
  if (!ANDROID_BILLING_ALLOWED_HOSTS.has(parsed.host)) {
    throw new HttpsError("invalid-argument", "returnUrl host is not allowed.");
  }
  if (parsed.pathname !== ANDROID_BILLING_PATH) {
    throw new HttpsError("invalid-argument", "returnUrl path is not allowed.");
  }
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

function withStatus(returnUrl: string, status: "success" | "cancel" | "portal"): string {
  const url = new URL(returnUrl);
  url.searchParams.set("status", status);
  return url.toString()
}
