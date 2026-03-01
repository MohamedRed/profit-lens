import { HttpsError } from "firebase-functions/v2/https";
import { ADMIN_CURSOR_VERSION } from "./constants";

type CursorEnvelope<T> = {
  v: number;
  type: string;
  payload: T;
};

export function encodeCursor<T>(type: string, payload: T): string {
  const envelope: CursorEnvelope<T> = {
    v: ADMIN_CURSOR_VERSION,
    type,
    payload,
  };
  return Buffer.from(JSON.stringify(envelope), "utf8").toString("base64url");
}

export function decodeCursor<T>(input: string | undefined, expectedType: string): T | null {
  if (!input) {
    return null;
  }
  if (input.length > 2048) {
    throw new HttpsError("invalid-argument", "Cursor is too large.");
  }

  try {
    const decoded = Buffer.from(input, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as CursorEnvelope<unknown>;

    if (
      parsed == null ||
      typeof parsed !== "object" ||
      parsed.v !== ADMIN_CURSOR_VERSION ||
      parsed.type !== expectedType
    ) {
      throw new Error("Invalid envelope");
    }

    return parsed.payload as T;
  } catch {
    throw new HttpsError("invalid-argument", "Malformed cursor.");
  }
}

export function buildFilterKey(value: unknown): string {
  return JSON.stringify(value);
}
