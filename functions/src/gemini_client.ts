import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { offerExtractionPrompt } from "./gemini_prompt";

type GeminiRequest = {
  apiKey: string;
  model: string;
  imageBase64: string;
  mimeType: string;
};

type GeminiJsonRequest = {
  apiKey: string;
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

export async function requestGeminiOffer(
  request: GeminiRequest
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${request.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      "internal",
      `Gemini API error (${response.status}): ${errorText}`
    );
  }

  const body = (await response.json()) as {
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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${request.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      "internal",
      `Gemini API error (${response.status}): ${errorText}`
    );
  }

  const body = (await response.json()) as {
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
