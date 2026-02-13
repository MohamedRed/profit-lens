import { Slot, component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { AppShell } from '../../components/layout/app-shell';
import { AuthGuard } from '../../components/guards/auth-guard';

const titleByPath = (path: string): string => {
  if (path.includes('/app/history')) {
    return 'History';
  }
  if (path.includes('/app/settings')) {
    return 'Settings';
  }
  if (path.includes('/app/help')) {
    return 'Help';
  }
  return 'Offer';
};

export default component$(() => {
  const location = useLocation();

  return (
    <AuthGuard requireAuth={true}>
      <AppShell title={titleByPath(location.url.pathname)}>
        <Slot />
      </AppShell>
    </AuthGuard>
  );
});
