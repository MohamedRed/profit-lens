import { describe, expect, it } from "vitest";
import { buildGeminiHttpError } from "../src/gemini_http_error";

describe("buildGeminiHttpError", () => {
  it("maps 429 to resource-exhausted", () => {
    const error = buildGeminiHttpError(
      429,
      "{\"status\":\"RESOURCE_EXHAUSTED\"}"
    );
    expect(error.code).toBe("resource-exhausted");
    expect(error.message).toContain("Service temporarily unavailable");
  });

  it("maps authentication failures to failed-precondition", () => {
    const error = buildGeminiHttpError(401, "Unauthorized");
    expect(error.code).toBe("failed-precondition");
    expect(error.message).toContain("Gemini API authentication failed");
  });

  it("maps unknown errors to internal", () => {
    const error = buildGeminiHttpError(500, "backend exploded");
    expect(error.code).toBe("internal");
    expect(error.message).toContain("Gemini API error (500)");
  });
});
