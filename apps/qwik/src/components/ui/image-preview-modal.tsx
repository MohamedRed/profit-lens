import { component$, type QRL, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { lockPageScroll, unlockPageScroll } from '../../lib/ui/page-scroll-lock';

interface ImagePreviewModalProps {
  alt: string;
  isOpen: boolean;
  onClose$: QRL<() => void>;
  src: string | null;
}

export const ImagePreviewModal = component$<ImagePreviewModalProps>(({ alt, isOpen, onClose$, src }) => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const hasScrollLock = useSignal(false);

  useVisibleTask$(({ track, cleanup }) => {
    const open = track(() => isOpen);
    const dialog = dialogRef.value;
    if (!dialog) {
      return;
    }
    if (open) {
      if (!hasScrollLock.value) {
        lockPageScroll();
        hasScrollLock.value = true;
      }
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }

    if (!open && hasScrollLock.value) {
      unlockPageScroll();
      hasScrollLock.value = false;
    }

    cleanup(() => {
      if (hasScrollLock.value) {
        unlockPageScroll();
        hasScrollLock.value = false;
      }
    });
  });

  if (!src) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      class="ui-image-modal-dialog"
      aria-label={alt}
      onCancel$={(event) => {
        event.preventDefault();
        onClose$();
      }}
      onClick$={(event, el) => {
        if (event.target === el) {
          onClose$();
        }
      }}
    >
      <div class="ui-image-modal-panel">
        <button
          type="button"
          class="ui-image-modal-close"
          aria-label="Close image preview"
          onClick$={onClose$}
        >
          <span class="material-icons-outlined" aria-hidden="true">
            close
          </span>
        </button>
        <img class="ui-image-modal-image" src={src} alt={alt} width={1200} height={900} />
      </div>
    </dialog>
  );
});
