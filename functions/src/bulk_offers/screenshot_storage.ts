import { createHash } from "node:crypto";
import { HttpsError } from "firebase-functions/v2/https";
import { storage } from "../firebase_admin";
import { ScreenshotRef } from "./types";

const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;

const mimeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadBulkScreenshot(params: {
  uid: string;
  imageBase64: string;
  mimeType: string;
}): Promise<ScreenshotRef> {
  const extension = mimeToExtension[params.mimeType];
  if (!extension) {
    throw new HttpsError("invalid-argument", "Unsupported screenshot mimeType.");
  }

  const bytes = Buffer.from(params.imageBase64, "base64");
  if (bytes.length === 0) {
    throw new HttpsError("invalid-argument", "Empty screenshot payload.");
  }
  if (bytes.length > MAX_SCREENSHOT_BYTES) {
    throw new HttpsError("invalid-argument", "Screenshot payload too large.");
  }

  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const month = new Date().toISOString().slice(0, 7);
  const path = `users/${params.uid}/offerImports/uploads/${month}/${sha256}.${extension}`;
  const bucket = storage.bucket();
  const file = bucket.file(path);
  await file.save(bytes, {
    metadata: {
      contentType: params.mimeType,
      metadata: {
        ownerUid: params.uid,
        sha256,
      },
    },
    resumable: false,
    validation: false,
  });

  return {
    bucket: bucket.name,
    path,
    sha256,
    uploadedAtIso: new Date().toISOString(),
  };
}

export function assertScreenshotRefOwnership(uid: string, path: string) {
  if (!path.startsWith(`users/${uid}/offerImports/`)) {
    throw new HttpsError("permission-denied", "Screenshot path is not owned by caller.");
  }
}
