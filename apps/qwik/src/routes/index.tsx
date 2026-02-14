import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../lib/auth/auth-context';

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    const deepAppPath =
      path.startsWith('/next/app/') && path !== '/next/app/' && path !== '/next/app'
        ? `${path}${search}${hash}`
        : null;

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
    <div class="ui-page">
      <div class="ui-card ui-stack" style="justify-items:center;">
        <div class="ui-spinner" />
        <div class="ui-status">Loading...</div>
      </div>
    </div>
  );
});
