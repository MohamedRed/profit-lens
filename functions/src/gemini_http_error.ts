import { HttpsError } from "firebase-functions/v2/https";

const isGeminiQuotaError = (status: number, errorText: string): boolean => {
  if (status === 429) {
    return true;
  }
  const normalized = errorText.toLowerCase();
  return (
    normalized.includes("resource_exhausted") ||
    normalized.includes("exceeded your current quota")
  );
};

export const buildGeminiHttpError = (
  status: number,
  errorText: string
): HttpsError => {
  if (isGeminiQuotaError(status, errorText)) {
    return new HttpsError(
      "resource-exhausted",
      "Gemini quota exceeded. Upgrade Gemini API billing or wait for quota reset."
    );
  }

  if (status === 401 || status === 403) {
    return new HttpsError(
      "failed-precondition",
      "Gemini API authentication failed."
    );
  }

  return new HttpsError(
    "internal",
    `Gemini API error (${status}): ${errorText}`
  );
};
