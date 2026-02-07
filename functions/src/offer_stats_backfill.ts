import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase_admin";

const REGION = "europe-west1";
const backfillKey = defineSecret("BACKFILL_KEY");
const OFFER_BATCH_SIZE = 500;
const USER_BATCH_SIZE = 500;

export const backfillOfferStats = onRequest(
  {
    region: REGION,
    timeoutSeconds: 540,
    memory: "512MiB",
    secrets: [backfillKey],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST." });
      return;
    }
    const providedKey =
      req.header("x-backfill-key") ??
      (typeof req.query.key === "string" ? req.query.key : null);
    if (!providedKey || providedKey !== backfillKey.value()) {
      res.status(403).json({ error: "Unauthorized." });
      return;
    }

    const uid =
      (req.body?.uid as string | undefined) ??
      (typeof req.query.uid === "string" ? req.query.uid : undefined);
    const scope =
      (req.body?.scope as string | undefined) ??
      (typeof req.query.scope === "string" ? req.query.scope : undefined);

    if (!uid && scope !== "all") {
      res.status(400).json({ error: "Provide uid or scope=all." });
      return;
    }

    const uids = uid ? [uid] : await listUserIds();
    const summary = {
      usersProcessed: 0,
      offersProcessed: 0,
      statsWritten: 0,
      statsDeleted: 0,
      users: [] as Array<{
        uid: string;
        offers: number;
        statsWritten: number;
        statsDeleted: number;
      }>,
    };

    for (const userId of uids) {
      const result = await backfillUserStats(userId);
      summary.usersProcessed += 1;
      summary.offersProcessed += result.offers;
      summary.statsWritten += result.statsWritten;
      summary.statsDeleted += result.statsDeleted;
      summary.users.push({
        uid: userId,
        offers: result.offers,
        statsWritten: result.statsWritten,
        statsDeleted: result.statsDeleted,
      });
    }

    res.status(200).json(summary);
  }
);

async function listUserIds(): Promise<string[]> {
  const ids: string[] = [];
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  while (true) {
    let query = db
      .collection("users")
      .orderBy(FieldPath.documentId())
      .limit(USER_BATCH_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    const snap = await query.get();
    if (snap.empty) {
      break;
    }
    for (const doc of snap.docs) {
      ids.push(doc.id);
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < USER_BATCH_SIZE) {
      break;
    }
  }
  return ids;
}

type OfferDelta = {
  dayId: string;
  dayStart: Date;
  netProfit: number;
};

type BackfillResult = {
  offers: number;
  statsWritten: number;
  statsDeleted: number;
};

async function backfillUserStats(uid: string): Promise<BackfillResult> {
  const statsMap = new Map<
    string,
    { dayStart: Date; count: number; netProfitSum: number }
  >();

  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  let offersProcessed = 0;

  while (true) {
    let query = db
      .collection("users")
      .doc(uid)
      .collection("offers")
      .orderBy("createdAt")
      .limit(OFFER_BATCH_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    const snap = await query.get();
    if (snap.empty) {
      break;
    }
    for (const doc of snap.docs) {
      offersProcessed += 1;
      const delta = extractOfferDelta(doc.data());
      if (!delta) {
        continue;
      }
      const current = statsMap.get(delta.dayId) ?? {
        dayStart: delta.dayStart,
        count: 0,
        netProfitSum: 0,
      };
      current.count += 1;
      current.netProfitSum += delta.netProfit;
      statsMap.set(delta.dayId, current);
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < OFFER_BATCH_SIZE) {
      break;
    }
  }

  const statsRef = db
    .collection("users")
    .doc(uid)
    .collection("offerStats");
  const existingSnap = await statsRef.get();
  const nextIds = new Set(statsMap.keys());

  let statsWritten = 0;
  let statsDeleted = 0;

  let batch = db.batch();
  let batchCount = 0;
  const commitBatch = async () => {
    if (batchCount === 0) return;
    await batch.commit();
    batch = db.batch();
    batchCount = 0;
  };

  for (const [dayId, stats] of statsMap.entries()) {
    const docRef = statsRef.doc(dayId);
    batch.set(
      docRef,
      {
        dayId,
        dayStart: Timestamp.fromDate(stats.dayStart),
        count: stats.count,
        netProfitSum: stats.netProfitSum,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    statsWritten += 1;
    batchCount += 1;
    if (batchCount >= 450) {
      await commitBatch();
    }
  }

  for (const doc of existingSnap.docs) {
    if (!nextIds.has(doc.id)) {
      batch.delete(doc.ref);
      statsDeleted += 1;
      batchCount += 1;
      if (batchCount >= 450) {
        await commitBatch();
      }
    }
  }

  await commitBatch();

  logger.info("Backfilled offer stats", {
    uid,
    offersProcessed,
    statsWritten,
    statsDeleted,
  });

  return {
    offers: offersProcessed,
    statsWritten,
    statsDeleted,
  };
}

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
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
