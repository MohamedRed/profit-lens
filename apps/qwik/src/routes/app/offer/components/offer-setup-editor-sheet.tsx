import { $, component$, type QRL, useSignal, useTask$ } from "@builder.io/qwik";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { SkeletonBlock } from "../../../../components/ui/page-loading-skeleton";
import { Select } from "../../../../components/ui/select";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { useOfferDialogTransition } from "./use-offer-dialog-transition";

interface OfferSetupEditorSheetProps {
  isOpen: boolean;
  minProfitabilityEuro: number;
  onClose$: QRL<() => void>;
  onSaveProfitabilityTarget$: QRL<(value: string) => Promise<void>>;
  onVehicleChange$: QRL<(vehicleId: string) => void>;
  savingProfitTarget: boolean;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
  vehiclesLoading: boolean;
}

export const OfferSetupEditorSheet = component$<OfferSetupEditorSheetProps>((props) => {
  const i18n = useI18n();
  const { dialogRef, isClosing } = useOfferDialogTransition({
    isOpen: props.isOpen,
  });
  const draftMinProfitability = useSignal(props.minProfitabilityEuro.toFixed(2));

  useTask$(({ track }) => {
    const open = track(() => props.isOpen);
    const minProfitabilityEuro = track(() => props.minProfitabilityEuro);
    if (!open) {
      return;
    }
    draftMinProfitability.value = minProfitabilityEuro.toFixed(2);
  });

  const applyAndClose$ = $(async () => {
    await props.onSaveProfitabilityTarget$(draftMinProfitability.value);
    props.onClose$();
  });

  return (
    <dialog
      ref={dialogRef}
      class={{ "ui-offer-setup-dialog": true, "is-closing": isClosing.value }}
      aria-label={t(i18n, "editOfferDetailsButton", "Edit details")}
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
      <div class="ui-offer-setup-panel">
        <header class="ui-offer-setup-panel-header">
          <h3 class="ui-offer-setup-panel-title">{t(i18n, "editOfferDetailsButton", "Edit details")}</h3>
          <button
            type="button"
            class="ui-offer-setup-panel-close"
            onClick$={props.onClose$}
            aria-label={t(i18n, "closeLabel", "Close")}
          >
            <span class="material-icons-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </header>
        <div class="ui-offer-setup-panel-body">
          {props.vehiclesLoading ? (
            <div class="ui-skeleton-stack-sm ui-offer-setup-vehicle-skeleton" aria-hidden="true">
              <SkeletonBlock height="12px" width="112px" />
              <SkeletonBlock height="44px" width="100%" />
            </div>
          ) : (
            <div class="ui-field">
              <Label for="offer-vehicle-sheet">{t(i18n, "vehicleSelectLabel", "Select vehicle")}</Label>
              <Select
                id="offer-vehicle-sheet"
                options={props.vehicles.map((vehicle) => ({
                  label: vehicle.name,
                  value: vehicle.id,
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
                type="number"
                step="0.01"
                min="0"
                value={draftMinProfitability.value}
                onInput$={(_, el) => {
                  draftMinProfitability.value = el.value;
                }}
              />
              <span class="ui-offer-target-suffix">€/km</span>
            </div>
            <p class="ui-offer-target-hint">{t(i18n, "minProfitabilityHint", "Suggested default: €2.00/km")}</p>
            {props.savingProfitTarget ? (
              <p class="ui-offer-target-saving">{t(i18n, "loadingLabel", "Loading...")}</p>
            ) : null}
          </div>
        </div>
        <footer class="ui-offer-setup-panel-actions">
          <Button variant="secondary" type="button" onClick$={props.onClose$}>
            {t(i18n, "cancelLabel", "Cancel")}
          </Button>
          <Button variant="default" type="button" onClick$={applyAndClose$}>
            {t(i18n, "saveLabel", "Save")}
          </Button>
        </footer>
      </div>
    </dialog>
  );
});
