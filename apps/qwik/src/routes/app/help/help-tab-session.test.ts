import { beforeEach, describe, expect, it } from 'vitest';
import {
  readHelpTabSessionState,
  writeHelpTabSessionState,
  type HelpTabSessionState,
} from './help-tab-session';

const HELP_TAB_SESSION_STORAGE_KEY = 'profit-lens.help-tab-session';

interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
}

interface WindowLike {
  sessionStorage: StorageLike;
}

const createSessionStorage = (): StorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    clear: () => {
      values.clear();
    },
  };
};

const getWindow = (): WindowLike => {
  return (globalThis as { window?: WindowLike }).window as WindowLike;
};

const buildState = (uid: string, description: string): HelpTabSessionState => ({
  uid,
  description,
});

describe('help-tab-session', () => {
  beforeEach(() => {
    (globalThis as { window?: WindowLike }).window = {
      sessionStorage: createSessionStorage(),
    };
    getWindow().sessionStorage.clear();
  });

  it('reads back stored state for the same uid', () => {
    writeHelpTabSessionState(buildState('uid-1', 'Need help with pricing.'));

    const restored = readHelpTabSessionState('uid-1');
    expect(restored).toEqual({
      uid: 'uid-1',
      description: 'Need help with pricing.',
    });
  });

  it('falls back to storage when in-memory state is from another uid', () => {
    writeHelpTabSessionState(buildState('uid-memory', 'memory value'));
    getWindow().sessionStorage.setItem(
      HELP_TAB_SESSION_STORAGE_KEY,
      JSON.stringify(buildState('uid-storage', 'storage value')),
    );

    const restored = readHelpTabSessionState('uid-storage');
    expect(restored).toEqual({
      uid: 'uid-storage',
      description: 'storage value',
    });
  });

  it('returns null when storage uid does not match', () => {
    getWindow().sessionStorage.setItem(
      HELP_TAB_SESSION_STORAGE_KEY,
      JSON.stringify(buildState('uid-a', 'draft')),
    );

    expect(readHelpTabSessionState('uid-b')).toBeNull();
  });
});
