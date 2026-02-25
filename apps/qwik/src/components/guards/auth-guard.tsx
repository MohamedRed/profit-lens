import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { AppSplash } from '../ui/app-splash';
import { useAuth } from '../../lib/auth/auth-context';
import { useLaunchSplashWindow } from '../../lib/ui/launch-splash-window';

interface AuthGuardProps {
  requireAuth: boolean;
}

const resolveSignedInRedirect = (url: URL): string => {
  const redirect = url.searchParams.get('redirect');
  if (!redirect || !redirect.startsWith('/next/')) {
    return '/next/app/offer';
  }
  if (redirect.startsWith('/next/login') || redirect.startsWith('/next/register')) {
    return '/next/app/offer';
  }
  return redirect;
};

export const AuthGuard = component$<AuthGuardProps>(({ requireAuth }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const splashWindowElapsed = useLaunchSplashWindow();

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    const splashReady = track(() => splashWindowElapsed.value);

    if (!ready || !splashReady) {
      return;
    }

    if (requireAuth && !user) {
      const redirect = encodeURIComponent(location.url.pathname + location.url.search);
      navigate(`/next/login?redirect=${redirect}`);
      return;
    }

    if (!requireAuth && user) {
      navigate(resolveSignedInRedirect(location.url));
    }
  });

  if (!auth.ready.value || !splashWindowElapsed.value) {
    return <AppSplash status="Checking secure session..." />;
  }

  if (requireAuth) {
    if (!auth.user.value) {
      return null;
    }
    return <Slot />;
  }

  if (!requireAuth && auth.user.value) {
    return null;
  }

  return <Slot />;
});
