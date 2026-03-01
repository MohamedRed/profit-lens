import { getAuth } from "../firebase_admin";
import { readAllowedAdminEmails, writeAdminAllowlist } from "../admin/authz";
import { isValidEmail, normalizeEmail } from "../admin/masks";

type AuthUser = {
  uid: string;
  email: string | null;
  customClaims?: Record<string, unknown>;
};

async function main() {
  const emails = parseEmails(process.argv.slice(2));
  if (emails.length === 0) {
    throw new Error(
      "No admin emails provided. Usage: npm run admin:sync-access -- admin1@example.com admin2@example.com"
    );
  }

  const previousAllowlist = await readAllowedAdminEmails();
  const nextAllowlist = await writeAdminAllowlist(emails);
  const nextAllowlistSet = new Set(nextAllowlist);

  const users = await listAllUsers();
  const matchedAllowlistEmails = new Set<string>();

  let grantedCount = 0;
  let revokedCount = 0;
  let unchangedCount = 0;

  for (const user of users) {
    const normalizedEmail = user.email ? normalizeEmail(user.email) : null;
    const shouldBeAdmin = normalizedEmail ? nextAllowlistSet.has(normalizedEmail) : false;
    const hasAdminClaim = user.customClaims?.admin === true;

    if (normalizedEmail && shouldBeAdmin) {
      matchedAllowlistEmails.add(normalizedEmail);
    }

    if (shouldBeAdmin === hasAdminClaim) {
      unchangedCount += 1;
      continue;
    }

    await setAdminClaim(user, shouldBeAdmin);
    if (shouldBeAdmin) {
      grantedCount += 1;
    } else {
      revokedCount += 1;
    }
  }

  const missingUsers = nextAllowlist.filter((email) => !matchedAllowlistEmails.has(email));

  console.log("Admin access sync completed.");
  console.log(`Previous allowlist size: ${previousAllowlist.size}`);
  console.log(`New allowlist size: ${nextAllowlist.length}`);
  console.log(`Claims granted: ${grantedCount}`);
  console.log(`Claims revoked: ${revokedCount}`);
  console.log(`Claims unchanged: ${unchangedCount}`);

  if (missingUsers.length > 0) {
    console.warn("Allowlisted emails without matching Auth users:");
    for (const email of missingUsers) {
      console.warn(`- ${email}`);
    }
    console.warn("Create those users in Firebase Auth, then run admin:sync-access again.");
  }
}

function parseEmails(input: string[]): string[] {
  const normalized = input
    .flatMap((value) => value.split(","))
    .map((value) => normalizeEmail(value))
    .filter(Boolean)
    .filter((email) => isValidEmail(email));

  return Array.from(new Set(normalized)).sort();
}

async function listAllUsers(): Promise<AuthUser[]> {
  const auth = getAuth();
  const users: AuthUser[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = await auth.listUsers(1000, nextPageToken);
    for (const user of response.users) {
      users.push({
        uid: user.uid,
        email: user.email ?? null,
        customClaims: user.customClaims,
      });
    }
    nextPageToken = response.pageToken;
  } while (nextPageToken);

  return users;
}

async function setAdminClaim(user: AuthUser, enabled: boolean) {
  const auth = getAuth();
  const nextClaims = {
    ...(user.customClaims ?? {}),
  };

  if (enabled) {
    nextClaims.admin = true;
  } else {
    delete nextClaims.admin;
  }

  const hasClaims = Object.keys(nextClaims).length > 0;
  await auth.setCustomUserClaims(user.uid, hasClaims ? nextClaims : null);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
