import * as logger from "firebase-functions/logger";
import { requestGeminiJsonWithRetry } from "./gemini_json_retry";
import { helpPullRequestPrompt } from "./help_pr_prompt";
import { getFileContent, searchCode } from "./github_repo";

const MAX_FILES = 6;
const MAX_FILE_CHARS = 8000;

const helpPrSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    files: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          reason: { type: "string" },
        },
        required: ["path", "content", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "body", "files"],
  additionalProperties: false,
} as const;

export type HelpPullRequestDraft = {
  title: string;
  body: string;
  files: Array<{ path: string; content: string; reason: string }>;
};

export async function buildHelpTicketPullRequestDraft(params: {
  token: string;
  owner: string;
  repo: string;
  ref: string;
  description: string;
  aiSummary?: string | null;
  aiNextSteps?: string | null;
  platform?: string | null;
  locale?: string | null;
  uid?: string | null;
  ticketId?: string | null;
  apiKey: string;
  model: string;
}) {
  const keywords = extractKeywords(params.description);
  const candidatePaths = await findCandidateFiles({
    token: params.token,
    owner: params.owner,
    repo: params.repo,
    keywords,
  });

  if (candidatePaths.length === 0) {
    throw new Error("No candidate files found for ticket.");
  }

  const filesContext = await Promise.all(
    candidatePaths.slice(0, MAX_FILES).map(async (path) => {
      const content = await getFileContent({
        token: params.token,
        owner: params.owner,
        repo: params.repo,
        path,
        ref: params.ref,
      });
      return { path, content: truncate(content) };
    })
  );

  const prompt = [
    helpPullRequestPrompt,
    "",
    "Ticket details:",
    `Description: ${params.description}`,
    `AI Summary: ${params.aiSummary ?? ""}`,
    `AI Next Steps: ${params.aiNextSteps ?? ""}`,
    `Platform: ${params.platform ?? ""}`,
    `Locale: ${params.locale ?? ""}`,
    "",
    "Repository files (path + content):",
    ...filesContext.map(
      (file) =>
        `---\nPath: ${file.path}\nContent:\n${file.content}\n---`
    ),
  ].join("\n");

  logger.info("Help ticket PR draft prompt", {
    keywordCount: keywords.length,
    fileCount: filesContext.length,
  });

  const parsed = await requestGeminiJsonWithRetry<HelpPullRequestDraft>({
    apiKey: params.apiKey,
    model: params.model,
    prompt,
    schema: helpPrSchema,
    temperature: 0.2,
    maxOutputTokens: 2048,
    context: {
      uid: params.uid ?? undefined,
      ticketId: params.ticketId ?? undefined,
      feature: "help_ticket_pr",
    },
  });
  validateDraft(parsed);
  return parsed;
}

function extractKeywords(description: string) {
  const tokens = description
    .toLowerCase()
    .match(/[a-z0-9_]{4,}/g) ?? [];
  const stopwords = new Set([
    "this",
    "that",
    "with",
    "from",
    "when",
    "then",
    "does",
    "dont",
    "dont",
    "into",
    "just",
    "like",
    "have",
    "unable",
    "error",
    "ticket",
    "help",
    "screen",
    "page",
    "submit",
  ]);
  const filtered = tokens.filter((token) => !stopwords.has(token));
  return Array.from(new Set(filtered)).slice(0, 4);
}

async function findCandidateFiles(params: {
  token: string;
  owner: string;
  repo: string;
  keywords: string[];
}) {
  const collected: string[] = [];
  for (const keyword of params.keywords) {
    const matches = await searchCode({
      token: params.token,
      owner: params.owner,
      repo: params.repo,
      query: keyword,
      perPage: 5,
    });
    for (const path of matches) {
      if (isAllowedPath(path) && !collected.includes(path)) {
        collected.push(path);
      }
    }
    if (collected.length >= MAX_FILES) {
      break;
    }
  }
  return collected;
}

function isAllowedPath(path: string) {
  return (
    path.startsWith("lib/") ||
    path.startsWith("functions/src/") ||
    path.startsWith("web/") ||
    path.startsWith("android/") ||
    path.startsWith("ios/")
  );
}

function truncate(content: string) {
  if (content.length <= MAX_FILE_CHARS) {
    return content;
  }
  return `${content.slice(0, MAX_FILE_CHARS)}\n/* truncated */`;
}

function validateDraft(draft: HelpPullRequestDraft) {
  if (!draft.title?.trim()) {
    throw new Error("PR draft missing title.");
  }
  if (!draft.body?.trim()) {
    throw new Error("PR draft missing body.");
  }
  if (!Array.isArray(draft.files) || draft.files.length === 0) {
    throw new Error("PR draft missing files.");
  }
  draft.files.forEach((file) => {
    if (!file.path || !file.content) {
      throw new Error("PR draft file missing path/content.");
    }
  });
}
