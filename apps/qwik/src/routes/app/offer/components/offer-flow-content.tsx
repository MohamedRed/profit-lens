import {
  $,
  component$,
  type QRL,
  type Signal,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Button } from "../../../../components/ui/button";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { shouldUseDirectGalleryImport } from "../offer-import-platform";
import type { OfferAnalysisRecord } from "../offer-analysis-result";
import { enableCaptureCta, enableManualEntry } from "../offer-feature-flags";
import { OfferFlowStatus } from "./offer-flow-status";
import { OfferImportSourceDialog } from "./offer-import-source-dialog";
import { OfferBillingSheet } from "./offer-billing-sheet";
import { OfferManualDetailsSection } from "./offer-manual-details-section";
import { OfferOverviewSections } from "./offer-overview-sections";
import { OfferSettingsSheet } from "./offer-settings-sheet";
import { OfferScreenshotPreview } from "./offer-screenshot-preview";
import { OfferSetupEditorSheet } from "./offer-setup-editor-sheet";

interface OfferFlowContentProps {
  analysisRecord: Signal<OfferAnalysisRecord | null>;
  distance: Signal<string>;
  dropoffAddress: Signal<string>;
  dropoffName: Signal<string>;
  duration: Signal<string>;
  loading: Signal<boolean>;
  manualEntryRequested: Signal<boolean>;
  minProfitabilityEuro: Signal<number>;
  onAnalyzeManual$: QRL<() => Promise<void>>;
  onClearScreenshotPreview$: QRL<() => void>;
  onImportScreenshotFile$: QRL<(file: File) => Promise<void>>;
  onSaveProfitabilityTarget$: QRL<(value: string) => Promise<void>>;
  onViewDetails$: QRL<() => void | Promise<void>>;
  payout: Signal<string>;
  pickupAddress: Signal<string>;
  pickupName: Signal<string>;
  savingProfitTarget: Signal<boolean>;
  screenshotPreviewUrl: Signal<string | null>;
  selectedVehicleId: Signal<string>;
  status: Signal<string>;
  userId: string;
  vehicles: Signal<VehicleProfile[]>;
  vehiclesLoading: Signal<boolean>;
}

export const OfferFlowContent = component$<OfferFlowContentProps>((props) => {
  const i18n = useI18n();
  const sourceDialogOpen = useSignal(false);
  const settingsSheetOpen = useSignal(false);
  const setupEditorOpen = useSignal(false);
  const billingSheetOpen = useSignal(false);
  const modalSwitchTimeoutId = useSignal<number | null>(null);
  const settingsOpenFrameId = useSignal<number | null>(null);
  const useDirectGalleryImport = useSignal(false);
  const importScreenshotLabel = t(
    i18n,
    "importScreenshotButton",
    "Import screenshot",
  );
  const analyzingCtaLabel = t(i18n, "offerAnalyzingLabel", "Analysing...");

  useVisibleTask$(() => {
    useDirectGalleryImport.value = shouldUseDirectGalleryImport(window);
  });

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (settingsOpenFrameId.value !== null) {
        window.cancelAnimationFrame(settingsOpenFrameId.value);
        settingsOpenFrameId.value = null;
      }
      if (modalSwitchTimeoutId.value !== null) {
        window.clearTimeout(modalSwitchTimeoutId.value);
        modalSwitchTimeoutId.value = null;
      }
    });
  });

  const closeSourceDialog$ = $(() => {
    sourceDialogOpen.value = false;
  });

  const closeSettingsSheet$ = $(() => {
    settingsSheetOpen.value = false;
  });

  const openSettingsSheet$ = $(() => {
    if (settingsOpenFrameId.value !== null) {
      window.cancelAnimationFrame(settingsOpenFrameId.value);
      settingsOpenFrameId.value = null;
    }
    settingsOpenFrameId.value = window.requestAnimationFrame(() => {
      settingsOpenFrameId.value = null;
      settingsSheetOpen.value = true;
    });
  });

  const openSetupEditorFromSettings$ = $(() => {
    settingsSheetOpen.value = false;
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
    settingsSheetOpen.value = false;
    if (modalSwitchTimeoutId.value !== null) {
      window.clearTimeout(modalSwitchTimeoutId.value);
      modalSwitchTimeoutId.value = null;
    }
    modalSwitchTimeoutId.value = window.setTimeout(() => {
      billingSheetOpen.value = true;
      modalSwitchTimeoutId.value = null;
    }, 280);
  });

  const handleImportButtonClick$ = $(() => {
    if (props.loading.value || !props.vehicles.value.length) {
      return;
    }
    sourceDialogOpen.value = true;
  });

  const onFileSelected$ = $(async (file: File) => {
    await props.onImportScreenshotFile$(file);
  });

  const onFileInputEvent$ = $(async (element: HTMLInputElement) => {
    const file = element.files?.[0];
    if (!file) {
      return;
    }
    void onFileSelected$(file);
    element.value = "";
  });

  const showOverview =
    !props.loading.value && props.analysisRecord.value !== null;
  const showDetailsSection =
    !showOverview && enableManualEntry && props.manualEntryRequested.value;
  const showManualEntryCta =
    enableManualEntry && !showOverview && !showDetailsSection;
  const hasVehicles = props.vehicles.value.length > 0;
  const showEmptyState = !props.vehiclesLoading.value && !hasVehicles;

  const onVehicleChange$ = $((nextVehicleId: string) => {
    props.selectedVehicleId.value = nextVehicleId;
    props.analysisRecord.value = null;
    props.status.value = "";
    props.manualEntryRequested.value = false;
  });

  return (
    <div class="ui-stack ui-offer-flow">
      {showEmptyState ? (
        <div class="ui-offer-no-vehicle-state">
          <p class="ui-offer-empty-copy">
            {t(
              i18n,
              "noVehiclesMessage",
              "Add a vehicle to start analyzing offers.",
            )}
          </p>
        </div>
      ) : null}

      {showEmptyState ? null : (
        <>
          <section
            class="ui-offer-import-hero"
            aria-label={importScreenshotLabel}
          >
            <div class="ui-offer-import-cta-row">
              <Button
                variant="ghost"
                size="lg"
                type="button"
                class="ui-offer-setup-settings-button"
                aria-label={t(i18n, "showOfferSetupButton", "Show setup")}
                onClick$={openSettingsSheet$}
              >
                <span
                  class="material-icons-outlined ui-offer-setup-settings-icon"
                  aria-hidden="true"
                >
                  settings
                </span>
              </Button>

              {useDirectGalleryImport.value ? (
                <label class="ui-button ui-button-default ui-button-lg ui-offer-primary-cta ui-offer-file-trigger">
                  {props.loading.value
                    ? (
                        <span class="ui-offer-cta-loading-content">
                          <span
                            class="material-icons-outlined ui-offer-cta-loading-icon"
                            aria-hidden="true"
                          >
                            manage_search
                          </span>
                          <span>{analyzingCtaLabel}</span>
                        </span>
                      )
                    : importScreenshotLabel}
                  <input
                    class="ui-offer-file-input-hidden"
                    type="file"
                    accept="image/*"
                    disabled={props.loading.value || !hasVehicles}
                    onClick$={(_, element) => {
                      element.value = "";
                    }}
                    onInput$={(_, element) => {
                      void onFileInputEvent$(element);
                    }}
                    onChange$={(_, element) => {
                      void onFileInputEvent$(element);
                    }}
                  />
                </label>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  class="ui-offer-primary-cta"
                  disabled={props.loading.value || !hasVehicles}
                  onClick$={handleImportButtonClick$}
                >
                  {props.loading.value
                    ? (
                        <span class="ui-offer-cta-loading-content">
                          <span
                            class="material-icons-outlined ui-offer-cta-loading-icon"
                            aria-hidden="true"
                          >
                            manage_search
                          </span>
                          <span>{analyzingCtaLabel}</span>
                        </span>
                      )
                    : importScreenshotLabel}
                </Button>
              )}
            </div>

            {enableCaptureCta ? (
              <label class="ui-button ui-button-secondary ui-button-lg ui-offer-file-trigger">
                {t(i18n, "captureScreenshotButton", "Capture screenshot")}
                <input
                  class="ui-offer-file-input-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={props.loading.value || !hasVehicles}
                  onClick$={(_, element) => {
                    element.value = "";
                  }}
                  onInput$={(_, element) => {
                    void onFileInputEvent$(element);
                  }}
                  onChange$={(_, element) => {
                    void onFileInputEvent$(element);
                  }}
                />
              </label>
            ) : null}

            {props.screenshotPreviewUrl.value ? (
              <OfferScreenshotPreview
                src={props.screenshotPreviewUrl.value}
                onRemove$={props.onClearScreenshotPreview$}
                removeDisabled={
                  props.loading.value || props.analysisRecord.value !== null
                }
              />
            ) : null}
          </section>

          {showOverview && props.analysisRecord.value ? (
            <OfferOverviewSections
              record={props.analysisRecord.value}
              minProfitabilityEuro={props.minProfitabilityEuro.value}
              onViewDetails$={props.onViewDetails$}
            />
          ) : null}

          {showDetailsSection ? (
            <OfferManualDetailsSection
              payout={props.payout}
              distance={props.distance}
              duration={props.duration}
              pickupName={props.pickupName}
              pickupAddress={props.pickupAddress}
              dropoffName={props.dropoffName}
              dropoffAddress={props.dropoffAddress}
              showAnalyzeAction={true}
              onAnalyze$={props.onAnalyzeManual$}
            />
          ) : null}

          {showManualEntryCta ? (
            <Button
              variant="secondary"
              size="lg"
              disabled={props.loading.value}
              onClick$={() => {
                props.manualEntryRequested.value = true;
                props.analysisRecord.value = null;
                props.status.value = "";
              }}
            >
              {t(i18n, "manualEntryButton", "Enter manually")}
            </Button>
          ) : null}

          <OfferFlowStatus status={props.status.value} />

          <OfferImportSourceDialog
            isOpen={sourceDialogOpen.value}
            onClose$={closeSourceDialog$}
            onSelectFile$={onFileSelected$}
          />

          <OfferSettingsSheet
            isOpen={settingsSheetOpen.value}
            minProfitabilityEuro={props.minProfitabilityEuro.value}
            onClose$={closeSettingsSheet$}
            onManagePlan$={openBillingFromSettings$}
            onOpenSetupEditor$={openSetupEditorFromSettings$}
            selectedVehicleId={props.selectedVehicleId.value}
            uid={props.userId}
            vehicles={props.vehicles.value}
          />

          <OfferSetupEditorSheet
            isOpen={setupEditorOpen.value}
            minProfitabilityEuro={props.minProfitabilityEuro.value}
            onClose$={() => {
              setupEditorOpen.value = false;
            }}
            onSaveProfitabilityTarget$={props.onSaveProfitabilityTarget$}
            onVehicleChange$={onVehicleChange$}
            savingProfitTarget={props.savingProfitTarget.value}
            selectedVehicleId={props.selectedVehicleId.value}
            vehicles={props.vehicles.value}
            vehiclesLoading={props.vehiclesLoading.value}
          />

          <OfferBillingSheet
            isOpen={billingSheetOpen.value}
            uid={props.userId}
            onClose$={() => {
              billingSheetOpen.value = false;
            }}
          />
        </>
      )}
    </div>
  );
});
