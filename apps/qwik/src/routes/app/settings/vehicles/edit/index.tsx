import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../../components/ui/page-loading-skeleton';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { isValidBackToHref } from '../../shared/vehicle-editor-href';
import { VehicleEditor } from '../vehicle-editor';

const decodeVehicleId = (raw: string): string => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const readVehicleId = (search: string): string | null => {
  const params = new URLSearchParams(search);
  const raw = params.get('vehicleId');
  if (!raw) {
    return null;
  }
  return decodeVehicleId(raw);
};

const readVehicleIdFromPath = (pathname: string): string | null => {
  const match = pathname.match(/^\/next\/app\/settings\/vehicles\/edit\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }
  return decodeVehicleId(match[1]);
};

export default component$(() => {
  const i18n = useI18n();
  const location = useLocation();
  const vehicleId = useSignal<string | null>(null);
  const resolvedBackToHref = useSignal<string | null>(null);
  const routeStateResolved = useSignal(false);

  useVisibleTask$(({ track }) => {
    track(() => location.url.href);
    const pathname = window.location.pathname;
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const pathVehicleId = readVehicleIdFromPath(pathname);
    const queryVehicleId = readVehicleId(search);
    vehicleId.value = pathVehicleId ?? queryVehicleId;
    const returnToHref = params.get('backTo');
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
