import { useVisibleTask$, type Signal } from '@builder.io/qwik';
import type { AuthStore } from '../../../lib/auth/auth-context';
import { watchEntitlement, watchUsage } from '../../../lib/features/billing/billing-service';
import { watchDevices } from '../../../lib/features/devices/devices-service';
import { watchUserProfile } from '../../../lib/features/profile/profile-service';
import { watchVehicles } from '../../../lib/features/vehicles/vehicles-service';
import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { readSettingsTabSessionState, writeSettingsTabSessionState } from './settings-tab-session';

interface UseSettingsTabSessionParams {
  auth: AuthStore;
  profile: Signal<UserProfile | null>;
  vehicles: Signal<VehicleProfile[]>;
  entitlement: Signal<Entitlement | null>;
  usage: Signal<OfferUsage | null>;
  devices: Signal<DeviceEntry[]>;
  selectedLanguage: Signal<'fr' | 'en' | 'ar'>;
}

export const useSettingsTabSession = (params: UseSettingsTabSessionParams): void => {
  const { auth, profile, vehicles, entitlement, usage, devices, selectedLanguage } = params;

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      profile.value = null;
      vehicles.value = [];
      entitlement.value = null;
      usage.value = null;
      devices.value = [];
      return;
    }

    const session = readSettingsTabSessionState(user.uid);
    if (session) {
      profile.value = session.profile;
      vehicles.value = session.vehicles;
      entitlement.value = session.entitlement;
      usage.value = session.usage;
      devices.value = session.devices;
      selectedLanguage.value = session.selectedLanguage;
    }

    let unsubscribeUsage: (() => void) | null = null;
    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      selectedLanguage.value = (nextProfile.preferredLocale || 'fr') as 'fr' | 'en' | 'ar';
    });
    const unsubscribeVehicles = watchVehicles(user.uid, (items) => {
      vehicles.value = items;
    });
    const unsubscribeEntitlement = watchEntitlement(user.uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      usage.value = null;
      if (unsubscribeUsage) {
        unsubscribeUsage();
        unsubscribeUsage = null;
      }
      if (nextEntitlement?.periodKey) {
        unsubscribeUsage = watchUsage(user.uid, nextEntitlement.periodKey, (nextUsage) => {
          usage.value = nextUsage;
        });
      }
    });
    const unsubscribeDevices = watchDevices(user.uid, (items) => {
      devices.value = items;
    });

    cleanup(() => {
      unsubscribeProfile();
      unsubscribeVehicles();
      unsubscribeEntitlement();
      unsubscribeDevices();
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    });
  });

  useVisibleTask$(({ track }) => {
    const uid = track(() => auth.user.value?.uid);
    const currentProfile = track(() => profile.value);
    const currentVehicles = track(() => vehicles.value);
    const currentEntitlement = track(() => entitlement.value);
    const currentUsage = track(() => usage.value);
    const currentDevices = track(() => devices.value);
    const currentLanguage = track(() => selectedLanguage.value);

    if (!uid) {
      return;
    }

    writeSettingsTabSessionState({
      uid,
      profile: currentProfile,
      vehicles: currentVehicles,
      entitlement: currentEntitlement,
      usage: currentUsage,
      devices: currentDevices,
      selectedLanguage: currentLanguage,
    });
  });
};
