import { component$, type QRL, type Signal } from "@builder.io/qwik";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import { BillingManager } from "../../settings/billing/billing-manager";
import { useOfferDialogTransition } from "./use-offer-dialog-transition";

interface OfferBillingSheetProps {
  isOpen: Signal<boolean>;
  onClose$: QRL<() => void>;
  uid: string;
}

export const OfferBillingSheet = component$<OfferBillingSheetProps>((props) => {
  const i18n = useI18n();
  const { dialogRef, isClosing } = useOfferDialogTransition({
    isOpen: props.isOpen,
  });

  return (
    <dialog
      ref={dialogRef}
      class={{ "ui-offer-billing-dialog": true, "is-closing": isClosing.value }}
      aria-label={t(i18n, "billingManageTitle", "Manage subscription")}
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
            {t(i18n, "billingManageTitle", "Manage subscription")}
          </h3>
          <button
            type="button"
            class="ui-offer-billing-panel-close"
            onClick$={props.onClose$}
            aria-label={t(i18n, "closeLabel", "Close")}
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
