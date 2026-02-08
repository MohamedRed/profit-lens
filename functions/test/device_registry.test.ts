import { describe, expect, it, vi } from "vitest";
import { createFakeDb, getStoreValue } from "./helpers/fake_firestore";

describe("device registry", () => {
  it("registers the first device", async () => {
    const store = new Map<string, Record<string, any>>();
    const fakeDb = createFakeDb(store);
    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({ db: fakeDb }));
    vi.doMock("../src/entitlements", () => ({
      ensureEntitlement: async () => ({ deviceLimit: 1 }),
    }));

    const { registerDeviceCore } = await import("../src/device_registry");

    const result = await registerDeviceCore({
      uid: "user-1",
      payload: {
        deviceId: "device-1",
        platform: "ios",
        userAgent: "UA",
      },
    });

    expect(result.deviceLimit).toBe(1);
    expect(result.activeDevices).toHaveLength(1);
    expect(result.activeDevices[0].deviceId).toBe("device-1");
  });

  it("blocks when over the device limit without replacement", async () => {
    const store = new Map<string, Record<string, any>>();
    const fakeDb = createFakeDb(store);
    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({ db: fakeDb }));
    vi.doMock("../src/entitlements", () => ({
      ensureEntitlement: async () => ({ deviceLimit: 1 }),
    }));

    const { registerDeviceCore } = await import("../src/device_registry");

    await registerDeviceCore({
      uid: "user-2",
      payload: {
        deviceId: "device-1",
        platform: "android",
        userAgent: "UA",
      },
    });

    await expect(
      registerDeviceCore({
        uid: "user-2",
        payload: {
          deviceId: "device-2",
          platform: "android",
          userAgent: "UA",
        },
      })
    ).rejects.toHaveProperty("code", "resource-exhausted");
  });

  it("replaces an existing device when requested", async () => {
    const store = new Map<string, Record<string, any>>();
    const fakeDb = createFakeDb(store);
    vi.resetModules();
    vi.doMock("../src/firebase_admin", () => ({ db: fakeDb }));
    vi.doMock("../src/entitlements", () => ({
      ensureEntitlement: async () => ({ deviceLimit: 1 }),
    }));

    const { registerDeviceCore } = await import("../src/device_registry");

    await registerDeviceCore({
      uid: "user-3",
      payload: {
        deviceId: "device-old",
        platform: "web",
        userAgent: "UA",
      },
    });

    const result = await registerDeviceCore({
      uid: "user-3",
      payload: {
        deviceId: "device-new",
        platform: "web",
        userAgent: "UA",
        replaceDeviceId: "device-old",
      },
    });

    expect(result.activeDevices).toHaveLength(1);
    expect(result.activeDevices[0].deviceId).toBe("device-new");

    const oldRef = fakeDb
      .collection("users")
      .doc("user-3")
      .collection("devices")
      .doc("device-old");
    const oldDevice = getStoreValue(store, oldRef);
    expect(oldDevice?.active).toBe(false);
    expect(oldDevice?.deviceId).toBe("device-old");
  });
});
