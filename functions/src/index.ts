import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-1.5-pro",
});

export const extractOfferFromImage = onCall(
  {
    cors: true,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "512MiB",
    region: "europe-west1",
  },
  async (request) => {
    const payload = request.data as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!payload?.imageBase64 || !payload?.mimeType) {
      throw new HttpsError("invalid-argument", "Missing image payload.");
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
    }

    const model = geminiModel.value();
    const prompt = [
      "You are extracting delivery offer data from a screenshot.",
      "Return ONLY valid JSON with this schema:",
      "{",
      "  \"offer\": {",
      "    \"payoutEuro\": number,",
      "    \"distanceKm\": number,",
      "    \"pickupName\": string | null,",
      "    \"pickupAddress\": string | null",
      "  },",
      "  \"confidence\": number,",
      "  \"rawText\": string",
      "}",
      "Use dot as decimal separator. If a field is unknown, set it to null.",
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: payload.mimeType,
                    data: payload.imageBase64,
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

    const parsed = parseJson(text);
    return parsed;
  }
);

function parseJson(text: string) {
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
