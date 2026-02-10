import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import {
  entitlementDocRef,
  ensureEntitlement,
  getPlanByPriceId,
  syncStripeEntitlement,
  syncStripeEntitlementForUid,
} from "./entitlements";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

function getStripe() {
  const key = stripeSecretKey.value();
  if (!key) {
    throw new HttpsError("failed-precondition", "STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

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
    await ensureEntitlement(uid);
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
      success_url: `${origin}/?stripe_return=1`,
      cancel_url: `${origin}/?stripe_return=1`,
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
    return { url: session.url };
  }
);

export const createCustomerPortalSession = onCall(
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
    const data = request.data as { origin?: string };
    const origin = data?.origin?.trim();
    if (!origin) {
      throw new HttpsError("invalid-argument", "Missing origin.");
    }
    const stripe = getStripe();
    const customerId = await getOrCreateCustomerId(uid, stripe);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/?stripe_return=1`,
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

async function getOrCreateCustomerId(uid: string, stripe: Stripe) {
  const docRef = entitlementDocRef(uid);
  const snapshot = await docRef.get();
  const existing = snapshot.data()?.stripeCustomerId as string | undefined;
  if (existing) {
    return existing;
  }
  const customer = await stripe.customers.create({
    metadata: { uid },
  });
  await docRef.set(
    {
      stripeCustomerId: customer.id,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
  return customer.id;
}

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
    await syncStripeEntitlementForUid({
      uid,
      customerId,
      subscriptionId: subscription.id,
      priceId,
      status: subscription.status,
      periodStartSec: subscription.current_period_start,
      periodEndSec: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAtSec: subscription.canceled_at,
    });
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
  await syncStripeEntitlementForUid({
    uid,
    customerId: session.customer,
    subscriptionId: subscription.id,
    priceId,
    status: subscription.status,
    periodStartSec: subscription.current_period_start,
    periodEndSec: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAtSec: subscription.canceled_at,
  });
}
