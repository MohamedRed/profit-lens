interface ScrollLockSnapshot {
  bodyCssText: string;
  htmlCssText: string;
  scrollY: number;
  mode: 'freeze' | 'overflow';
}

interface ScrollLockOptions {
  disableTouchAction?: boolean;
}

let activeScrollLocks = 0;
let snapshot: ScrollLockSnapshot | null = null;

export const lockPageScroll = (options: ScrollLockOptions = {}): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const { body, documentElement } = document;
  if (!body || !documentElement) {
    return;
  }

  if (activeScrollLocks === 0) {
    const shouldDisableTouchAction = options.disableTouchAction ?? true;
    const lockMode: ScrollLockSnapshot['mode'] = shouldDisableTouchAction ? 'freeze' : 'overflow';
    snapshot = {
      bodyCssText: body.style.cssText,
      htmlCssText: documentElement.style.cssText,
      scrollY: window.scrollY,
      mode: lockMode,
    };

    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    if (lockMode === 'freeze') {
      body.style.position = 'fixed';
      body.style.top = `-${snapshot.scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.touchAction = 'none';
    }
  }

  activeScrollLocks += 1;
};

export const unlockPageScroll = (): void => {
  if (typeof window === 'undefined' || activeScrollLocks === 0) {
    return;
  }

  activeScrollLocks -= 1;
  if (activeScrollLocks > 0) {
    return;
  }

  const { body, documentElement } = document;
  if (!body || !documentElement || !snapshot) {
    snapshot = null;
    return;
  }

  const { scrollY, bodyCssText, htmlCssText, mode } = snapshot;
  body.style.cssText = bodyCssText;
  documentElement.style.cssText = htmlCssText;
  snapshot = null;
  if (mode === 'freeze') {
    window.scrollTo(0, scrollY);
  }
};

export const resetPageScrollLock = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  activeScrollLocks = 0;
  const { body, documentElement } = document;
  if (!body || !documentElement) {
    snapshot = null;
    return;
  }

  if (snapshot) {
    body.style.cssText = snapshot.bodyCssText;
    documentElement.style.cssText = snapshot.htmlCssText;
    if (snapshot.mode === 'freeze') {
      window.scrollTo(0, snapshot.scrollY);
    }
    snapshot = null;
    return;
  }

  body.style.overflow = '';
  body.style.overscrollBehavior = '';
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.touchAction = '';
  documentElement.style.overflow = '';
  documentElement.style.overscrollBehavior = '';
};
