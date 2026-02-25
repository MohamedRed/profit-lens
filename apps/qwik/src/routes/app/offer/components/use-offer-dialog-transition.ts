import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { lockPageScroll, unlockPageScroll } from '../../../../lib/ui/page-scroll-lock';

interface UseOfferDialogTransitionOptions {
  isOpen: Signal<boolean>;
}

interface OfferDialogTransitionState {
  dialogRef: Signal<HTMLDialogElement | undefined>;
}

export const useOfferDialogTransition = (
  options: UseOfferDialogTransitionOptions,
): OfferDialogTransitionState => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const hasScrollLock = useSignal(false);

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
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
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
      return;
    }

    if (open) {
      if (!hasScrollLock.value) {
        lockPageScroll({ disableTouchAction: false });
        hasScrollLock.value = true;
      }
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
    if (hasScrollLock.value) {
      unlockPageScroll();
      hasScrollLock.value = false;
    }
  });

  return {
    dialogRef,
  };
};
