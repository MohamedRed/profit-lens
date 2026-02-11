const GITHUB_API_BASE = "https://api.github.com";

export async function githubRequest<T>(params: {
  token: string;
  method: "GET" | "POST" | "PATCH" | "PUT";
  path: string;
  body?: unknown;
}) {
  const response = await fetch(`${GITHUB_API_BASE}${params.path}`, {
    method: params.method,
    headers: {
      Authorization: `Bearer ${params.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: params.body ? JSON.stringify(params.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `GitHub API ${params.method} ${params.path} failed: ${response.status} ${text}`
    );
  }

  if (response.status === 204) {
    return null as T;
  }
  return (await response.json()) as T;
}
