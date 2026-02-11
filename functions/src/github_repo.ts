import { githubRequest } from "./github_api";

type IssueResponse = { html_url: string; number: number };

type LabelDefinition = {
  name: string;
  color: string;
  description?: string;
};

export async function createIssue(params: {
  token: string;
  owner: string;
  repo: string;
  title: string;
  body: string;
}) {
  const data = await githubRequest<IssueResponse>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/issues`,
    body: {
      title: params.title,
      body: params.body,
    },
  });
  return data;
}

export async function ensureLabels(params: {
  token: string;
  owner: string;
  repo: string;
  labels: LabelDefinition[];
}) {
  for (const label of params.labels) {
    try {
      await githubRequest<void>({
        token: params.token,
        method: "POST",
        path: `/repos/${params.owner}/${params.repo}/labels`,
        body: {
          name: label.name,
          color: label.color,
          description: label.description ?? "",
        },
      });
    } catch (error) {
      if (!isLabelAlreadyExistsError(error)) {
        throw error;
      }
    }
  }
}

export async function addIssueLabels(params: {
  token: string;
  owner: string;
  repo: string;
  issueNumber: number;
  labels: string[];
}) {
  if (params.labels.length === 0) return;
  await githubRequest<void>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/issues/${params.issueNumber}/labels`,
    body: {
      labels: params.labels,
    },
  });
}

function isLabelAlreadyExistsError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  return message.includes(" 422 ") || message.includes("already_exists");
}
