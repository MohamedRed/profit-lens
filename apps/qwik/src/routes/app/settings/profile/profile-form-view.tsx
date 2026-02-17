import { component$ } from '@builder.io/qwik';
import {
  franceDefaultSources,
  profileFranceDefaultRates,
  type BusinessActivity,
  type FixedCostAllocation,
} from '../../../../lib/features/profile/profile-form-utils';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { PresetSourcesSection } from '../shared/preset-sources-section';
import type { ProfileFormState } from './profile-form-state';
import { Select } from '../../../../components/ui/select';

interface ProfileFormViewProps {
  state: ProfileFormState;
}

export const ProfileFormView = component$<ProfileFormViewProps>(({ state }) => {
  const i18n = useI18n();

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
            <Select
              id="profile-activity"
              options={activityOptions}
              value={state.activity.value}
              onChange$={(value) => {
                state.activity.value = value;
                if (!state.useFranceDefaults.value) {
                  return;
                }
                const defaults = profileFranceDefaultRates(
                  value as BusinessActivity,
                  state.useLiberatoryTax.value,
                );
                state.socialRatePercent.value = defaults.socialRatePercent;
                state.incomeTaxPercent.value = defaults.incomeTaxPercent;
              }}
            />
          </div>

          <p class="ui-settings-field-heading">{t(i18n, 'costsSection', 'Taxes & contributions')}</p>

          <label class="ui-settings-checkbox">
            <input
              type="checkbox"
              checked={state.useFranceDefaults.value}
              onChange$={(_, element) => {
                state.useFranceDefaults.value = element.checked;
                if (!element.checked) {
                  return;
                }
                const defaults = profileFranceDefaultRates(
                  state.activity.value as BusinessActivity,
                  state.useLiberatoryTax.value,
                );
                state.socialRatePercent.value = defaults.socialRatePercent;
                state.incomeTaxPercent.value = defaults.incomeTaxPercent;
              }}
            />
            <span>{t(i18n, 'useFranceDefaultsLabel', 'Use France presets')}</span>
          </label>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-social-rate">
              {t(i18n, 'socialRateLabel', 'Social contribution rate')} (%)
            </label>
            <input
              id="profile-social-rate"
              class="ui-input"
              type="number"
              step="0.1"
              value={state.socialRatePercent.value}
              onInput$={(_, element) => {
                state.socialRatePercent.value = element.value;
              }}
            />
          </div>

          <label class="ui-settings-checkbox">
            <input
              type="checkbox"
              checked={state.useLiberatoryTax.value}
              onChange$={(_, element) => {
                state.useLiberatoryTax.value = element.checked;
                if (!state.useFranceDefaults.value) {
                  return;
                }
                const defaults = profileFranceDefaultRates(
                  state.activity.value as BusinessActivity,
                  element.checked,
                );
                state.socialRatePercent.value = defaults.socialRatePercent;
                state.incomeTaxPercent.value = defaults.incomeTaxPercent;
              }}
            />
            <span>{t(i18n, 'liberatoryTaxLabel', 'Prélèvement libératoire')}</span>
          </label>
          <p class="ui-settings-field-hint">
            {t(i18n, 'liberatoryTaxHint', 'Apply a flat income tax rate on turnover.')}
          </p>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-income-tax">
              {t(i18n, 'incomeTaxRateLabel', 'Income tax rate')} (%)
            </label>
            <input
              id="profile-income-tax"
              class="ui-input"
              type="number"
              step="0.1"
              value={state.incomeTaxPercent.value}
              onInput$={(_, element) => {
                state.incomeTaxPercent.value = element.value;
              }}
            />
            <p class="ui-settings-field-hint">
              {t(i18n, 'incomeTaxEstimatedHint', 'Estimated default. You can override it.')}
            </p>
          </div>

          <p class="ui-settings-field-heading">{t(i18n, 'monthlyCostsSectionTitle', 'Monthly costs')}</p>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-fixed-costs">
              {t(i18n, 'monthlyFixedCostsLabel', 'Monthly fixed costs')}
            </label>
            <input
              id="profile-fixed-costs"
              class="ui-input"
              type="number"
              step="0.01"
              value={state.monthlyFixedCosts.value}
              onInput$={(_, element) => {
                state.monthlyFixedCosts.value = element.value;
              }}
            />
          </div>

          <div class="ui-settings-field">
            <label class="ui-label" for="profile-allocation">
              {t(i18n, 'fixedCostAllocationLabel', 'Allocate fixed costs by')}
            </label>
            <Select
              id="profile-allocation"
              options={allocationOptions}
              value={state.fixedCostAllocation.value}
              onChange$={(value) => {
                state.fixedCostAllocation.value = value as FixedCostAllocation;
              }}
            />
          </div>

          {state.fixedCostAllocation.value === 'perHour' ? (
            <div class="ui-settings-field">
              <label class="ui-label" for="profile-hours">
                {t(i18n, 'monthlyHoursLabel', 'Monthly working hours')}
              </label>
              <input
                id="profile-hours"
                class="ui-input"
                type="number"
                step="0.1"
                value={state.monthlyWorkingHours.value}
                onInput$={(_, element) => {
                  state.monthlyWorkingHours.value = element.value;
                }}
              />
            </div>
          ) : null}

          {state.fixedCostAllocation.value === 'perKm' ? (
            <div class="ui-settings-field">
              <label class="ui-label" for="profile-distance">
                {t(i18n, 'monthlyDistanceLabel', 'Monthly distance (km)')}
              </label>
              <input
                id="profile-distance"
                class="ui-input"
                type="number"
                step="0.1"
                value={state.monthlyDistanceKm.value}
                onInput$={(_, element) => {
                  state.monthlyDistanceKm.value = element.value;
                }}
              />
            </div>
          ) : null}

          {state.fixedCostAllocation.value === 'perDelivery' ? (
            <div class="ui-settings-field">
              <label class="ui-label" for="profile-deliveries">
                {t(i18n, 'monthlyDeliveriesLabel', 'Monthly deliveries')}
              </label>
              <input
                id="profile-deliveries"
                class="ui-input"
                type="number"
                step="1"
                value={state.monthlyDeliveries.value}
                onInput$={(_, element) => {
                  state.monthlyDeliveries.value = element.value;
                }}
              />
            </div>
          ) : null}

          <PresetSourcesSection sources={franceDefaultSources} />

          <button
            type="button"
            class="ui-settings-action-button"
            disabled={state.saving.value}
            onClick$={state.save$}
          >
            {state.saving.value
              ? t(i18n, 'loadingLabel', 'Loading...')
              : t(i18n, 'saveProfileButton', 'Save profile')}
          </button>
        </div>
      </section>

      {state.status.value ? <p class="ui-status ui-status-error">{state.status.value}</p> : null}
    </div>
  );
});
