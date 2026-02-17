import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { Select } from '../../../../components/ui/select';
import { useAuth } from '../../../../lib/auth/auth-context';
import { saveUserProfile, watchUserProfile } from '../../../../lib/features/profile/profile-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../lib/types/profile';

const parseNumber = (value: string): number | null => {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
};

export default component$(() => {
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
  const fixedCostAllocation = useSignal('perDelivery');
  const monthlyFixedCosts = useSignal('');
  const monthlyWorkingHours = useSignal('');
  const monthlyDistanceKm = useSignal('');
  const monthlyDeliveries = useSignal('');
  const minProfitabilityEuro = useSignal('');

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
      incomeTaxPercent.value = nextProfile.incomeTaxRate == null ? '' : (nextProfile.incomeTaxRate * 100).toFixed(1);
      useLiberatoryTax.value = nextProfile.useLiberatoryTax;
      useFranceDefaults.value = nextProfile.useFranceDefaults;
      fixedCostAllocation.value = nextProfile.fixedCostAllocation;
      monthlyFixedCosts.value = nextProfile.monthlyFixedCosts.toFixed(2);
      monthlyWorkingHours.value = nextProfile.monthlyWorkingHours.toFixed(1);
      monthlyDistanceKm.value = nextProfile.monthlyDistanceKm.toFixed(1);
      monthlyDeliveries.value = String(nextProfile.monthlyDeliveries);
      minProfitabilityEuro.value = nextProfile.minProfitabilityEuro.toFixed(2);
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

    const socialRate = parseNumber(socialRatePercent.value);
    const incomeTax = incomeTaxPercent.value.trim() ? parseNumber(incomeTaxPercent.value) : null;
    const fixedCosts = parseNumber(monthlyFixedCosts.value);
    const workingHours = parseNumber(monthlyWorkingHours.value);
    const distanceKm = parseNumber(monthlyDistanceKm.value);
    const deliveries = parseNumber(monthlyDeliveries.value);
    const minProfitability = parseNumber(minProfitabilityEuro.value);

    if (
      socialRate == null ||
      fixedCosts == null ||
      workingHours == null ||
      distanceKm == null ||
      deliveries == null ||
      minProfitability == null ||
      (incomeTaxPercent.value.trim() && incomeTax == null)
    ) {
      status.value = t(i18n, 'profileSaveFailedMessage', 'Unable to save profile.');
      return;
    }

    saving.value = true;
    status.value = '';
    try {
      const nextProfile: UserProfile = {
        ...currentProfile,
        activity: activity.value,
        socialContributionRate: socialRate / 100,
        incomeTaxRate: incomeTax == null ? null : incomeTax / 100,
        useLiberatoryTax: useLiberatoryTax.value,
        useFranceDefaults: useFranceDefaults.value,
        fixedCostAllocation: fixedCostAllocation.value,
        monthlyFixedCosts: fixedCosts,
        monthlyWorkingHours: workingHours,
        monthlyDistanceKm: distanceKm,
        monthlyDeliveries: Math.max(0, Math.round(deliveries)),
        minProfitabilityEuro: minProfitability,
      };
      await saveUserProfile(nextProfile);
      status.value = '';
    } catch (error) {
      status.value = error instanceof Error ? error.message : String(error);
    } finally {
      saving.value = false;
    }
  });

  if (loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={10} />
      </div>
    );
  }

  if (!profile.value) {
    return <p class="ui-settings-detail-subtitle">{t(i18n, 'profileSaveFailedMessage', 'Unable to save profile.')}</p>;
  }

  const activityOptions = [
    { value: 'deliveryServices', label: t(i18n, 'activityDelivery', 'Delivery services') },
    { value: 'services', label: t(i18n, 'activityServices', 'Services') },
    { value: 'sales', label: t(i18n, 'activitySales', 'Sales') },
  ];

  const allocationOptions = [
    { value: 'perHour', label: t(i18n, 'fixedCostPerHourLabel', 'Per hour') },
    { value: 'perKm', label: t(i18n, 'fixedCostPerKmLabel', 'Per km') },
    { value: 'perDelivery', label: t(i18n, 'fixedCostPerDeliveryLabel', 'Per delivery') },
  ];

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">{t(i18n, 'profileEditTitle', 'Edit profile')}</h2>
        <div class="ui-settings-form-grid">
          <div class="ui-settings-field">
            <label class="ui-label" for="profile-activity">
              {t(i18n, 'activityLabel', 'Business activity')}
            </label>
            <Select id="profile-activity" options={activityOptions} value={activity.value} onChange$={(value) => {
              activity.value = value;
            }} />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-social-rate">
              {t(i18n, 'socialRateLabel', 'Social contribution rate')} (%)
            </label>
            <input
              id="profile-social-rate"
              class="ui-input"
              type="number"
              step="0.1"
              value={socialRatePercent.value}
              onInput$={(_, element) => {
                socialRatePercent.value = element.value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-income-tax">
              {t(i18n, 'incomeTaxRateLabel', 'Income tax rate')} (%)
            </label>
            <input
              id="profile-income-tax"
              class="ui-input"
              type="number"
              step="0.1"
              value={incomeTaxPercent.value}
              onInput$={(_, element) => {
                incomeTaxPercent.value = element.value;
              }}
            />
          </div>

          <label class="ui-settings-checkbox">
            <input
              type="checkbox"
              checked={useLiberatoryTax.value}
              onChange$={(_, element) => {
                useLiberatoryTax.value = element.checked;
              }}
            />
            <span>{t(i18n, 'liberatoryTaxLabel', 'Prélèvement libératoire')}</span>
          </label>

          <label class="ui-settings-checkbox">
            <input
              type="checkbox"
              checked={useFranceDefaults.value}
              onChange$={(_, element) => {
                useFranceDefaults.value = element.checked;
              }}
            />
            <span>{t(i18n, 'useFranceDefaultsLabel', 'Use France presets')}</span>
          </label>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-allocation">
              {t(i18n, 'fixedCostAllocationLabel', 'Allocate fixed costs by')}
            </label>
            <Select
              id="profile-allocation"
              options={allocationOptions}
              value={fixedCostAllocation.value}
              onChange$={(value) => {
                fixedCostAllocation.value = value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-fixed-costs">
              {t(i18n, 'monthlyFixedCostsLabel', 'Monthly fixed costs')}
            </label>
            <input
              id="profile-fixed-costs"
              class="ui-input"
              type="number"
              step="0.01"
              value={monthlyFixedCosts.value}
              onInput$={(_, element) => {
                monthlyFixedCosts.value = element.value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-hours">
              {t(i18n, 'monthlyHoursLabel', 'Monthly working hours')}
            </label>
            <input
              id="profile-hours"
              class="ui-input"
              type="number"
              step="0.1"
              value={monthlyWorkingHours.value}
              onInput$={(_, element) => {
                monthlyWorkingHours.value = element.value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-distance">
              {t(i18n, 'monthlyDistanceLabel', 'Monthly distance (km)')}
            </label>
            <input
              id="profile-distance"
              class="ui-input"
              type="number"
              step="0.1"
              value={monthlyDistanceKm.value}
              onInput$={(_, element) => {
                monthlyDistanceKm.value = element.value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-deliveries">
              {t(i18n, 'monthlyDeliveriesLabel', 'Monthly deliveries')}
            </label>
            <input
              id="profile-deliveries"
              class="ui-input"
              type="number"
              step="1"
              value={monthlyDeliveries.value}
              onInput$={(_, element) => {
                monthlyDeliveries.value = element.value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-min-profitability">
              {t(i18n, 'minProfitabilityLabel', 'Minimum profit per offer')}
            </label>
            <input
              id="profile-min-profitability"
              class="ui-input"
              type="number"
              step="0.01"
              value={minProfitabilityEuro.value}
              onInput$={(_, element) => {
                minProfitabilityEuro.value = element.value;
              }}
            />
          </div>

          <button type="button" class="ui-settings-action-button" disabled={saving.value} onClick$={save$}>
            {saving.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'saveProfileButton', 'Save profile')}
          </button>
        </div>
      </section>

      {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
    </div>
  );
});
