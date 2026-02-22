import { component$, type QRL } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

interface OfferSetupSummaryProps {
  minProfitabilityEuro: number;
  onEdit$: QRL<() => void>;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatEuroPerKm = (value: number): string => `${formatCurrency(value)}/km`;

export const OfferSetupSummary = component$<OfferSetupSummaryProps>((props) => {
  const i18n = useI18n();

  const selectedVehicleName =
    props.vehicles.find((vehicle) => vehicle.id === props.selectedVehicleId)?.name ??
    t(i18n, 'loadingLabel', 'Loading...');

  return (
    <section class="ui-offer-setup-summary" aria-label={t(i18n, 'editOfferDetailsButton', 'Edit details')}>
      <div class="ui-offer-setup-summary-chips">
        <span class="ui-offer-setup-chip">{selectedVehicleName}</span>
        <span class="ui-offer-setup-chip">
          {formatEuroPerKm(props.minProfitabilityEuro)}
        </span>
      </div>
      <Button variant="ghost" type="button" class="ui-offer-setup-summary-edit" onClick$={props.onEdit$}>
        {t(i18n, 'editOfferDetailsButton', 'Edit details')}
      </Button>
    </section>
  );
});
