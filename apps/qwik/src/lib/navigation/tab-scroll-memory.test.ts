import { beforeEach, describe, expect, it } from 'vitest';
import { readTabScrollY, saveTabScrollY } from './tab-scroll-memory';

const storageKey = 'pl-tab-scroll-memory-v1';

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

describe('tab-scroll-memory', () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = {};
    (globalThis as { sessionStorage?: ReturnType<typeof buildMemoryStorage> }).sessionStorage =
      buildMemoryStorage();
    sessionStorage.clear();
  });

  it('saves and reads scroll positions by tab section key', () => {
    saveTabScrollY('app/offer', 432.8);
    saveTabScrollY('app/history', 99.2);
    expect(readTabScrollY('app/offer')).toBe(433);
    expect(readTabScrollY('app/history')).toBe(99);
  });

  it('returns null for unknown or invalid entries', () => {
    expect(readTabScrollY('app/help')).toBeNull();
    sessionStorage.setItem(storageKey, '{"app/help":"bad"}');
    expect(readTabScrollY('app/help')).toBeNull();
  });
});
