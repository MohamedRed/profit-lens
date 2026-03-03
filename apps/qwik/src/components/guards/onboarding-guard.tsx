import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../lib/auth/auth-context';
import {
  readVehiclePresenceHint,
  writeVehiclePresenceHint,
} from '../../lib/features/vehicles/vehicle-presence-hint';
import { watchVehicles } from '../../lib/features/vehicles/vehicles-service';
import { AppSplash } from '../ui/app-splash';
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

    const cachedVehiclePresence = readVehiclePresenceHint(uid);
    hasVehicles.value = cachedVehiclePresence;
    const unsubscribe = watchVehicles(uid, (items) => {
      const nextHasVehicles = items.length > 0;
      writeVehiclePresenceHint(uid, nextHasVehicles);
      hasVehicles.value = nextHasVehicles;
    }, (error) => {
      console.warn('[onboarding] unable to watch vehicles', error);
      if (hasVehicles.value !== null) {
        return;
      }
      const fallbackPresence = readVehiclePresenceHint(uid);
      hasVehicles.value = fallbackPresence === null ? true : fallbackPresence;
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

  if (shouldHoldRootShell && hasVehicles.value === null) {
    return <AppSplash status="Preparing your workspace..." progress={0.98} />;
  }

  return <Slot />;
});
