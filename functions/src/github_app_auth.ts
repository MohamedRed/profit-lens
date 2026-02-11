import jwt from "jsonwebtoken";

const GITHUB_API_BASE = "https://api.github.com";

export type GithubInstallationToken = {
  token: string;
  expiresAt: string;
};

export function createAppJwt(params: {
  appId: string;
  privateKey: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iat: now - 60,
      exp: now + 10 * 60,
      iss: params.appId,
    },
    params.privateKey,
    { algorithm: "RS256" }
  );
}

export async function fetchInstallationToken(params: {
  appId: string;
  installationId: string;
  privateKey: string;
}) {
  const jwtToken = createAppJwt({
    appId: params.appId,
    privateKey: params.privateKey,
  });

  const response = await fetch(
    `${GITHUB_API_BASE}/app/installations/${params.installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub installation token failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as {
    token?: string;
    expires_at?: string;
  };

  if (!data.token || !data.expires_at) {
    throw new Error("GitHub installation token response missing fields.");
  }

  return {
    token: data.token,
    expiresAt: data.expires_at,
  } satisfies GithubInstallationToken;
}
