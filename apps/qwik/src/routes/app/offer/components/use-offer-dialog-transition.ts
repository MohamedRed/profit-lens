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

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (closeTimeoutId.value !== undefined) {
        window.clearTimeout(closeTimeoutId.value);
        closeTimeoutId.value = undefined;
      }
      const dialog = dialogRef.value;
      if (dialog?.open) {
        dialog.classList.remove(dialogClosingClass);
        dialog.close();
      }
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
    });
  });

  useVisibleTask$(({ track }) => {
    const open = track(() => options.isOpen.value);
    const dialog = track(() => dialogRef.value);

    if (!dialog) {
      if (closeTimeoutId.value !== undefined) {
        window.clearTimeout(closeTimeoutId.value);
        closeTimeoutId.value = undefined;
      }
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
      return;
    }

    if (open) {
      if (closeTimeoutId.value !== undefined) {
        window.clearTimeout(closeTimeoutId.value);
        closeTimeoutId.value = undefined;
      }
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
      if (closeTimeoutId.value !== undefined) {
        window.clearTimeout(closeTimeoutId.value);
        closeTimeoutId.value = undefined;
      }
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
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
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
      closeTimeoutId.value = undefined;
    }, closeTransitionMs);
  });

  return {
    dialogRef,
  };
};
