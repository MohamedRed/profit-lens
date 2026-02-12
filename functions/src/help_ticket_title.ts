const MAX_TITLE_LENGTH = 70;

export function resolveHelpTicketTitle(input: {
  title?: string;
  summary?: string;
  locale?: string;
}) {
  const normalizedTitle = normalizeTitle(input.title);
  if (normalizedTitle) {
    return normalizedTitle;
  }

  const summaryTitle = summarizeTitle(input.summary);
  if (summaryTitle) {
    return summaryTitle;
  }

  return defaultTitle(input.locale);
}

function normalizeTitle(value?: string) {
  if (!value) return "";
  const condensed = value.replaceAll(/\s+/g, " ").trim();
  if (!condensed) return "";
  const withoutEndingPunctuation = condensed.replace(/[.!?…]+$/g, "").trim();
  if (!withoutEndingPunctuation) return "";
  return truncate(withoutEndingPunctuation, MAX_TITLE_LENGTH);
}

function summarizeTitle(summary?: string) {
  if (!summary) return "";
  const firstSentence = summary
    .split(/[.!?\n]+/)
    .map((segment) => segment.trim())
    .find((segment) => segment.length > 0);
  if (!firstSentence) return "";
  return truncate(firstSentence, MAX_TITLE_LENGTH);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function defaultTitle(locale?: string) {
  if (!locale) return "Support request";
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("fr")) return "Demande d’assistance";
  if (normalized.startsWith("ar")) return "طلب دعم";
  return "Support request";
}
