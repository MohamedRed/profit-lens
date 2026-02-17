import { $, useSignal, useVisibleTask$, type QRL, type Signal } from '@builder.io/qwik';
import { useAuth } from '../../../../lib/auth/auth-context';
import { saveUserProfile, watchUserProfile } from '../../../../lib/features/profile/profile-service';
import {
  parseNumberOrNull,
  parseNumberOrZero,
  resolveFixedCostAllocationError,
  type BusinessActivity,
  type FixedCostAllocation,
} from '../../../../lib/features/profile/profile-form-utils';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../lib/types/profile';

export interface ProfileFormState {
  profile: Signal<UserProfile | null>;
  loading: Signal<boolean>;
  saving: Signal<boolean>;
  status: Signal<string>;
  activity: Signal<string>;
  socialRatePercent: Signal<string>;
  incomeTaxPercent: Signal<string>;
  useLiberatoryTax: Signal<boolean>;
  useFranceDefaults: Signal<boolean>;
  fixedCostAllocation: Signal<FixedCostAllocation>;
  monthlyFixedCosts: Signal<string>;
  monthlyWorkingHours: Signal<string>;
  monthlyDistanceKm: Signal<string>;
  monthlyDeliveries: Signal<string>;
  save$: QRL<() => Promise<void>>;
}

export const useProfileFormState = (): ProfileFormState => {
  const auth = useAuth();
  const i18n = useI18n();

  const profile = useSignal<UserProfile | null>(null);
  const loading = useSignal(true);
  const saving = useSignal(false);
  const status = useSignal('');

  const activity = useSignal('deliveryServices');
  const socialRatePercent = useSignal('');
  const incomeTaxPercent = useSignal('');
  const useLiberatoryTax = useSignal(false);
  const useFranceDefaults = useSignal(true);
  const fixedCostAllocation = useSignal<FixedCostAllocation>('perDelivery');
  const monthlyFixedCosts = useSignal('');
  const monthlyWorkingHours = useSignal('');
  const monthlyDistanceKm = useSignal('');
  const monthlyDeliveries = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      loading.value = false;
      profile.value = null;
      return;
    }

    loading.value = true;
    const unsubscribe = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      activity.value = nextProfile.activity;
      socialRatePercent.value = (nextProfile.socialContributionRate * 100).toFixed(1);
      incomeTaxPercent.value =
        nextProfile.incomeTaxRate == null ? '' : (nextProfile.incomeTaxRate * 100).toFixed(1);
      useLiberatoryTax.value = nextProfile.useLiberatoryTax;
      useFranceDefaults.value = nextProfile.useFranceDefaults;
      fixedCostAllocation.value =
        nextProfile.fixedCostAllocation === 'perHour' ||
        nextProfile.fixedCostAllocation === 'perKm' ||
        nextProfile.fixedCostAllocation === 'perDelivery'
          ? nextProfile.fixedCostAllocation
          : 'perDelivery';
      monthlyFixedCosts.value = nextProfile.monthlyFixedCosts.toFixed(2);
      monthlyWorkingHours.value = nextProfile.monthlyWorkingHours.toFixed(1);
      monthlyDistanceKm.value = nextProfile.monthlyDistanceKm.toFixed(1);
      monthlyDeliveries.value = String(nextProfile.monthlyDeliveries);
      loading.value = false;
    });

    cleanup(() => {
      unsubscribe();
    });
  });

  const save$ = $(async () => {
    const currentProfile = profile.value;
    if (!currentProfile) {
      return;
    }

    const socialRate = parseNumberOrNull(socialRatePercent.value);
    if (socialRate == null) {
      status.value = t(i18n, 'requiredFieldError', 'This field is required.');
      return;
    }

    const incomeTax =
      incomeTaxPercent.value.trim().length > 0 ? parseNumberOrNull(incomeTaxPercent.value) : null;
    const fixedCosts = parseNumberOrZero(monthlyFixedCosts.value);
    const workingHours = parseNumberOrZero(monthlyWorkingHours.value);
    const distanceKm = parseNumberOrZero(monthlyDistanceKm.value);
    const deliveries = parseNumberOrZero(monthlyDeliveries.value);
    const fixedCostError = resolveFixedCostAllocationError({
      allocation: fixedCostAllocation.value,
      monthlyFixedCosts: fixedCosts,
      monthlyHours: workingHours,
      monthlyDistance: distanceKm,
      monthlyDeliveries: deliveries,
    });
    if (fixedCostError) {
      status.value = t(i18n, fixedCostError, 'Please complete monthly allocation values.');
      return;
    }

    saving.value = true;
    status.value = '';
    try {
      await saveUserProfile({
        ...currentProfile,
        activity: activity.value as BusinessActivity,
        socialContributionRate: socialRate / 100,
        incomeTaxRate: incomeTax == null ? null : incomeTax / 100,
        useLiberatoryTax: useLiberatoryTax.value,
        useFranceDefaults: useFranceDefaults.value,
        fixedCostAllocation: fixedCostAllocation.value,
        monthlyFixedCosts: fixedCosts,
        monthlyWorkingHours: workingHours,
        monthlyDistanceKm: distanceKm,
        monthlyDeliveries: Math.max(0, Math.round(deliveries)),
      });
      status.value = '';
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'profile');
    } finally {
      saving.value = false;
    }
  });

  return {
    profile,
    loading,
    saving,
    status,
    activity,
    socialRatePercent,
    incomeTaxPercent,
    useLiberatoryTax,
    useFranceDefaults,
    fixedCostAllocation,
    monthlyFixedCosts,
    monthlyWorkingHours,
    monthlyDistanceKm,
    monthlyDeliveries,
    save$,
  };
};
