import type { BillingPlan } from '../types/billing';

const readPublicEnv = (key: string, fallback = ''): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  return value ?? fallback;
};

export const firebaseFunctionsRegion = 'europe-west1';

export const billingPlans: BillingPlan[] = [
  {
    id: 'tier_9',
    priceId: readPublicEnv('PUBLIC_STRIPE_PRICE_TIER_9'),
    priceLabel: '€9.99',
    offerLimit: 250,
  },
  {
    id: 'tier_24',
    priceId: readPublicEnv('PUBLIC_STRIPE_PRICE_TIER_24'),
    priceLabel: '€24.99',
    offerLimit: 1000,
  },
  {
    id: 'tier_34',
    priceId: readPublicEnv('PUBLIC_STRIPE_PRICE_TIER_34'),
    priceLabel: '€34.99',
    offerLimit: null,
  },
];
