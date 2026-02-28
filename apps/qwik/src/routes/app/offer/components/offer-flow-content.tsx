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
  const fileImportInFlight = useSignal(false);
  const importFileInputRef = useSignal<HTMLInputElement>();
  const captureFileInputRef = useSignal<HTMLInputElement>();
  const importScreenshotLabel = t(
    i18n,
    "importScreenshotButton",
    "Import screenshot",
  );
  const analyzingCtaLabel = t(i18n, "offerAnalyzingLabel", "Analysing...");

  const openSettingsSheet$ = $(() => {
    settingsSheetOpen.value = true;
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => props.loading.value);
    track(() => props.selectedVehicleId.value);
    track(() => props.vehicles.value.length);
    track(() => fileImportInFlight.value);

    const readSelectedFileWithRetry = async (
      element: HTMLInputElement,
    ): Promise<File | null> => {
      let file = element.files?.item(0) ?? null;
      let attempt = 0;
      while (!file && attempt < 4) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 120);
        });
        file = element.files?.item(0) ?? null;
        attempt += 1;
      }
      return file;
    };

    const handleFileInputElement = async (
      element: HTMLInputElement,
    ): Promise<void> => {
      if (fileImportInFlight.value) {
        return;
      }
      const file = await readSelectedFileWithRetry(element);
      if (!file) {
        return;
      }
      fileImportInFlight.value = true;
      props.status.value = t(
        i18n,
        "offerScreenshotSelectedMessage",
        "Screenshot selected. Preparing analysis...",
      );
      try {
        const fileToken = stageOfferScreenshotFile(file);
        await props.onImportScreenshotFile$(fileToken);
      } catch {
        props.status.value = t(
          i18n,
          "offerActionFailedMessage",
          "Unable to complete this action right now. Please try again.",
        );
      } finally {
        element.value = "";
        fileImportInFlight.value = false;
      }
    };

    const cleanups: Array<() => void> = [];
    const register = (element: HTMLInputElement | undefined) => {
      if (!element) {
        return;
      }
      const onInput = () => {
        void handleFileInputElement(element);
      };
      const onChange = () => {
        void handleFileInputElement(element);
      };
      element.addEventListener("input", onInput);
      element.addEventListener("change", onChange);
      cleanups.push(() => {
        element.removeEventListener("input", onInput);
        element.removeEventListener("change", onChange);
      });
    };

    register(importFileInputRef.value);
    register(captureFileInputRef.value);

    cleanup(() => {
      cleanups.forEach((runCleanup) => {
        runCleanup();
      });
    });
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
  const hasSelectedVehicle = props.selectedVehicleId.value.length > 0;
  const importBusy = props.loading.value || fileImportInFlight.value;
  const importDisabled = importBusy || !hasVehicles || !hasSelectedVehicle;
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
                  disabled={importDisabled}
                  aria-label={importScreenshotLabel}
                >
                  {importBusy
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
                <input
                  class="ui-offer-file-input-overlay"
                  type="file"
                  accept="image/*"
                  aria-label={importScreenshotLabel}
                  disabled={importDisabled}
                  ref={importFileInputRef}
                />
              </div>
            </div>

            {enableCaptureCta ? (
              <label class="ui-button ui-button-secondary ui-button-lg ui-offer-file-trigger">
                {t(i18n, "captureScreenshotButton", "Capture screenshot")}
                <input
                  class="ui-offer-file-input-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={importDisabled}
                  ref={captureFileInputRef}
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

          <OfferFlowStatus status={props.status.value} />

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
