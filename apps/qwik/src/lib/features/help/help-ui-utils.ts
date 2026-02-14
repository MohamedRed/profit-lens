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
    list.push({
      type: attachmentType(file),
      filename: file.name,
      contentType: file.type,
      file,
    });
  }
  return list;
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
