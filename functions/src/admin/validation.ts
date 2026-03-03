import { HttpsError } from "firebase-functions/v2/https";
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_MAX_PAGE_SIZE,
} from "./constants";

export function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

export function readOptionalString(
  source: Record<string, unknown>,
  key: string,
  maxLength = 256
): string | undefined {
  const value = source[key];
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${key} must be a string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > maxLength) {
    throw new HttpsError(
      "invalid-argument",
      `${key} must be at most ${maxLength} characters.`
    );
  }
  return trimmed;
}

export function readOptionalBoolean(
  source: Record<string, unknown>,
  key: string
): boolean | undefined {
  const value = source[key];
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw new HttpsError("invalid-argument", `${key} must be a boolean.`);
  }
  return value;
}

export function readOptionalEnum<T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[]
): T | undefined {
  const value = readOptionalString(source, key);
  if (!value) {
    return undefined;
  }
  if (!allowedValues.includes(value as T)) {
    throw new HttpsError(
      "invalid-argument",
      `${key} must be one of: ${allowedValues.join(", ")}.`
    );
  }
  return value as T;
}

export function readPageSize(source: Record<string, unknown>): number {
  const value = source.pageSize;
  if (value == null) {
    return ADMIN_DEFAULT_PAGE_SIZE;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpsError("invalid-argument", "pageSize must be a number.");
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new HttpsError("invalid-argument", "pageSize must be a positive integer.");
  }
  return Math.min(value, ADMIN_MAX_PAGE_SIZE);
}

export function readOptionalIsoDate(
  source: Record<string, unknown>,
  key: string
): Date | undefined {
  const raw = readOptionalString(source, key);
  if (!raw) {
    return undefined;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new HttpsError("invalid-argument", `${key} must be a valid ISO date.`);
  }
  return date;
}
