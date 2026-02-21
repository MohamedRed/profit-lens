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

  useVisibleTask$(({ track }) => {
    const open = track(() => props.isOpen);
    const dialog = dialogRef.value;
    if (!dialog) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  });

  return (
    <dialog
      ref={dialogRef}
      class="ui-offer-billing-dialog"
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
