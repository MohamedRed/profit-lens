import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import { createHelpTicket } from '../../../lib/features/help/help-service';
import {
  buildHelpDrafts,
  maxHelpAttachments,
  revokeHelpDraftPreview,
  revokeHelpDraftPreviews,
} from '../../../lib/features/help/help-ui-utils';
import { resolveUserFacingErrorMessage } from '../../../lib/errors/user-facing-error';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { HelpAttachmentDraft } from '../../../lib/types/help';
import { HelpAttachmentDraftList } from './components/help-attachment-draft-list';
import { readHelpTabSessionState, writeHelpTabSessionState } from './help-tab-session';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const description = useSignal('');
  const drafts = useSignal<HelpAttachmentDraft[]>([]);
  const submitting = useSignal(false);
  const status = useSignal('');

  useVisibleTask$(({ track }) => {
    const uid = track(() => auth.user.value?.uid ?? null);
    if (!uid) {
      description.value = '';
      return;
    }
    const savedState = readHelpTabSessionState(uid);
    description.value = savedState?.description ?? '';
  });

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      revokeHelpDraftPreviews(drafts.value);
    });
  });

  const removeDraft$ = $((index: number) => {
    const current = drafts.value[index];
    if (current) {
      revokeHelpDraftPreview(current);
    }
    drafts.value = drafts.value.filter((_, itemIndex) => itemIndex !== index);
  });

  return (
    <div class="ui-help-root">
      <section class="ui-help-card ui-help-form-card">
        <h2 class="ui-help-card-title">{t(i18n, 'helpFormTitle', 'Submit a ticket')}</h2>
        <div class="ui-help-intro-row ui-help-intro-row-compact">
          <span class="material-icons-outlined ui-help-intro-icon" aria-hidden="true">
            support_agent
          </span>
          <p class="ui-help-intro-copy">
            {t(
              i18n,
              'helpIntroBody',
              'Report bugs or issues with screenshots and a written description. Our team will analyze and keep you informed.',
            )}
          </p>
        </div>

        <textarea
          class="ui-help-textarea"
          value={description.value}
          placeholder={t(i18n, 'helpDescriptionLabel', 'Describe the issue')}
          onInput$={(_, el) => {
            const nextDescription = el.value;
            description.value = nextDescription;
            const uid = auth.user.value?.uid;
            if (!uid) {
              return;
            }
            writeHelpTabSessionState({
              uid,
              description: nextDescription,
            });
          }}
        />

        <div class="ui-help-attachments-head">
          <p class="ui-help-attachments-title">{t(i18n, 'helpAttachmentTitle', 'Screenshots')}</p>
          <p class="ui-help-attachments-subtitle">
            {t(i18n, 'helpAttachmentSubtitle', 'Add screenshots to speed up diagnosis.')}
          </p>
        </div>

        <label class="ui-help-gallery-btn">
          <span class="material-icons-outlined ui-help-gallery-icon" aria-hidden="true">
            image
          </span>
          {t(i18n, 'helpAttachmentGalleryButton', 'Gallery')}
          <input
            type="file"
            accept="image/*,audio/*"
            multiple
            style="display:none"
            onChange$={(_, element) => {
              const files = element.files;
              if (!files || files.length === 0) {
                return;
              }
              const mergedDrafts = [...drafts.value, ...buildHelpDrafts(files)];
              const overflowDrafts = mergedDrafts.slice(maxHelpAttachments);
              if (overflowDrafts.length > 0) {
                revokeHelpDraftPreviews(overflowDrafts);
              }
              const nextDrafts = mergedDrafts.slice(0, maxHelpAttachments);
              drafts.value = nextDrafts;
              if (nextDrafts.length === maxHelpAttachments) {
                status.value = t(i18n, 'helpAttachmentLimitReached', 'Attachment limit reached.');
              }
              element.value = '';
            }}
          />
        </label>

        {drafts.value.length > 0 ? (
          <HelpAttachmentDraftList drafts={drafts.value} onRemove$={removeDraft$} />
        ) : null}

        <button
          type="button"
          class="ui-help-submit"
          disabled={submitting.value}
          onClick$={async () => {
            const user = auth.user.value;
            if (!user) {
              status.value = resolveUserFacingErrorMessage(
                i18n,
                new Error('Missing authenticated user.'),
                'help-submit',
              );
              return;
            }
            if (!description.value.trim() && drafts.value.length === 0) {
              status.value = t(i18n, 'helpDescriptionRequired', 'Add a short description.');
              return;
            }

            status.value = '';
            submitting.value = true;
            try {
              await createHelpTicket({
                uid: user.uid,
                locale: i18n.locale.value,
                deviceId: getDeviceId(),
                platform: navigator.platform || 'web',
                description: description.value.trim(),
                attachments: drafts.value,
              });
              revokeHelpDraftPreviews(drafts.value);
              description.value = '';
              drafts.value = [];
              writeHelpTabSessionState({
                uid: user.uid,
                description: '',
              });
              status.value = t(i18n, 'helpTicketSubmitted', 'Ticket submitted.');
            } catch (error) {
              status.value = resolveUserFacingErrorMessage(i18n, error, 'help-submit');
            } finally {
              submitting.value = false;
            }
          }}
        >
          {submitting.value
            ? t(i18n, 'helpSubmittingLabel', 'Submitting...')
            : t(i18n, 'helpSubmitButton', 'Submit ticket')}
        </button>

        {status.value ? (
          <p
            class={{
              'ui-status': true,
              'ui-status-success': status.value.toLowerCase().includes('ticket'),
              'ui-status-error': !status.value.toLowerCase().includes('ticket'),
            }}
          >
            {status.value}
          </p>
        ) : null}
      </section>

    </div>
  );
});
