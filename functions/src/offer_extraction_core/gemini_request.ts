import { requestGeminiImageJson } from "../gemini_client";

export async function requestExtractionJson(params: {
  model: string;
  prompt: string;
  schema: Record<string, unknown>;
  imageBase64: string;
  mimeType: string;
  maxOutputTokens?: number;
}): Promise<string> {
  return await requestGeminiImageJson({
    model: params.model,
    prompt: params.prompt,
    schema: params.schema,
    imageBase64: params.imageBase64,
    mimeType: params.mimeType,
    maxOutputTokens: params.maxOutputTokens,
  });
}
