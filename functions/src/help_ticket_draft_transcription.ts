import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { v2 } from "@google-cloud/speech";
import { normalizeSpeechLocale } from "./speech_locale";

const REGION = "europe-west1";
const LOCATION = "global";
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const speechClient = new v2.SpeechClient();

export const transcribeHelpDraftAudio = onCall(
  {
    region: REGION,
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const data = request.data as {
      audio?: string;
      contentType?: string;
      locale?: string;
    };
    if (!data?.audio) {
      throw new HttpsError("invalid-argument", "Missing audio data.");
    }

    const bytes = Buffer.from(data.audio, "base64");
    if (bytes.length === 0) {
      throw new HttpsError("invalid-argument", "Empty audio data.");
    }
    if (bytes.length > MAX_AUDIO_BYTES) {
      throw new HttpsError("invalid-argument", "Audio payload too large.");
    }

    const projectId =
      process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
    if (!projectId) {
      logger.error("Missing project id for speech recognition");
      throw new HttpsError("internal", "Missing project id.");
    }

    const language = normalizeSpeechLocale(data.locale);

    try {
      const [response] = await speechClient.recognize({
        recognizer: `projects/${projectId}/locations/${LOCATION}/recognizers/_`,
        config: {
          autoDecodingConfig: {},
          languageCodes: [language],
          model: "latest_long",
          features: { enableAutomaticPunctuation: true },
        },
        content: bytes,
      });

      const transcript = (response.results ?? [])
        .map((result) => result.alternatives?.[0]?.transcript ?? "")
        .join(" ")
        .trim();

      return {
        transcript,
      };
    } catch (error) {
      logger.error("Draft audio transcription failed", { error });
      throw new HttpsError("internal", "Transcription failed.");
    }
  }
);
