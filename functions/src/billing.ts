import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import Stripe from "stripe";
import {
  entitlementDocRef,
  ensureEntitlement,
  getPlanByPriceId,
  syncStripeEntitlement,
} from "./entitlements";
import { getOrCreateCustomerId, getStripe, stripeSecretKey } from "./billing_core";
import { syncEntitlementFromSubscription } from "./billing_entitlement_sync";
import {
  enforceSingleManagedSubscription,
  listManagedSubscriptionsForCustomer,
} from "./billing_subscription_ops";

const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

const stripTrailingSlashes = (value: string): string => {
  return value.replace(/\/+$/, "");
};

const buildQwikBillingReturnUrl = (origin: string, status: "success" | "cancel" | "portal"): string => {
  const baseOrigin = stripTrailingSlashes(origin);
  const params = new URLSearchParams({
    stripe_return: "1",
    stripe_status: status,
  });
  return `${baseOrigin}/next/app/settings/billing?${params.toString()}`;
};

export const createCheckoutSession = onCall(
  {
    cors: true,
    secrets: [stripeSecretKey],
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { priceId?: string; origin?: string };
    const priceId = data?.priceId?.trim();
    const origin = data?.origin?.trim();
    if (!priceId) {
      throw new HttpsError("invalid-argument", "Missing priceId.");
    }
    if (!origin) {
      throw new HttpsError("invalid-argument", "Missing origin.");
    }
    const plan = getPlanByPriceId(priceId);
    if (!plan) {
      throw new HttpsError("invalid-argument", "Unsupported priceId.");
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
        return_url: buildQwikBillingReturnUrl(origin, "portal"),
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
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          uid,
          planId: plan.planId,
        },
      },
      success_url: buildQwikBillingReturnUrl(origin, "success"),
      cancel_url: buildQwikBillingReturnUrl(origin, "cancel"),
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
  }
);

export const createCustomerPortalSession = onCall(
  {
    cors: true,
    secrets: [stripeSecretKey],
    minInstances: 1,
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const data = request.data as { origin?: string };
    const origin = data?.origin?.trim();
    if (!origin) {
      throw new HttpsError("invalid-argument", "Missing origin.");
    }
    const stripe = getStripe();
    const customerId = await getOrCreateCustomerId(uid, stripe);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: buildQwikBillingReturnUrl(origin, "portal"),
    });
    return { url: session.url };
  }
);

export const stripeWebhook = onRequest(
  {
    secrets: [stripeSecretKey, stripeWebhookSecret],
    region: "europe-west1",
  },
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
      res.status(400).send("Missing Stripe signature.");
      return;
    }
    const webhookSecret = stripeWebhookSecret.value();
    if (!webhookSecret) {
      res.status(500).send("STRIPE_WEBHOOK_SECRET is not set.");
      return;
    }
    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      );
    } catch (error) {
      logger.error("Stripe webhook signature verification failed", {
        error,
      });
      res.status(400).send("Invalid signature.");
      return;
    }
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await syncSubscription(subscription);
          break;
        }
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await syncCheckoutSession(session, stripe);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      logger.error("Stripe webhook handling failed", { error, type: event.type });
      res.status(500).send("Webhook failed.");
      return;
    }
    res.json({ received: true });
  }
);

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const uid = subscription.metadata?.uid?.trim();
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  if (!priceId) {
    logger.warn("Subscription missing price", { subscriptionId: subscription.id });
    return;
  }
  if (uid) {
    await syncEntitlementFromSubscription(uid, subscription);
    return;
  }
  await syncStripeEntitlement({
    customerId,
    subscriptionId: subscription.id,
    priceId,
    status: subscription.status,
    periodStartSec: subscription.current_period_start,
    periodEndSec: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAtSec: subscription.canceled_at,
  });
}

async function syncCheckoutSession(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  if (!session.customer || typeof session.customer !== "string") {
    return;
  }
  const uid = session.client_reference_id;
  if (!uid) {
    return;
  }
  const docRef = entitlementDocRef(uid);
  await docRef.set(
    {
      stripeCustomerId: session.customer,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
  if (!session.subscription || typeof session.subscription !== "string") {
    return;
  }
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription
  );
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  if (!priceId) {
    logger.warn("Checkout session missing price", {
      subscriptionId: subscription.id,
      sessionId: session.id,
    });
    return;
  }
  await syncEntitlementFromSubscription(uid, subscription);
}
