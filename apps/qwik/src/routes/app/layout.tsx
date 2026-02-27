import { Slot, component$ } from '@builder.io/qwik';
import { AppShell } from '../../components/layout/app-shell';
import { AuthGuard } from '../../components/guards/auth-guard';
import { DeviceAccessGuard } from '../../components/guards/device-access-guard';
import { OnboardingGuard } from '../../components/guards/onboarding-guard';
import { PwaInstallGuard } from '../../components/guards/pwa-install-guard';

export default component$(() => {
  return (
    <AuthGuard requireAuth={true}>
      <PwaInstallGuard>
        <DeviceAccessGuard>
          <OnboardingGuard>
            <AppShell>
              <Slot />
            </AppShell>
          </OnboardingGuard>
        </DeviceAccessGuard>
      </PwaInstallGuard>
    </AuthGuard>
  );
});
