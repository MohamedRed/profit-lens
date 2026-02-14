export interface BeforeInstallPromptEventLike extends Event {
  prompt: () => Promise<void> | void;
  userChoice?: Promise<unknown>;
}

interface PwaPromptWindowLike {
  addEventListener: (type: string, listener: (event: Event) => void) => void;
}

type DeferredPromptListener = (event: BeforeInstallPromptEventLike | null) => void;

let deferredPrompt: BeforeInstallPromptEventLike | null = null;
let listenersBound = false;
const deferredPromptListeners = new Set<DeferredPromptListener>();

const notifyDeferredPromptListeners = () => {
  for (const listener of deferredPromptListeners) {
    listener(deferredPrompt);
  }
};

const bindDeferredPromptListeners = (browser: PwaPromptWindowLike) => {
  if (listenersBound) {
    return;
  }
  listenersBound = true;

  browser.addEventListener('beforeinstallprompt', (event: Event) => {
    const deferredEvent = event as BeforeInstallPromptEventLike;
    deferredEvent.preventDefault();
    deferredPrompt = deferredEvent;
    notifyDeferredPromptListeners();
  });

  browser.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyDeferredPromptListeners();
  });
};

export const watchDeferredInstallPrompt = (
  browser: PwaPromptWindowLike,
  onChange: DeferredPromptListener,
): (() => void) => {
  bindDeferredPromptListeners(browser);
  deferredPromptListeners.add(onChange);
  onChange(deferredPrompt);

  return () => {
    deferredPromptListeners.delete(onChange);
  };
};

export const consumeDeferredInstallPrompt = (): BeforeInstallPromptEventLike | null => {
  const event = deferredPrompt;
  deferredPrompt = null;
  notifyDeferredPromptListeners();
  return event;
};

export const __resetDeferredInstallPromptForTests = () => {
  deferredPrompt = null;
  listenersBound = false;
  deferredPromptListeners.clear();
};
