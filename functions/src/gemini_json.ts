import { HttpsError } from "firebase-functions/v2/https";

export function parseGeminiJson(text: string) {
  const cleaned = stripMarkdownFence(text.trim());
  const jsonCandidate = extractFirstJsonObject(cleaned);
  if (!jsonCandidate) {
    throw new HttpsError("internal", "Gemini response was not JSON.");
  }
  try {
    return JSON.parse(jsonCandidate);
  } catch (error) {
    throw new HttpsError("internal", "Failed to parse Gemini JSON response.");
  }
}

function stripMarkdownFence(text: string) {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenceMatch ? fenceMatch[1].trim() : text;
}

function extractFirstJsonObject(text: string) {
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }
    if (char === "}") {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          return text.slice(start, i + 1);
        }
      }
    }
  }
  return null;
}
