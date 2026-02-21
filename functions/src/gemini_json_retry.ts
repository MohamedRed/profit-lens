import * as logger from "firebase-functions/logger";
import { requestGeminiJson } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";

type GeminiJsonRetryRequest = {
  model: string;
  prompt: string;
  schema: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  context?: Record<string, unknown>;
};

export async function requestGeminiJsonWithRetry<T>(
  request: GeminiJsonRetryRequest
): Promise<T> {
  const initialText = await requestGeminiJson(request);
  try {
    return parseGeminiJson(initialText) as T;
  } catch (error) {
    const diagnostics = buildGeminiDiagnostics(initialText);
    const shouldRetry =
      diagnostics.firstBraceIndex >= 0 &&
      diagnostics.lastBraceIndex < diagnostics.firstBraceIndex;
    if (!shouldRetry) {
      logGeminiJsonFailure({
        error,
        diagnostics,
        context: request.context,
      });
      throw error;
    }

    logger.warn("Gemini JSON incomplete, retrying", {
      ...diagnostics,
      ...request.context,
      model: request.model,
    });

    const retryText = await requestGeminiJson(request);
    try {
      return parseGeminiJson(retryText) as T;
    } catch (retryError) {
      logGeminiJsonFailure({
        error: retryError,
        diagnostics: buildGeminiDiagnostics(retryText),
        context: request.context,
      });
      throw retryError;
    }
  }
}

function buildGeminiDiagnostics(text: string) {
  const trimmed = text.trim();
  return {
    textLength: text.length,
    trimmedLength: trimmed.length,
    containsFence: text.includes("```"),
    startsWithBrace: trimmed.startsWith("{"),
    firstBraceIndex: text.indexOf("{"),
    lastBraceIndex: text.lastIndexOf("}"),
  };
}

function logGeminiJsonFailure(params: {
  error: unknown;
  diagnostics: Record<string, unknown>;
  context?: Record<string, unknown>;
}) {
  logger.error("Gemini JSON parse failed", {
    ...params.diagnostics,
    ...params.context,
  });
  logger.error("Gemini JSON parse failed error", {
    error: params.error instanceof Error ? params.error.message : String(params.error),
    ...params.context,
  });
}
