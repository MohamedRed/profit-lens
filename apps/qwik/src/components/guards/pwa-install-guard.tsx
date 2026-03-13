import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { androidAppDownloadUrl } from '../../lib/config/runtime-config';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { watchDeferredInstallPrompt } from '../../lib/features/pwa/pwa-install-prompt';
import {
  isAndroidMobileBrowser,
  isIosInstallManualOnly,
  isRunningAsInstalledPwa,
  shouldEnforcePwaInstallGate,
} from '../../lib/features/pwa/pwa-install-state';
import { PwaInstallGuardActions } from './pwa-install-guard-actions';
import {
  beginPwaInstall,
  getKnownInstalledFlag,
  installHostId,
  nativePromptFallbackDelayMs,
  resolveInstallButtonLabel,
  resolveInstallCopy,
  setKnownInstalledFlag,
  type InstallFlowState,
  type InstallGateState,
  type PwaInstallElementLike,
} from './pwa-install-guard-helpers';

export const PwaInstallGuard = component$(() => {
  const i18n = useI18n();
  const gateState = useSignal<InstallGateState>('checking');
  const installFlow = useSignal<InstallFlowState>('unknown');
  const dialogReady = useSignal(false);
  const dialogRef = useSignal<PwaInstallElementLike | null>(null);
  const installing = useSignal(false);
  const loadError = useSignal('');
  const showAndroidApkAction = useSignal(false);

  useVisibleTask$(({ cleanup }) => {
    const evaluate = () => {
      showAndroidApkAction.value =
        androidAppDownloadUrl.length > 0 &&
        isAndroidMobileBrowser(window) &&
        !isRunningAsInstalledPwa(window);

      if (!shouldEnforcePwaInstallGate(window)) {
        gateState.value = 'installed';
        installFlow.value = 'unknown';
        return;
      }

      if (isRunningAsInstalledPwa(window)) {
        setKnownInstalledFlag(true);
        gateState.value = 'installed';
        installFlow.value = 'unknown';
        return;
      }

      if (getKnownInstalledFlag()) {
        gateState.value = 'installed';
        installFlow.value = 'unknown';
        return;
      }

      gateState.value = 'not-installed';
      installFlow.value = isIosInstallManualOnly(window) ? 'ios-manual' : 'native-pending';
    };

    const onInstalled = () => {
      setKnownInstalledFlag(true);
      gateState.value = 'installed';
      installFlow.value = 'unknown';
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        evaluate();
      }
    };

    const stopDeferredPromptWatcher = watchDeferredInstallPrompt(window, (event) => {
      if (!shouldEnforcePwaInstallGate(window)) {
        return;
      }
      if (isRunningAsInstalledPwa(window) || isIosInstallManualOnly(window)) {
        return;
      }
      if (event) {
        setKnownInstalledFlag(false);
        installFlow.value = 'native-ready';
        return;
      }
      if (installFlow.value !== 'native-manual') {
        installFlow.value = 'native-pending';
      }
    });

    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('focus', evaluate);
    document.addEventListener('visibilitychange', onVisibilityChange);
    evaluate();

    cleanup(() => {
      stopDeferredPromptWatcher();
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('focus', evaluate);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const state = track(() => gateState.value);
    const flow = track(() => installFlow.value);
    const shouldUseIosManualDialog = state === 'not-installed' && flow === 'ios-manual';

    if (!shouldUseIosManualDialog) {
      dialogReady.value = false;
      dialogRef.value = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await import('@khmyznikov/pwa-install');
        if (cancelled) {
          return;
        }
        const host = document.getElementById(installHostId);
        if (!host) {
          loadError.value = t(i18n, 'installAppLoadFailed', 'Failed to load install dialog.');
          return;
        }

        let dialog = host.querySelector('pwa-install') as PwaInstallElementLike | null;
        if (!dialog) {
          dialog = document.createElement('pwa-install') as PwaInstallElementLike;
          host.replaceChildren(dialog);
        }
        dialog.setAttribute('disable-close', '');
        dialog.setAttribute('manual-apple', '');
        dialog.setAttribute('manifest-url', '/next/manifest.webmanifest');
        dialog.setAttribute('icon', '/next/icons/Icon-192-v2.png');
        dialog.setAttribute('name', 'Liive Profit');
        dialog.setAttribute('description', 'Progressive web application');

        loadError.value = '';
        dialogReady.value = true;
        dialogRef.value = dialog;
      } catch (error) {
        loadError.value = error instanceof Error ? error.message : String(error);
      }
    })();

    cleanup(() => {
      cancelled = true;
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const shouldWaitForNativePrompt =
      track(() => gateState.value) === 'not-installed' && track(() => installFlow.value) === 'native-pending';
    if (!shouldWaitForNativePrompt) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (gateState.value === 'not-installed' && installFlow.value === 'native-pending') {
        installFlow.value = 'native-manual';
      }
    }, nativePromptFallbackDelayMs);

    cleanup(() => {
      window.clearTimeout(timer);
    });
  });

  if (gateState.value === 'installed' || gateState.value === 'checking') {
    return <Slot />;
  }

  const isIosFlow = installFlow.value === 'ios-manual';
  const isNativeManualFlow = installFlow.value === 'native-manual';
  const showInstallAction = isIosFlow || isNativeManualFlow || installFlow.value === 'native-ready';
  const showAnyAction = showInstallAction || showAndroidApkAction.value;
  const showSpinner =
    (!dialogReady.value && isIosFlow) || installFlow.value === 'native-pending';
  const installButtonLabel = resolveInstallButtonLabel(i18n, showAndroidApkAction.value);
  const copy = resolveInstallCopy(i18n, installFlow.value);

  return (
    <div class="ui-pwa-gate">
      <section class="ui-pwa-gate-card">
        <span class="material-icons-outlined ui-pwa-gate-icon" aria-hidden="true">
          install_mobile
        </span>
        <h2 class="ui-pwa-gate-title">{t(i18n, 'installAppRequiredTitle', 'Install required')}</h2>
        <p class="ui-pwa-gate-copy">{copy}</p>

        <div id={installHostId} class="ui-pwa-install-host" />

        {showAnyAction ? (
          <PwaInstallGuardActions
            showInstallAction={showInstallAction}
            installButtonLabel={installButtonLabel}
            installDisabled={!showInstallAction || installing.value || (isIosFlow && !dialogReady.value)}
            installing={installing.value}
            loadingLabel={t(i18n, 'loadingLabel', 'Loading...')}
            showAndroidApkAction={showAndroidApkAction.value}
            androidApkDownloadUrl={androidAppDownloadUrl}
            androidApkButtonLabel={t(i18n, 'downloadAndroidApkCta', 'Download APK')}
            onInstall$={async () => {
              await beginPwaInstall({
                dialogRef: dialogRef.value,
                i18n,
                installFlow: installFlow.value,
                installing: installing.value,
                isIosFlow,
                setInstallFlow: (flow) => {
                  installFlow.value = flow;
                },
                setInstalling: (value) => {
                  installing.value = value;
                },
                setLoadError: (message) => {
                  loadError.value = message;
                },
              });
            }}
          />
        ) : null}

        {showSpinner && !loadError.value ? (
          <div class="ui-spinner" aria-hidden="true" />
        ) : null}

        {installFlow.value === 'native-pending' && !loadError.value ? (
          <p class="ui-status">
            {t(
              i18n,
              'installAppPromptWaiting',
              'Preparing install prompt. Keep this page open for a moment.',
            )}
          </p>
        ) : null}

        {installFlow.value === 'native-manual' && !loadError.value ? (
          <p class="ui-status">
            {t(
              i18n,
              'installAppPromptManual',
              'Automatic prompt is unavailable on this browser session. Tap Install to open manual install steps.',
            )}
          </p>
        ) : null}

        {showAndroidApkAction.value ? (
          <p class="ui-status">
            {t(
              i18n,
              'downloadAndroidApkHint',
              'The APK installs outside the browser prompt and may require allowing installs from your browser source.',
            )}
          </p>
        ) : null}

        {loadError.value ? <p class="ui-status ui-status-error">{loadError.value}</p> : null}
      </section>
    </div>
  );
});
