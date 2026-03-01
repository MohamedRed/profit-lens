const SIMPLE_EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return SIMPLE_EMAIL_REGEX.test(value.trim());
}

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }
  const normalized = normalizeEmail(email);
  const [localPart, domainPart] = normalized.split("@");
  if (!localPart || !domainPart) {
    return null;
  }
  const localMask = localPart.length <= 1
    ? "*"
    : `${localPart[0]}${"*".repeat(Math.min(3, localPart.length - 1))}`;
  return `${localMask}@${domainPart}`;
}

export function summarizeAddress(address: string | null | undefined): string | null {
  if (!address) {
    return null;
  }
  const cleaned = address.trim();
  if (!cleaned) {
    return null;
  }
  const segments = cleaned
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length >= 2) {
    return segments.slice(-2).join(", ");
  }

  const compact = cleaned.replace(/\s+/g, " ");
  const words = compact.split(" ");
  if (words.length <= 2) {
    return compact;
  }
  return words.slice(-2).join(" ");
}

export function maskTextPreview(value: string | null | undefined, maxLen = 120): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxLen - 1))}…`;
}
