import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import {
  consumeDeferredInstallPrompt,
  watchDeferredInstallPrompt,
} from '../../lib/features/pwa/pwa-install-prompt';
import {
  isIosInstallManualOnly,
  isRunningAsInstalledPwa,
} from '../../lib/features/pwa/pwa-install-state';

interface PwaInstallElementLike extends HTMLElement {
  showDialog: (forced?: boolean) => void;
}

type InstallGateState = 'checking' | 'installed' | 'not-installed';
type InstallFlowState =
  | 'unknown'
  | 'ios-manual'
  | 'native-ready'
  | 'native-pending'
  | 'native-manual';
const installHostId = 'ui-pwa-install-host';
const nativePromptFallbackDelayMs = 3000;

export const PwaInstallGuard = component$(() => {
  const i18n = useI18n();
  const gateState = useSignal<InstallGateState>('checking');
  const installFlow = useSignal<InstallFlowState>('unknown');
  const dialogReady = useSignal(false);
  const dialogRef = useSignal<PwaInstallElementLike | null>(null);
  const installing = useSignal(false);
  const loadError = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    const evaluate = () => {
      if (isRunningAsInstalledPwa(window)) {
        gateState.value = 'installed';
        installFlow.value = 'unknown';
        return;
      }

      gateState.value = 'not-installed';
      installFlow.value = isIosInstallManualOnly(window) ? 'ios-manual' : 'native-pending';
    };

    const onInstalled = () => {
      gateState.value = 'installed';
      installFlow.value = 'unknown';
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        evaluate();
      }
    };

    const stopDeferredPromptWatcher = watchDeferredInstallPrompt(window, (event) => {
      if (isRunningAsInstalledPwa(window) || isIosInstallManualOnly(window)) {
        return;
      }
      if (event) {
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
    const shouldUseManualDialog =
      state === 'not-installed' && (flow === 'ios-manual' || flow === 'native-manual');

    if (!shouldUseManualDialog) {
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
          dialog.setAttribute('disable-close', '');
          dialog.setAttribute('name', 'ProfitLens');
          host.replaceChildren(dialog);
        }

        loadError.value = '';
        dialogReady.value = true;
        dialogRef.value = dialog;
        window.requestAnimationFrame(() => {
          dialog?.showDialog(true);
        });
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

  if (gateState.value === 'installed') {
    return <Slot />;
  }

  const isManualDialogFlow = installFlow.value === 'ios-manual' || installFlow.value === 'native-manual';
  const showInstallAction = isManualDialogFlow || installFlow.value === 'native-ready';
  const showSpinner =
    (!dialogReady.value && isManualDialogFlow) || installFlow.value === 'native-pending';
  const copy =
    installFlow.value === 'native-ready'
      ? t(
          i18n,
          'installAppRequiredNativeBody',
          'To continue, install ProfitLens and open it from your home screen. Tap Install to open the browser prompt.',
        )
      : installFlow.value === 'native-manual'
        ? t(
            i18n,
            'installAppRequiredManualBody',
            'To continue, install ProfitLens and open it from your home screen. Tap Install to open guided install steps for your browser.',
          )
      : t(
          i18n,
          'installAppRequiredBody',
          'To continue, install ProfitLens and open it from your home screen. We show the install guide automatically.',
        );

  return (
    <div class="ui-pwa-gate">
      <section class="ui-pwa-gate-card">
        <span class="material-icons-outlined ui-pwa-gate-icon" aria-hidden="true">
          install_mobile
        </span>
        <h2 class="ui-pwa-gate-title">{t(i18n, 'installAppRequiredTitle', 'Install required')}</h2>
        <p class="ui-pwa-gate-copy">{copy}</p>

        <div id={installHostId} class="ui-pwa-install-host" />

        {showInstallAction ? (
          <button
            type="button"
            class="ui-pwa-gate-button"
            disabled={installing.value || (isManualDialogFlow && !dialogReady.value)}
            onClick$={async () => {
              if (installing.value) {
                return;
              }
              if (isManualDialogFlow) {
                if (!dialogRef.value) {
                  loadError.value = t(i18n, 'installAppLoadFailed', 'Failed to load install dialog.');
                  return;
                }
                loadError.value = '';
                dialogRef.value.showDialog(true);
                return;
              }

              const deferredPrompt = consumeDeferredInstallPrompt();
              if (!deferredPrompt) {
                loadError.value = t(
                  i18n,
                  'installAppPromptUnavailable',
                  'Install prompt is not ready yet. Wait a moment and try again.',
                );
                installFlow.value = 'native-manual';
                return;
              }

              installing.value = true;
              loadError.value = '';
              try {
                await deferredPrompt.prompt();
                if (deferredPrompt.userChoice) {
                  await deferredPrompt.userChoice;
                }
              } catch (error) {
                loadError.value =
                  error instanceof Error ? error.message : t(i18n, 'installAppPromptFailed', 'Install failed.');
              } finally {
                installing.value = false;
              }
            }}
          >
            {installing.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'installAppCta', 'Install')}
          </button>
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

        {loadError.value ? <p class="ui-status ui-status-error">{loadError.value}</p> : null}
      </section>
    </div>
  );
});
