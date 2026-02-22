import { component$, type QRL, type Signal } from "@builder.io/qwik";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { OfferSetupSummary } from "./offer-setup-summary";
import { useOfferDialogTransition } from "./use-offer-dialog-transition";

interface OfferSettingsSheetProps {
  isOpen: Signal<boolean>;
  minProfitabilityEuro: number;
  onClose$: QRL<() => void>;
  onManagePlan$: QRL<() => void>;
  onOpenSetupEditor$: QRL<() => void>;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
}

export const OfferSettingsSheet = component$<OfferSettingsSheetProps>((props) => {
  const i18n = useI18n();
  const { dialogRef, isClosing } = useOfferDialogTransition({
    isOpen: props.isOpen,
  });

  return (
    <dialog
      ref={dialogRef}
      class={{ "ui-offer-settings-dialog": true, "is-closing": isClosing.value }}
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

          <button type="button" class="ui-offer-settings-link" onClick$={props.onManagePlan$}>
            <div class="ui-offer-settings-link-copy">
              <p class="ui-offer-settings-link-title">
                {t(i18n, "billingManageTitle", "Manage subscription")}
              </p>
              <p class="ui-offer-settings-link-subtitle">
                {t(
                  i18n,
                  "offerSubscriptionSettingsHint",
                  "Open your current plan and billing options.",
                )}
              </p>
            </div>
            <span
              class="material-icons-outlined ui-offer-settings-link-chevron"
              aria-hidden="true"
            >
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </dialog>
  );
});
