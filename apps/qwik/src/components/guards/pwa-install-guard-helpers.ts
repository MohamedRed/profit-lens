import { consumeDeferredInstallPrompt } from '../../lib/features/pwa/pwa-install-prompt';
import { t, type I18nStore } from '../../lib/i18n/i18n-context';

export interface PwaInstallElementLike extends HTMLElement {
  showDialog: (forced?: boolean) => void;
}

export type InstallGateState = 'checking' | 'installed' | 'not-installed';
export type InstallFlowState =
  | 'unknown'
  | 'ios-manual'
  | 'native-ready'
  | 'native-pending'
  | 'native-manual';

export const installHostId = 'ui-pwa-install-host';
export const nativePromptFallbackDelayMs = 3000;
const knownInstalledKey = 'profit-lens-pwa-installed';

export const setKnownInstalledFlag = (installed: boolean): void => {
  try {
    if (installed) {
      window.localStorage.setItem(knownInstalledKey, '1');
    } else {
      window.localStorage.removeItem(knownInstalledKey);
    }
  } catch {
    // Ignore storage failures such as private mode or blocked storage.
  }
};

export const getKnownInstalledFlag = (): boolean => {
  try {
    return window.localStorage.getItem(knownInstalledKey) === '1';
  } catch {
    return false;
  }
};

export const resolveInstallButtonLabel = (
  i18n: I18nStore,
  showAndroidApkAction: boolean,
): string => {
  return showAndroidApkAction
    ? t(i18n, 'installPwaCta', 'Install PWA')
    : t(i18n, 'installAppCta', 'Install');
};

export const resolveInstallCopy = (i18n: I18nStore, installFlow: InstallFlowState): string => {
  if (installFlow === 'native-ready') {
    return t(
      i18n,
      'installAppRequiredNativeBody',
      'To continue, install Liive Profit and open it from your home screen. Tap Install to open the browser prompt.',
    );
  }

  if (installFlow === 'native-manual') {
    return t(
      i18n,
      'installAppRequiredManualBody',
      'To continue, install Liive Profit and open it from your home screen. Tap Install to open guided install steps for your browser.',
    );
  }

  return t(
    i18n,
    'installAppRequiredBody',
    'To continue, install Liive Profit and open it from your home screen. We show the install guide automatically.',
  );
};

interface BeginPwaInstallOptions {
  dialogRef: PwaInstallElementLike | null;
  i18n: I18nStore;
  installFlow: InstallFlowState;
  installing: boolean;
  isIosFlow: boolean;
  setInstallFlow: (flow: InstallFlowState) => void;
  setInstalling: (installing: boolean) => void;
  setLoadError: (message: string) => void;
}

export const beginPwaInstall = async ({
  dialogRef,
  i18n,
  installFlow,
  installing,
  isIosFlow,
  setInstallFlow,
  setInstalling,
  setLoadError,
}: BeginPwaInstallOptions): Promise<void> => {
  if (installing) {
    return;
  }

  if (isIosFlow) {
    if (!dialogRef) {
      setLoadError(t(i18n, 'installAppLoadFailed', 'Failed to load install dialog.'));
      return;
    }

    setLoadError('');
    dialogRef.showDialog(true);
    return;
  }

  const deferredPrompt = consumeDeferredInstallPrompt();
  if (!deferredPrompt) {
    if (installFlow === 'native-manual') {
      setLoadError(
        t(
          i18n,
          'installAppDesktopManualHint',
          'Install prompt is unavailable in this desktop session. Use your browser install option in the menu or address bar, then reopen Liive Profit from the installed app.',
        ),
      );
    } else {
      setLoadError(
        t(
          i18n,
          'installAppPromptUnavailable',
          'Install prompt is not ready yet. Wait a moment and try again.',
        ),
      );
      setInstallFlow('native-manual');
    }
    return;
  }

  setInstalling(true);
  setLoadError('');
  try {
    await deferredPrompt.prompt();
    if (deferredPrompt.userChoice) {
      await deferredPrompt.userChoice;
    }
  } catch (error) {
    setLoadError(
      error instanceof Error ? error.message : t(i18n, 'installAppPromptFailed', 'Install failed.'),
    );
  } finally {
    setInstalling(false);
  }
};
