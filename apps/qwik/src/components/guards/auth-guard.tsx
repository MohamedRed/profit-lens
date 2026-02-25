import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { AppSplash } from '../ui/app-splash';
import { useAuth } from '../../lib/auth/auth-context';

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
      navigate(resolveSignedInRedirect(location.url));
    }
  });

  if (!auth.ready.value) {
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
