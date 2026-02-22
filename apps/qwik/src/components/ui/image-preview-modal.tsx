import { component$, type QRL, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { lockPageScroll, unlockPageScroll } from '../../lib/ui/page-scroll-lock';

export interface ImagePreviewItem {
  src: string;
  alt: string;
}

interface ImagePreviewModalProps {
  alt: string;
  initialIndex?: number;
  isOpen: boolean;
  items?: ImagePreviewItem[];
  onClose$: QRL<() => void>;
  src: string | null;
}

const clampIndex = (value: number, max: number): number => {
  if (max <= 0) {
    return 0;
  }
  return Math.min(Math.max(value, 0), max - 1);
};

const swipeThresholdPx = 40;

export const ImagePreviewModal = component$<ImagePreviewModalProps>(
  ({ alt, initialIndex, isOpen, items, onClose$, src }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const hasScrollLock = useSignal(false);
    const activeIndex = useSignal(0);
    const touchStartX = useSignal<number | null>(null);
    const touchStartY = useSignal<number | null>(null);
    const galleryItems = items?.length ? items : src ? [{ src, alt }] : [];
    const maxItems = galleryItems.length;
    const hasGallery = maxItems > 1;
    const safeIndex = clampIndex(activeIndex.value, maxItems);
    const currentItem = maxItems > 0 ? galleryItems[safeIndex] : null;

    useVisibleTask$(({ track, cleanup }) => {
      const open = track(() => isOpen);
      const nextInitialIndex = track(() => initialIndex ?? 0);
      const nextLength = track(() => items?.length ?? 0);
      const dialog = dialogRef.value;
      if (!dialog) {
        return;
      }
      if (open) {
        const max = nextLength > 0 ? nextLength : src ? 1 : 0;
        activeIndex.value = clampIndex(nextInitialIndex, max);
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

    if (!currentItem) {
      return null;
    }

    return (
      <dialog
        ref={dialogRef}
        class="ui-image-modal-dialog"
        aria-label={currentItem.alt || alt}
        onCancel$={(event) => {
          event.preventDefault();
          onClose$();
        }}
        onClick$={(event, el) => {
          if (event.target === el) {
            onClose$();
          }
        }}
        onKeyDown$={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (hasGallery) {
              activeIndex.value = clampIndex(activeIndex.value - 1, maxItems);
            }
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (hasGallery) {
              activeIndex.value = clampIndex(activeIndex.value + 1, maxItems);
            }
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
          <div
            class="ui-image-modal-frame"
            onTouchStart$={(event) => {
              const touch = event.touches[0];
              if (!touch) {
                return;
              }
              touchStartX.value = touch.clientX;
              touchStartY.value = touch.clientY;
            }}
            onTouchEnd$={(event) => {
              const startX = touchStartX.value;
              const startY = touchStartY.value;
              touchStartX.value = null;
              touchStartY.value = null;
              if (startX === null || startY === null) {
                return;
              }
              const touch = event.changedTouches[0];
              if (!touch) {
                return;
              }
              const deltaX = touch.clientX - startX;
              const deltaY = touch.clientY - startY;
              if (Math.abs(deltaX) < swipeThresholdPx || Math.abs(deltaX) < Math.abs(deltaY)) {
                return;
              }
              if (!hasGallery) {
                return;
              }
              activeIndex.value = clampIndex(activeIndex.value + (deltaX < 0 ? 1 : -1), maxItems);
            }}
          >
            {hasGallery ? (
              <button
                type="button"
                class="ui-image-modal-nav is-prev"
                aria-label="Previous image"
                onClick$={() => {
                  activeIndex.value = clampIndex(activeIndex.value - 1, maxItems);
                }}
                disabled={safeIndex === 0}
              >
                <span class="material-icons-outlined" aria-hidden="true">
                  chevron_left
                </span>
              </button>
            ) : null}
            <div class="ui-image-modal-carousel">
              <div
                class="ui-image-modal-track"
                style={{
                  '--ui-image-modal-slide-index': String(safeIndex),
                }}
              >
                {galleryItems.map((item, index) => (
                  <figure key={`${item.src}-${index}`} class="ui-image-modal-slide">
                    <img
                      class="ui-image-modal-image"
                      src={item.src}
                      alt={item.alt}
                      width={1200}
                      height={900}
                      loading={Math.abs(index - safeIndex) <= 1 ? 'eager' : 'lazy'}
                    />
                  </figure>
                ))}
              </div>
            </div>
            {hasGallery ? (
              <button
                type="button"
                class="ui-image-modal-nav is-next"
                aria-label="Next image"
                onClick$={() => {
                  activeIndex.value = clampIndex(activeIndex.value + 1, maxItems);
                }}
                disabled={safeIndex >= maxItems - 1}
              >
                <span class="material-icons-outlined" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            ) : null}
          </div>
          {hasGallery ? (
            <p class="ui-image-modal-counter">
              {safeIndex + 1} / {maxItems}
            </p>
          ) : null}
        </div>
      </dialog>
    );
  },
);
