import { describe, expect, it } from 'vitest';
import { profileFranceDefaultRates, resolveFixedCostAllocationError } from './profile-form-utils';

describe('profile-form-utils', () => {
  it('matches France default rates for activity and tax mode', () => {
    expect(profileFranceDefaultRates('deliveryServices', true)).toEqual({
      socialRatePercent: '21.2',
      incomeTaxPercent: '1.7',
    });
    expect(profileFranceDefaultRates('sales', true)).toEqual({
      socialRatePercent: '21.2',
      incomeTaxPercent: '1.0',
    });
    expect(profileFranceDefaultRates('services', false)).toEqual({
      socialRatePercent: '21.2',
      incomeTaxPercent: '11.0',
    });
  });

  it('requires allocation input only when fixed costs are positive', () => {
    expect(
      resolveFixedCostAllocationError({
        allocation: 'perHour',
        monthlyFixedCosts: 0,
        monthlyHours: 0,
        monthlyDistance: 0,
        monthlyDeliveries: 0,
      }),
    ).toBeNull();

    expect(
      resolveFixedCostAllocationError({
        allocation: 'perHour',
        monthlyFixedCosts: 50,
        monthlyHours: 0,
        monthlyDistance: 0,
        monthlyDeliveries: 0,
      }),
    ).toBe('monthlyHoursRequiredError');
  });
});
