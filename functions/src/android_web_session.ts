import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assertDeviceActive } from "./device_registry";
import { getAuth } from "./firebase_admin";

interface AndroidWebSessionPayload {
  deviceId?: unknown;
}

export interface AndroidWebSessionResponse {
  customToken: string;
}

const androidWebSessionCallableConfig = {
  cors: true,
  timeoutSeconds: 20,
  memory: "256MiB" as const,
  region: "europe-west1",
};

export const createAndroidWebSession = onCall(
  androidWebSessionCallableConfig,
  async (request): Promise<AndroidWebSessionResponse> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const payload = readAndroidWebSessionPayload(request.data);
    await assertDeviceActive(uid, payload.deviceId);
    return createAndroidWebSessionCore({
      uid,
      deviceId: payload.deviceId,
    });
  },
);

export async function createAndroidWebSessionCore(input: {
  uid: string;
  deviceId: string;
}): Promise<AndroidWebSessionResponse> {
  const customToken = await getAuth().createCustomToken(input.uid, {
    deviceId: input.deviceId,
    platform: "android",
    target: "qwik-webview",
  });
  return { customToken };
}

function readAndroidWebSessionPayload(input: unknown): { deviceId: string } {
  const payload = (input ?? {}) as AndroidWebSessionPayload;
  const deviceId = typeof payload.deviceId === "string" ? payload.deviceId.trim() : "";
  if (!deviceId) {
    throw new HttpsError("invalid-argument", "Device is required.");
  }
  return { deviceId };
}
