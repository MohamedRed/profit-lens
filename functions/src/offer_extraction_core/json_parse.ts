import { parseGeminiJson } from "../gemini_json";

export function parseExtractionJson<T>(payload: string): T {
  return parseGeminiJson(payload) as T;
}

export function shouldRetryExtractionJson(payload: string): boolean {
  const trimmed = payload.trim();
  if (!trimmed.startsWith("{")) {
    return false;
  }
  return payload.lastIndexOf("}") < 0;
}
