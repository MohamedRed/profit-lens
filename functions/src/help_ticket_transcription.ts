import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { v2 } from "@google-cloud/speech";
import { FieldValue } from "firebase-admin/firestore";
import { db, storage } from "./firebase_admin";
import { normalizeSpeechLocale } from "./speech_locale";

const REGION = "europe-west1";
const LOCATION = "global";
const speechClient = new v2.SpeechClient();

export const transcribeHelpTicketAudio = onDocumentCreated(
  {
    document: "users/{uid}/helpTickets/{ticketId}/attachments/{attachmentId}",
    region: REGION,
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    if (data.type !== "audio") return;

    const uid = event.params.uid as string;
    const ticketId = event.params.ticketId as string;
    const attachmentId = event.params.attachmentId as string;
    const storagePath = data.storagePath as string | undefined;
    const ticketRef = db
      .collection("users")
      .doc(uid)
      .collection("helpTickets")
      .doc(ticketId);
    if (!storagePath) {
      logger.warn("Audio attachment missing storagePath", {
        uid,
        ticketId,
        attachmentId,
      });
      await ticketRef.set(
        {
          transcriptionStatus: "failed",
          transcriptionError: "missing_storage_path",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return;
    }
    const ticketSnap = await ticketRef.get();
    const ticketData = ticketSnap.data();
    if (!ticketData) return;

    const projectId =
      process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
    if (!projectId) {
      logger.error("Missing project id for speech recognition");
      await ticketRef.set(
        {
          transcriptionStatus: "failed",
          transcriptionError: "missing_project_id",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return;
    }

    const bucketName = storage.bucket().name;
    const uri = `gs://${bucketName}/${storagePath}`;
    const language = normalizeSpeechLocale(
      ticketData.locale as string | undefined
    );

    try {
      const [response] = await speechClient.recognize({
        recognizer: `projects/${projectId}/locations/${LOCATION}/recognizers/_`,
        config: {
          autoDecodingConfig: {},
          languageCodes: [language],
          model: "latest_long",
          features: {
            enableAutomaticPunctuation: true,
          },
        },
        uri,
      });

      const transcript = (response.results ?? [])
        .map((result) => result.alternatives?.[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) {
        await ticketRef.set(
          {
            transcriptionStatus: "failed",
            transcriptionError: "empty_transcript",
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return;
      }

      const existing = (ticketData.description as string | undefined)?.trim();
      const updatedDescription = existing
        ? `${existing}\n\n${transcript}`
        : transcript;

      await ticketRef.set(
        {
          description: updatedDescription,
          transcriptionStatus: "completed",
          transcriptionError: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      logger.error("Audio transcription failed", {
        uid,
        ticketId,
        attachmentId,
        error,
      });
      await ticketRef.set(
        {
          transcriptionStatus: "failed",
          transcriptionError: "speech_error",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
);
