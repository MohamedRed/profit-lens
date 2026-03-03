import * as logger from "firebase-functions/logger";
import type { AdminEndpointName, AdminPrincipal } from "./types";

export function logAdminCall(params: {
  endpoint: AdminEndpointName;
  principal: AdminPrincipal;
  requestSummary: Record<string, unknown>;
  responseCount?: number;
}) {
  logger.info("Admin callable executed", {
    endpoint: params.endpoint,
    callerUid: params.principal.uid,
    callerEmail: params.principal.normalizedEmail,
    requestSummary: params.requestSummary,
    responseCount: params.responseCount ?? null,
  });
}
