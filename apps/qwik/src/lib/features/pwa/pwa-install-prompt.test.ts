import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetDeferredInstallPromptForTests,
  consumeDeferredInstallPrompt,
  watchDeferredInstallPrompt,
  type BeforeInstallPromptEventLike,
} from './pwa-install-prompt';

class FakeWindow {
  private readonly listeners = new Map<string, ((event: Event) => void)[]>();

  addEventListener(type: string, listener: (event: Event) => void) {
    const group = this.listeners.get(type) ?? [];
    group.push(listener);
    this.listeners.set(type, group);
  }

  dispatch(type: string, event: Event) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }
}

const createDeferredPromptEvent = (): BeforeInstallPromptEventLike => {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEventLike;
  event.preventDefault = vi.fn();
  event.prompt = vi.fn();
  event.userChoice = Promise.resolve({ outcome: 'accepted' });
  return event;
};

describe('pwa-install-prompt', () => {
  beforeEach(() => {
    __resetDeferredInstallPromptForTests();
  });

  it('captures beforeinstallprompt and exposes it to listeners', () => {
    const browser = new FakeWindow();
    const states: (BeforeInstallPromptEventLike | null)[] = [];

    watchDeferredInstallPrompt(browser, (event) => {
      states.push(event);
    });

    const deferredEvent = createDeferredPromptEvent();
    browser.dispatch('beforeinstallprompt', deferredEvent);

    expect(states.length).toBe(2);
    expect(states[0]).toBeNull();
    expect(states[1]).toBe(deferredEvent);
    expect(deferredEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('consumes and clears deferred prompt after use', () => {
    const browser = new FakeWindow();
    const states: (BeforeInstallPromptEventLike | null)[] = [];

    watchDeferredInstallPrompt(browser, (event) => {
      states.push(event);
    });

    const deferredEvent = createDeferredPromptEvent();
    browser.dispatch('beforeinstallprompt', deferredEvent);
    const consumed = consumeDeferredInstallPrompt();

    expect(consumed).toBe(deferredEvent);
    expect(states.at(-1)).toBeNull();
  });

  it('clears deferred prompt when appinstalled fires', () => {
    const browser = new FakeWindow();
    const states: (BeforeInstallPromptEventLike | null)[] = [];

    watchDeferredInstallPrompt(browser, (event) => {
      states.push(event);
    });

    browser.dispatch('beforeinstallprompt', createDeferredPromptEvent());
    browser.dispatch('appinstalled', new Event('appinstalled'));

    expect(states.at(-1)).toBeNull();
  });
});
