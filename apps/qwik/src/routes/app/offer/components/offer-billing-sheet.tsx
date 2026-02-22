import { component$, type QRL, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { BillingManager } from '../../settings/billing/billing-manager';

interface OfferBillingSheetProps {
  isOpen: boolean;
  onClose$: QRL<() => void>;
  uid: string;
}

export const OfferBillingSheet = component$<OfferBillingSheetProps>((props) => {
  const i18n = useI18n();
  const dialogRef = useSignal<HTMLDialogElement>();
  const isClosing = useSignal(false);
  const closeTimerId = useSignal<number | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const open = track(() => props.isOpen);
    const dialog = dialogRef.value;
    if (!dialog) {
      return;
    }

    cleanup(() => {
      if (closeTimerId.value !== null) {
        window.clearTimeout(closeTimerId.value);
        closeTimerId.value = null;
      }
    });

    if (open) {
      if (closeTimerId.value !== null) {
        window.clearTimeout(closeTimerId.value);
        closeTimerId.value = null;
      }
      isClosing.value = false;
      dialog.classList.remove('is-closing');
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open && !isClosing.value) {
      isClosing.value = true;
      dialog.classList.add('is-closing');
      closeTimerId.value = window.setTimeout(() => {
        closeTimerId.value = null;
        isClosing.value = false;
        if (dialog.open) {
          dialog.close();
        }
        dialog.classList.remove('is-closing');
      }, 220);
    }
  });

  return (
    <dialog
      ref={dialogRef}
      class={{ 'ui-offer-billing-dialog': true, 'is-closing': isClosing.value }}
      aria-label={t(i18n, 'billingManageTitle', 'Manage subscription')}
      onCancel$={(event) => {
        event.preventDefault();
        props.onClose$();
      }}
      onClick$={(event, element) => {
        if (event.target === element) {
          props.onClose$();
        }
      }}
    >
      <div class="ui-offer-billing-panel">
        <header class="ui-offer-billing-panel-header">
          <h3 class="ui-offer-billing-panel-title">
            {t(i18n, 'billingManageTitle', 'Manage subscription')}
          </h3>
          <button
            type="button"
            class="ui-offer-billing-panel-close"
            onClick$={props.onClose$}
            aria-label={t(i18n, 'closeLabel', 'Close')}
          >
            <span class="material-icons-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </header>

        <div class="ui-offer-billing-panel-body">
          <BillingManager uid={props.uid} rootClass="ui-offer-billing-manager" />
        </div>
      </div>
    </dialog>
  );
});
