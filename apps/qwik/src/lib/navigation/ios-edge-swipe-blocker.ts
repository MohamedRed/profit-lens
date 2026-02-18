import { isRunningAsInstalledPwa } from '../features/pwa/pwa-install-state';

const EDGE_TRIGGER_PX = 24;
const HORIZONTAL_SWIPE_PX = 10;
const IOS_PWA_BACK_GUARD_KEY = '__iosPwaBackGuard';
const IOS_PWA_BACK_GUARD_TS_KEY = '__iosPwaBackGuardAt';

const isIosDevice = (browser: Window): boolean => {
  const userAgent = browser.navigator.userAgent.toLowerCase();
  const platform = (browser.navigator.platform ?? '').toLowerCase();
  const touchPoints = browser.navigator.maxTouchPoints ?? 0;
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return true;
  }
  return platform.includes('mac') && touchPoints > 1;
};

export const shouldBlockIosPwaBackNavigation = (browser: Window): boolean => {
  return isRunningAsInstalledPwa(browser) && isIosDevice(browser);
};

const withBackGuardState = (state: unknown): Record<string, unknown> => {
  const baseState =
    typeof state === 'object' && state !== null ? (state as Record<string, unknown>) : {};
  return {
    ...baseState,
    [IOS_PWA_BACK_GUARD_KEY]: true,
    [IOS_PWA_BACK_GUARD_TS_KEY]: Date.now(),
  };
};

const toAbsoluteHref = (browser: Window, url: string | URL | null | undefined): string => {
  if (typeof url === 'string') {
    return new URL(url, browser.location.href).href;
  }
  if (url instanceof URL) {
    return url.href;
  }
  return browser.location.href;
};

export const installIosPwaHistoryBackGuard = (browser: Window): (() => void) => {
  if (!shouldBlockIosPwaBackNavigation(browser)) {
    return () => {};
  }

  const historyApi = browser.history as History & {
    pushState: (data: unknown, unused: string, url?: string | URL | null) => void;
    replaceState: (data: unknown, unused: string, url?: string | URL | null) => void;
  };
  const originalPushState = historyApi.pushState.bind(historyApi);
  const originalReplaceState = historyApi.replaceState.bind(historyApi);
  let lockedHref = browser.location.href;

  const lockToHref = (state: unknown, url: string | URL | null | undefined): void => {
    lockedHref = toAbsoluteHref(browser, url);
    originalReplaceState(withBackGuardState(state), '', lockedHref);
  };

  lockToHref(browser.history.state, browser.location.href);

  historyApi.pushState = (state, unused, url) => {
    lockToHref(state, url);
  };
  historyApi.replaceState = (state, unused, url) => {
    lockToHref(state, url);
  };

  const onPopState = (event: PopStateEvent): void => {
    event.stopImmediatePropagation();
    lockToHref(browser.history.state, lockedHref);
    browser.history.go(1);
  };

  const onPageShow = (): void => {
    lockToHref(browser.history.state, browser.location.href);
  };

  browser.addEventListener('popstate', onPopState, { capture: true });
  browser.addEventListener('pageshow', onPageShow, { capture: true });

  return () => {
    historyApi.pushState = originalPushState;
    historyApi.replaceState = originalReplaceState;
    browser.removeEventListener('popstate', onPopState, { capture: true });
    browser.removeEventListener('pageshow', onPageShow, { capture: true });
  };
};

export const installIosPwaBackSwipeBlocker = (browser: Window): (() => void) => {
  if (!shouldBlockIosPwaBackNavigation(browser)) {
    return () => {};
  }

  let startX = 0;
  let startY = 0;
  let tracking = false;
  let startedAtLeftEdge = false;

  const onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) {
      tracking = false;
      startedAtLeftEdge = false;
      return;
    }
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
    startedAtLeftEdge = startX <= EDGE_TRIGGER_PX;
  };

  const onTouchMove = (event: TouchEvent): void => {
    if (!tracking || !startedAtLeftEdge || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const isHorizontalSwipe = deltaX > HORIZONTAL_SWIPE_PX && Math.abs(deltaX) > Math.abs(deltaY);
    if (isHorizontalSwipe) {
      event.preventDefault();
    }
  };

  const resetTracking = (): void => {
    tracking = false;
    startedAtLeftEdge = false;
  };

  browser.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
  browser.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  browser.addEventListener('touchend', resetTracking, { passive: true, capture: true });
  browser.addEventListener('touchcancel', resetTracking, { passive: true, capture: true });

  return () => {
    browser.removeEventListener('touchstart', onTouchStart, { capture: true });
    browser.removeEventListener('touchmove', onTouchMove, { capture: true });
    browser.removeEventListener('touchend', resetTracking, { capture: true });
    browser.removeEventListener('touchcancel', resetTracking, { capture: true });
  };
};
