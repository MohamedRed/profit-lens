import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';

const SETTINGS_TAB_SESSION_STORAGE_KEY = 'profit-lens.settings-tab-session';

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

const cloneSettingsTabSessionState = (state: SettingsTabSessionState): SettingsTabSessionState => {
  return {
    ...state,
    profile: state.profile ? { ...state.profile } : null,
    vehicles: state.vehicles.map((vehicle) => ({ ...vehicle })),
    entitlement: state.entitlement ? { ...state.entitlement } : null,
    usage: state.usage ? { ...state.usage } : null,
    devices: state.devices.map((device) => ({ ...device })),
  };
};

const readSettingsTabSessionStateFromStorage = (): SettingsTabSessionState | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SETTINGS_TAB_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SettingsTabSessionState;
  } catch {
    return null;
  }
};

const writeSettingsTabSessionStateToStorage = (state: SettingsTabSessionState): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(
      SETTINGS_TAB_SESSION_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Ignore storage failures (private mode, quota) and keep in-memory fallback.
  }
};

export const readSettingsTabSessionState = (uid: string): SettingsTabSessionState | null => {
  if (settingsTabSessionState?.uid === uid) {
    return cloneSettingsTabSessionState(settingsTabSessionState);
  }
  const storageState = readSettingsTabSessionStateFromStorage();
  if (!storageState || storageState.uid !== uid) {
    return null;
  }
  settingsTabSessionState = cloneSettingsTabSessionState(storageState);
  return cloneSettingsTabSessionState(storageState);
};

export const writeSettingsTabSessionState = (nextState: SettingsTabSessionState): void => {
  const cloned = cloneSettingsTabSessionState(nextState);
  settingsTabSessionState = cloned;
  writeSettingsTabSessionStateToStorage(cloned);
};
