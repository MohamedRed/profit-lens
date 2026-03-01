import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { lockPageScroll, unlockPageScroll } from '../../../../lib/ui/page-scroll-lock';

interface UseOfferDialogTransitionOptions {
  isOpen: Signal<boolean>;
}

interface OfferDialogTransitionState {
  dialogRef: Signal<HTMLDialogElement | undefined>;
}

const dialogOpeningClass = 'is-opening';
const dialogClosingClass = 'is-closing';
export const offerDialogTransitionMs = 320;

export const useOfferDialogTransition = (
  options: UseOfferDialogTransitionOptions,
): OfferDialogTransitionState => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const hasScrollLock = useSignal(false);
  const closeTimeoutId = useSignal<number>();
  const openingRafId = useSignal<number>();

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (openingRafId.value !== undefined) {
        window.cancelAnimationFrame(openingRafId.value);
        openingRafId.value = undefined;
      }
      if (closeTimeoutId.value !== undefined) {
        window.clearTimeout(closeTimeoutId.value);
        closeTimeoutId.value = undefined;
      }
      const dialog = dialogRef.value;
      if (dialog?.open) {
        dialog.classList.remove(dialogOpeningClass);
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
      if (openingRafId.value !== undefined) {
        window.cancelAnimationFrame(openingRafId.value);
        openingRafId.value = undefined;
      }
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
      if (openingRafId.value !== undefined) {
        window.cancelAnimationFrame(openingRafId.value);
        openingRafId.value = undefined;
      }
      if (closeTimeoutId.value !== undefined) {
        window.clearTimeout(closeTimeoutId.value);
        closeTimeoutId.value = undefined;
      }
      dialog.classList.remove(dialogOpeningClass);
      dialog.classList.remove(dialogClosingClass);
      if (!hasScrollLock.value) {
        lockPageScroll({ disableTouchAction: false });
        hasScrollLock.value = true;
      }
      if (!dialog.open) {
        dialog.showModal();
        dialog.classList.add(dialogOpeningClass);
        openingRafId.value = window.requestAnimationFrame(() => {
          dialog.classList.remove(dialogOpeningClass);
          openingRafId.value = undefined;
        });
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

    if (openingRafId.value !== undefined) {
      window.cancelAnimationFrame(openingRafId.value);
      openingRafId.value = undefined;
    }
    dialog.classList.remove(dialogOpeningClass);
    dialog.classList.add(dialogClosingClass);
    closeTimeoutId.value = window.setTimeout(() => {
      if (dialog.open) {
        dialog.close();
      }
      dialog.classList.remove(dialogOpeningClass);
      dialog.classList.remove(dialogClosingClass);
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
      closeTimeoutId.value = undefined;
    }, offerDialogTransitionMs);
  });

  return {
    dialogRef,
  };
};
