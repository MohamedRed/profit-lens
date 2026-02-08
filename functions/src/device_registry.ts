import { onCall, HttpsError } from "firebase-functions/v2/https";
import { QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase_admin";
import { ensureEntitlement } from "./entitlements";

type DevicePayload = {
  deviceId?: string;
  platform?: string;
  userAgent?: string;
  replaceDeviceId?: string;
};

type DeviceResponse = {
  deviceId: string;
  platform: string;
  firstSeen?: string;
  lastSeen?: string;
  active: boolean;
};

export const registerDevice = onCall(
  {
    cors: true,
    timeoutSeconds: 15,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const payload = request.data as DevicePayload;
    return registerDeviceCore({ uid, payload });
  }
);

export async function registerDeviceCore(params: {
  uid: string;
  payload: DevicePayload;
}) {
  const deviceId = params.payload?.deviceId?.trim();
  if (!deviceId) {
    throw new HttpsError("invalid-argument", "Missing deviceId.");
  }
  const platform = params.payload?.platform?.trim() ?? "";
  const userAgent = params.payload?.userAgent?.trim() ?? "";
  const replaceDeviceId = params.payload?.replaceDeviceId?.trim();
  const entitlement = await ensureEntitlement(params.uid);
  const deviceLimit = entitlement.deviceLimit ?? 1;
  const devicesRef = db.collection("users").doc(params.uid).collection("devices");
  const activeQuery = devicesRef.where("active", "==", true);
  const now = Timestamp.now();

  await db.runTransaction(async (tx) => {
    const activeSnapshot = await tx.get(activeQuery);
    const activeDocs = activeSnapshot.docs ?? [];
    const activeIds = new Set(activeDocs.map((doc) => doc.id));
    const deviceRef = devicesRef.doc(deviceId);
    if (activeIds.has(deviceId)) {
      tx.set(
        deviceRef,
        {
          deviceId,
          platform,
          userAgent,
          lastSeen: now,
          active: true,
          updatedAt: now,
        },
        { merge: true }
      );
      return;
    }
    if (activeDocs.length < deviceLimit) {
      tx.set(
        deviceRef,
        {
          deviceId,
          platform,
          userAgent,
          firstSeen: now,
          lastSeen: now,
          active: true,
          updatedAt: now,
        },
        { merge: true }
      );
      return;
    }
    if (replaceDeviceId) {
      const replaceRef = devicesRef.doc(replaceDeviceId);
      tx.set(
        replaceRef,
        {
          deviceId: replaceDeviceId,
          active: false,
          updatedAt: now,
        },
        { merge: true }
      );
      tx.set(
        deviceRef,
        {
          deviceId,
          platform,
          userAgent,
          firstSeen: now,
          lastSeen: now,
          active: true,
          updatedAt: now,
        },
        { merge: true }
      );
      return;
    }
    throw new HttpsError("resource-exhausted", "Device limit reached.", {
      deviceLimit,
      activeDevices: activeDocs.map((doc) => serializeDevice(doc)),
    });
  });

  const updatedSnapshot = await activeQuery.get();
  return {
    deviceLimit,
    activeDevices: updatedSnapshot.docs.map((doc) => serializeDevice(doc)),
  };
}

export const revokeDevice = onCall(
  {
    cors: true,
    timeoutSeconds: 15,
    memory: "128MiB",
    region: "europe-west1",
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const payload = request.data as { deviceId?: string };
    const deviceId = payload?.deviceId?.trim();
    if (!deviceId) {
      throw new HttpsError("invalid-argument", "Missing deviceId.");
    }
    const deviceRef = db
      .collection("users")
      .doc(uid)
      .collection("devices")
      .doc(deviceId);
    await deviceRef.set(
      {
        deviceId,
        active: false,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    return { status: "revoked" };
  }
);

export async function assertDeviceActive(uid: string, deviceId: string) {
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("devices")
    .doc(deviceId)
    .get();
  if (!snapshot.exists) {
    throw new HttpsError("failed-precondition", "Device not registered.");
  }
  if (snapshot.data()?.active === false) {
    throw new HttpsError("failed-precondition", "Device inactive.");
  }
}

function serializeDevice(doc: QueryDocumentSnapshot): DeviceResponse {
  const data = doc.data() as Record<string, any>;
  return {
    deviceId: doc.id,
    platform: data.platform ?? "",
    firstSeen: toIsoString(data.firstSeen),
    lastSeen: toIsoString(data.lastSeen),
    active: data.active ?? true,
  };
}

function toIsoString(value: unknown) {
  if (value && typeof (value as any).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return undefined;
}
