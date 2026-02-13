import { $, component$, type QRL, type Signal } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import type { OfferAnalysisRecord } from '../offer-analysis-result';
import { enableCaptureCta, enableManualEntry } from '../offer-feature-flags';
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
  fileInputRef: Signal<HTMLInputElement | undefined>;
  loading: Signal<boolean>;
  manualEntryRequested: Signal<boolean>;
  minProfitabilityEuro: Signal<number>;
  onAnalyzeManual$: QRL<() => Promise<void>>;
  onImportScreenshot$: QRL<(input: HTMLInputElement) => Promise<void>>;
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
  const showOverview = !props.loading.value && props.analysisRecord.value !== null;
  const showDetailsSection =
    !showOverview && enableManualEntry && props.manualEntryRequested.value;
  const showManualEntryCta =
    enableManualEntry && !showOverview && !showDetailsSection;

  return (
    <div class="ui-stack ui-offer-flow">
      <OfferSectionCard title={t(i18n, 'vehicleSection', 'Vehicle')}>
        {props.vehiclesLoading.value ? (
          <p class="ui-offer-loading-copy">{t(i18n, 'loadingLabel', 'Loading...')}</p>
        ) : props.vehicles.value.length === 0 ? (
          <p class="ui-offer-empty-copy">{t(i18n, 'noVehiclesMessage', 'No vehicles found.')}</p>
        ) : (
          <div class="ui-field">
            <Label for="offer-vehicle">{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</Label>
            <Select
              id="offer-vehicle"
              value={props.selectedVehicleId.value}
              onChange$={(_, el) => {
                props.selectedVehicleId.value = el.value;
                props.analysisRecord.value = null;
                props.status.value = '';
                props.manualEntryRequested.value = false;
              }}
            >
              {props.vehicles.value.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </OfferSectionCard>

      <OfferSectionCard
        title={t(i18n, 'profitabilityTargetTitle', 'Profitability target')}
        subtitle={t(i18n, 'minProfitabilityHint', 'Saved automatically when you leave the field.')}
      >
        <div class="ui-field">
          <Label for="min-profitability">{t(i18n, 'minProfitabilityLabel', 'Minimum profitability')}</Label>
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

      <input
        ref={props.fileInputRef}
        type="file"
        accept="image/*"
        style="display:none"
        onChange$={(_, element) => {
          void props.onImportScreenshot$(element);
        }}
      />

      <Button
        variant="default"
        size="lg"
        class="ui-offer-primary-cta"
        disabled={props.loading.value || props.vehicles.value.length === 0}
        onClick$={() => {
          props.fileInputRef.value?.click();
        }}
      >
        {props.loading.value
          ? t(i18n, 'loadingLabel', 'Loading...')
          : t(i18n, 'importScreenshotButton', 'Import screenshot')}
      </Button>

      {enableCaptureCta ? (
        <Button variant="secondary" size="lg" disabled={true}>
          {t(i18n, 'captureScreenshotButton', 'Capture screenshot')}
        </Button>
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
        <OfferScreenshotPreview src={props.screenshotPreviewUrl.value} />
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
    </div>
  );
});
