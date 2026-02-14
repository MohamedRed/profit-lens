import { $, Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { isRunningAsInstalledPwa } from '../../lib/features/pwa/pwa-install-state';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallGateState = 'checking' | 'installed' | 'not-installed';

export const PwaInstallGuard = component$(() => {
  const i18n = useI18n();
  const gateState = useSignal<InstallGateState>('checking');
  const deferredPrompt = useSignal<BeforeInstallPromptEvent | null>(null);
  const installing = useSignal(false);
  const status = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    const evaluate = () => {
      gateState.value = isRunningAsInstalledPwa(window) ? 'installed' : 'not-installed';
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt.value = event as BeforeInstallPromptEvent;
      evaluate();
    };

    const onInstalled = () => {
      deferredPrompt.value = null;
      gateState.value = 'installed';
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    evaluate();

    cleanup(() => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    });
  });

  const installNow$ = $(async () => {
    const prompt = deferredPrompt.value;
    if (!prompt || installing.value) {
      return;
    }

    status.value = '';
    installing.value = true;
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') {
        status.value = t(i18n, 'installAppAcceptedStatus', 'Install accepted. Open the app from your home screen.');
      } else {
        status.value = t(i18n, 'installAppDismissedStatus', 'Install was dismissed. Installation is required.');
      }
    } catch (error) {
      status.value = error instanceof Error ? error.message : String(error);
    } finally {
      deferredPrompt.value = null;
      installing.value = false;
      gateState.value = isRunningAsInstalledPwa(window) ? 'installed' : 'not-installed';
    }
  });

  if (gateState.value === 'installed') {
    return <Slot />;
  }

  return (
    <div class="ui-pwa-gate">
      <section class="ui-pwa-gate-card">
        <span class="material-icons-outlined ui-pwa-gate-icon" aria-hidden="true">
          install_mobile
        </span>
        <h2 class="ui-pwa-gate-title">{t(i18n, 'installAppRequiredTitle', 'Install required')}</h2>
        <p class="ui-pwa-gate-copy">
          {t(
            i18n,
            'installAppRequiredBody',
            'To continue, install ProfitLens and open it from your home screen.',
          )}
        </p>

        {deferredPrompt.value ? (
          <button type="button" class="ui-pwa-gate-button" onClick$={installNow$} disabled={installing.value}>
            {installing.value
              ? t(i18n, 'installAppInstallingLabel', 'Installing...')
              : t(i18n, 'installAppNowButton', 'Install now')}
          </button>
        ) : (
          <p class="ui-pwa-gate-hint">
            {t(
              i18n,
              'installAppManualHint',
              'Use your browser menu and choose "Add to Home Screen", then reopen the app.',
            )}
          </p>
        )}

        {gateState.value === 'checking' ? (
          <div class="ui-spinner" aria-hidden="true" />
        ) : null}

        {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
      </section>
    </div>
  );
});
