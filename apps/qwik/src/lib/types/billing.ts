export interface Entitlement {
  planId: string;
  status: string;
  offerLimit: number | null;
  deviceLimit: number;
  periodStart: Date;
  periodEnd: Date;
  periodKey: string;
  cancelAtPeriodEnd: boolean;
  stripePriceId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface OfferUsage {
  offerCount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface BillingPlan {
  id: string;
  priceId: string;
  priceLabel: string;
  offerLimit: number | null;
}

export interface ManagedSubscriptionSnapshot {
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndSec: number;
  currentPriceId: string;
  currentPlanId: string;
}

export interface ManagedSubscriptionStateSnapshot {
  primarySubscriptionId: string;
  managedSubscriptions: ManagedSubscriptionSnapshot[];
}
