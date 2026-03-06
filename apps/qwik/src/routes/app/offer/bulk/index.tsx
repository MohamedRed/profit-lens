import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../../lib/auth/auth-context';
import { getDeviceId } from '../../../../lib/config/device-id';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { watchUserProfile } from '../../../../lib/features/profile/profile-service';
import {
  commitBulkOffersImport,
  parseBulkOffersScreenshot,
} from '../../../../lib/features/offers/bulk-offers-service';
import { watchVehicles } from '../../../../lib/features/vehicles/vehicles-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type {
  BulkInvalidRow,
  BulkParsedRow,
  CommitBulkOffersImportResponse,
  ScreenshotRef,
} from '../../../../lib/types/bulk-offers';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { BulkInvalidRowsPanel } from './components/bulk-invalid-rows-panel';
import { BulkReviewList } from './components/bulk-review-list';
import { BulkSaveFooter } from './components/bulk-save-footer';
import { BulkSummaryKpis } from './components/bulk-summary-kpis';
import { BulkUploadStep } from './components/bulk-upload-step';
import { OfferModeToggle } from '../components/offer-mode-toggle';
import { patchBulkRow, removeBulkRow, resolveLocalTodayIso, resolveVehicleSelection } from './bulk-helpers';

const resolveTimeZone = (): string | null => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && zone.trim().length > 0 ? zone : null;
  } catch {
    return null;
  }
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const vehicles = useSignal<VehicleProfile[]>([]);
  const selectedVehicleId = useSignal('');
  const defaultVehicleId = useSignal<string | null>(null);
  const selectedFile = useSignal<File | null>(null);
  const serviceDateIso = useSignal(resolveLocalTodayIso());
  const parseInFlight = useSignal(false);
  const saveInFlight = useSignal(false);
  const parsedRows = useSignal<BulkParsedRow[]>([]);
  const invalidRows = useSignal<BulkInvalidRow[]>([]);
  const screenshotRefs = useSignal<ScreenshotRef[]>([]);
  const status = useSignal('');
  const commitResult = useSignal<CommitBulkOffersImportResponse | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    if (!isReady || !user) {
      vehicles.value = [];
      selectedVehicleId.value = '';
      defaultVehicleId.value = null;
      return;
    }

    const unsubscribeVehicles = watchVehicles(user.uid, (items) => {
      vehicles.value = items;
      selectedVehicleId.value = resolveVehicleSelection(
        selectedVehicleId.value,
        items,
        defaultVehicleId.value,
      );
    });
    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (profile) => {
      defaultVehicleId.value = profile.defaultVehicleId;
      selectedVehicleId.value = resolveVehicleSelection(
        selectedVehicleId.value,
        vehicles.value,
        profile.defaultVehicleId,
      );
    });

    cleanup(() => {
      unsubscribeVehicles();
      unsubscribeProfile();
    });
  });

  const onParse$ = $(async (fileOverride?: File | null) => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    if (fileOverride !== undefined) {
      selectedFile.value = fileOverride;
    }
    const file = selectedFile.value;
    if (!file) {
      status.value = t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot');
      return;
    }
    const timezone = resolveTimeZone();
    if (!timezone) {
      status.value = t(i18n, 'bulkTimezoneMissing', 'Timezone is required on this device.');
      return;
    }
    parseInFlight.value = true;
    status.value = '';
    try {
      const response = await parseBulkOffersScreenshot({
        deviceId: getDeviceId(),
        timezone,
        serviceDateIso: serviceDateIso.value,
        file,
      });
      const rowOffset = parsedRows.value.length;
      parsedRows.value = [
        ...parsedRows.value,
        ...response.parsedRows.map((row, index) => ({ ...row, sourceIndex: rowOffset + index })),
      ];
      invalidRows.value = [
        ...invalidRows.value,
        ...response.invalidRows.map((row) => ({ ...row, sourceIndex: row.sourceIndex + rowOffset })),
      ];
      screenshotRefs.value = [
        ...screenshotRefs.value.filter((item) => item.path !== response.screenshotRef.path),
        response.screenshotRef,
      ];
      commitResult.value = null;
      status.value = t(i18n, 'bulkParseSuccess', 'Screenshot parsed. Review rows before saving.');
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
    } finally {
      parseInFlight.value = false;
    }
  });

  const onPatchRow$ = $((index: number, patch: Partial<BulkParsedRow>) => {
    parsedRows.value = patchBulkRow(parsedRows.value, index, patch);
  });

  const onRemoveRow$ = $((index: number) => {
    parsedRows.value = removeBulkRow(parsedRows.value, index);
  });

  const onSave$ = $(async () => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    if (parsedRows.value.length === 0) {
      status.value = t(i18n, 'bulkNoRowsToSave', 'No valid rows to save.');
      return;
    }
    if (screenshotRefs.value.length === 0) {
      status.value = t(i18n, 'bulkScreenshotMissing', 'Screenshot reference is missing. Parse again.');
      return;
    }
    const timezone = resolveTimeZone();
    if (!timezone) {
      status.value = t(i18n, 'bulkTimezoneMissing', 'Timezone is required on this device.');
      return;
    }

    saveInFlight.value = true;
    status.value = '';
    try {
      const response = await commitBulkOffersImport({
        deviceId: getDeviceId(),
        timezone,
        serviceDateIso: serviceDateIso.value,
        vehicleId: selectedVehicleId.value || undefined,
        screenshotRefs: screenshotRefs.value,
        rows: parsedRows.value,
      });
      commitResult.value = response;
      status.value = t(i18n, 'bulkSaveSuccess', 'Rows saved successfully.');
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
    } finally {
      saveInFlight.value = false;
    }
  });

  const user = auth.user.value;
  if (!user) {
    return null;
  }

  return (
    <div class="ui-stack ui-offer-bulk-root">
      <OfferModeToggle mode="bulk" />

      <BulkUploadStep
        serviceDateIso={serviceDateIso.value}
        parseInFlight={parseInFlight.value}
        onServiceDateChange$={$((nextDateIso: string) => {
          serviceDateIso.value = nextDateIso;
        })}
        onParse$={onParse$}
      />

      <BulkReviewList rows={parsedRows.value} onPatch$={onPatchRow$} onRemove$={onRemoveRow$} />
      <BulkInvalidRowsPanel rows={invalidRows.value} />
      <BulkSummaryKpis locale={i18n.locale.value} committed={commitResult.value} />
      <BulkSaveFooter
        canSave={parsedRows.value.length > 0 && !parseInFlight.value}
        rowCount={parsedRows.value.length}
        saving={saveInFlight.value}
        status={status.value}
        onSave$={onSave$}
      />
    </div>
  );
});
