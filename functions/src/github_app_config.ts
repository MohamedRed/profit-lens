import { defineSecret, defineString } from "firebase-functions/params";

export const githubAppId = defineString("GITHUB_APP_ID");
export const githubInstallationId = defineString("GITHUB_APP_INSTALLATION_ID");
export const githubRepoOwner = defineString("GITHUB_REPO_OWNER", {
  default: "MohamedRed",
});
export const githubRepoName = defineString("GITHUB_REPO_NAME", {
  default: "profit-lens",
});
export const githubBaseBranch = defineString("GITHUB_BASE_BRANCH", {
  default: "main",
});
export const githubAppPrivateKey = defineSecret("GITHUB_APP_PRIVATE_KEY");
