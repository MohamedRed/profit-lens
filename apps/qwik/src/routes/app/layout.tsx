import { Slot, component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { AppShell } from '../../components/layout/app-shell';
import { AuthGuard } from '../../components/guards/auth-guard';
import { PwaInstallGuard } from '../../components/guards/pwa-install-guard';

const titleByPath = (path: string): { key: string; fallback: string } => {
  if (path.includes('/app/history')) {
    return { key: 'historyTabLabel', fallback: 'History' };
  }
  if (path.includes('/app/settings')) {
    return { key: 'settingsTabLabel', fallback: 'Settings' };
  }
  if (path.includes('/app/help')) {
    return { key: 'helpTabLabel', fallback: 'Help' };
  }
  return { key: 'offerTabLabel', fallback: 'Offer' };
};

export default component$(() => {
  const location = useLocation();
  const title = titleByPath(location.url.pathname);

  return (
    <AuthGuard requireAuth={true}>
      <PwaInstallGuard>
        <AppShell titleKey={title.key} titleFallback={title.fallback}>
          <Slot />
        </AppShell>
      </PwaInstallGuard>
    </AuthGuard>
  );
});
