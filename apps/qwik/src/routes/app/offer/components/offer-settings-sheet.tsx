import { component$, type QRL } from "@builder.io/qwik";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { OfferSetupSummary } from "./offer-setup-summary";
import { useOfferSheetTransition } from "./use-offer-sheet-transition";

interface OfferSettingsSheetProps {
  isOpen: boolean;
  minProfitabilityEuro: number;
  onClose$: QRL<() => void>;
  onManagePlan$: QRL<() => void>;
  onOpenSetupEditor$: QRL<() => void>;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
}

export const OfferSettingsSheet = component$<OfferSettingsSheetProps>((props) => {
  const i18n = useI18n();
  const { isClosing, isMounted } = useOfferSheetTransition({
    isOpen: props.isOpen,
  });

  if (!isMounted.value) {
    return null;
  }

  return (
    <div
      class={{
        "ui-offer-settings-sheet-root": true,
        "is-closing": isClosing.value,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t(i18n, "offerSetupTitle", "Offer settings")}
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
    </div>
  );
});
