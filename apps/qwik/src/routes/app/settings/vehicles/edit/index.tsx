import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
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
  const rawSearch = location.url.search;
  const search = typeof window === 'undefined' ? rawSearch : window.location.search;
  const params = new URLSearchParams(search);
  const vehicleId = readVehicleId(search);
  const returnToHref = params.get('backTo');

  return (
    <VehicleEditor
      mode="edit"
      vehicleId={vehicleId}
      returnToHref={isValidBackToHref(returnToHref) ? returnToHref : null}
    />
  );
});
