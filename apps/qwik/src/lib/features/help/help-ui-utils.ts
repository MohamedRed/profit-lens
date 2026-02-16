import type { HelpAttachmentDraft } from '../../types/help';

export const maxHelpAttachments = 6;

const attachmentType = (file: File): 'image' | 'audio' => {
  return file.type.startsWith('audio/') ? 'audio' : 'image';
};

export const formatHelpDate = (value: Date | null | undefined): string => {
  return value ? value.toLocaleString() : 'n/a';
};

export const buildHelpDrafts = (files: FileList): HelpAttachmentDraft[] => {
  const list: HelpAttachmentDraft[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files.item(index);
    if (!file) {
      continue;
    }
    const type = attachmentType(file);
    list.push({
      type,
      filename: file.name,
      contentType: file.type,
      file,
      previewUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
    });
  }
  return list;
};

export const revokeHelpDraftPreview = (draft: HelpAttachmentDraft): void => {
  if (draft.type === 'image' && draft.previewUrl) {
    URL.revokeObjectURL(draft.previewUrl);
  }
};

export const revokeHelpDraftPreviews = (drafts: readonly HelpAttachmentDraft[]): void => {
  for (const draft of drafts) {
    revokeHelpDraftPreview(draft);
  }
};

export const statusLabel = (
  status: string,
  fallback: string,
  translate: (key: string, fallbackText: string) => string,
): string => {
  const normalized = status.toLowerCase();
  if (normalized === 'open') return translate('helpStatusOpen', fallback);
  if (normalized === 'triaging') return translate('helpStatusTriaging', fallback);
  if (normalized === 'inprogress' || normalized === 'in_progress') {
    return translate('helpStatusInProgress', fallback);
  }
  if (normalized === 'awaitingresponse' || normalized === 'awaiting_response') {
    return translate('helpStatusAwaitingResponse', fallback);
  }
  if (normalized === 'resolved') return translate('helpStatusResolved', fallback);
  if (normalized === 'closed') return translate('helpStatusClosed', fallback);
  return fallback;
};

export const delivererStatusLabel = (
  status: string,
  fallback: string,
  translate: (key: string, fallbackText: string) => string,
): string => {
  const normalized = status.toLowerCase();
  if (normalized === 'received') return translate('helpDelivererStatusReceivedLabel', fallback);
  if (normalized === 'analyzing') return translate('helpDelivererStatusAnalyzingLabel', fallback);
  if (normalized === 'needsinfo' || normalized === 'needs_info') {
    return translate('helpDelivererStatusNeedsInfoLabel', fallback);
  }
  if (normalized === 'fixready' || normalized === 'fix_ready') {
    return translate('helpDelivererStatusFixReadyLabel', fallback);
  }
  if (normalized === 'resolved') return translate('helpDelivererStatusResolvedLabel', fallback);
  return fallback;
};
