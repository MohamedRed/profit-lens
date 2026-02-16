import { component$, type QRL } from '@builder.io/qwik';

interface ImagePreviewModalProps {
  alt: string;
  isOpen: boolean;
  onClose$: QRL<() => void>;
  src: string | null;
}

export const ImagePreviewModal = component$<ImagePreviewModalProps>(({ alt, isOpen, onClose$, src }) => {
  if (!isOpen || !src) {
    return null;
  }

  return (
    <div class="ui-image-modal-backdrop" role="dialog" aria-modal="true" onClick$={onClose$}>
      <div
        class="ui-image-modal-panel"
        onClick$={(event) => {
          event.stopPropagation();
        }}
      >
        <button type="button" class="ui-image-modal-close" aria-label="Close image preview" onClick$={onClose$}>
          <span class="material-icons-outlined" aria-hidden="true">
            close
          </span>
        </button>
        <img class="ui-image-modal-image" src={src} alt={alt} width={1200} height={900} />
      </div>
    </div>
  );
});
