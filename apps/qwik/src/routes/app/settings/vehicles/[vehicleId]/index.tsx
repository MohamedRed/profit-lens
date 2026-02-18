import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawVehicleId = location.params.vehicleId ?? null;
  let vehicleId: string | null = null;
  if (rawVehicleId) {
    try {
      vehicleId = decodeURIComponent(rawVehicleId);
    } catch {
      vehicleId = rawVehicleId;
    }
  }

  useVisibleTask$(({ track }) => {
    track(() => location.params.vehicleId);
    if (!vehicleId) {
      void navigate('/next/app/settings/vehicles');
      return;
    }
    const encodedId = encodeURIComponent(vehicleId);
    void navigate(`/next/app/settings/vehicles/edit?vehicleId=${encodedId}`);
  });

  return null;
});
