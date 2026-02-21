import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { isValidBackToHref } from '../../shared/vehicle-editor-href';
import { VehicleEditor } from '../vehicle-editor';

const decodeVehicleId = (raw: string): string => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export default component$(() => {
  const location = useLocation();
  const rawVehicleId = location.params.vehicleId ?? null;
  const returnToHref = location.url.searchParams.get('backTo');
  const vehicleId = rawVehicleId ? decodeVehicleId(rawVehicleId) : null;

  return (
    <VehicleEditor
      mode="edit"
      vehicleId={vehicleId}
      returnToHref={isValidBackToHref(returnToHref) ? returnToHref : null}
    />
  );
});
