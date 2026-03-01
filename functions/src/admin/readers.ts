import { Timestamp } from "firebase-admin/firestore";

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

export function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function readDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (
    value &&
    typeof value === "object" &&
    "toDate" in (value as { toDate?: unknown }) &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

export function toIsoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export function readNetProfit(data: Record<string, unknown>): number | null {
  const breakdown = asRecord(data.breakdown);
  return (
    readNumber(breakdown.netProfit) ??
    readNumber(breakdown.netProfitEuro) ??
    readNumber(data.netProfit) ??
    readNumber(data.netProfitEuro)
  );
}

export function readDocumentUid(path: string): string | null {
  const parts = path.split("/");
  const usersIndex = parts.indexOf("users");
  if (usersIndex < 0 || usersIndex + 1 >= parts.length) {
    return null;
  }
  return parts[usersIndex + 1] ?? null;
}

export function toDayRangeStart(date: Date, rangeDays: number): Date {
  return new Date(date.getTime() - rangeDays * 24 * 60 * 60 * 1000);
}

export function isDateInRange(value: Date, from?: Date, to?: Date): boolean {
  if (from && value < from) {
    return false;
  }
  if (to && value > to) {
    return false;
  }
  return true;
}
