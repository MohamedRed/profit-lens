import * as logger from "firebase-functions/logger";

export function logDelivererStatusResolution(input: {
  source: string;
  ticketId: string;
  delivererStatus: string;
  timelineEventAppended: boolean;
  warnings: string[];
}) {
  if (input.warnings.length > 0) {
    logger.warn("Help ticket deliverer status warning", input);
    return;
  }
  logger.info("Help ticket deliverer status resolved", input);
}
