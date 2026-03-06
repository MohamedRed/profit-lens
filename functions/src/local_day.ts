import { HttpsError } from "firebase-functions/v2/https";

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_ONLY_REGEX = /^(2[0-3]|[01]\d):([0-5]\d)$/;

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) {
    return cached;
  }
  try {
    const next = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, next);
    return next;
  } catch {
    throw new HttpsError("invalid-argument", "Invalid timezone.");
  }
}

function formatParts(date: Date, timeZone: string): DateParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes): number => {
    const token = parts.find((part) => part.type === type)?.value;
    const parsed = Number(token);
    if (!Number.isFinite(parsed)) {
      throw new HttpsError("internal", `Unable to parse ${type} for timezone conversion.`);
    }
    return parsed;
  };
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
  };
}

export function resolveLocalDayId(date: Date, timezone?: string | null): string {
  if (!timezone) {
    return date.toISOString().slice(0, 10);
  }
  const parts = formatParts(date, timezone);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function parseDateOnly(value: string): { year: number; month: number; day: number } {
  if (!DATE_ONLY_REGEX.test(value)) {
    throw new HttpsError("invalid-argument", "serviceDateIso must use YYYY-MM-DD.");
  }
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new HttpsError("invalid-argument", "Invalid serviceDateIso.");
  }
  return { year, month, day };
}

export function parseTimeOnly(value: string): { hour: number; minute: number } {
  const match = value.match(TIME_ONLY_REGEX);
  if (!match) {
    throw new HttpsError("invalid-argument", "deliveryTime must use HH:mm.");
  }
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function localDateTimeToUtc(params: {
  timezone: string;
  serviceDateIso: string;
  time: string;
}): Date {
  const { year, month, day } = parseDateOnly(params.serviceDateIso);
  const { hour, minute } = parseTimeOnly(params.time);
  // Iteratively align a UTC guess to the target local wall-clock time.
  let utcMillis = Date.UTC(year, month - 1, day, hour, minute, 0);
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 4; i += 1) {
    const actual = formatParts(new Date(utcMillis), params.timezone);
    const actualMillis = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      0
    );
    const delta = target - actualMillis;
    if (delta === 0) {
      break;
    }
    utcMillis += delta;
  }
  return new Date(utcMillis);
}

export function resolveDayStartFromDayId(dayId: string): Date {
  if (!DATE_ONLY_REGEX.test(dayId)) {
    throw new HttpsError("invalid-argument", "dayId must use YYYY-MM-DD.");
  }
  return new Date(`${dayId}T00:00:00.000Z`);
}
