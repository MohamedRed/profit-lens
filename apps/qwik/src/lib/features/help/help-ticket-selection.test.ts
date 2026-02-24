import { afterEach, describe, expect, it, vi } from 'vitest';
import { readSelectedHelpTicketId, saveSelectedHelpTicketId } from './help-ticket-selection';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

const restoreWindow = () => {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).window;
};

const mockWindowWithStorage = (storage: Pick<Storage, 'getItem' | 'setItem'>): void => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      sessionStorage: storage,
    },
  });
};

describe('help-ticket-selection', () => {
  afterEach(() => {
    restoreWindow();
  });

  it('saves and reads the selected ticket id when storage is available', () => {
    const values = new Map<string, string>();
    mockWindowWithStorage({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        values.set(key, value);
      },
    });

    saveSelectedHelpTicketId('ticket-123');
    expect(readSelectedHelpTicketId()).toBe('ticket-123');
  });

  it('returns null when no browser window exists', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
    expect(readSelectedHelpTicketId()).toBeNull();
    expect(() => saveSelectedHelpTicketId('ticket-123')).not.toThrow();
  });

  it('ignores storage errors to keep navigation functional', () => {
    const getItem = vi.fn(() => {
      throw new Error('blocked');
    });
    const setItem = vi.fn(() => {
      throw new Error('blocked');
    });
    mockWindowWithStorage({ getItem, setItem });

    expect(() => saveSelectedHelpTicketId('ticket-123')).not.toThrow();
    expect(readSelectedHelpTicketId()).toBeNull();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledTimes(1);
  });
});
