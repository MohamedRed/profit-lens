import { component$ } from '@builder.io/qwik';
import { VisualOptionPicker } from '../../../../../components/ui/visual-option-picker';
import {
  profileFranceDefaultRates,
  type BusinessActivity,
} from '../../../../../lib/features/profile/profile-form-utils';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { ProfileFormState } from '../profile-form-state';

interface ProfileTaxesSectionProps {
  state: ProfileFormState;
  showHeading?: boolean;
}

export const ProfileTaxesSection = component$<ProfileTaxesSectionProps>(
  ({ state, showHeading = true }) => {
    const i18n = useI18n();

    const activityOptions = [
      {
        value: 'deliveryServices',
        label: t(i18n, 'activityDelivery', 'Delivery services'),
        icon: 'local_shipping',
      },
      { value: 'services', label: t(i18n, 'activityServices', 'Services'), icon: 'build' },
      { value: 'sales', label: t(i18n, 'activitySales', 'Sales'), icon: 'storefront' },
    ];

    return (
      <>
        <div class="ui-settings-field">
          <span class="ui-label">{t(i18n, 'activityLabel', 'Business activity')}</span>
          <VisualOptionPicker
            ariaLabel={t(i18n, 'activityLabel', 'Business activity')}
            compact
            columns={3}
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

        {showHeading ? (
          <p class="ui-settings-field-heading">{t(i18n, 'costsSection', 'Taxes & contributions')}</p>
        ) : null}

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
      </>
    );
  },
);
