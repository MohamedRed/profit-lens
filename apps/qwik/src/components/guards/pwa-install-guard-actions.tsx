import { component$, type PropFunction } from '@builder.io/qwik';

interface PwaInstallGuardActionsProps {
  showInstallAction: boolean;
  installButtonLabel: string;
  installDisabled: boolean;
  installing: boolean;
  loadingLabel: string;
  onInstall$: PropFunction<() => Promise<void> | void>;
  showAndroidApkAction: boolean;
  androidApkDownloadUrl: string;
  androidApkButtonLabel: string;
}

export const PwaInstallGuardActions = component$((props: PwaInstallGuardActionsProps) => {
  return (
    <div class="ui-pwa-gate-actions">
      {props.showInstallAction ? (
        <button
          type="button"
          class="ui-pwa-gate-button"
          disabled={props.installDisabled}
          onClick$={props.onInstall$}
        >
          {props.installing ? props.loadingLabel : props.installButtonLabel}
        </button>
      ) : null}

      {props.showAndroidApkAction ? (
        <a href={props.androidApkDownloadUrl} class="ui-pwa-gate-button ui-pwa-gate-button-secondary">
          {props.androidApkButtonLabel}
        </a>
      ) : null}
    </div>
  );
});
