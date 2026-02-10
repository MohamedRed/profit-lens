const DEFAULT_LOCALE = "en-US";
const LANGUAGE_FALLBACKS: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  de: "de-DE",
  nl: "nl-NL",
  pt: "pt-PT",
  ar: "ar-SA",
};

export function normalizeSpeechLocale(locale?: string) {
  if (!locale) return DEFAULT_LOCALE;
  const normalized = locale.replace("_", "-").trim();
  if (!normalized) return DEFAULT_LOCALE;
  if (normalized.includes("-")) {
    return normalized;
  }
  const mapped = LANGUAGE_FALLBACKS[normalized.toLowerCase()];
  return mapped ?? DEFAULT_LOCALE;
}
