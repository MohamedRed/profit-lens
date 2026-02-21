import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../lib/auth/auth-context';

const normalizeDeepAppPath = (path: string, search: string, hash: string): string | null => {
  const legacyHistoryMatch = path.match(/^\/next\/app\/history\/([^/]+)\/?$/);
  if (legacyHistoryMatch) {
    const params = new URLSearchParams(search);
    if (!params.get('offerId')) {
      try {
        params.set('offerId', decodeURIComponent(legacyHistoryMatch[1]));
      } catch {
        params.set('offerId', legacyHistoryMatch[1]);
      }
    }
    const query = params.toString();
    return `/next/app/history/details/${query ? `?${query}` : ''}${hash}`;
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
    const currentHref = `${path}${search}${hash}`;
    const hasLegacyRewrite = deepAppPath !== null && deepAppPath !== currentHref;

    if (hasLegacyRewrite) {
      navigate(deepAppPath);
      return;
    }

    if (!ready) {
      return;
    }

    if (user) {
      if (deepAppPath && deepAppPath !== currentHref) {
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
