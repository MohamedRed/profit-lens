import { doc, onSnapshot } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import type { Entitlement, OfferUsage } from '../../types/billing';
import { callCreateCheckoutSession } from '../../firebase/callables';
import { getDb } from '../../firebase/firestore';
import {
  consumeCustomerPortalSession,
  prefetchCustomerPortalSession,
} from './customer-portal-session';
import {
  captureBillingPortalTelemetry,
  createBillingPortalSessionId,
  flushBillingTelemetryQueue,
  type BillingPortalSource,
} from './billing-telemetry';

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

interface OpenCustomerPortalOptions {
  uid: string;
  source: BillingPortalSource;
}

export const openCustomerPortal = async ({ uid, source }: OpenCustomerPortalOptions) => {
  const sessionId = createBillingPortalSessionId();
  const clickStartedAt = performance.now();
  const routePath = window.location.pathname;

  captureBillingPortalTelemetry(uid, source, 'manage_click', sessionId, {
    routePath,
    visibilityState: document.visibilityState,
  });

  const resolutionStartedAt = performance.now();
  const resolution = await consumeCustomerPortalSession();
  const resolutionDurationMs = Math.round(performance.now() - resolutionStartedAt);
  captureBillingPortalTelemetry(uid, source, 'portal_url_resolved', sessionId, {
    routePath,
    durationMs: resolutionDurationMs,
    resolveSource: resolution.source,
    cacheAgeMs: resolution.cacheAgeMs,
  });

  const redirectStartedAt = performance.now();
  captureBillingPortalTelemetry(uid, source, 'portal_redirect_start', sessionId, {
    routePath,
    sinceClickMs: Math.round(redirectStartedAt - clickStartedAt),
  });

  window.addEventListener(
    'pagehide',
    () => {
      captureBillingPortalTelemetry(uid, source, 'portal_pagehide', sessionId, {
        routePath,
        sinceRedirectMs: Math.round(performance.now() - redirectStartedAt),
      });
    },
    { once: true },
  );

  const url = resolution.url;
  window.location.assign(url);
};

export const warmCustomerPortalSession = async () => {
  await prefetchCustomerPortalSession();
};

export const flushBillingTelemetry = async (uid: string) => {
  await flushBillingTelemetryQueue(uid);
};
