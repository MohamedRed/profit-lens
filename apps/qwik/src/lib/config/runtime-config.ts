import type { BillingPlan } from '../types/billing';
import { billingDefines } from './billing-defines';

export const firebaseFunctionsRegion = 'europe-west1';

export const billingPlans: BillingPlan[] = [
  {
    id: 'tier_9',
    priceId: billingDefines.stripePriceTier9,
    monthlyPriceEuro: 9.99,
    offerLimit: 250,
  },
  {
    id: 'tier_24',
    priceId: billingDefines.stripePriceTier24,
    monthlyPriceEuro: 24.99,
    offerLimit: 1000,
  },
  {
    id: 'tier_34',
    priceId: billingDefines.stripePriceTier34,
    monthlyPriceEuro: 34.99,
    offerLimit: null,
  },
];
