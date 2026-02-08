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
  const { uid, entitlement, docRef, document } = params;
  const usageRef = usageDocRef(uid, entitlement.periodKey);
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    const usageSnapshot = await tx.get(usageRef);
    const currentCount = usageSnapshot.exists
      ? Number(usageSnapshot.data()?.offerCount ?? 0)
      : 0;
    if (
      entitlement.offerLimit != null &&
      currentCount >= entitlement.offerLimit
    ) {
      throw new HttpsError("resource-exhausted", "Offer limit reached.", {
        offerLimit: entitlement.offerLimit,
        used: currentCount,
      });
    }
    const nextCount = currentCount + 1;
    tx.set(
      usageRef,
      {
        periodStart: Timestamp.fromDate(entitlement.periodStart),
        periodEnd: Timestamp.fromDate(entitlement.periodEnd),
        offerCount: nextCount,
        updatedAt: now,
      },
      { merge: true }
    );
    tx.set(docRef, document, { merge: true });
  });
}
