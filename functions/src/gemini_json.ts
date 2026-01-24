import { HttpsError } from "firebase-functions/v2/https";

export function parseGeminiJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) {
    throw new HttpsError("internal", "Gemini response was not JSON.");
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (error) {
    throw new HttpsError("internal", "Failed to parse Gemini JSON response.");
  }
}
