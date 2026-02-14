import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { isRunningAsInstalledPwa } from '../../lib/features/pwa/pwa-install-state';

interface PwaInstallElementLike extends HTMLElement {
  showDialog: (forced?: boolean) => void;
}

type InstallGateState = 'checking' | 'installed' | 'not-installed';
const installHostId = 'ui-pwa-install-host';

export const PwaInstallGuard = component$(() => {
  const i18n = useI18n();
  const gateState = useSignal<InstallGateState>('checking');
  const dialogReady = useSignal(false);
  const loadError = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    const evaluate = () => {
      gateState.value = isRunningAsInstalledPwa(window) ? 'installed' : 'not-installed';
    };

    const onInstalled = () => {
      gateState.value = 'installed';
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        evaluate();
      }
    };

    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('focus', evaluate);
    document.addEventListener('visibilitychange', onVisibilityChange);
    evaluate();

    cleanup(() => {
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('focus', evaluate);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });
  });

  useVisibleTask$(({ track }) => {
    const state = track(() => gateState.value);
    if (state !== 'not-installed') {
      dialogReady.value = false;
      loadError.value = '';
      return;
    }

    void (async () => {
      try {
        await import('@khmyznikov/pwa-install');
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
        window.requestAnimationFrame(() => {
          dialog?.showDialog(true);
        });
      } catch (error) {
        loadError.value = error instanceof Error ? error.message : String(error);
      }
    })();
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
            'To continue, install ProfitLens and open it from your home screen. We show the install guide automatically.',
          )}
        </p>

        <div id={installHostId} class="ui-pwa-install-host" />

        {!dialogReady.value && !loadError.value ? (
          <div class="ui-spinner" aria-hidden="true" />
        ) : null}

        {loadError.value ? <p class="ui-status ui-status-error">{loadError.value}</p> : null}
      </section>
    </div>
  );
});
