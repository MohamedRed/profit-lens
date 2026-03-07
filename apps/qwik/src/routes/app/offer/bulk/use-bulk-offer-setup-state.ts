import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import type { AuthStore } from '../../../../lib/auth/auth-context';
import { watchUserProfile } from '../../../../lib/features/profile/profile-service';
import { watchVehicles } from '../../../../lib/features/vehicles/vehicles-service';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

export interface BulkOfferSetupState {
  profile: Signal<UserProfile | null>;
  minProfitabilityEuro: Signal<number>;
  vehicles: Signal<VehicleProfile[]>;
  vehiclesLoading: Signal<boolean>;
  selectedVehicleId: Signal<string>;
}

export const useBulkOfferSetupState = (auth: AuthStore): BulkOfferSetupState => {
  const profile = useSignal<UserProfile | null>(null);
  const minProfitabilityEuro = useSignal(2);
  const vehicles = useSignal<VehicleProfile[]>([]);
  const vehiclesLoading = useSignal(true);
  const selectedVehicleId = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    if (!isReady || !user) {
      profile.value = null;
      vehicles.value = [];
      vehiclesLoading.value = true;
      selectedVehicleId.value = '';
      return;
    }

    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      minProfitabilityEuro.value = nextProfile.minProfitabilityEuro;
    });
    const unsubscribeVehicles = watchVehicles(user.uid, (nextVehicles) => {
      vehicles.value = nextVehicles;
      vehiclesLoading.value = false;
    });

    cleanup(() => {
      unsubscribeProfile();
      unsubscribeVehicles();
    });
  });

  useVisibleTask$(({ track }) => {
    track(() => vehicles.value);
    track(() => profile.value?.defaultVehicleId);
    const isSelectedVehicleValid = vehicles.value.some((vehicle) => vehicle.id === selectedVehicleId.value);
    if (isSelectedVehicleValid) {
      return;
    }
    const defaultVehicleId = profile.value?.defaultVehicleId ?? '';
    selectedVehicleId.value = vehicles.value.some((vehicle) => vehicle.id === defaultVehicleId)
      ? defaultVehicleId
      : '';
  });

  return {
    profile,
    minProfitabilityEuro,
    vehicles,
    vehiclesLoading,
    selectedVehicleId,
  };
};
