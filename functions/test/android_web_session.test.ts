import { describe, expect, it, vi } from "vitest";

describe("android web session", () => {
  it("creates a Firebase custom token with android metadata", async () => {
    const createCustomToken = vi.fn(async () => "token-123");

    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({
      getAuth: () => ({
        createCustomToken,
      }),
    }));

    const { createAndroidWebSessionCore } = await import("../src/android_web_session");
    const result = await createAndroidWebSessionCore({
      uid: "user-1",
      deviceId: "device-1",
    });

    expect(result).toEqual({ customToken: "token-123" });
    expect(createCustomToken).toHaveBeenCalledWith("user-1", {
      deviceId: "device-1",
      platform: "android",
      target: "qwik-webview",
    });
  });
});
