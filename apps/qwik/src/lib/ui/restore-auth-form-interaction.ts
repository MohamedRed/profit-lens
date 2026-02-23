import { resetPageScrollLock } from './page-scroll-lock';

const modalOpenClass = 'ui-image-modal-open';

export const restoreAuthFormInteraction = (): void => {
  resetPageScrollLock();
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.remove(modalOpenClass);
  document.body.classList.remove(modalOpenClass);
};
