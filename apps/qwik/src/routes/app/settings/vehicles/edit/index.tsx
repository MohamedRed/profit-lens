import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { buildVehicleEditorHref, isValidBackToHref } from '../../shared/vehicle-editor-href';
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
  const navigate = useNavigate();
  const rawSearch = location.url.search;
  const search = typeof window === 'undefined' ? rawSearch : window.location.search;
  const params = new URLSearchParams(search);
  const vehicleId = readVehicleId(search);
  const returnToHref = params.get('backTo');
  const resolvedBackToHref = isValidBackToHref(returnToHref) ? returnToHref : null;

  useVisibleTask$(({ track }) => {
    const targetVehicleId = track(() => vehicleId);
    if (!targetVehicleId) {
      return;
    }
    const href = buildVehicleEditorHref(targetVehicleId, resolvedBackToHref ?? undefined);
    void navigate(href);
  });

  if (vehicleId) {
    return null;
  }

  return (
    <VehicleEditor
      mode="edit"
      vehicleId={vehicleId}
      returnToHref={resolvedBackToHref}
    />
  );
});
