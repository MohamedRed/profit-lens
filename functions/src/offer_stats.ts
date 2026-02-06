import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase_admin";

const REGION = "europe-west1";

export const syncOfferDailyStats = onDocumentWritten(
  {
    document: "users/{uid}/offers/{offerId}",
    region: REGION,
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    if (!beforeData && !afterData) {
      return;
    }
    const uid = event.params.uid as string;

    const before = extractOfferDelta(beforeData);
    const after = extractOfferDelta(afterData);

    if (before && after && before.dayId === after.dayId && before.netProfit === after.netProfit) {
      return;
    }

    const updates = [
      before ? { ...before, multiplier: -1 } : null,
      after ? { ...after, multiplier: 1 } : null,
    ].filter(Boolean) as Array<
      OfferDelta & { multiplier: number }
    >;

    await Promise.all(
      updates.map((update) => applyDelta(uid, update))
    );
  }
);

type OfferDelta = {
  dayId: string;
  dayStart: Date;
  netProfit: number;
};

function extractOfferDelta(data?: Record<string, unknown>): OfferDelta | null {
  if (!data) return null;
  const createdAt = data.createdAt as Timestamp | undefined;
  if (!createdAt) return null;
  const breakdown = data.breakdown as Record<string, unknown> | undefined;
  const netProfit = (breakdown?.netProfit as number | undefined) ?? null;
  if (netProfit == null) return null;
  const dayStart = toUtcDayStart(createdAt.toDate());
  const dayId = dayStart.toISOString().slice(0, 10);
  return { dayId, dayStart, netProfit };
}

function toUtcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function applyDelta(
  uid: string,
  update: OfferDelta & { multiplier: number }
) {
  const statsRef = db
    .collection("users")
    .doc(uid)
    .collection("offerStats")
    .doc(update.dayId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(statsRef);
    const current = snap.data() as
      | { count?: number; netProfitSum?: number }
      | undefined;
    const nextCount = (current?.count ?? 0) + update.multiplier;
    const nextSum = (current?.netProfitSum ?? 0) +
      update.netProfit * update.multiplier;

    if (nextCount <= 0) {
      tx.delete(statsRef);
      return;
    }

    tx.set(
      statsRef,
      {
        dayId: update.dayId,
        dayStart: Timestamp.fromDate(update.dayStart),
        count: nextCount,
        netProfitSum: nextSum,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }).catch((error) => {
    logger.error("Failed to sync offer stats", {
      uid,
      dayId: update.dayId,
      error,
    });
    throw error;
  });
}
