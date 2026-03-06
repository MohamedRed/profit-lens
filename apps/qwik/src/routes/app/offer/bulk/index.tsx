import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
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
  const vehiclesLoading = useSignal(true);
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
      vehiclesLoading.value = true;
      return;
    }

    const unsubscribeVehicles = watchVehicles(user.uid, (items) => {
      vehicles.value = items;
      vehiclesLoading.value = false;
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

  const onParse$ = $(async () => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    if (!selectedVehicleId.value) {
      status.value = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
      return;
    }
    if (!selectedFile.value) {
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
        vehicleId: selectedVehicleId.value,
        timezone,
        serviceDateIso: serviceDateIso.value,
        file: selectedFile.value,
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
        vehicleId: selectedVehicleId.value,
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
      <div class="ui-offer-bulk-top">
        <Link class="ui-button ui-button-ghost" href="/next/app/offer">
          <span class="material-icons-outlined" aria-hidden="true">
            arrow_back
          </span>
          <span>{t(i18n, 'backButtonLabel', 'Back')}</span>
        </Link>
      </div>

      <BulkUploadStep
        vehicles={vehicles.value}
        selectedVehicleId={selectedVehicleId.value}
        serviceDateIso={serviceDateIso.value}
        parseInFlight={parseInFlight.value || vehiclesLoading.value}
        onVehicleChange$={$((vehicleId: string) => {
          selectedVehicleId.value = vehicleId;
        })}
        onServiceDateChange$={$((nextDateIso: string) => {
          serviceDateIso.value = nextDateIso;
        })}
        onFileSelected$={$((file: File | null) => {
          selectedFile.value = file;
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
