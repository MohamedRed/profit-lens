import { DocumentData, Timestamp } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase_admin";

type PlanConfig = {
  planId: string;
  offerLimit: number | null;
  priceId: string | null;
};

export type EntitlementSnapshot = {
  planId: string;
  status: string;
  offerLimit: number | null;
  deviceLimit: number;
  periodStart: Date;
  periodEnd: Date;
  periodKey: string;
  source: "stripe" | "free";
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
};

const stripePriceTier9 = defineString("STRIPE_PRICE_TIER_9", {
  default: "",
});
const stripePriceTier24 = defineString("STRIPE_PRICE_TIER_24", {
  default: "",
});
const stripePriceTier34 = defineString("STRIPE_PRICE_TIER_34", {
  default: "",
});

const DEVICE_LIMIT = 1;
const FREE_PLAN: PlanConfig = {
  planId: "free",
  offerLimit: 10,
  priceId: null,
};

function getPaidPlans(): PlanConfig[] {
  return [
    {
      planId: "tier_9",
      offerLimit: 250,
      priceId: stripePriceTier9.value(),
    },
    {
      planId: "tier_24",
      offerLimit: 1000,
      priceId: stripePriceTier24.value(),
    },
    {
      planId: "tier_34",
      offerLimit: null,
      priceId: stripePriceTier34.value(),
    },
  ];
}

export function getPlanByPriceId(priceId: string): PlanConfig | null {
  const plans = getPaidPlans();
  return plans.find((plan) => plan.priceId === priceId) ?? null;
}

export function getPlanById(planId: string): PlanConfig {
  if (planId == FREE_PLAN.planId) return FREE_PLAN;
  const paid = getPaidPlans().find((plan) => plan.planId == planId);
  return paid ?? FREE_PLAN;
}

export function entitlementDocRef(uid: string) {
  return db
    .collection("users")
    .doc(uid)
    .collection("entitlements")
    .doc("current");
}

export function usageDocRef(uid: string, periodKey: string) {
  return db.collection("users").doc(uid).collection("usage").doc(periodKey);
}

export function buildFreePeriod(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );
  const month = `${start.getUTCFullYear()}-${String(
    start.getUTCMonth() + 1
  ).padStart(2, "0")}`;
  return { periodStart: start, periodEnd: end, periodKey: month };
}

export function buildStripePeriod(periodStartSec: number, periodEndSec: number) {
  const start = new Date(periodStartSec * 1000);
  const end = new Date(periodEndSec * 1000);
  const periodKey = `${start.toISOString()}-${end.toISOString()}`;
  return { periodStart: start, periodEnd: end, periodKey };
}

export async function ensureEntitlement(
  uid: string
): Promise<EntitlementSnapshot> {
  const now = new Date();
  const docRef = entitlementDocRef(uid);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    const free = buildFreeEntitlement(now, {});
    await docRef.set(free, { merge: true });
    return toSnapshot(free);
  }
  const data = snapshot.data();
  const parsed = parseEntitlement(data);
  if (!parsed || !isEntitlementActive(parsed, now)) {
    const free = buildFreeEntitlement(now, {
      stripeCustomerId: data?.stripeCustomerId ?? null,
      stripeSubscriptionId: data?.stripeSubscriptionId ?? null,
      stripePriceId: data?.stripePriceId ?? null,
    });
    await docRef.set(free, { merge: true });
    return toSnapshot(free);
  }
  return parsed;
}

export function buildStripeEntitlement(params: {
  planId: string;
  status: string;
  offerLimit: number | null;
  periodStart: Date;
  periodEnd: Date;
  periodKey: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
}) {
  return {
    planId: params.planId,
    status: params.status,
    offerLimit: params.offerLimit,
    deviceLimit: DEVICE_LIMIT,
    periodStart: Timestamp.fromDate(params.periodStart),
    periodEnd: Timestamp.fromDate(params.periodEnd),
    periodKey: params.periodKey,
    source: "stripe",
    cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    canceledAt: params.canceledAt ? Timestamp.fromDate(params.canceledAt) : null,
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    stripePriceId: params.stripePriceId,
    updatedAt: Timestamp.now(),
  };
}

export function buildFreeEntitlement(
  now: Date,
  stripe: {
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
  }
) {
  const { periodStart, periodEnd, periodKey } = buildFreePeriod(now);
  return {
    planId: FREE_PLAN.planId,
    status: "free",
    offerLimit: FREE_PLAN.offerLimit,
    deviceLimit: DEVICE_LIMIT,
    periodStart: Timestamp.fromDate(periodStart),
    periodEnd: Timestamp.fromDate(periodEnd),
    periodKey,
    source: "free",
    cancelAtPeriodEnd: false,
    canceledAt: null,
    stripeCustomerId: stripe.stripeCustomerId ?? null,
    stripeSubscriptionId: stripe.stripeSubscriptionId ?? null,
    stripePriceId: stripe.stripePriceId ?? null,
    updatedAt: Timestamp.now(),
  };
}

export async function findEntitlementByCustomerId(customerId: string) {
  const snapshot = await db
    .collectionGroup("entitlements")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].ref;
}

export async function syncStripeEntitlement(params: {
  customerId: string;
  subscriptionId: string;
  priceId: string;
  status: string;
  periodStartSec: number;
  periodEndSec: number;
  cancelAtPeriodEnd: boolean;
  canceledAtSec?: number | null;
}) {
  const plan = getPlanByPriceId(params.priceId);
  if (!plan) {
    logger.warn("Stripe price ID not mapped to plan", {
      priceId: params.priceId,
    });
    return;
  }
  const docRef = await findEntitlementByCustomerId(params.customerId);
  if (!docRef) {
    logger.warn("No entitlement document for customer", {
      customerId: params.customerId,
    });
    return;
  }
  await updateEntitlementDoc({
    docRef,
    planId: plan.planId,
    offerLimit: plan.offerLimit,
    customerId: params.customerId,
    subscriptionId: params.subscriptionId,
    priceId: params.priceId,
    status: params.status,
    periodStartSec: params.periodStartSec,
    periodEndSec: params.periodEndSec,
    cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    canceledAtSec: params.canceledAtSec ?? null,
  });
}

export async function syncStripeEntitlementForUid(params: {
  uid: string;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  status: string;
  periodStartSec: number;
  periodEndSec: number;
  cancelAtPeriodEnd: boolean;
  canceledAtSec?: number | null;
}) {
  const plan = getPlanByPriceId(params.priceId);
  if (!plan) {
    logger.warn("Stripe price ID not mapped to plan", {
      priceId: params.priceId,
    });
    return;
  }
  const docRef = entitlementDocRef(params.uid);
  await updateEntitlementDoc({
    docRef,
    planId: plan.planId,
    offerLimit: plan.offerLimit,
    customerId: params.customerId,
    subscriptionId: params.subscriptionId,
    priceId: params.priceId,
    status: params.status,
    periodStartSec: params.periodStartSec,
    periodEndSec: params.periodEndSec,
    cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    canceledAtSec: params.canceledAtSec ?? null,
  });
}

async function updateEntitlementDoc(params: {
  docRef: FirebaseFirestore.DocumentReference;
  planId: string;
  offerLimit: number | null;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  status: string;
  periodStartSec: number;
  periodEndSec: number;
  cancelAtPeriodEnd: boolean;
  canceledAtSec?: number | null;
}) {
  const { periodStart, periodEnd, periodKey } = buildStripePeriod(
    params.periodStartSec,
    params.periodEndSec
  );
  const canceledAt =
    params.canceledAtSec && params.canceledAtSec > 0
      ? new Date(params.canceledAtSec * 1000)
      : null;
  const payload = buildStripeEntitlement({
    planId: params.planId,
    status: params.status,
    offerLimit: params.offerLimit,
    periodStart,
    periodEnd,
    periodKey,
    cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    canceledAt,
    stripeCustomerId: params.customerId,
    stripeSubscriptionId: params.subscriptionId,
    stripePriceId: params.priceId,
  });
  await params.docRef.set(payload, { merge: true });
}

function parseEntitlement(data?: DocumentData | null) {
  if (!data) return null;
  const periodStart = data.periodStart?.toDate?.();
  const periodEnd = data.periodEnd?.toDate?.();
  const periodKey = data.periodKey as string | undefined;
  const canceledAt = data.canceledAt?.toDate?.();
  if (!periodStart || !periodEnd || !periodKey) {
    return null;
  }
  return {
    planId: (data.planId as string | undefined) ?? FREE_PLAN.planId,
    status: (data.status as string | undefined) ?? "free",
    offerLimit:
      data.offerLimit === null || data.offerLimit === undefined
        ? null
        : Number(data.offerLimit),
    deviceLimit: Number(data.deviceLimit ?? DEVICE_LIMIT),
    periodStart,
    periodEnd,
    periodKey,
    source: (data.source as "stripe" | "free" | undefined) ?? "free",
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd ?? false),
    canceledAt: canceledAt ?? null,
    stripeCustomerId: data.stripeCustomerId ?? null,
    stripeSubscriptionId: data.stripeSubscriptionId ?? null,
    stripePriceId: data.stripePriceId ?? null,
  } satisfies EntitlementSnapshot;
}

function isEntitlementActive(entitlement: EntitlementSnapshot, now: Date) {
  if (entitlement.periodEnd <= now) return false;
  if (entitlement.source == "free") {
    return true;
  }
  return isStripeStatusActive(entitlement.status);
}

function isStripeStatusActive(status: string) {
  return (
    status == "active" ||
    status == "trialing" ||
    status == "past_due"
  );
}

function toSnapshot(data: DocumentData) {
  const parsed = parseEntitlement(data);
  if (!parsed) {
    throw new Error("Invalid entitlement data.");
  }
  return parsed;
}
