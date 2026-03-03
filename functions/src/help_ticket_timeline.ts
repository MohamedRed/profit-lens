import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { resolveDelivererStatus } from "./help_ticket_deliverer_status";

export type DelivererTimelineStatus =
  | "received"
  | "analyzing"
  | "needs_info"
  | "fix_ready"
  | "resolved";

export type DelivererTimelineSource =
  | "submission"
  | "triage"
  | "agent"
  | "manual"
  | "backfill";

type ApplyDelivererStatusUpdateInput = {
  ticketRef: FirebaseFirestore.DocumentReference;
  updates: Record<string, unknown>;
  source: DelivererTimelineSource;
};

type ApplyDelivererStatusUpdateResult = {
  delivererStatus: DelivererTimelineStatus;
  delivererStatusMessage: string;
  warnings: string[];
  timelineEventAppended: boolean;
};

type TimelineEventSnapshot = {
  status?: string;
  message?: string;
};

export async function applyDelivererStatusUpdate(
  input: ApplyDelivererStatusUpdateInput
): Promise<ApplyDelivererStatusUpdateResult> {
  const db = input.ticketRef.firestore;
  return db.runTransaction(async (transaction) => {
    const ticketSnapshot = await transaction.get(input.ticketRef);
    const timelineCollection = input.ticketRef.collection("delivererTimeline");
    const latestQuery = timelineCollection
      .orderBy("at", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(1);
    const latestSnapshot = await transaction.get(latestQuery);
    const latestEvent = latestSnapshot.docs[0]?.data() as
      | TimelineEventSnapshot
      | undefined;

    if (!ticketSnapshot.exists) {
      throw new Error(`Ticket not found: ${input.ticketRef.path}`);
    }

    const currentData = (ticketSnapshot.data() ?? {}) as Record<string, unknown>;
    const nextData = {
      ...currentData,
      ...input.updates,
    };
    const resolution = resolveDelivererStatus({
      status: asString(nextData.status),
      codingAgentStatus: asString(nextData.codingAgentStatus),
      aiNeedsUserAction: asBoolean(nextData.aiNeedsUserAction),
      locale: asString(nextData.locale),
    });

    const shouldAppend = shouldAppendTimelineEvent({
      latestEvent,
      nextStatus: resolution.delivererStatus,
      nextMessage: resolution.delivererStatusMessage,
    });

    transaction.set(
      input.ticketRef,
      {
        ...input.updates,
        delivererStatus: resolution.delivererStatus,
        delivererStatusMessage: resolution.delivererStatusMessage,
        delivererStatusUpdatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (shouldAppend) {
      transaction.set(timelineCollection.doc(), {
        status: resolution.delivererStatus,
        message: resolution.delivererStatusMessage,
        at: FieldValue.serverTimestamp(),
        source: input.source,
      });
    }

    return {
      delivererStatus: resolution.delivererStatus,
      delivererStatusMessage: resolution.delivererStatusMessage,
      warnings: resolution.warnings,
      timelineEventAppended: shouldAppend,
    };
  });
}

export function shouldAppendTimelineEvent(input: {
  latestEvent?: TimelineEventSnapshot;
  nextStatus: DelivererTimelineStatus;
  nextMessage: string;
}) {
  if (!input.latestEvent) {
    return true;
  }
  if (input.latestEvent.status !== input.nextStatus) {
    return true;
  }
  return input.latestEvent.message !== input.nextMessage;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}
