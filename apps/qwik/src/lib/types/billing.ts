export interface Entitlement {
  planId: string;
  status: string;
  offerLimit: number | null;
  deviceLimit: number;
  periodStart: Date;
  periodEnd: Date;
  periodKey: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
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
  monthlyPriceEuro: number;
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
  duplicateCleanupScheduledCount: number;
  managedSubscriptions: ManagedSubscriptionSnapshot[];
}

export interface SubscriptionCheckoutEligibility {
  eligibleForCheckout: boolean;
  manageableSubscriptionCount: number;
  duplicateSubscriptionCount: number;
  primarySubscriptionId: string | null;
}
