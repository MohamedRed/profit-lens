import { beforeEach, describe, expect, it } from 'vitest';
import { readSelectedHelpTicketId, saveSelectedHelpTicketId } from './help-ticket-selection';

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

describe('help-ticket-selection', () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = {};
    (globalThis as { sessionStorage?: ReturnType<typeof buildMemoryStorage> }).sessionStorage =
      buildMemoryStorage();
    sessionStorage.clear();
  });

  it('saves and reads selected help ticket id', () => {
    saveSelectedHelpTicketId('ticket-123');
    expect(readSelectedHelpTicketId()).toBe('ticket-123');
  });

  it('returns null when no ticket has been saved', () => {
    expect(readSelectedHelpTicketId()).toBeNull();
  });
});
