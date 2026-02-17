import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { VehicleEditor } from '../vehicle-editor';

export default component$(() => {
  const location = useLocation();
  const rawVehicleId = location.params.vehicleId ?? null;
  let vehicleId: string | null = null;
  if (rawVehicleId) {
    try {
      vehicleId = decodeURIComponent(rawVehicleId);
    } catch {
      vehicleId = rawVehicleId;
    }
  }

  return <VehicleEditor mode="edit" vehicleId={vehicleId} />;
});
