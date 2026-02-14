import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';

export interface SettingsTabSessionState {
  uid: string;
  profile: UserProfile | null;
  vehicles: VehicleProfile[];
  entitlement: Entitlement | null;
  usage: OfferUsage | null;
  devices: DeviceEntry[];
  selectedLanguage: 'fr' | 'en' | 'ar';
}

let settingsTabSessionState: SettingsTabSessionState | null = null;

export const readSettingsTabSessionState = (uid: string): SettingsTabSessionState | null => {
  if (!settingsTabSessionState || settingsTabSessionState.uid !== uid) {
    return null;
  }
  return {
    ...settingsTabSessionState,
    profile: settingsTabSessionState.profile ? { ...settingsTabSessionState.profile } : null,
    vehicles: [...settingsTabSessionState.vehicles],
    entitlement: settingsTabSessionState.entitlement ? { ...settingsTabSessionState.entitlement } : null,
    usage: settingsTabSessionState.usage ? { ...settingsTabSessionState.usage } : null,
    devices: [...settingsTabSessionState.devices],
  };
};

export const writeSettingsTabSessionState = (nextState: SettingsTabSessionState): void => {
  settingsTabSessionState = {
    ...nextState,
    profile: nextState.profile ? { ...nextState.profile } : null,
    vehicles: [...nextState.vehicles],
    entitlement: nextState.entitlement ? { ...nextState.entitlement } : null,
    usage: nextState.usage ? { ...nextState.usage } : null,
    devices: [...nextState.devices],
  };
};
