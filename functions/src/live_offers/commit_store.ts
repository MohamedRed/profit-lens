import { Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import type { EntitlementSnapshot } from "../entitlements";
import { usageDocRef } from "../entitlements";
import type { LiveOfferProvider } from "../profitability_types";

export async function commitLiveOfferStorage(params: {
  uid: string;
  entitlement: EntitlementSnapshot;
  deviceId: string;
  liveOfferSessionId: string;
  provider: LiveOfferProvider;
  offerId: string;
  offerDocument: Record<string, unknown>;
}) {
  const sessionRef = db
    .collection("users")
    .doc(params.uid)
    .collection("liveOfferSessions")
    .doc(buildLiveOfferCommitDocId(params.deviceId, params.liveOfferSessionId));
  const offerRef = db
    .collection("users")
    .doc(params.uid)
    .collection("offers")
    .doc(params.offerId);
  const usageRef = usageDocRef(params.uid, params.entitlement.periodKey);
  const now = Timestamp.now();

  let status: "committed" | "deduplicated" = "committed";
  let usedAfter: number | null = null;
  let existingOfferId: string | null = null;

  await db.runTransaction(async (tx) => {
    const sessionSnapshot = await tx.get(sessionRef);
    if (sessionSnapshot.exists) {
      status = "deduplicated";
      existingOfferId = String(sessionSnapshot.data()?.offerId ?? "");
      if (!existingOfferId) {
        throw new HttpsError("internal", "Live offer session is missing the saved offer reference.");
      }
      return;
    }

    const usageSnapshot = await tx.get(usageRef);
    const currentCount = usageSnapshot.exists
      ? Number(usageSnapshot.data()?.offerCount ?? 0)
      : 0;
    if (
      params.entitlement.offerLimit != null &&
      currentCount + 1 > params.entitlement.offerLimit
    ) {
      throw new HttpsError("resource-exhausted", "Offer limit reached.", {
        offerLimit: params.entitlement.offerLimit,
        used: currentCount,
      });
    }
    usedAfter = currentCount + 1;
    tx.set(
      usageRef,
      {
        periodStart: Timestamp.fromDate(params.entitlement.periodStart),
        periodEnd: Timestamp.fromDate(params.entitlement.periodEnd),
        offerCount: usedAfter,
        updatedAt: now,
      },
      { merge: true }
    );
    tx.set(offerRef, params.offerDocument, { merge: true });
    tx.set(
      sessionRef,
      {
        deviceId: params.deviceId,
        liveOfferSessionId: params.liveOfferSessionId,
        provider: params.provider,
        offerId: params.offerId,
        committedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  });

  return {
    status,
    offerId: existingOfferId ?? params.offerId,
    usedAfter,
  };
}

export function buildLiveOfferCommitDocId(
  deviceId: string,
  liveOfferSessionId: string
): string {
  return `${encodeURIComponent(deviceId)}:${encodeURIComponent(liveOfferSessionId)}`;
}
