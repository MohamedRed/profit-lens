import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { lockPageScroll, unlockPageScroll } from '../../../../lib/ui/page-scroll-lock';

const DEFAULT_CLOSE_DURATION_MS = 280;

interface UseOfferDialogTransitionOptions {
  closeDurationMs?: number;
  isOpen: Signal<boolean>;
}

interface OfferDialogTransitionState {
  dialogRef: Signal<HTMLDialogElement | undefined>;
  isClosing: Signal<boolean>;
}

export const useOfferDialogTransition = (
  options: UseOfferDialogTransitionOptions,
): OfferDialogTransitionState => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const isClosing = useSignal(false);
  const closeTimerId = useSignal<number | null>(null);
  const hasScrollLock = useSignal(false);
  const closeDurationMs = options.closeDurationMs ?? DEFAULT_CLOSE_DURATION_MS;

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (closeTimerId.value !== null) {
        window.clearTimeout(closeTimerId.value);
        closeTimerId.value = null;
      }
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const open = track(() => options.isOpen.value);
    const dialog = track(() => dialogRef.value);

    cleanup(() => {
      if (closeTimerId.value !== null) {
        window.clearTimeout(closeTimerId.value);
        closeTimerId.value = null;
      }
    });

    if (!dialog) {
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
      return;
    }

    if (open) {
      if (closeTimerId.value !== null) {
        window.clearTimeout(closeTimerId.value);
        closeTimerId.value = null;
      }
      isClosing.value = false;
      if (!hasScrollLock.value) {
        lockPageScroll({ disableTouchAction: false });
        hasScrollLock.value = true;
      }
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (!dialog.open || isClosing.value) {
      if (!dialog.open && hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
      return;
    }

    isClosing.value = true;
    closeTimerId.value = window.setTimeout(() => {
      closeTimerId.value = null;
      isClosing.value = false;
      if (dialog.open) {
        dialog.close();
      }
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
    }, closeDurationMs);
  });

  return {
    dialogRef,
    isClosing,
  };
};
