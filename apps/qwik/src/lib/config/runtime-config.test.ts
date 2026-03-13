import { describe, expect, it } from 'vitest';
import {
  androidAppDownloadUrl,
  billingPlans,
  firebaseFunctionsRegion,
  normalizeDownloadUrl,
} from './runtime-config';
import { installDefines } from './install-defines';

describe('runtime-config', () => {
  it('uses the expected Firebase region', () => {
    expect(firebaseFunctionsRegion).toBe('europe-west1');
  });

  it('defines all billing tiers', () => {
    expect(billingPlans.map((plan) => plan.id)).toEqual(['tier_9', 'tier_24', 'tier_34']);
  });

  it('defines Stripe price ids for all billing tiers', () => {
    expect(billingPlans.every((plan) => plan.priceId.length > 0)).toBe(true);
  });

  it('normalizes the configured Android APK download URL', () => {
    expect(androidAppDownloadUrl).toBe(normalizeDownloadUrl(installDefines.androidAppDownloadUrl));
  });

  it('accepts a same-origin Android APK path when configured', () => {
    expect(normalizeDownloadUrl('/downloads/profit-lens-android-release.apk')).toBe(
      '/downloads/profit-lens-android-release.apk',
    );
  });
});
