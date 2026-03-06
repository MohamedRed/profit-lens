import { DocumentData, DocumentReference, Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase_admin";
import { EntitlementSnapshot, usageDocRef } from "./entitlements";

export async function saveOfferWithUsage(params: {
  uid: string;
  entitlement: EntitlementSnapshot;
  docRef: DocumentReference;
  document: DocumentData;
}) {
  await saveOffersWithUsage({
    uid: params.uid,
    entitlement: params.entitlement,
    writes: [{ docRef: params.docRef, document: params.document }],
  });
}

export async function saveOffersWithUsage(params: {
  uid: string;
  entitlement: EntitlementSnapshot;
  writes: Array<{ docRef: DocumentReference; document: DocumentData }>;
  usageIncrement?: number;
}): Promise<{ usedAfter: number }> {
  const { uid, entitlement } = params;
  if (params.writes.length === 0) {
    throw new HttpsError("invalid-argument", "No offers to save.");
  }
  const offerWrites = params.usageIncrement ?? params.writes.length;
  if (offerWrites <= 0) {
    throw new HttpsError("invalid-argument", "usageIncrement must be positive.");
  }
  const usageRef = usageDocRef(uid, entitlement.periodKey);
  const now = Timestamp.now();
  let usedAfter = 0;
  await db.runTransaction(async (tx) => {
    const usageSnapshot = await tx.get(usageRef);
    const currentCount = usageSnapshot.exists
      ? Number(usageSnapshot.data()?.offerCount ?? 0)
      : 0;
    if (
      entitlement.offerLimit != null &&
      currentCount + offerWrites > entitlement.offerLimit
    ) {
      throw new HttpsError("resource-exhausted", "Offer limit reached.", {
        offerLimit: entitlement.offerLimit,
        used: currentCount,
      });
    }
    usedAfter = currentCount + offerWrites;
    tx.set(
      usageRef,
      {
        periodStart: Timestamp.fromDate(entitlement.periodStart),
        periodEnd: Timestamp.fromDate(entitlement.periodEnd),
        offerCount: usedAfter,
        updatedAt: now,
      },
      { merge: true }
    );
    for (const write of params.writes) {
      tx.set(write.docRef, write.document, { merge: true });
    }
  });
  return { usedAfter };
}

export async function readOfferUsageCount(params: {
  uid: string;
  entitlement: EntitlementSnapshot;
}): Promise<number> {
  const usageRef = usageDocRef(params.uid, params.entitlement.periodKey);
  let currentCount = 0;
  await db.runTransaction(async (tx) => {
    const usageSnapshot = await tx.get(usageRef);
    currentCount = usageSnapshot.exists
      ? Number(usageSnapshot.data()?.offerCount ?? 0)
      : 0;
  });
  return currentCount;
}

export async function assertOfferLimitAvailable(params: {
  uid: string;
  entitlement: EntitlementSnapshot;
}) {
  const { entitlement } = params;
  if (entitlement.offerLimit == null) {
    return;
  }
  const currentCount = await readOfferUsageCount(params);
  if (currentCount >= entitlement.offerLimit) {
    throw new HttpsError("resource-exhausted", "Offer limit reached.", {
      offerLimit: entitlement.offerLimit,
      used: currentCount,
    });
  }
}

export async function assertOfferLimitAvailableForCount(params: {
  uid: string;
  entitlement: EntitlementSnapshot;
  requestedCount: number;
}) {
  if (params.requestedCount <= 0) {
    throw new HttpsError("invalid-argument", "requestedCount must be positive.");
  }
  const { uid, entitlement, requestedCount } = params;
  if (entitlement.offerLimit == null) {
    return;
  }
  const currentCount = await readOfferUsageCount({
    uid,
    entitlement,
  });
  if (currentCount + requestedCount > entitlement.offerLimit) {
    throw new HttpsError("resource-exhausted", "Offer limit reached.", {
      offerLimit: entitlement.offerLimit,
      used: currentCount,
      requestedCount,
    });
  }
}
