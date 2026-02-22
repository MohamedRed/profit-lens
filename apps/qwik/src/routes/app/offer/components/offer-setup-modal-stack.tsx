import { $, component$, type QRL, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { OfferBillingSheet } from "./offer-billing-sheet";
import { OfferSettingsSheet } from "./offer-settings-sheet";
import { OfferSetupEditorSheet } from "./offer-setup-editor-sheet";

interface OfferSetupModalStackProps {
  isSettingsOpen: boolean;
  minProfitabilityEuro: number;
  onCloseSettings$: QRL<() => void>;
  onSaveProfitabilityTarget$: QRL<(value: string) => Promise<void>>;
  onVehicleChange$: QRL<(vehicleId: string) => void>;
  savingProfitTarget: boolean;
  selectedVehicleId: string;
  uid: string;
  vehicles: VehicleProfile[];
  vehiclesLoading: boolean;
}

export const OfferSetupModalStack = component$<OfferSetupModalStackProps>((props) => {
  const setupEditorOpen = useSignal(false);
  const billingSheetOpen = useSignal(false);
  const modalSwitchTimeoutId = useSignal<number | null>(null);

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (modalSwitchTimeoutId.value !== null) {
        window.clearTimeout(modalSwitchTimeoutId.value);
        modalSwitchTimeoutId.value = null;
      }
    });
  });

  const openSetupEditorFromSettings$ = $(() => {
    props.onCloseSettings$();
    if (modalSwitchTimeoutId.value !== null) {
      window.clearTimeout(modalSwitchTimeoutId.value);
      modalSwitchTimeoutId.value = null;
    }
    modalSwitchTimeoutId.value = window.setTimeout(() => {
      setupEditorOpen.value = true;
      modalSwitchTimeoutId.value = null;
    }, 280);
  });

  const openBillingFromSettings$ = $(() => {
    props.onCloseSettings$();
    if (modalSwitchTimeoutId.value !== null) {
      window.clearTimeout(modalSwitchTimeoutId.value);
      modalSwitchTimeoutId.value = null;
    }
    modalSwitchTimeoutId.value = window.setTimeout(() => {
      billingSheetOpen.value = true;
      modalSwitchTimeoutId.value = null;
    }, 280);
  });

  return (
    <>
      <OfferSettingsSheet
        isOpen={props.isSettingsOpen}
        minProfitabilityEuro={props.minProfitabilityEuro}
        onClose$={props.onCloseSettings$}
        onManagePlan$={openBillingFromSettings$}
        onOpenSetupEditor$={openSetupEditorFromSettings$}
        selectedVehicleId={props.selectedVehicleId}
        vehicles={props.vehicles}
      />

      <OfferSetupEditorSheet
        isOpen={setupEditorOpen.value}
        minProfitabilityEuro={props.minProfitabilityEuro}
        onClose$={() => {
          setupEditorOpen.value = false;
        }}
        onSaveProfitabilityTarget$={props.onSaveProfitabilityTarget$}
        onVehicleChange$={props.onVehicleChange$}
        savingProfitTarget={props.savingProfitTarget}
        selectedVehicleId={props.selectedVehicleId}
        vehicles={props.vehicles}
        vehiclesLoading={props.vehiclesLoading}
      />

      <OfferBillingSheet
        isOpen={billingSheetOpen.value}
        uid={props.uid}
        onClose$={() => {
          billingSheetOpen.value = false;
        }}
      />
    </>
  );
});
