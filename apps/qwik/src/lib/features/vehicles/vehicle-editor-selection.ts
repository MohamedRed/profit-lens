const selectedVehicleEditorIdKey = 'pl-settings-selected-vehicle-id';

const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

export const saveSelectedVehicleEditorId = (vehicleId: string): void => {
  if (!isBrowser() || !vehicleId) {
    return;
  }
  sessionStorage.setItem(selectedVehicleEditorIdKey, vehicleId);
};

export const readSelectedVehicleEditorId = (): string | null => {
  if (!isBrowser()) {
    return null;
  }
  const value = sessionStorage.getItem(selectedVehicleEditorIdKey);
  return value && value.length > 0 ? value : null;
};
