import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { lockPageScroll, unlockPageScroll } from '../../../../lib/ui/page-scroll-lock';

interface UseOfferDialogTransitionOptions {
  isOpen: Signal<boolean>;
}

interface OfferDialogTransitionState {
  dialogRef: Signal<HTMLDialogElement | undefined>;
}

const dialogClosingClass = 'is-closing';
const closeTransitionMs = 320;

export const useOfferDialogTransition = (
  options: UseOfferDialogTransitionOptions,
): OfferDialogTransitionState => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const hasScrollLock = useSignal(false);
  const closeTimeoutId = useSignal<number>();

  const clearCloseTimeout = (): void => {
    if (closeTimeoutId.value === undefined) {
      return;
    }
    window.clearTimeout(closeTimeoutId.value);
    closeTimeoutId.value = undefined;
  };

  const releaseScrollLock = (): void => {
    if (!hasScrollLock.value) {
      return;
    }
    unlockPageScroll();
    hasScrollLock.value = false;
  };

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      clearCloseTimeout();
      const dialog = dialogRef.value;
      if (dialog?.open) {
        dialog.classList.remove(dialogClosingClass);
        dialog.close();
      }
      releaseScrollLock();
    });
  });

  useVisibleTask$(({ track }) => {
    const open = track(() => options.isOpen.value);
    const dialog = track(() => dialogRef.value);

    if (!dialog) {
      clearCloseTimeout();
      releaseScrollLock();
      return;
    }

    if (open) {
      clearCloseTimeout();
      dialog.classList.remove(dialogClosingClass);
      if (!hasScrollLock.value) {
        lockPageScroll({ disableTouchAction: false });
        hasScrollLock.value = true;
      }
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (!dialog.open) {
      clearCloseTimeout();
      releaseScrollLock();
      return;
    }

    if (dialog.classList.contains(dialogClosingClass)) {
      return;
    }

    dialog.classList.add(dialogClosingClass);
    closeTimeoutId.value = window.setTimeout(() => {
      dialog.classList.remove(dialogClosingClass);
      if (dialog.open) {
        dialog.close();
      }
      releaseScrollLock();
      closeTimeoutId.value = undefined;
    }, closeTransitionMs);
  });

  return {
    dialogRef,
  };
};
