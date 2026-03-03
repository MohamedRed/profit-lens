import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { getAuth, db } from "../firebase_admin";
import { ADMIN_ACCESS_DOC_PATH } from "./constants";
import { isValidEmail, normalizeEmail } from "./masks";
import type { AdminPrincipal } from "./types";

export async function assertAdminAccess(request: {
  auth?: {
    uid?: string;
    token?: Record<string, unknown>;
  } | null;
}): Promise<AdminPrincipal> {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const claims = request.auth?.token ?? {};
  if (claims.admin !== true) {
    throw new HttpsError("permission-denied", "Admin role is required.");
  }

  const email = await resolveCallerEmail(uid, claims);
  const normalizedEmail = normalizeEmail(email);
  const allowlist = await readAllowedAdminEmails();

  if (!allowlist.has(normalizedEmail)) {
    throw new HttpsError("permission-denied", "Admin access is not allowlisted.");
  }

  return {
    uid,
    email,
    normalizedEmail,
  };
}

export async function readAllowedAdminEmails(): Promise<Set<string>> {
  const snapshot = await db.doc(ADMIN_ACCESS_DOC_PATH).get();
  const raw = snapshot.data() as { allowedEmails?: unknown } | undefined;

  const emails = Array.isArray(raw?.allowedEmails)
    ? raw?.allowedEmails
    : [];

  const normalized = emails
    .map((item) => (typeof item === "string" ? normalizeEmail(item) : ""))
    .filter((email) => isValidEmail(email));

  return new Set(normalized);
}

async function resolveCallerEmail(
  uid: string,
  claims: Record<string, unknown>
): Promise<string> {
  const tokenEmail = claims.email;
  if (typeof tokenEmail === "string" && tokenEmail.trim()) {
    return tokenEmail;
  }

  const authUser = await getAuth().getUser(uid);
  if (typeof authUser.email === "string" && authUser.email.trim()) {
    return authUser.email;
  }

  throw new HttpsError(
    "permission-denied",
    "Caller must have a verified email to access admin APIs."
  );
}

export async function writeAdminAllowlist(allowedEmails: string[]) {
  const normalized = Array.from(
    new Set(
      allowedEmails
        .map((email) => normalizeEmail(email))
        .filter((email) => isValidEmail(email))
    )
  ).sort();

  await db.doc(ADMIN_ACCESS_DOC_PATH).set(
    {
      allowedEmails: normalized,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return normalized;
}
