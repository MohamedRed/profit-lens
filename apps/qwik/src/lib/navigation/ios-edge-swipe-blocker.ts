import { isRunningAsInstalledPwa } from '../features/pwa/pwa-install-state';

const EDGE_TRIGGER_PX = 24;
const HORIZONTAL_SWIPE_PX = 10;

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
