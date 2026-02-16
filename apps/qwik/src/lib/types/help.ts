export interface HelpTicket {
  id: string;
  title?: string | null;
  description: string;
  status: string;
  delivererStatus: string;
  delivererStatusMessage?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  imageCount: number;
  audioCount: number;
}

export interface HelpAttachmentDraft {
  type: 'image' | 'audio';
  filename: string;
  contentType: string;
  file: File;
  previewUrl?: string;
  durationSeconds?: number;
}

export interface HelpTicketAttachment {
  id: string;
  type: 'image' | 'audio';
  url: string;
  storagePath?: string | null;
  filename: string;
  contentType: string;
  sizeBytes: number;
  durationSeconds?: number | null;
  uploadedAt?: Date | null;
}

export interface HelpTicketTimelineEvent {
  id: string;
  status: string;
  message: string;
  at: Date | null;
  source?: string | null;
}
