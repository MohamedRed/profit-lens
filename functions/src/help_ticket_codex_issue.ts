import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { db, storage } from "./firebase_admin";
import {
  githubAppId,
  githubAppPrivateKey,
  githubInstallationId,
  githubRepoName,
  githubRepoOwner,
} from "./github_app_config";
import { fetchInstallationToken } from "./github_app_auth";
import { addIssueLabels, createIssue } from "./github_repo";

const REGION = "europe-west1";
const MAX_IMAGE_ATTACHMENTS = 5;
const SIGNED_URL_TTL_DAYS = 7;
const ISSUE_LABELS = ["help-ticket", "codex:run"];

type AttachmentData = {
  type?: string;
  storagePath?: string;
  url?: string;
  filename?: string;
};

export const createHelpTicketCodexIssue = onDocumentUpdated(
  {
    document: "users/{uid}/helpTickets/{ticketId}",
    region: REGION,
    secrets: [githubAppPrivateKey],
    timeoutSeconds: 120,
    memory: "1GiB",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    if (after.codingAgentStatus) return;
    if (!after.aiSummary || !after.aiNextSteps) return;
    if (typeof after.description !== "string" || after.description.trim() === "") {
      return;
    }

    const uid = event.params.uid as string;
    const ticketId = event.params.ticketId as string;

    const ticketRef = db
      .collection("users")
      .doc(uid)
      .collection("helpTickets")
      .doc(ticketId);

    const appId = githubAppId.value();
    const installationId = githubInstallationId.value();
    const owner = githubRepoOwner.value();
    const repo = githubRepoName.value();
    const privateKey = githubAppPrivateKey.value();

    if (!appId || !installationId || !privateKey) {
      throw new Error("Missing GitHub App configuration.");
    }

    await ticketRef.set(
      {
        codingAgentStatus: "queued",
        statusMessage: resolveQueuedStatusMessage(
          after.locale as string | undefined
        ),
        codingAgentUpdatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    try {
      const installationToken = await fetchInstallationToken({
        appId,
        installationId,
        privateKey,
      });

      const attachments = await fetchImageAttachments(ticketRef);
      const imageLinks = await buildImageLinks(attachments);
      const issueTitle = buildIssueTitle(after);
      const issueBody = buildIssueBody({
        uid,
        ticketId,
        description: after.description as string,
        aiSummary: after.aiSummary as string,
        aiNextSteps: after.aiNextSteps as string,
        platform: (after.platform as string | undefined) ?? "",
        locale: (after.locale as string | undefined) ?? "",
        imageLinks,
      });

      const issue = await createIssue({
        token: installationToken.token,
        owner,
        repo,
        title: issueTitle,
        body: issueBody,
      });

      await addIssueLabels({
        token: installationToken.token,
        owner,
        repo,
        issueNumber: issue.number,
        labels: ISSUE_LABELS,
      });

      await ticketRef.set(
        {
          codingAgentIssueUrl: issue.html_url,
          codingAgentIssueNumber: issue.number,
          codingAgentUpdatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      logger.error("Failed to create Codex help ticket issue", {
        uid,
        ticketId,
        error: error instanceof Error ? error.message : String(error),
      });
      await ticketRef.set(
        {
          codingAgentStatus: "failed",
          statusMessage: resolveFailedStatusMessage(
            after.locale as string | undefined
          ),
          codingAgentUpdatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
);

async function fetchImageAttachments(ticketRef: FirebaseFirestore.DocumentReference) {
  const snapshot = await ticketRef.collection("attachments").get();
  const attachments = snapshot.docs
    .map((doc) => doc.data() as AttachmentData)
    .filter((attachment) => attachment.type === "image");
  return attachments.slice(0, MAX_IMAGE_ATTACHMENTS);
}

async function buildImageLinks(attachments: AttachmentData[]) {
  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_DAYS * 86400_000);
  const results: string[] = [];
  for (const attachment of attachments) {
    const label = attachment.filename ?? "attachment";
    if (attachment.storagePath) {
      try {
        const [signedUrl] = await storage
          .bucket()
          .file(attachment.storagePath)
          .getSignedUrl({
            version: "v4",
            action: "read",
            expires: expiresAt,
          });
        results.push(`- ${label}: ${signedUrl}`);
        continue;
      } catch (error) {
        logger.warn("Failed to sign help ticket attachment", {
          storagePath: attachment.storagePath,
          error,
        });
      }
    }
    if (attachment.url) {
      results.push(`- ${label}: ${attachment.url}`);
    }
  }
  return results;
}

function buildIssueTitle(data: Record<string, unknown>) {
  const summary = (data.aiSummary as string | undefined)?.trim();
  if (summary) {
    return truncate(`Help ticket: ${summary}`, 120);
  }
  const description = (data.description as string | undefined)?.trim() ?? "";
  if (!description) return "Help ticket";
  return truncate(`Help ticket: ${description}`, 120);
}

function buildIssueBody(params: {
  uid: string;
  ticketId: string;
  description: string;
  aiSummary: string;
  aiNextSteps: string;
  platform: string;
  locale: string;
  imageLinks: string[];
}) {
  const attachments =
    params.imageLinks.length > 0 ? params.imageLinks.join("\n") : "- None";
  return [
    `TicketId: ${params.ticketId}`,
    `Uid: ${params.uid}`,
    `Platform: ${params.platform}`,
    `Locale: ${params.locale}`,
    "",
    "Description:",
    params.description,
    "",
    "AI Summary:",
    params.aiSummary,
    "",
    "AI Next Steps:",
    params.aiNextSteps,
    "",
    "Attachments:",
    attachments,
  ].join("\n");
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function resolveQueuedStatusMessage(locale?: string) {
  if (!locale) return "Codex agent queued.";
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("fr")) {
    return "Agent Codex en file d’attente.";
  }
  if (normalized.startsWith("ar")) {
    return "تمت جدولة وكيل كودكس.";
  }
  return "Codex agent queued.";
}

function resolveFailedStatusMessage(locale?: string) {
  if (!locale) return "Codex failed to prepare a fix.";
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("fr")) {
    return "Échec de la préparation du correctif Codex.";
  }
  if (normalized.startsWith("ar")) {
    return "فشل كودكس في إعداد الإصلاح.";
  }
  return "Codex failed to prepare a fix.";
}
