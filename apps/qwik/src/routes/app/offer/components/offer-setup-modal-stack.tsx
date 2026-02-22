import { component$, type QRL, type Signal } from "@builder.io/qwik";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { OfferSettingsSheet } from "./offer-settings-sheet";

interface OfferSetupModalStackProps {
  isSettingsOpen: Signal<boolean>;
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
  return (
    <OfferSettingsSheet
      isOpen={props.isSettingsOpen}
      minProfitabilityEuro={props.minProfitabilityEuro}
      onClose$={props.onCloseSettings$}
      onSaveProfitabilityTarget$={props.onSaveProfitabilityTarget$}
      onVehicleChange$={props.onVehicleChange$}
      savingProfitTarget={props.savingProfitTarget}
      selectedVehicleId={props.selectedVehicleId}
      uid={props.uid}
      vehicles={props.vehicles}
      vehiclesLoading={props.vehiclesLoading}
    />
  );
});
