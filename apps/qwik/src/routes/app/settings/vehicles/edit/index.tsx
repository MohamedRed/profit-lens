import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { buildVehicleEditorHref, isValidBackToHref } from '../../shared/vehicle-editor-href';
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
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = typeof window === 'undefined' ? location.url.pathname : window.location.pathname;
  const search = typeof window === 'undefined' ? location.url.search : window.location.search;
  const params = new URLSearchParams(search);
  const pathVehicleId = readVehicleIdFromPath(pathname);
  const queryVehicleId = readVehicleId(search);
  const vehicleId = pathVehicleId ?? queryVehicleId;
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
