import { githubRequest } from "./github_api";

type GitRefResponse = { object: { sha: string } };
type GitCommitResponse = { tree: { sha: string } };
type GitBlobResponse = { sha: string };
type GitTreeResponse = { sha: string };
type GitCommitCreateResponse = { sha: string };
type PullRequestResponse = { html_url: string; number: number };

export async function getBranchSha(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}) {
  const data = await githubRequest<GitRefResponse>({
    token: params.token,
    method: "GET",
    path: `/repos/${params.owner}/${params.repo}/git/ref/heads/${params.branch}`,
  });
  return data.object.sha;
}

export async function createBranch(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  sha: string;
}) {
  await githubRequest<void>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/git/refs`,
    body: {
      ref: `refs/heads/${params.branch}`,
      sha: params.sha,
    },
  });
}

export async function getCommitTreeSha(params: {
  token: string;
  owner: string;
  repo: string;
  sha: string;
}) {
  const data = await githubRequest<GitCommitResponse>({
    token: params.token,
    method: "GET",
    path: `/repos/${params.owner}/${params.repo}/git/commits/${params.sha}`,
  });
  return data.tree.sha;
}

export async function createBlob(params: {
  token: string;
  owner: string;
  repo: string;
  content: string;
}) {
  const data = await githubRequest<GitBlobResponse>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/git/blobs`,
    body: {
      content: params.content,
      encoding: "utf-8",
    },
  });
  return data.sha;
}

export async function createTree(params: {
  token: string;
  owner: string;
  repo: string;
  baseTree: string;
  entries: Array<{ path: string; sha: string }>;
}) {
  const data = await githubRequest<GitTreeResponse>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/git/trees`,
    body: {
      base_tree: params.baseTree,
      tree: params.entries.map((entry) => ({
        path: entry.path,
        mode: "100644",
        type: "blob",
        sha: entry.sha,
      })),
    },
  });
  return data.sha;
}

export async function createCommit(params: {
  token: string;
  owner: string;
  repo: string;
  message: string;
  tree: string;
  parents: string[];
}) {
  const data = await githubRequest<GitCommitCreateResponse>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/git/commits`,
    body: {
      message: params.message,
      tree: params.tree,
      parents: params.parents,
    },
  });
  return data.sha;
}

export async function updateBranchRef(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  sha: string;
}) {
  await githubRequest<void>({
    token: params.token,
    method: "PATCH",
    path: `/repos/${params.owner}/${params.repo}/git/refs/heads/${params.branch}`,
    body: {
      sha: params.sha,
      force: false,
    },
  });
}

export async function createPullRequest(params: {
  token: string;
  owner: string;
  repo: string;
  base: string;
  head: string;
  title: string;
  body: string;
}) {
  const data = await githubRequest<PullRequestResponse>({
    token: params.token,
    method: "POST",
    path: `/repos/${params.owner}/${params.repo}/pulls`,
    body: {
      title: params.title,
      head: params.head,
      base: params.base,
      body: params.body,
      draft: false,
    },
  });
  return data;
}

export async function getFileContent(params: {
  token: string;
  owner: string;
  repo: string;
  path: string;
  ref: string;
}) {
  const encodedPath = params.path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const data = await githubRequest<{
    content?: string;
    encoding?: string;
  }>({
    token: params.token,
    method: "GET",
    path: `/repos/${params.owner}/${params.repo}/contents/${encodedPath}?ref=${encodeURIComponent(
      params.ref
    )}`,
  });
  if (!data.content || data.encoding !== "base64") {
    throw new Error(`Missing content for ${params.path}`);
  }
  const buffer = Buffer.from(data.content, "base64");
  return buffer.toString("utf-8");
}

export async function searchCode(params: {
  token: string;
  owner: string;
  repo: string;
  query: string;
  perPage?: number;
}) {
  const perPage = params.perPage ?? 5;
  const data = await githubRequest<{
    items: Array<{ path: string }>;
  }>({
    token: params.token,
    method: "GET",
    path: `/search/code?q=${encodeURIComponent(
      `${params.query} repo:${params.owner}/${params.repo}`
    )}&per_page=${perPage}`,
  });
  return data.items.map((item) => item.path);
}
