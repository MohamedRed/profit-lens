import { component$, type QRL } from "@builder.io/qwik";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { OfferSetupSummary } from "./offer-setup-summary";
import { OfferUsageSection } from "./offer-usage-section";
import { useOfferDialogTransition } from "./use-offer-dialog-transition";

interface OfferSettingsSheetProps {
  isOpen: boolean;
  minProfitabilityEuro: number;
  onClose$: QRL<() => void>;
  onManagePlan$: QRL<() => void>;
  onOpenSetupEditor$: QRL<() => void>;
  selectedVehicleId: string;
  uid: string;
  vehicles: VehicleProfile[];
}

export const OfferSettingsSheet = component$<OfferSettingsSheetProps>(
  (props) => {
    const i18n = useI18n();
    const { dialogRef, isClosing } = useOfferDialogTransition({
      isOpen: props.isOpen,
    });

    return (
      <dialog
        ref={dialogRef}
        class={{
          "ui-offer-settings-dialog": true,
          "is-closing": isClosing.value,
        }}
        aria-label={t(i18n, "offerSetupTitle", "Offer settings")}
        onCancel$={(event) => {
          event.preventDefault();
          props.onClose$();
        }}
        onClick$={(event, element) => {
          if (event.target === element) {
            props.onClose$();
          }
        }}
      >
        <div class="ui-offer-settings-panel">
          <header class="ui-offer-settings-panel-header">
            <h3 class="ui-offer-settings-panel-title">
              {t(i18n, "offerSetupTitle", "Offer settings")}
            </h3>
            <button
              type="button"
              class="ui-offer-settings-panel-close"
              onClick$={props.onClose$}
              aria-label={t(i18n, "closeLabel", "Close")}
            >
              <span class="material-icons-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </header>
          <div class="ui-offer-settings-panel-body">
            <OfferSetupSummary
              minProfitabilityEuro={props.minProfitabilityEuro}
              onEdit$={props.onOpenSetupEditor$}
              selectedVehicleId={props.selectedVehicleId}
              vehicles={props.vehicles}
            />
            <OfferUsageSection
              uid={props.uid}
              variant="inline"
              onManagePlan$={props.onManagePlan$}
            />
          </div>
        </div>
      </dialog>
    );
  },
);
