import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleAuth } from "google-auth-library";
import { offerExtractionPrompt } from "./gemini_prompt";
import { buildGeminiHttpError } from "./gemini_http_error";

type GeminiRequest = {
  model: string;
  imageBase64: string;
  mimeType: string;
};

type GeminiJsonRequest = {
  model: string;
  prompt: string;
  schema: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
};

const offerExtractionSchema = {
  type: "object",
  properties: {
    offer: {
      type: "object",
      properties: {
        payoutEuro: { type: ["number", "null"] },
        distanceKm: { type: ["number", "null"] },
        pickupName: { type: ["string", "null"] },
        pickupAddress: { type: ["string", "null"] },
        dropoffName: { type: ["string", "null"] },
        dropoffAddress: { type: ["string", "null"] },
      },
      required: [
        "payoutEuro",
        "distanceKm",
        "pickupName",
        "pickupAddress",
        "dropoffName",
        "dropoffAddress",
      ],
      additionalProperties: false,
    },
    confidence: { type: ["number", "null"] },
    rawText: { type: "string" },
  },
  required: ["offer", "confidence", "rawText"],
  additionalProperties: false,
} as const;

const VERTEX_AUTH_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const vertexAuth = new GoogleAuth({
  scopes: [VERTEX_AUTH_SCOPE],
});

export async function requestGeminiOffer(
  request: GeminiRequest
): Promise<string> {
  const body = (await requestGeminiContent({
    model: request.model,
    body: {
      contents: [
        {
          role: "user",
          parts: [
            { text: offerExtractionPrompt },
            {
              inlineData: {
                mimeType: request.mimeType,
                data: request.imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseJsonSchema: offerExtractionSchema,
      },
    },
  })) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
      safetyRatings?: Array<{ category?: string; probability?: string }>;
    }>;
    promptFeedback?: { blockReason?: string };
  };
  const debugEnabled =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    process.env.GEMINI_DEBUG?.toLowerCase() === "true";
  if (debugEnabled) {
    const candidate = body.candidates?.[0];
    const meta = {
      model: request.model,
      candidateCount: body.candidates?.length ?? 0,
      finishReason: candidate?.finishReason ?? null,
      safetyRatings: candidate?.safetyRatings ?? null,
      blockReason: body.promptFeedback?.blockReason ?? null,
    };
    logger.info("Gemini response metadata", meta);
    console.error("Gemini response metadata", JSON.stringify(meta));
  }

  const text =
    body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "";

  if (!text) {
    const diagnostics = {
      candidateCount: body.candidates?.length ?? 0,
      blockReason: body.promptFeedback?.blockReason ?? null,
      responseSize: JSON.stringify(body).length,
    };
    logger.warn("Gemini returned empty text", diagnostics);
    console.error("Gemini returned empty text", JSON.stringify(diagnostics));
    throw new HttpsError("internal", "Empty Gemini response.");
  }

  return text;
}

export async function requestGeminiJson(
  request: GeminiJsonRequest
): Promise<string> {
  const body = (await requestGeminiContent({
    model: request.model,
    body: {
      contents: [
        {
          role: "user",
          parts: [{ text: request.prompt }],
        },
      ],
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxOutputTokens ?? 1024,
        responseMimeType: "application/json",
        responseJsonSchema: request.schema,
      },
    },
  })) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text =
    body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "";

  if (!text) {
    throw new HttpsError("internal", "Empty Gemini response.");
  }

  return text;
}

async function requestGeminiContent(request: {
  model: string;
  body: Record<string, unknown>;
}) {
  const endpoint = buildVertexEndpoint(request.model);
  const accessToken = await getVertexAccessToken();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request.body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw buildGeminiHttpError(
      response.status,
      extractGeminiErrorMessage(errorText)
    );
  }
  return (await response.json()) as Record<string, unknown>;
}

function buildVertexEndpoint(model: string): string {
  const projectId =
    process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new HttpsError("failed-precondition", "Missing project id.");
  }
  const location = process.env.GEMINI_VERTEX_LOCATION?.trim() || "global";
  return `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
}

async function getVertexAccessToken(): Promise<string> {
  const token = await vertexAuth.getAccessToken();
  if (!token) {
    throw new HttpsError(
      "failed-precondition",
      "Vertex AI authentication failed."
    );
  }
  return token;
}

function extractGeminiErrorMessage(errorText: string): string {
  const trimmed = errorText.trim();
  if (!trimmed) {
    return "Unknown Gemini API error.";
  }
  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { message?: unknown };
      message?: unknown;
    };
    const detailed =
      typeof parsed.error?.message === "string"
        ? parsed.error.message
        : typeof parsed.message === "string"
          ? parsed.message
          : null;
    if (detailed && detailed.trim().length > 0) {
      return detailed;
    }
  } catch {
    // Keep raw text when response is not JSON.
  }
  return trimmed;
}
