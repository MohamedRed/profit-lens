import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../../components/ui/page-loading-skeleton';
import { readVehicleEditorId } from '../../../../../lib/features/vehicles/vehicle-editor-id';
import {
  readSelectedVehicleEditorId,
  saveSelectedVehicleEditorId,
} from '../../../../../lib/features/vehicles/vehicle-editor-selection';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { isValidBackToHref } from '../../shared/vehicle-editor-href';
import { VehicleEditor } from '../vehicle-editor';

export default component$(() => {
  const i18n = useI18n();
  const location = useLocation();
  const vehicleId = useSignal<string | null>(null);
  const resolvedBackToHref = useSignal<string | null>(null);
  const routeStateResolved = useSignal(false);

  useVisibleTask$(({ track }) => {
    track(() => location.url.href);
    const resolvedVehicleId =
      readVehicleEditorId(undefined, location.url.pathname, location.url.search) ?? readSelectedVehicleEditorId();
    vehicleId.value = resolvedVehicleId;
    if (resolvedVehicleId) {
      saveSelectedVehicleEditorId(resolvedVehicleId);
    }
    const returnToHref = location.url.searchParams.get('backTo');
    resolvedBackToHref.value = isValidBackToHref(returnToHref) ? returnToHref : null;
    routeStateResolved.value = true;
  });

  if (!routeStateResolved.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={3} />
      </div>
    );
  }

  return (
    <VehicleEditor
      mode="edit"
      vehicleId={vehicleId.value}
      returnToHref={resolvedBackToHref.value}
    />
  );
});
