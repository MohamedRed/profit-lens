import { $, component$, type QRL, type Signal } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { useOfferDialogTransition } from './use-offer-dialog-transition';

interface OfferImportSourceDialogProps {
  isOpen: Signal<boolean>;
  onClose$: QRL<() => void>;
  onSelectFile$: QRL<(file: File) => Promise<void>>;
}

export const OfferImportSourceDialog = component$<OfferImportSourceDialogProps>((props) => {
  const i18n = useI18n();
  const { dialogRef, isClosing } = useOfferDialogTransition({
    isOpen: props.isOpen,
  });
  const onFileChange$ = $(async (element: HTMLInputElement) => {
    const file = element.files?.[0];
    if (!file) {
      return;
    }
    try {
      props.onClose$();
      await props.onSelectFile$(file);
    } finally {
      element.value = '';
    }
  });

  return (
    <dialog
      ref={dialogRef}
      class={{ 'ui-offer-source-dialog': true, 'is-closing': isClosing.value }}
      aria-label={t(i18n, 'importSourceTitle', 'Choose a source')}
      onCancel$={(event) => {
        event.preventDefault();
        props.onClose$();
      }}
      onClick$={(event, element) => {
        if (event.target === element) {
          props.onClose$();
        }
      }}
    >
      <div class="ui-offer-source-panel">
        <h3 class="ui-offer-source-title">{t(i18n, 'importSourceTitle', 'Choose a source')}</h3>
        <label class="ui-offer-source-item">
          <span class="material-icons-outlined ui-offer-source-icon" aria-hidden="true">
            photo_library
          </span>
          <span class="ui-offer-source-label">{t(i18n, 'importSourceGallery', 'Photo library')}</span>
          <span class="material-icons-outlined ui-offer-source-chevron" aria-hidden="true">
            chevron_right
          </span>
          <input
            class="ui-offer-file-input-hidden"
            type="file"
            accept="image/*"
            onClick$={(_, element) => {
              element.value = '';
            }}
            onInput$={(_, element) => {
              void onFileChange$(element);
            }}
            onChange$={(_, element) => {
              void onFileChange$(element);
            }}
          />
        </label>
        <label class="ui-offer-source-item">
          <span class="material-icons-outlined ui-offer-source-icon" aria-hidden="true">
            photo_camera
          </span>
          <span class="ui-offer-source-label">{t(i18n, 'importSourceCamera', 'Take photo')}</span>
          <span class="material-icons-outlined ui-offer-source-chevron" aria-hidden="true">
            chevron_right
          </span>
          <input
            class="ui-offer-file-input-hidden"
            type="file"
            accept="image/*"
            capture="environment"
            onClick$={(_, element) => {
              element.value = '';
            }}
            onInput$={(_, element) => {
              void onFileChange$(element);
            }}
            onChange$={(_, element) => {
              void onFileChange$(element);
            }}
          />
        </label>
      </div>
    </dialog>
  );
});
