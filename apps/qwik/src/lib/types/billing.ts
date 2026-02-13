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
