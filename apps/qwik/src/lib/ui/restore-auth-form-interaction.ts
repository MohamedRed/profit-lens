import { resetPageScrollLock } from './page-scroll-lock';

const modalOpenClass = 'ui-image-modal-open';
const authRouteClass = 'ui-auth-route-active';

const closeOpenDialogs = (): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const dialogs = Array.from(document.querySelectorAll('dialog[open]')) as HTMLDialogElement[];
  dialogs.forEach((dialog) => {
    try {
      dialog.classList.remove('is-closing');
      dialog.close();
    } catch {
      // Ignore if dialog is already detached or cannot close.
    }
  });
};

const removeInstallPromptHosts = (): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const installElements = Array.from(document.querySelectorAll('pwa-install'));
  installElements.forEach((element) => {
    try {
      element.remove();
    } catch {
      // Ignore detached nodes.
    }
  });
};

export const restoreAuthFormInteraction = (): (() => void) => {
  resetPageScrollLock();
  if (typeof document === 'undefined') {
    return () => {};
  }

  closeOpenDialogs();
  removeInstallPromptHosts();

  document.documentElement.classList.remove(modalOpenClass);
  document.body.classList.remove(modalOpenClass);
  document.documentElement.classList.add(authRouteClass);
  document.body.classList.add(authRouteClass);

  return () => {
    document.documentElement.classList.remove(authRouteClass);
    document.body.classList.remove(authRouteClass);
  };
};
