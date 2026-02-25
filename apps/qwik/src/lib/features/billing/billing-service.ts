import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import type {
  Entitlement,
  ManagedSubscriptionSnapshot,
  ManagedSubscriptionStateSnapshot,
  OfferUsage,
} from '../../types/billing';
import {
  callChangeSubscriptionPlan,
  callCreateCustomerPortalSession,
  callCreateCheckoutSession,
  callGetManagedSubscriptionState,
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
  const rawPeriodKey = raw.periodKey as string | undefined;
  if (!periodStart || !periodEnd) {
    return null;
  }
  const periodKey =
    rawPeriodKey && rawPeriodKey.length > 0
      ? rawPeriodKey
      : `${periodStart.toISOString()}-${periodEnd.toISOString()}`;

  return {
    planId: (raw.planId as string | undefined) ?? 'free',
    status: (raw.status as string | undefined) ?? 'free',
    offerLimit: raw.offerLimit == null ? null : Number(raw.offerLimit),
    deviceLimit: Number(raw.deviceLimit ?? 1),
    periodStart,
    periodEnd,
    periodKey,
    cancelAtPeriodEnd: Boolean(raw.cancelAtPeriodEnd ?? false),
    stripeCustomerId: (raw.stripeCustomerId as string | undefined) ?? null,
    stripePriceId: (raw.stripePriceId as string | undefined) ?? null,
    stripeSubscriptionId: (raw.stripeSubscriptionId as string | undefined) ?? null,
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

export const fetchEntitlement = async (uid: string): Promise<Entitlement | null> => {
  const reference = doc(getDb(), 'users', uid, 'entitlements', 'current');
  const snapshot = await getDoc(reference);
  return mapEntitlement(snapshot.data() as Record<string, unknown> | undefined);
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

export const fetchUsage = async (uid: string, periodKey: string): Promise<OfferUsage | null> => {
  const reference = doc(getDb(), 'users', uid, 'usage', periodKey);
  const snapshot = await getDoc(reference);
  return mapUsage(snapshot.data() as Record<string, unknown> | undefined);
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

const mapManagedSubscriptionState = (
  raw: Record<string, unknown>,
): ManagedSubscriptionStateSnapshot => {
  const primary = mapManagedSubscription(raw);
  const managedSubscriptionsRaw = Array.isArray(raw.managedSubscriptions)
    ? raw.managedSubscriptions
    : [];
  const deduped = new Map<string, ManagedSubscriptionSnapshot>();
  for (const item of managedSubscriptionsRaw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    try {
      const snapshot = mapManagedSubscription(item as Record<string, unknown>);
      deduped.set(snapshot.subscriptionId, snapshot);
    } catch {
      // Ignore invalid entries and keep valid managed subscriptions.
    }
  }
  if (!deduped.has(primary.subscriptionId)) {
    deduped.set(primary.subscriptionId, primary);
  }
  return {
    primarySubscriptionId: primary.subscriptionId,
    managedSubscriptions: [
      deduped.get(primary.subscriptionId)!,
      ...Array.from(deduped.values()).filter(
        (subscription) => subscription.subscriptionId !== primary.subscriptionId,
      ),
    ],
  };
};

export const fetchManagedSubscriptionState = async (): Promise<ManagedSubscriptionStateSnapshot> => {
  const payload = await callGetManagedSubscriptionState();
  return mapManagedSubscriptionState(payload);
};

export const changeSubscriptionPlan = async (priceId: string): Promise<ManagedSubscriptionStateSnapshot> => {
  const payload = await callChangeSubscriptionPlan({ priceId });
  return mapManagedSubscriptionState(payload);
};

export const setSubscriptionCancellation = async (
  cancelAtPeriodEnd: boolean,
): Promise<ManagedSubscriptionStateSnapshot> => {
  const payload = await callSetSubscriptionCancellation({ cancelAtPeriodEnd });
  return mapManagedSubscriptionState(payload);
};
