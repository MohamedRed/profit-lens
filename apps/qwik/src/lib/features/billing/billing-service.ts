import { doc, onSnapshot } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import type { Entitlement, ManagedSubscriptionSnapshot, OfferUsage } from '../../types/billing';
import {
  callChangeSubscriptionPlan,
  callCreateCustomerPortalSession,
  callCreateCheckoutSession,
  callSetSubscriptionCancellation,
} from '../../firebase/callables';
import { getDb } from '../../firebase/firestore';

const asDate = (value: unknown): Date | null => {
  if (value && typeof value === 'object' && 'toDate' in (value as { toDate: unknown })) {
    const maybe = value as { toDate: () => Date };
    return maybe.toDate();
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const mapEntitlement = (raw: Record<string, unknown> | undefined): Entitlement | null => {
  if (!raw) {
    return null;
  }
  const periodStart = asDate(raw.periodStart);
  const periodEnd = asDate(raw.periodEnd);
  const periodKey = raw.periodKey as string | undefined;
  if (!periodStart || !periodEnd || !periodKey) {
    return null;
  }

  return {
    planId: (raw.planId as string | undefined) ?? 'free',
    status: (raw.status as string | undefined) ?? 'free',
    offerLimit: raw.offerLimit == null ? null : Number(raw.offerLimit),
    deviceLimit: Number(raw.deviceLimit ?? 1),
    periodStart,
    periodEnd,
    periodKey,
    cancelAtPeriodEnd: Boolean(raw.cancelAtPeriodEnd ?? false),
    stripePriceId: (raw.stripePriceId as string | undefined) ?? null,
  };
};

const mapUsage = (raw: Record<string, unknown> | undefined): OfferUsage | null => {
  if (!raw) {
    return null;
  }

  const periodStart = asDate(raw.periodStart);
  const periodEnd = asDate(raw.periodEnd);
  if (!periodStart || !periodEnd) {
    return null;
  }

  return {
    offerCount: Number(raw.offerCount ?? 0),
    periodStart,
    periodEnd,
  };
};

export const watchEntitlement = (
  uid: string,
  callback: (entitlement: Entitlement | null) => void,
): (() => void) => {
  const reference = doc(getDb(), 'users', uid, 'entitlements', 'current');
  return onSnapshot(reference, (snapshot: DocumentSnapshot) => {
    callback(mapEntitlement(snapshot.data() as Record<string, unknown> | undefined));
  });
};

export const watchUsage = (
  uid: string,
  periodKey: string,
  callback: (usage: OfferUsage | null) => void,
): (() => void) => {
  const reference = doc(getDb(), 'users', uid, 'usage', periodKey);
  return onSnapshot(reference, (snapshot: DocumentSnapshot) => {
    callback(mapUsage(snapshot.data() as Record<string, unknown> | undefined));
  });
};

export const startCheckout = async (priceId: string) => {
  const payload = await callCreateCheckoutSession({ priceId, origin: window.location.origin });
  const url = payload.url as string | undefined;
  if (!url) {
    throw new Error('Missing checkout URL.');
  }
  window.location.assign(url);
};

export const openStripeBillingPortal = async () => {
  const payload = await callCreateCustomerPortalSession({ origin: window.location.origin });
  const url = payload.url as string | undefined;
  if (!url) {
    throw new Error('Missing Stripe billing URL.');
  }
  window.location.assign(url);
};

const mapManagedSubscription = (raw: Record<string, unknown>): ManagedSubscriptionSnapshot => {
  const subscriptionId = raw.subscriptionId as string | undefined;
  const status = raw.status as string | undefined;
  const currentPriceId = raw.currentPriceId as string | undefined;
  const currentPlanId = raw.currentPlanId as string | undefined;
  const currentPeriodEndSec = Number(raw.currentPeriodEndSec ?? 0);
  if (!subscriptionId || !status || !currentPriceId || !currentPlanId || !currentPeriodEndSec) {
    throw new Error('Missing managed subscription details.');
  }
  return {
    subscriptionId,
    status,
    cancelAtPeriodEnd: Boolean(raw.cancelAtPeriodEnd ?? false),
    currentPeriodEndSec,
    currentPriceId,
    currentPlanId,
  };
};

export const changeSubscriptionPlan = async (priceId: string): Promise<ManagedSubscriptionSnapshot> => {
  const payload = await callChangeSubscriptionPlan({ priceId });
  return mapManagedSubscription(payload);
};

export const setSubscriptionCancellation = async (
  cancelAtPeriodEnd: boolean,
): Promise<ManagedSubscriptionSnapshot> => {
  const payload = await callSetSubscriptionCancellation({ cancelAtPeriodEnd });
  return mapManagedSubscription(payload);
};
