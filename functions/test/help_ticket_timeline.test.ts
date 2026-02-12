import { describe, expect, it } from "vitest";
import {
  applyDelivererStatusUpdate,
  shouldAppendTimelineEvent,
} from "../src/help_ticket_timeline";

describe("shouldAppendTimelineEvent", () => {
  it("returns true when no latest event exists", () => {
    expect(
      shouldAppendTimelineEvent({
        latestEvent: undefined,
        nextStatus: "received",
        nextMessage: "Ticket received.",
      })
    ).toBe(true);
  });

  it("returns false when status and message are unchanged", () => {
    expect(
      shouldAppendTimelineEvent({
        latestEvent: {
          status: "analyzing",
          message: "Analysis in progress.",
        },
        nextStatus: "analyzing",
        nextMessage: "Analysis in progress.",
      })
    ).toBe(false);
  });

  it("returns true when status changes", () => {
    expect(
      shouldAppendTimelineEvent({
        latestEvent: {
          status: "analyzing",
          message: "Analysis in progress.",
        },
        nextStatus: "needs_info",
        nextMessage: "We need additional information to continue.",
      })
    ).toBe(true);
  });

  it("returns true when message changes with same status", () => {
    expect(
      shouldAppendTimelineEvent({
        latestEvent: {
          status: "analyzing",
          message: "Analysis in progress.",
        },
        nextStatus: "analyzing",
        nextMessage: "Analyse en cours.",
      })
    ).toBe(true);
  });
});

describe("applyDelivererStatusUpdate", () => {
  it("writes root status fields and appends timeline when changed", async () => {
    const writes: Array<{ target: string; data: Record<string, unknown> }> = [];
    const ticketData = {
      status: "in_progress",
      locale: "fr",
      aiNeedsUserAction: false,
    };
    const latestEvent = {
      status: "received",
      message: "Ticket reçu.",
    };
    const ticketRef = createMockTicketRef({
      ticketData,
      latestEvent,
      writes,
    });

    const result = await applyDelivererStatusUpdate({
      ticketRef,
      source: "agent",
      updates: {
        codingAgentStatus: "pr_created",
      },
    });

    expect(result.delivererStatus).toBe("fix_ready");
    expect(result.timelineEventAppended).toBe(true);
    expect(writes).toHaveLength(2);
    expect(writes[0].target).toBe("ticket");
    expect(writes[0].data.delivererStatus).toBe("fix_ready");
    expect(writes[1].target).toBe("timeline");
    expect(writes[1].data.status).toBe("fix_ready");
    expect(writes[1].data.source).toBe("agent");
  });

  it("keeps writes consistent without duplicate timeline event", async () => {
    const writes: Array<{ target: string; data: Record<string, unknown> }> = [];
    const ticketData = {
      status: "in_progress",
      locale: "fr",
      aiNeedsUserAction: false,
      codingAgentStatus: "running",
    };
    const latestEvent = {
      status: "analyzing",
      message: "Analyse en cours.",
    };
    const ticketRef = createMockTicketRef({
      ticketData,
      latestEvent,
      writes,
    });

    const result = await applyDelivererStatusUpdate({
      ticketRef,
      source: "agent",
      updates: {
        codingAgentStatus: "running",
      },
    });

    expect(result.delivererStatus).toBe("analyzing");
    expect(result.timelineEventAppended).toBe(false);
    expect(writes).toHaveLength(1);
    expect(writes[0].target).toBe("ticket");
    expect(writes[0].data.delivererStatus).toBe("analyzing");
  });
});

function createMockTicketRef(input: {
  ticketData: Record<string, unknown>;
  latestEvent?: Record<string, unknown>;
  writes: Array<{ target: string; data: Record<string, unknown> }>;
}) {
  const latestQuery = { kind: "latestQuery" };
  const timelineCollection = {
    orderBy: () => ({
      orderBy: () => ({
        limit: () => latestQuery,
      }),
    }),
    doc: () => ({ kind: "timelineDoc" }),
  };
  const ticketRef = {
    path: "users/uid/helpTickets/ticketId",
    firestore: {
      runTransaction: async (fn: (transaction: any) => Promise<any>) => {
        const transaction = {
          get: async (ref: unknown) => {
            if (ref === ticketRef) {
              return {
                exists: true,
                data: () => input.ticketData,
              };
            }
            if (ref === latestQuery) {
              return {
                docs: input.latestEvent
                  ? [{ data: () => input.latestEvent }]
                  : [],
              };
            }
            throw new Error("Unexpected get target");
          },
          set: (ref: unknown, data: Record<string, unknown>) => {
            if (ref === ticketRef) {
              input.writes.push({ target: "ticket", data });
              return;
            }
            input.writes.push({ target: "timeline", data });
          },
        };
        return fn(transaction);
      },
    },
    collection: (_name: string) => timelineCollection,
  };
  return ticketRef as unknown as FirebaseFirestore.DocumentReference;
}
