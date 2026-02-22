import { type Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";

const DEFAULT_CLOSE_DURATION_MS = 260;

interface UseOfferSheetTransitionOptions {
  closeDurationMs?: number;
  isOpen: boolean;
}

interface OfferSheetTransitionState {
  isClosing: Signal<boolean>;
  isMounted: Signal<boolean>;
}

export const useOfferSheetTransition = (
  options: UseOfferSheetTransitionOptions,
): OfferSheetTransitionState => {
  const isMounted = useSignal(options.isOpen);
  const isClosing = useSignal(false);
  const closeTimerId = useSignal<number | null>(null);
  const closeDurationMs = options.closeDurationMs ?? DEFAULT_CLOSE_DURATION_MS;

  useVisibleTask$(({ track, cleanup }) => {
    const open = track(() => options.isOpen);

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
      isMounted.value = true;
      isClosing.value = false;
      return;
    }

    if (!isMounted.value || isClosing.value) {
      return;
    }

    isClosing.value = true;
    closeTimerId.value = window.setTimeout(() => {
      closeTimerId.value = null;
      isClosing.value = false;
      isMounted.value = false;
    }, closeDurationMs);
  });

  return {
    isClosing,
    isMounted,
  };
};
