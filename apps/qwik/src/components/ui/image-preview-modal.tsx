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
    const imageRef = useSignal<HTMLImageElement>();
    const hasScrollLock = useSignal(false);
    const activeIndex = useSignal(0);
    const requestedIndex = useSignal<number | null>(null);
    const transitionDirection = useSignal<1 | -1>(1);
    const isAnimating = useSignal(false);
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
        requestedIndex.value = null;
        isAnimating.value = false;
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

    useVisibleTask$(({ track }) => {
      const nextIndex = track(() => requestedIndex.value);
      if (nextIndex === null || isAnimating.value || nextIndex === activeIndex.value) {
        if (nextIndex === activeIndex.value) {
          requestedIndex.value = null;
        }
        return;
      }

      void (async () => {
        isAnimating.value = true;
        const direction = transitionDirection.value;
        const currentImage = imageRef.value;
        if (currentImage) {
          await currentImage
            .animate(
              [
                { opacity: 1, transform: 'translateX(0)' },
                { opacity: 0.16, transform: `translateX(${direction > 0 ? -26 : 26}px)` },
              ],
              {
                duration: 150,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'forwards',
              },
            )
            .finished.catch(() => undefined);
        }

        activeIndex.value = nextIndex;
        requestedIndex.value = null;

        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => {
            resolve();
          });
        });

        const nextImage = imageRef.value;
        if (nextImage) {
          await nextImage
            .animate(
              [
                { opacity: 0.16, transform: `translateX(${direction > 0 ? 26 : -26}px)` },
                { opacity: 1, transform: 'translateX(0)' },
              ],
              {
                duration: 210,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              },
            )
            .finished.catch(() => undefined);
        }

        isAnimating.value = false;
      })();
    });

    if (!currentItem) {
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
        onKeyDown$={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (hasGallery && !isAnimating.value) {
              const next = clampIndex(activeIndex.value - 1, maxItems);
              if (next !== activeIndex.value) {
                transitionDirection.value = -1;
                requestedIndex.value = next;
              }
            }
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (hasGallery && !isAnimating.value) {
              const next = clampIndex(activeIndex.value + 1, maxItems);
              if (next !== activeIndex.value) {
                transitionDirection.value = 1;
                requestedIndex.value = next;
              }
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
              if (!hasGallery || isAnimating.value) {
                return;
              }
              const next = clampIndex(activeIndex.value + (deltaX < 0 ? 1 : -1), maxItems);
              if (next !== activeIndex.value) {
                transitionDirection.value = deltaX < 0 ? 1 : -1;
                requestedIndex.value = next;
              }
            }}
          >
            {hasGallery ? (
              <button
                type="button"
                class="ui-image-modal-nav is-prev"
                aria-label="Previous image"
                onClick$={() => {
                  if (isAnimating.value) {
                    return;
                  }
                  const next = clampIndex(activeIndex.value - 1, maxItems);
                  if (next !== activeIndex.value) {
                    transitionDirection.value = -1;
                    requestedIndex.value = next;
                  }
                }}
                disabled={safeIndex === 0 || isAnimating.value}
              >
                <span class="material-icons-outlined" aria-hidden="true">
                  chevron_left
                </span>
              </button>
            ) : null}
            <img
              ref={imageRef}
              class="ui-image-modal-image"
              src={currentItem.src}
              alt={currentItem.alt}
              width={1200}
              height={900}
            />
            {hasGallery ? (
              <button
                type="button"
                class="ui-image-modal-nav is-next"
                aria-label="Next image"
                onClick$={() => {
                  if (isAnimating.value) {
                    return;
                  }
                  const next = clampIndex(activeIndex.value + 1, maxItems);
                  if (next !== activeIndex.value) {
                    transitionDirection.value = 1;
                    requestedIndex.value = next;
                  }
                }}
                disabled={safeIndex >= maxItems - 1 || isAnimating.value}
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
