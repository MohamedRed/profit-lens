import {
  $,
  component$,
  type QRL,
  type Signal,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { SkeletonBlock } from "../../../../components/ui/page-loading-skeleton";
import { VisualOptionPicker } from "../../../../components/ui/visual-option-picker";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { resolveVehicleTypeIcon } from "../../shared/vehicle-visuals";
import { BillingManager } from "../../settings/billing/billing-manager";
import { OfferSetupSummary } from "./offer-setup-summary";
import { OfferSubscriptionLink } from "./offer-subscription-link";
import {
  offerDialogTransitionMs,
  useOfferDialogTransition,
} from "./use-offer-dialog-transition";
import {
  type OfferSettingsView,
  useOfferSettingsViewportHeight,
} from "./use-offer-settings-viewport-height";

interface OfferSettingsSheetProps {
  isOpen: Signal<boolean>;
  minProfitabilityEuro: number;
  onClose$: QRL<() => void>;
  onSaveProfitabilityTarget$: QRL<(value: string) => Promise<void>>;
  onVehicleChange$: QRL<(vehicleId: string) => void>;
  savingProfitTarget: boolean;
  selectedVehicleId: string;
  uid: string;
  vehicles: VehicleProfile[];
  vehiclesLoading: boolean;
}

export const OfferSettingsSheet = component$<OfferSettingsSheetProps>((props) => {
  const i18n = useI18n();
  const { dialogRef } = useOfferDialogTransition({
    isOpen: props.isOpen,
  });
  const activeView = useSignal<OfferSettingsView>("menu");
  const viewHeightPx = useSignal<number | null>(null);
  const draftMinProfitability = useSignal(props.minProfitabilityEuro.toFixed(2));
  const closeResetTimeoutId = useSignal<number>();

  useVisibleTask$(({ track, cleanup }) => {
    const isOpen = track(() => props.isOpen.value);
    cleanup(() => {
      if (closeResetTimeoutId.value !== undefined) {
        window.clearTimeout(closeResetTimeoutId.value);
        closeResetTimeoutId.value = undefined;
      }
    });
    if (closeResetTimeoutId.value !== undefined) {
      window.clearTimeout(closeResetTimeoutId.value);
      closeResetTimeoutId.value = undefined;
    }
    if (!isOpen) {
      closeResetTimeoutId.value = window.setTimeout(() => {
        activeView.value = "menu";
        viewHeightPx.value = null;
        closeResetTimeoutId.value = undefined;
      }, offerDialogTransitionMs);
      return;
    }
    if (activeView.value === "menu") {
      draftMinProfitability.value = props.minProfitabilityEuro.toFixed(2);
    }
  });

  useOfferSettingsViewportHeight({
    isOpen: props.isOpen,
    activeView,
    dialogRef,
    viewHeightPx,
  });

  const openSetup$ = $(() => {
    draftMinProfitability.value = props.minProfitabilityEuro.toFixed(2);
    activeView.value = "setup";
  });

  const openBilling$ = $(() => {
    activeView.value = "billing";
  });

  const goBackToMenu$ = $(() => {
    activeView.value = "menu";
  });

  const applySetup$ = $(async () => {
    await props.onSaveProfitabilityTarget$(draftMinProfitability.value);
    activeView.value = "menu";
  });

  const viewTitle =
    activeView.value === "menu"
      ? t(i18n, "offerSetupTitle", "Offer settings")
      : activeView.value === "setup"
        ? t(i18n, "editOfferDetailsButton", "Edit details")
        : t(i18n, "billingManageTitle", "Manage subscription");

  const bodyViewportStyle =
    viewHeightPx.value === null ? undefined : { height: `${viewHeightPx.value}px` };

  return (
    <dialog
      ref={dialogRef}
      class="ui-offer-settings-dialog"
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
          {activeView.value === "menu" ? (
            <span class="ui-offer-settings-panel-nav-spacer" aria-hidden="true" />
          ) : (
            <button
              type="button"
              class="ui-offer-settings-panel-back"
              onClick$={goBackToMenu$}
              aria-label={t(i18n, "commonBackLabel", "Back")}
            >
              <span class="material-icons-outlined" aria-hidden="true">
                arrow_back
              </span>
            </button>
          )}
          <h3 class="ui-offer-settings-panel-title">{viewTitle}</h3>
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

        <div
          class="ui-offer-settings-view-viewport"
          style={bodyViewportStyle}
        >
          {activeView.value === "menu" ? (
            <section
              key="offer-settings-menu"
              data-offer-settings-view="menu"
              class="ui-offer-settings-view"
            >
              <div class="ui-offer-settings-panel-body">
                <OfferSetupSummary
                  minProfitabilityEuro={props.minProfitabilityEuro}
                  onEdit$={openSetup$}
                  selectedVehicleId={props.selectedVehicleId}
                  vehicles={props.vehicles}
                />

                <OfferSubscriptionLink onOpenBilling$={openBilling$} uid={props.uid} />
              </div>
            </section>
          ) : null}

          {activeView.value === "setup" ? (
            <section
              key="offer-settings-setup"
              data-offer-settings-view="setup"
              class="ui-offer-settings-view"
            >
              <div class="ui-offer-setup-panel-body">
                {props.vehiclesLoading ? (
                  <div class="ui-skeleton-stack-sm ui-offer-setup-vehicle-skeleton" aria-hidden="true">
                    <SkeletonBlock height="12px" width="112px" />
                    <SkeletonBlock height="44px" width="100%" />
                  </div>
                ) : (
                  <div class="ui-field">
                    <Label>{t(i18n, "vehicleSelectLabel", "Select vehicle")}</Label>
                    <VisualOptionPicker
                      ariaLabel={t(i18n, "vehicleSelectLabel", "Select vehicle")}
                      columns={1}
                      options={props.vehicles.map((vehicle) => ({
                        label: vehicle.name,
                        subtitle: vehicle.type,
                        value: vehicle.id,
                        icon: resolveVehicleTypeIcon(vehicle.type),
                      }))}
                      value={props.selectedVehicleId}
                      onChange$={props.onVehicleChange$}
                    />
                  </div>
                )}

                <div class="ui-field">
                  <Label for="offer-min-profitability-sheet">
                    {t(i18n, "minProfitabilityLabel", "Minimum profit per km")}
                  </Label>
                  <div class="ui-offer-target-input-wrap">
                    <Input
                      id="offer-min-profitability-sheet"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      autoComplete="off"
                      spellcheck={false}
                      value={draftMinProfitability.value}
                      onInput$={(_, element) => {
                        draftMinProfitability.value = element.value;
                      }}
                    />
                    <span class="ui-offer-target-suffix">€/km</span>
                  </div>
                  <p class="ui-offer-target-hint">
                    {t(i18n, "minProfitabilityHint", "Suggested default: €2.00/km")}
                  </p>
                  {props.savingProfitTarget ? (
                    <p class="ui-offer-target-saving">{t(i18n, "loadingLabel", "Loading...")}</p>
                  ) : null}
                </div>
              </div>

              <footer class="ui-offer-setup-panel-actions">
                <Button variant="secondary" type="button" onClick$={goBackToMenu$}>
                  {t(i18n, "cancelLabel", "Cancel")}
                </Button>
                <Button variant="default" type="button" onClick$={applySetup$}>
                  {t(i18n, "saveLabel", "Save")}
                </Button>
              </footer>
            </section>
          ) : null}

          {activeView.value === "billing" ? (
            <section
              key="offer-settings-billing"
              data-offer-settings-view="billing"
              class="ui-offer-settings-view ui-offer-settings-view-scroll"
            >
              <BillingManager uid={props.uid} rootClass="ui-offer-billing-manager" />
            </section>
          ) : null}
        </div>
      </div>
    </dialog>
  );
});
