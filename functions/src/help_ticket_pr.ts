import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase_admin";
import {
  githubAppId,
  githubAppPrivateKey,
  githubBaseBranch,
  githubInstallationId,
  githubRepoName,
  githubRepoOwner,
} from "./github_app_config";
import { fetchInstallationToken } from "./github_app_auth";
import {
  createBlob,
  createBranch,
  createCommit,
  createPullRequest,
  createTree,
  getBranchSha,
  getCommitTreeSha,
  updateBranchRef,
} from "./github_repo";
import { buildHelpTicketPullRequestDraft } from "./help_ticket_pr_agent";

const REGION = "europe-west1";
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const geminiModel = defineString("GEMINI_PR_MODEL", {
  default: "gemini-3-flash-preview",
});

export const createHelpTicketPullRequest = onDocumentUpdated(
  {
    document: "users/{uid}/helpTickets/{ticketId}",
    region: REGION,
    secrets: [githubAppPrivateKey, geminiApiKey],
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

    await ticketRef.set(
      {
        codingAgentStatus: "in_progress",
        codingAgentUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const appId = githubAppId.value();
    const installationId = githubInstallationId.value();
    const owner = githubRepoOwner.value();
    const repo = githubRepoName.value();
    const baseBranch = githubBaseBranch.value();
    const privateKey = githubAppPrivateKey.value();
    const apiKey = geminiApiKey.value();
    const model = geminiModel.value();

    if (!appId || !installationId || !privateKey) {
      throw new Error("Missing GitHub App configuration.");
    }

    const installationToken = await fetchInstallationToken({
      appId,
      installationId,
      privateKey,
    });

    const draft = await buildHelpTicketPullRequestDraft({
      token: installationToken.token,
      owner,
      repo,
      ref: baseBranch,
      uid,
      ticketId,
      description: (after.description as string | undefined) ?? "",
      aiSummary: after.aiSummary as string | undefined,
      aiNextSteps: after.aiNextSteps as string | undefined,
      platform: after.platform as string | undefined,
      locale: after.locale as string | undefined,
      apiKey,
      model,
    });

    const branchName = `codex/help-ticket-${ticketId}`;
    const baseSha = await getBranchSha({
      token: installationToken.token,
      owner,
      repo,
      branch: baseBranch,
    });

    await createBranch({
      token: installationToken.token,
      owner,
      repo,
      branch: branchName,
      sha: baseSha,
    });

    const baseTree = await getCommitTreeSha({
      token: installationToken.token,
      owner,
      repo,
      sha: baseSha,
    });

    const entries = [];
    for (const file of draft.files) {
      const blobSha = await createBlob({
        token: installationToken.token,
        owner,
        repo,
        content: file.content,
      });
      entries.push({ path: file.path, sha: blobSha });
    }

    const treeSha = await createTree({
      token: installationToken.token,
      owner,
      repo,
      baseTree,
      entries,
    });

    const commitSha = await createCommit({
      token: installationToken.token,
      owner,
      repo,
      message: draft.title,
      tree: treeSha,
      parents: [baseSha],
    });

    await updateBranchRef({
      token: installationToken.token,
      owner,
      repo,
      branch: branchName,
      sha: commitSha,
    });

    const pr = await createPullRequest({
      token: installationToken.token,
      owner,
      repo,
      base: baseBranch,
      head: branchName,
      title: draft.title,
      body: draft.body,
    });

    logger.info("Help ticket PR created", {
      ticketId,
      prNumber: pr.number,
      url: pr.html_url,
    });

    await ticketRef.set(
      {
        codingAgentStatus: "pr_created",
        codingAgentPrUrl: pr.html_url,
        codingAgentPrNumber: pr.number,
        codingAgentBranch: branchName,
        statusMessage: resolvePrStatusMessage(after.locale as string | undefined),
        updatedAt: FieldValue.serverTimestamp(),
        codingAgentUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);

function resolvePrStatusMessage(locale?: string) {
  if (!locale) return "Proposed fix is ready for review.";
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("fr")) {
    return "Correctif proposé prêt pour examen.";
  }
  if (normalized.startsWith("ar")) {
    return "اقتراح الإصلاح جاهز للمراجعة.";
  }
  return "Proposed fix is ready for review.";
}
