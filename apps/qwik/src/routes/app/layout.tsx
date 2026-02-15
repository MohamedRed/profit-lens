import { Slot, component$ } from '@builder.io/qwik';
import { AppShell } from '../../components/layout/app-shell';
import { AuthGuard } from '../../components/guards/auth-guard';
import { PwaInstallGuard } from '../../components/guards/pwa-install-guard';

export default component$(() => {
  return (
    <AuthGuard requireAuth={true}>
      <PwaInstallGuard>
        <AppShell>
          <Slot />
        </AppShell>
      </PwaInstallGuard>
    </AuthGuard>
  );
});
