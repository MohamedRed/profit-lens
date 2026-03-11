import { describe, expect, it } from "vitest";
import { buildLiveOfferCommitDocId } from "../src/live_offers/commit_store";

describe("buildLiveOfferCommitDocId", () => {
  it("creates a stable combined id", () => {
    expect(buildLiveOfferCommitDocId("device:one", "session/two")).toBe(
      "device%3Aone:session%2Ftwo"
    );
  });
});
