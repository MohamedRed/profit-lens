const VEHICLE_EDITOR_TARGET_STORAGE_KEY = 'profit-lens.vehicle-editor-target-id';

const canUseStorage = (): boolean => {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
};

export const writeVehicleEditorTargetId = (vehicleId: string): void => {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.sessionStorage.setItem(VEHICLE_EDITOR_TARGET_STORAGE_KEY, vehicleId);
  } catch {
    // Ignore storage failures and keep URL-based navigation as primary source of truth.
  }
};

export const readVehicleEditorTargetId = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }
  try {
    const value = window.sessionStorage.getItem(VEHICLE_EDITOR_TARGET_STORAGE_KEY);
    if (!value || !value.trim()) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

export const clearVehicleEditorTargetId = (): void => {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.sessionStorage.removeItem(VEHICLE_EDITOR_TARGET_STORAGE_KEY);
  } catch {
    // No-op.
  }
};
