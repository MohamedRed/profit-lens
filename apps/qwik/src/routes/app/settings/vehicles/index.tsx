import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { readVehicleEditorId } from '../../../../lib/features/vehicles/vehicle-editor-id';
import { isValidBackToHref } from '../shared/vehicle-editor-href';
import { VehicleEditor } from './vehicle-editor';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicleId = readVehicleEditorId(undefined, location.url.pathname, location.url.search);
  const returnToHref = location.url.searchParams.get('backTo');

  if (vehicleId) {
    return (
      <VehicleEditor
        mode="edit"
        vehicleId={vehicleId}
        returnToHref={isValidBackToHref(returnToHref) ? returnToHref : null}
      />
    );
  }

  useVisibleTask$(({ track }) => {
    track(() => location.url.href);
    void navigate('/next/app/settings');
  });

  return null;
});
