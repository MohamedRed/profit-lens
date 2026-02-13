import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../lib/auth/auth-context';

interface AuthGuardProps {
  requireAuth: boolean;
}

export const AuthGuard = component$<AuthGuardProps>(({ requireAuth }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);

    if (!ready) {
      return;
    }

    if (requireAuth && !user) {
      const redirect = encodeURIComponent(location.url.pathname + location.url.search);
      navigate(`/next/login?redirect=${redirect}`);
      return;
    }

    if (!requireAuth && user) {
      navigate('/next/app/offer');
    }
  });

  if (requireAuth) {
    if (auth.ready.value && !auth.user.value) {
      return null;
    }
    return <Slot />;
  }

  if (!auth.ready.value) {
    return (
      <div class="pl-page">
        <div class="pl-card pl-stack" style="justify-items:center;">
          <div class="pl-spinner" />
          <div class="pl-status">Checking session...</div>
        </div>
      </div>
    );
  }

  if (!requireAuth && auth.user.value) {
    return null;
  }

  return <Slot />;
});
