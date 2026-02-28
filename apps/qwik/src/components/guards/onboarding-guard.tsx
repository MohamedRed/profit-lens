import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../lib/auth/auth-context';
import { watchVehicles } from '../../lib/features/vehicles/vehicles-service';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { AppSplash } from '../ui/app-splash';
import { toAppPath } from '../layout/app-shell-routing';

export const OnboardingGuard = component$(() => {
  const i18n = useI18n();
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasVehicles = useSignal<boolean | null>(null);
  const currentPath = toAppPath(location.url.pathname);

  useVisibleTask$(({ track, cleanup }) => {
    const ready = track(() => auth.ready.value);
    const uid = track(() => auth.user.value?.uid ?? null);
    if (!ready || !uid) {
      hasVehicles.value = null;
      return;
    }

    hasVehicles.value = null;
    const unsubscribe = watchVehicles(uid, (items) => {
      hasVehicles.value = items.length > 0;
    }, (error) => {
      console.warn('[onboarding] unable to watch vehicles', error);
      hasVehicles.value = null;
    });

    cleanup(() => {
      unsubscribe();
    });
  });

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const uid = track(() => auth.user.value?.uid ?? null);
    const vehicleState = track(() => hasVehicles.value);
    const currentPath = track(() => toAppPath(location.url.pathname));

    if (!ready || !uid || vehicleState === null) {
      return;
    }

    if (currentPath === '/app') {
      void navigate(vehicleState ? '/next/app/offer' : '/next/app/onboarding');
      return;
    }

    const isOnboarding = currentPath.startsWith('/app/onboarding');
    if (!vehicleState && !isOnboarding) {
      void navigate('/next/app/onboarding');
      return;
    }
    if (vehicleState && isOnboarding) {
      void navigate('/next/app/offer');
    }
  });

  const shouldHoldRootShell =
    auth.ready.value && Boolean(auth.user.value?.uid) && currentPath === '/app';

  if (shouldHoldRootShell) {
    return (
      <AppSplash
        status={t(i18n, 'loadingLabel', 'Loading...')}
        progress={1}
        exiting={false}
      />
    );
  }

  return <Slot />;
});
