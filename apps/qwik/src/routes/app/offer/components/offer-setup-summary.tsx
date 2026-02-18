import { $, component$, type QRL, useSignal } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { OfferSetupEditorSheet } from './offer-setup-editor-sheet';

interface OfferSetupSummaryProps {
  minProfitabilityEuro: number;
  onSaveProfitabilityTarget$: QRL<(value: string) => Promise<void>>;
  onVehicleChange$: QRL<(vehicleId: string) => void>;
  savingProfitTarget: boolean;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
  vehiclesLoading: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const OfferSetupSummary = component$<OfferSetupSummaryProps>((props) => {
  const i18n = useI18n();
  const editorOpen = useSignal(false);

  const selectedVehicleName =
    props.vehicles.find((vehicle) => vehicle.id === props.selectedVehicleId)?.name ??
    t(i18n, 'loadingLabel', 'Loading...');

  const openEditor$ = $(() => {
    editorOpen.value = true;
  });

  const closeEditor$ = $(() => {
    editorOpen.value = false;
  });

  return (
    <>
      <section class="ui-offer-setup-summary" aria-label={t(i18n, 'editOfferDetailsButton', 'Edit details')}>
        <div class="ui-offer-setup-summary-chips">
          <span class="ui-offer-setup-chip">{selectedVehicleName}</span>
          <span class="ui-offer-setup-chip">
            {formatCurrency(props.minProfitabilityEuro)}
          </span>
        </div>
        <Button variant="ghost" type="button" class="ui-offer-setup-summary-edit" onClick$={openEditor$}>
          {t(i18n, 'editOfferDetailsButton', 'Edit details')}
        </Button>
      </section>

      <OfferSetupEditorSheet
        isOpen={editorOpen.value}
        minProfitabilityEuro={props.minProfitabilityEuro}
        onClose$={closeEditor$}
        onSaveProfitabilityTarget$={props.onSaveProfitabilityTarget$}
        onVehicleChange$={props.onVehicleChange$}
        savingProfitTarget={props.savingProfitTarget}
        selectedVehicleId={props.selectedVehicleId}
        vehicles={props.vehicles}
        vehiclesLoading={props.vehiclesLoading}
      />
    </>
  );
});
