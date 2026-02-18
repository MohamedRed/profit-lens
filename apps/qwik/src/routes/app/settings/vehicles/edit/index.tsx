import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';

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

  useVisibleTask$(({ track }) => {
    track(() => location.url.search);
    const search = typeof window === 'undefined' ? location.url.search : window.location.search;
    const vehicleId = readVehicleId(search);
    if (!vehicleId) {
      void navigate('/next/app/settings/vehicles');
      return;
    }
    void navigate(`/next/app/settings/vehicles/${encodeURIComponent(vehicleId)}`);
  });

  return null;
});
