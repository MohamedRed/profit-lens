import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type DocumentSnapshot,
  type QuerySnapshot,
  writeBatch,
} from 'firebase/firestore';
import { callTranscribeHelpDraftAudio } from '../../firebase/callables';
import type {
  HelpAttachmentDraft,
  HelpTicket,
  HelpTicketAttachment,
  HelpTicketTimelineEvent,
} from '../../types/help';
import { getDb, nowServer } from '../../firebase/firestore';
import { uploadFileAndGetUrl } from '../../firebase/storage';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const asDate = (value: unknown): Date | null => {
  if (value && typeof value === 'object' && 'toDate' in (value as { toDate: unknown })) {
    const maybe = value as { toDate: () => Date };
    return maybe.toDate();
  }
  return null;
};

const mapTicket = (id: string, data: Record<string, unknown>): HelpTicket => {
  return {
    id,
    title: (data.title as string | undefined) ?? null,
    description: String(data.description ?? ''),
    status: String(data.status ?? 'open'),
    delivererStatus: String(data.delivererStatus ?? 'received'),
    delivererStatusMessage: (data.delivererStatusMessage as string | undefined) ?? null,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
    imageCount: Number(data.imageCount ?? 0),
    audioCount: Number(data.audioCount ?? 0),
  };
};

const mapAttachment = (
  id: string,
  data: Record<string, unknown>,
): HelpTicketAttachment | null => {
  const type = data.type === 'audio' ? 'audio' : data.type === 'image' ? 'image' : null;
  const url = data.url as string | undefined;
  const filename = data.filename as string | undefined;
  const contentType = data.contentType as string | undefined;
  if (!type || !url || !filename || !contentType) {
    return null;
  }
  return {
    id,
    type,
    url,
    storagePath: (data.storagePath as string | undefined) ?? null,
    filename,
    contentType,
    sizeBytes: Number(data.sizeBytes ?? 0),
    durationSeconds: data.durationSeconds == null ? null : Number(data.durationSeconds),
    uploadedAt: asDate(data.uploadedAt),
  };
};

const mapTimeline = (
  id: string,
  data: Record<string, unknown>,
): HelpTicketTimelineEvent | null => {
  const status = data.status as string | undefined;
  const message = data.message as string | undefined;
  if (!status || !message) {
    return null;
  }
  return {
    id,
    status,
    message,
    at: asDate(data.at),
    source: (data.source as string | undefined) ?? null,
  };
};

const storagePath = (uid: string, ticketId: string, attachmentId: string, filename: string) => {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `users/${uid}/helpTickets/${ticketId}/attachments/${attachmentId}-${safeFilename}`;
};

export const watchHelpTickets = (
  uid: string,
  callback: (tickets: HelpTicket[]) => void,
  onError?: (error: unknown) => void,
): (() => void) => {
  const ticketsRef = collection(getDb(), 'users', uid, 'helpTickets');
  const ticketsQuery = query(ticketsRef, orderBy('updatedAt', 'desc'));
  return onSnapshot(
    ticketsQuery,
    (snapshot: QuerySnapshot) => {
      const tickets = snapshot.docs.map((item) => mapTicket(item.id, item.data() as Record<string, unknown>));
      callback(tickets);
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const watchHelpTicket = (
  uid: string,
  ticketId: string,
  callback: (ticket: HelpTicket | null) => void,
  onError?: (error: unknown) => void,
): (() => void) => {
  const ref = doc(getDb(), 'users', uid, 'helpTickets', ticketId);
  return onSnapshot(
    ref,
    (snapshot: DocumentSnapshot) => {
      const raw = snapshot.data() as Record<string, unknown> | undefined;
      if (!snapshot.exists() || !raw) {
        callback(null);
        return;
      }
      callback(mapTicket(snapshot.id, raw));
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const watchHelpTicketAttachments = (
  uid: string,
  ticketId: string,
  callback: (attachments: HelpTicketAttachment[]) => void,
  onError?: (error: unknown) => void,
): (() => void) => {
  const ref = collection(getDb(), 'users', uid, 'helpTickets', ticketId, 'attachments');
  const attachmentQuery = query(ref, orderBy('uploadedAt', 'asc'));
  return onSnapshot(
    attachmentQuery,
    (snapshot: QuerySnapshot) => {
      const attachments = snapshot.docs
        .map((item) => mapAttachment(item.id, item.data() as Record<string, unknown>))
        .filter((value): value is HelpTicketAttachment => value !== null);
      callback(attachments);
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const watchHelpTicketTimeline = (
  uid: string,
  ticketId: string,
  callback: (events: HelpTicketTimelineEvent[]) => void,
  onError?: (error: unknown) => void,
): (() => void) => {
  const ref = collection(getDb(), 'users', uid, 'helpTickets', ticketId, 'delivererTimeline');
  const timelineQuery = query(ref, orderBy('at', 'desc'));
  return onSnapshot(
    timelineQuery,
    (snapshot: QuerySnapshot) => {
      const events = snapshot.docs
        .map((item) => mapTimeline(item.id, item.data() as Record<string, unknown>))
        .filter((value): value is HelpTicketTimelineEvent => value !== null);
      callback(events);
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const transcribeHelpAudio = async (params: {
  file: File;
  locale: string;
}): Promise<string | null> => {
  const bytes = await params.file.arrayBuffer();
  const uint8 = new Uint8Array(bytes);
  let binary = '';
  for (let index = 0; index < uint8.length; index += 1) {
    binary += String.fromCharCode(uint8[index]);
  }
  const payload = await callTranscribeHelpDraftAudio({
    audio: btoa(binary),
    contentType: params.file.type || 'audio/webm',
    locale: params.locale,
  });
  const transcript = payload.transcript;
  if (typeof transcript !== 'string') {
    return null;
  }
  const trimmed = transcript.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const createHelpTicket = async (params: {
  uid: string;
  locale: string;
  deviceId: string;
  platform: string;
  description: string;
  attachments: HelpAttachmentDraft[];
}) => {
  const ticketId = createId();
  const ticketRef = doc(getDb(), 'users', params.uid, 'helpTickets', ticketId);
  const attachmentCollection = collection(getDb(), 'users', params.uid, 'helpTickets', ticketId, 'attachments');

  const uploaded = [] as Array<{
    id: string;
    type: 'image' | 'audio';
    url: string;
    storagePath: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    durationSeconds?: number;
  }>;

  for (const attachment of params.attachments) {
    const attachmentId = createId();
    const objectPath = storagePath(params.uid, ticketId, attachmentId, attachment.filename);
    const url = await uploadFileAndGetUrl(objectPath, attachment.file, attachment.contentType);
    uploaded.push({
      id: attachmentId,
      type: attachment.type,
      url,
      storagePath: objectPath,
      filename: attachment.filename,
      contentType: attachment.contentType,
      sizeBytes: attachment.file.size,
      durationSeconds: attachment.durationSeconds,
    });
  }

  const imageCount = uploaded.filter((item) => item.type === 'image').length;
  const audioCount = uploaded.filter((item) => item.type === 'audio').length;

  const batch = writeBatch(getDb());
  batch.set(ticketRef, {
    description: params.description,
    status: 'open',
    delivererStatus: 'received',
    delivererStatusMessage: params.locale.startsWith('fr')
      ? 'Ticket reçu.'
      : params.locale.startsWith('ar')
        ? 'تم استلام التذكرة.'
        : 'Ticket received.',
    delivererStatusUpdatedAt: nowServer(),
    deviceId: params.deviceId,
    platform: params.platform,
    locale: params.locale,
    imageCount,
    audioCount,
    transcriptionStatus: audioCount > 0 && params.description.trim().length === 0 ? 'pending' : null,
    createdAt: nowServer(),
    updatedAt: nowServer(),
  });

  for (const item of uploaded) {
    const attachmentRef = doc(attachmentCollection, item.id);
    batch.set(attachmentRef, {
      type: item.type,
      url: item.url,
      storagePath: item.storagePath,
      filename: item.filename,
      contentType: item.contentType,
      sizeBytes: item.sizeBytes,
      durationSeconds: item.durationSeconds ?? null,
      uploadedAt: nowServer(),
    });
  }

  await batch.commit();
};
