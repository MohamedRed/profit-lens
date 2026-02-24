import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { readVehicleEditorId } from '../../../../../lib/features/vehicles/vehicle-editor-id';
import { isValidBackToHref } from '../../shared/vehicle-editor-href';
import { VehicleEditor } from '../vehicle-editor';

export default component$(() => {
  const location = useLocation();
  const vehicleId = readVehicleEditorId(
    location.params.vehicleId,
    location.url.pathname,
    location.url.search,
  );
  const returnToHref = location.url.searchParams.get('backTo');

  return (
    <VehicleEditor
      mode="edit"
      vehicleId={vehicleId}
      returnToHref={isValidBackToHref(returnToHref) ? returnToHref : null}
    />
  );
});
