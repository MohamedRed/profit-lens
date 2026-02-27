import { component$ } from '@builder.io/qwik';
import { VisualOptionPicker } from '../../../../../components/ui/visual-option-picker';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { FixedCostAllocation } from '../../../../../lib/features/profile/profile-form-utils';
import type { ProfileFormState } from '../profile-form-state';

interface ProfileMonthlyCostsSectionProps {
  state: ProfileFormState;
  showHeading?: boolean;
}

export const ProfileMonthlyCostsSection = component$<ProfileMonthlyCostsSectionProps>(
  ({ state, showHeading = true }) => {
    const i18n = useI18n();

    const allocationOptions = [
      { value: 'perHour', label: t(i18n, 'fixedCostPerHourLabel', 'Per hour'), icon: 'schedule' },
      { value: 'perKm', label: t(i18n, 'fixedCostPerKmLabel', 'Per km'), icon: 'route' },
      {
        value: 'perDelivery',
        label: t(i18n, 'fixedCostPerDeliveryLabel', 'Per delivery'),
        icon: 'local_shipping',
      },
    ];

    return (
      <>
        {showHeading ? (
          <p class="ui-settings-field-heading">{t(i18n, 'monthlyCostsSectionTitle', 'Monthly costs')}</p>
        ) : null}

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
          <span class="ui-label">{t(i18n, 'fixedCostAllocationLabel', 'Allocate fixed costs by')}</span>
          <VisualOptionPicker
            ariaLabel={t(i18n, 'fixedCostAllocationLabel', 'Allocate fixed costs by')}
            compact
            columns={3}
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
      </>
    );
  },
);
