import { HttpsError } from "firebase-functions/v2/https";
import { offerExtractionPrompt } from "./gemini_prompt";

type GeminiRequest = {
  apiKey: string;
  model: string;
  imageBase64: string;
  mimeType: string;
};

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
          maxOutputTokens: 512,
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
