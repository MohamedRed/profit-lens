import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { isValidBackToHref } from '../../shared/vehicle-editor-href';
import { VehicleEditor } from '../vehicle-editor';

const readVehicleId = (search: string): string | null => {
  const params = new URLSearchParams(search);
  const raw = params.get('vehicleId');
  if (!raw) {
    return null;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export default component$(() => {
  const location = useLocation();
  const vehicleId = useSignal<string | null>(null);
  const resolvedBackToHref = useSignal<string | null>(null);
  const searchReady = useSignal(false);

  useVisibleTask$(({ track }) => {
    const search = track(() => location.url.search);
    const params = new URLSearchParams(search);
    vehicleId.value = readVehicleId(search);
    const returnToHref = params.get('backTo');
    resolvedBackToHref.value = isValidBackToHref(returnToHref) ? returnToHref : null;
    searchReady.value = true;
  });

  if (!searchReady.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label="Loading..." />
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
