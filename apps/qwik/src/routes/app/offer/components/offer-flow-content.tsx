import { $, component$, type QRL, type Signal, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { SkeletonBlock } from '../../../../components/ui/page-loading-skeleton';
import { Select } from '../../../../components/ui/select';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { shouldUseDirectGalleryImport } from '../offer-import-platform';
import type { OfferAnalysisRecord } from '../offer-analysis-result';
import { enableCaptureCta, enableManualEntry } from '../offer-feature-flags';
import { OfferImportSourceDialog } from './offer-import-source-dialog';
import { OfferManualDetailsSection } from './offer-manual-details-section';
import { OfferOverviewSections } from './offer-overview-sections';
import { OfferScreenshotPreview } from './offer-screenshot-preview';
import { OfferSectionCard } from './offer-section-card';
import { OfferUsageSection } from './offer-usage-section';

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

const isSuccessStatus = (value: string): boolean => {
  const lower = value.toLowerCase();
  return lower.includes('import') || lower.includes('analy');
};

export const OfferFlowContent = component$<OfferFlowContentProps>((props) => {
  const i18n = useI18n();
  const sourceDialogOpen = useSignal(false);
  const useDirectGalleryImport = useSignal(false);

  useVisibleTask$(() => {
    useDirectGalleryImport.value = shouldUseDirectGalleryImport(window);
  });

  const closeSourceDialog$ = $(() => {
    sourceDialogOpen.value = false;
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

  const showOverview = !props.loading.value && props.analysisRecord.value !== null;
  const showDetailsSection = !showOverview && enableManualEntry && props.manualEntryRequested.value;
  const showManualEntryCta = enableManualEntry && !showOverview && !showDetailsSection;
  const hasVehicles = props.vehicles.value.length > 0;
  const showEmptyState = !props.vehiclesLoading.value && !hasVehicles;

  return (
    <div class="ui-stack ui-offer-flow">
      {showEmptyState ? (
        <div class="ui-offer-no-vehicle-state">
          <p class="ui-offer-empty-copy">
            {t(i18n, 'noVehiclesMessage', 'Add a vehicle to start analyzing offers.')}
          </p>
        </div>
      ) : null}

      {showEmptyState ? null : (
        <>
          <OfferSectionCard title={t(i18n, 'vehicleSection', 'Vehicle')} showBorder={true}>
            {props.vehiclesLoading.value ? (
              <div class="ui-skeleton-stack-sm" aria-hidden="true">
                <SkeletonBlock height="12px" width="112px" />
                <SkeletonBlock height="44px" width="100%" />
              </div>
            ) : (
              <div class="ui-field">
                <Label for="offer-vehicle">{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</Label>
                <Select
                  id="offer-vehicle"
                  options={props.vehicles.value.map((vehicle) => ({
                    label: vehicle.name,
                    value: vehicle.id,
                  }))}
                  value={props.selectedVehicleId.value}
                  onChange$={(nextVehicleId) => {
                    props.selectedVehicleId.value = nextVehicleId;
                    props.analysisRecord.value = null;
                    props.status.value = '';
                    props.manualEntryRequested.value = false;
                  }}
                />
              </div>
            )}
          </OfferSectionCard>

          <OfferSectionCard
            title={t(i18n, 'profitabilityTargetTitle', 'Profitability target')}
            showBorder={true}
          >
            <div class="ui-field">
              <Label for="min-profitability">
                {t(i18n, 'minProfitabilityLabel', 'Minimum profitability')}
              </Label>
              <div class="ui-offer-target-input-wrap">
                <Input
                  id="min-profitability"
                  type="number"
                  step="0.01"
                  min="0"
                  value={props.minProfitabilityEuro.value.toFixed(2)}
                  onBlur$={(_, el) => {
                    void props.onSaveProfitabilityTarget$(el.value);
                  }}
                />
                <span class="ui-offer-target-suffix">€</span>
              </div>
              <p class="ui-offer-target-hint">{t(i18n, 'minProfitabilityHint', 'Suggested default: €2.00')}</p>
              {props.savingProfitTarget.value ? (
                <p class="ui-offer-target-saving">{t(i18n, 'loadingLabel', 'Loading...')}</p>
              ) : null}
            </div>
          </OfferSectionCard>

          <OfferUsageSection uid={props.userId} />

          {showOverview && props.analysisRecord.value ? (
            <OfferOverviewSections
              record={props.analysisRecord.value}
              minProfitabilityEuro={props.minProfitabilityEuro.value}
              onViewDetails$={$(() => {
                props.manualEntryRequested.value = true;
              })}
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

          {useDirectGalleryImport.value ? (
            <label class="ui-button ui-button-default ui-button-lg ui-offer-primary-cta ui-offer-file-trigger">
              {props.loading.value
                ? t(i18n, 'loadingLabel', 'Loading...')
                : t(i18n, 'importScreenshotButton', 'Import screenshot')}
              <input
                type="file"
                accept="image/*"
                style="display:none"
                disabled={props.loading.value || !hasVehicles}
                onChange$={(_, element) => {
                  const file = element.files?.[0];
                  if (!file) {
                    return;
                  }
                  void onFileSelected$(file);
                  element.value = '';
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
                ? t(i18n, 'loadingLabel', 'Loading...')
                : t(i18n, 'importScreenshotButton', 'Import screenshot')}
            </Button>
          )}

          {enableCaptureCta ? (
            <label class="ui-button ui-button-secondary ui-button-lg ui-offer-file-trigger">
              {t(i18n, 'captureScreenshotButton', 'Capture screenshot')}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style="display:none"
                disabled={props.loading.value || !hasVehicles}
                onChange$={(_, element) => {
                  const file = element.files?.[0];
                  if (!file) {
                    return;
                  }
                  void onFileSelected$(file);
                  element.value = '';
                }}
              />
            </label>
          ) : null}

          {showManualEntryCta ? (
            <Button
              variant="secondary"
              size="lg"
              disabled={props.loading.value}
              onClick$={() => {
                props.manualEntryRequested.value = true;
                props.analysisRecord.value = null;
                props.status.value = '';
              }}
            >
              {t(i18n, 'manualEntryButton', 'Enter manually')}
            </Button>
          ) : null}

          {props.screenshotPreviewUrl.value ? (
            <OfferScreenshotPreview
              src={props.screenshotPreviewUrl.value}
              onRemove$={props.onClearScreenshotPreview$}
            />
          ) : null}

          {props.status.value ? (
            <p
              class={{
                'ui-status': true,
                'ui-status-success': isSuccessStatus(props.status.value),
                'ui-status-error': !isSuccessStatus(props.status.value),
              }}
            >
              {props.status.value}
            </p>
          ) : null}

          <OfferImportSourceDialog
            isOpen={sourceDialogOpen.value}
            onClose$={closeSourceDialog$}
            onSelectFile$={onFileSelected$}
          />
        </>
      )}
    </div>
  );
});
