export type DelivererStatus =
  | "received"
  | "analyzing"
  | "needs_info"
  | "fix_ready"
  | "resolved";

type ResolveDelivererStatusInput = {
  status?: string | null;
  codingAgentStatus?: string | null;
  aiNeedsUserAction?: boolean | null;
  locale?: string | null;
};

export type DelivererStatusResolution = {
  delivererStatus: DelivererStatus;
  delivererStatusMessage: string;
  warnings: string[];
};

export function resolveDelivererStatus(
  input: ResolveDelivererStatusInput
): DelivererStatusResolution {
  const status = normalize(input.status);
  const codingAgentStatus = normalize(input.codingAgentStatus);
  const locale = normalizeLocale(input.locale);
  const warnings = collectWarnings(status, codingAgentStatus);

  const delivererStatus = resolveDelivererStatusValue({
    status,
    codingAgentStatus,
    aiNeedsUserAction: input.aiNeedsUserAction === true,
  });

  return {
    delivererStatus,
    delivererStatusMessage: resolveDelivererStatusMessage({
      delivererStatus,
      locale,
    }),
    warnings,
  };
}

function resolveDelivererStatusValue(input: {
  status: string;
  codingAgentStatus: string;
  aiNeedsUserAction: boolean;
}): DelivererStatus {
  if (input.status === "resolved" || input.status === "closed") {
    return "resolved";
  }

  if (input.codingAgentStatus === "pr_created") {
    return "fix_ready";
  }

  if (
    input.status === "awaiting_response" ||
    input.aiNeedsUserAction ||
    input.codingAgentStatus === "no_changes" ||
    input.codingAgentStatus === "failed"
  ) {
    return "needs_info";
  }

  if (
    input.status === "triaging" ||
    input.status === "in_progress" ||
    input.codingAgentStatus === "queued" ||
    input.codingAgentStatus === "running"
  ) {
    return "analyzing";
  }

  return "received";
}

function resolveDelivererStatusMessage(input: {
  delivererStatus: DelivererStatus;
  locale: string;
}) {
  const isFr = input.locale.startsWith("fr");
  const isAr = input.locale.startsWith("ar");
  switch (input.delivererStatus) {
    case "received":
      if (isFr) return "Ticket reçu.";
      if (isAr) return "تم استلام التذكرة.";
      return "Ticket received.";
    case "analyzing":
      if (isFr) return "Analyse en cours.";
      if (isAr) return "جارٍ تحليل البلاغ.";
      return "Analysis in progress.";
    case "needs_info":
      if (isFr) return "Nous avons besoin d’informations supplémentaires.";
      if (isAr) return "نحتاج إلى معلومات إضافية للمتابعة.";
      return "We need additional information to continue.";
    case "fix_ready":
      if (isFr) return "Une correction est prête et en validation.";
      if (isAr) return "الإصلاح جاهز وهو قيد المراجعة.";
      return "A fix is ready and under validation.";
    case "resolved":
      if (isFr) return "Le ticket est résolu.";
      if (isAr) return "تم حل التذكرة.";
      return "This ticket is resolved.";
  }
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeLocale(locale: string | null | undefined) {
  return normalize(locale);
}

function collectWarnings(status: string, codingAgentStatus: string) {
  const warnings: string[] = [];

  if (
    (status === "resolved" || status === "closed") &&
    (codingAgentStatus === "queued" || codingAgentStatus === "running")
  ) {
    warnings.push(
      "Ticket is resolved/closed while coding agent status is still active."
    );
  }

  if (status === "awaiting_response" && codingAgentStatus === "pr_created") {
    warnings.push(
      "Ticket is awaiting response while coding agent already produced a PR."
    );
  }

  return warnings;
}
