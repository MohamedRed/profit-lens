import { HttpsError } from "firebase-functions/v2/https";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout } from "../src/http_fetch_timeout";

describe("fetchWithTimeout", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns the upstream response when fetch succeeds", async () => {
    const response = new Response("ok", { status: 200 });
    global.fetch = vi.fn().mockResolvedValue(response);

    const result = await fetchWithTimeout({
      url: "https://example.com",
      timeoutMs: 1000,
      timeoutMessage: "timed out",
      unavailableMessage: "failed",
    });

    expect(result).toBe(response);
  });

  it("maps timeout aborts to deadline-exceeded", async () => {
    const timeoutError = new Error("Timeout");
    timeoutError.name = "TimeoutError";
    global.fetch = vi.fn().mockRejectedValue(timeoutError);

    await expect(
      fetchWithTimeout({
        url: "https://example.com",
        timeoutMs: 1,
        timeoutMessage: "Request timed out.",
        unavailableMessage: "Request failed",
      })
    ).rejects.toMatchObject({
      code: "deadline-exceeded",
      message: "Request timed out.",
    } satisfies Partial<HttpsError>);
  });

  it("maps network failures to unavailable", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("socket hang up"));

    await expect(
      fetchWithTimeout({
        url: "https://example.com",
        timeoutMs: 1000,
        timeoutMessage: "Request timed out.",
        unavailableMessage: "Request failed",
      })
    ).rejects.toMatchObject({
      code: "unavailable",
      message: "Request failed. socket hang up",
    } satisfies Partial<HttpsError>);
  });
});
