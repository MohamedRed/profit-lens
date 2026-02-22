import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';

const DEFAULT_CLOSE_DURATION_MS = 260;

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
  const closeDurationMs = options.closeDurationMs ?? DEFAULT_CLOSE_DURATION_MS;

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
      return;
    }

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

    if (!dialog.open || isClosing.value) {
      return;
    }

    isClosing.value = true;
    dialog.classList.add('is-closing');
    closeTimerId.value = window.setTimeout(() => {
      closeTimerId.value = null;
      isClosing.value = false;
      if (dialog.open) {
        dialog.close();
      }
      dialog.classList.remove('is-closing');
    }, closeDurationMs);
  });

  return {
    dialogRef,
    isClosing,
  };
};
