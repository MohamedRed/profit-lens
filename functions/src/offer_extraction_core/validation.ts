import { ExtractionIssue, NormalizedOfferRow } from "./types";

const timeRegex = /^(2[0-3]|[01]\d):([0-5]\d)$/;

export function validateNormalizedOfferRow(row: NormalizedOfferRow): ExtractionIssue[] {
  const issues: ExtractionIssue[] = [];

  if (row.payoutEuro == null) {
    issues.push({
      code: "missing-payout",
      field: "payoutEuro",
      message: "Payout is required.",
    });
  }

  if (row.distanceKm == null) {
    issues.push({
      code: "missing-distance",
      field: "distanceKm",
      message: "Distance is required.",
    });
  }

  if (row.durationMinutes == null) {
    issues.push({
      code: "missing-duration",
      field: "durationMinutes",
      message: "Duration is required.",
    });
  }

  if (row.deliveryTime == null) {
    issues.push({
      code: "missing-time",
      field: "deliveryTime",
      message: "Delivery time is required.",
    });
  } else if (!timeRegex.test(row.deliveryTime)) {
    issues.push({
      code: "invalid-time",
      field: "deliveryTime",
      message: "Delivery time must use HH:mm format.",
    });
  }

  if (row.payoutEuro != null && !Number.isFinite(row.payoutEuro)) {
    issues.push({
      code: "invalid-number",
      field: "payoutEuro",
      message: "Payout must be a valid number.",
    });
  }

  if (row.distanceKm != null && !Number.isFinite(row.distanceKm)) {
    issues.push({
      code: "invalid-number",
      field: "distanceKm",
      message: "Distance must be a valid number.",
    });
  }

  if (row.durationMinutes != null && !Number.isFinite(row.durationMinutes)) {
    issues.push({
      code: "invalid-number",
      field: "durationMinutes",
      message: "Duration must be a valid number.",
    });
  }

  if (row.tipEuro != null && !Number.isFinite(row.tipEuro)) {
    issues.push({
      code: "invalid-number",
      field: "tipEuro",
      message: "Tip must be a valid number.",
    });
  }

  return issues;
}
