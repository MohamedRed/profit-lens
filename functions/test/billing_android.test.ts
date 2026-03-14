import { HttpsError } from "firebase-functions/v2/https";
import { validateAndroidReturnUrl } from "../src/billing_android";

describe("validateAndroidReturnUrl", () => {
  it("accepts the production hosting path", () => {
    expect(
      validateAndroidReturnUrl("https://profit-lens-prod-2e417.web.app/android-return/billing")
    ).toBe("https://profit-lens-prod-2e417.web.app/android-return/billing");
  });

  it("rejects non-hosted return URLs", () => {
    expect(() => validateAndroidReturnUrl("https://example.com/android-return/billing")).toThrow(HttpsError);
  });

  it("rejects unexpected paths", () => {
    expect(() => validateAndroidReturnUrl("https://profit-lens-prod-2e417.web.app/next/app/settings/billing")).toThrow(
      HttpsError
    );
  });
});
