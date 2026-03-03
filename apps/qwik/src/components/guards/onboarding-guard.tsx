import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../lib/auth/auth-context';
import { watchVehicles } from '../../lib/features/vehicles/vehicles-service';
import { AppBootBackdrop } from '../ui/app-boot-backdrop';
import { toAppPath } from '../layout/app-shell-routing';

export const OnboardingGuard = component$(() => {
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

  const shouldHoldRootShell = currentPath === '/app';

  if (shouldHoldRootShell) {
    return <AppBootBackdrop status="Preparing your workspace..." />;
  }

  return <Slot />;
});
