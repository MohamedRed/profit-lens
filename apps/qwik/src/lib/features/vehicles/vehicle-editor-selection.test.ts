import { beforeEach, describe, expect, it } from 'vitest';
import { readSelectedVehicleEditorId, saveSelectedVehicleEditorId } from './vehicle-editor-selection';

const buildMemoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    clear: () => {
      data.clear();
    },
  };
};

describe('vehicle-editor-selection', () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = {};
    (globalThis as { sessionStorage?: ReturnType<typeof buildMemoryStorage> }).sessionStorage =
      buildMemoryStorage();
    sessionStorage.clear();
  });

  it('saves and reads selected vehicle id', () => {
    saveSelectedVehicleEditorId('vehicle-123');
    expect(readSelectedVehicleEditorId()).toBe('vehicle-123');
  });

  it('returns null when no vehicle has been saved', () => {
    expect(readSelectedVehicleEditorId()).toBeNull();
  });
});
