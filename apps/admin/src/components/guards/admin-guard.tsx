import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useAdminAuth } from '../../lib/auth/admin-auth-context';

interface AdminGuardProps {
  requireAdmin: boolean;
}

const resolveSignedInRedirect = (url: URL): string => {
  const redirect = url.searchParams.get('redirect');
  if (!redirect || !redirect.startsWith('/')) {
    return '/';
  }
  if (redirect === '/login' || redirect === '/unauthorized') {
    return '/';
  }
  return redirect;
};

export const AdminGuard = component$<AdminGuardProps>(({ requireAdmin }) => {
  const auth = useAdminAuth();
  const readySig = auth.ready;
  const userSig = auth.user;
  const hasUserSig = auth.hasUser;
  const claimReadySig = auth.claimReady;
  const isAdminSig = auth.isAdmin;
  const navigate = useNavigate();
  const location = useLocation();

  useVisibleTask$(({ track }) => {
    const ready = track(() => readySig.value);
    const hasUser = track(() => hasUserSig.value);
    const claimReady = track(() => claimReadySig.value);
    const isAdmin = track(() => isAdminSig.value);

    if (!ready) {
      return;
    }

    if (requireAdmin) {
      if (!hasUser) {
        const redirect = encodeURIComponent(location.url.pathname + location.url.search);
        navigate(`/login?redirect=${redirect}`);
        return;
      }
      if (!claimReady) {
        return;
      }
      if (!isAdmin) {
        navigate('/unauthorized');
      }
      return;
    }

    if (!hasUser || !claimReady) {
      return;
    }

    if (isAdmin) {
      navigate(resolveSignedInRedirect(location.url));
      return;
    }

    navigate('/unauthorized');
  });

  if (!readySig.value) {
    return <div class="admin-auth-page"><div class="admin-loading">Loading session…</div></div>;
  }

  if (requireAdmin) {
    if (!userSig.value) {
      return <div class="admin-auth-page"><div class="admin-loading">Redirecting to login…</div></div>;
    }
    if (!claimReadySig.value) {
      return <div class="admin-auth-page"><div class="admin-loading">Checking admin access…</div></div>;
    }
    if (!isAdminSig.value) {
      return <div class="admin-auth-page"><div class="admin-loading">Redirecting…</div></div>;
    }
  }

  if (!requireAdmin && userSig.value && claimReadySig.value) {
    return <div class="admin-auth-page"><div class="admin-loading">Redirecting…</div></div>;
  }

  return <Slot />;
});
