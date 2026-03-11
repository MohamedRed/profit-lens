import { defineSecret, defineString } from "firebase-functions/params";

export const routesApiKey = defineSecret("ROUTES_API_KEY");
export const geocodingApiKey = defineSecret("GEOCODING_API_KEY");
export const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-3-flash-preview",
});
