interface ScrollLockSnapshot {
  bodyCssText: string;
  htmlCssText: string;
  scrollY: number;
}

let activeScrollLocks = 0;
let snapshot: ScrollLockSnapshot | null = null;

export const lockPageScroll = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const { body, documentElement } = document;
  if (!body || !documentElement) {
    return;
  }

  if (activeScrollLocks === 0) {
    snapshot = {
      bodyCssText: body.style.cssText,
      htmlCssText: documentElement.style.cssText,
      scrollY: window.scrollY,
    };

    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';

    body.style.position = 'fixed';
    body.style.top = `-${snapshot.scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.touchAction = 'none';
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

  const { scrollY, bodyCssText, htmlCssText } = snapshot;
  body.style.cssText = bodyCssText;
  documentElement.style.cssText = htmlCssText;
  snapshot = null;
  window.scrollTo(0, scrollY);
};
