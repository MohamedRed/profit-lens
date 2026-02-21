import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../lib/auth/auth-context';

const normalizeDeepAppPath = (path: string, search: string, hash: string): string | null => {
  const legacyHistoryMatch = path.match(/^\/next\/app\/history\/([^/]+)\/?$/);
  if (legacyHistoryMatch) {
    const params = new URLSearchParams(search);
    if (!params.get('offerId')) {
      params.set('offerId', decodeURIComponent(legacyHistoryMatch[1]));
    }
    const query = params.toString();
    return `/next/app/history/details/${query ? `?${query}` : ''}${hash}`;
  }

  const vehicleEditMatch = path.match(/^\/next\/app\/settings\/vehicles\/edit\/([^/]+)$/);
  if (vehicleEditMatch) {
    return `/next/app/settings/vehicles/edit/${vehicleEditMatch[1]}/${search}${hash}`;
  }

  const legacyVehiclePathMatch = path.match(/^\/next\/app\/settings\/vehicles\/([^/]+)\/?$/);
  if (legacyVehiclePathMatch) {
    const vehicleSegment = legacyVehiclePathMatch[1];
    if (vehicleSegment !== 'new' && vehicleSegment !== 'edit') {
      return `/next/app/settings/vehicles/edit/${vehicleSegment}/${search}${hash}`;
    }
  }

  if (path.startsWith('/next/app/') && path !== '/next/app/' && path !== '/next/app') {
    return `${path}${search}${hash}`;
  }

  return null;
};

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    const deepAppPath = normalizeDeepAppPath(path, search, hash);

    if (!ready) {
      return;
    }

    if (user) {
      if (deepAppPath) {
        navigate(deepAppPath);
        return;
      }
      navigate('/next/app/offer');
      return;
    }

    if (deepAppPath) {
      navigate(`/next/login?redirect=${encodeURIComponent(deepAppPath)}`);
      return;
    }

    navigate('/next/login');
  });

  return (
    <div class="ui-gate-viewport">
      <div class="ui-card ui-stack ui-gate-loading-card">
        <div class="ui-spinner" />
        <div class="ui-status">Loading...</div>
      </div>
    </div>
  );
});
