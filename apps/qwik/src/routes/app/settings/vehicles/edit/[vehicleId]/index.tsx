import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { isValidBackToHref } from '../../../shared/vehicle-editor-href';
import { VehicleEditor } from '../../vehicle-editor';

export default component$(() => {
  const location = useLocation();
  const rawVehicleId = location.params.vehicleId ?? null;
  const returnToHref = location.url.searchParams.get('backTo');
  let vehicleId: string | null = null;

  if (rawVehicleId) {
    try {
      vehicleId = decodeURIComponent(rawVehicleId);
    } catch {
      vehicleId = rawVehicleId;
    }
  }

  return (
    <VehicleEditor
      mode="edit"
      vehicleId={vehicleId}
      returnToHref={isValidBackToHref(returnToHref) ? returnToHref : null}
    />
  );
});
