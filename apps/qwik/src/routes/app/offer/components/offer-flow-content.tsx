import {
  $,
  component$,
  type QRL,
  type Signal,
  useSignal,
} from "@builder.io/qwik";
import { Button } from "../../../../components/ui/button";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import type { OfferAnalysisRecord } from "../offer-analysis-result";
import { stageOfferScreenshotFile } from "../offer-file-transfer-store";
import { enableCaptureCta, enableManualEntry } from "../offer-feature-flags";
import { OfferFlowStatus } from "./offer-flow-status";
import { OfferManualDetailsSection } from "./offer-manual-details-section";
import { OfferOverviewSections } from "./offer-overview-sections";
import { OfferScreenshotPreview } from "./offer-screenshot-preview";
import { OfferSetupModalStack } from "./offer-setup-modal-stack";

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
  onImportScreenshotFile$: QRL<(fileToken: string) => Promise<void>>;
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
  const settingsSheetOpen = useSignal(false);
  const screenshotInputRef = useSignal<HTMLInputElement>();
  const importScreenshotLabel = t(
    i18n,
    "importScreenshotButton",
    "Import screenshot",
  );
  const analyzingCtaLabel = t(i18n, "offerAnalyzingLabel", "Analysing...");

  const openSettingsSheet$ = $(() => {
    settingsSheetOpen.value = true;
  });

  const onFileSelected$ = $(async (file: File) => {
    const token = stageOfferScreenshotFile(file);
    await props.onImportScreenshotFile$(token);
  });

  const onFileInputEvent$ = $(async (element: HTMLInputElement) => {
    const file = element.files?.[0];
    if (!file) {
      return;
    }
    try {
      await onFileSelected$(file);
    } finally {
      element.value = "";
    }
  });

  const openScreenshotPicker$ = $(() => {
    const element = screenshotInputRef.value;
    if (!element) {
      return;
    }
    element.value = "";
    element.click();
  });

  const analysisRecord = props.analysisRecord.value;
  const showOverview =
    !props.loading.value && analysisRecord !== null;
  const detailsHref = analysisRecord
    ? `/next/app/history/details?offerId=${encodeURIComponent(analysisRecord.id)}&backTo=${encodeURIComponent("/next/app/offer")}`
    : null;
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
              <button
                type="button"
                class="ui-button ui-button-ghost ui-button-lg ui-offer-setup-settings-button"
                aria-label={t(i18n, "showOfferSetupButton", "Show setup")}
                data-allow-left-edge-tap
                onClick$={openSettingsSheet$}
              >
                <span
                  class="material-icons-outlined ui-offer-setup-settings-icon"
                  aria-hidden="true"
                >
                  settings
                </span>
              </button>

              <div class="ui-offer-file-cta-shell">
                <Button
                  variant="default"
                  size="lg"
                  type="button"
                  class="ui-offer-primary-cta"
                  disabled={props.loading.value || !hasVehicles}
                  onClick$={openScreenshotPicker$}
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
              </div>
            </div>
            <input
              ref={screenshotInputRef}
              class="ui-offer-file-input-control"
              type="file"
              accept="image/*"
              aria-label={importScreenshotLabel}
              disabled={props.loading.value || !hasVehicles}
              tabIndex={-1}
              onInput$={(_, element) => {
                void onFileInputEvent$(element);
              }}
              onChange$={(_, element) => {
                void onFileInputEvent$(element);
              }}
            />

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

          {showOverview && analysisRecord && detailsHref ? (
            <OfferOverviewSections
              record={analysisRecord}
              minProfitabilityEuro={props.minProfitabilityEuro.value}
              detailsHref={detailsHref}
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

          <OfferSetupModalStack
            isSettingsOpen={settingsSheetOpen}
            minProfitabilityEuro={props.minProfitabilityEuro.value}
            onCloseSettings$={() => {
              settingsSheetOpen.value = false;
            }}
            onSaveProfitabilityTarget$={props.onSaveProfitabilityTarget$}
            onVehicleChange$={onVehicleChange$}
            savingProfitTarget={props.savingProfitTarget.value}
            selectedVehicleId={props.selectedVehicleId.value}
            uid={props.userId}
            vehicles={props.vehicles.value}
            vehiclesLoading={props.vehiclesLoading.value}
          />
        </>
      )}
    </div>
  );
});
