import { readDate, readNetProfit } from "./readers";
import type { AdminOverviewSeriesPoint } from "./types";

const RESOLVED_TICKET_STATUSES = new Set(["resolved", "closed"]);

export function summarizeOfferProfitabilityFromDocs(
  docs: FirebaseFirestore.QueryDocumentSnapshot[]
): { positive: number; negative: number } {
  let positive = 0;
  let negative = 0;

  for (const doc of docs) {
    const data = doc.data() as Record<string, unknown>;
    const netProfit = readNetProfit(data) ?? 0;
    if (netProfit > 0) {
      positive += 1;
    } else if (netProfit < 0) {
      negative += 1;
    }
  }

  return { positive, negative };
}

export function summarizeTicketsFromDocs(
  docs: FirebaseFirestore.QueryDocumentSnapshot[]
): { total: number; open: number; resolved: number } {
  let open = 0;
  let resolved = 0;

  for (const doc of docs) {
    const data = doc.data() as Record<string, unknown>;
    const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
    if (RESOLVED_TICKET_STATUSES.has(status)) {
      resolved += 1;
    } else {
      open += 1;
    }
  }

  return {
    total: docs.length,
    open,
    resolved,
  };
}

export function buildOverviewSeries(params: {
  from: Date;
  to: Date;
  activeUsersDocs: FirebaseFirestore.QueryDocumentSnapshot[];
  offerDocs: FirebaseFirestore.QueryDocumentSnapshot[];
  ticketDocs: FirebaseFirestore.QueryDocumentSnapshot[];
}): AdminOverviewSeriesPoint[] {
  const dayKeys = buildDayKeys(params.from, params.to);
  const buckets = new Map<string, AdminOverviewSeriesPoint>(
    dayKeys.map((dateIso) => [
      dateIso,
      {
        dateIso,
        activeUsers: 0,
        offers: 0,
        positiveOffers: 0,
        negativeOffers: 0,
        openTickets: 0,
        resolvedTickets: 0,
      },
    ])
  );

  for (const doc of params.activeUsersDocs) {
    const data = doc.data() as Record<string, unknown>;
    const updatedAt = readDate(data.updatedAt);
    const key = updatedAt ? toUtcDayKey(updatedAt) : null;
    if (key && buckets.has(key)) {
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.activeUsers += 1;
      }
    }
  }

  for (const doc of params.offerDocs) {
    const data = doc.data() as Record<string, unknown>;
    const createdAt = readDate(data.createdAt);
    const key = createdAt ? toUtcDayKey(createdAt) : null;
    if (!key || !buckets.has(key)) {
      continue;
    }

    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }

    bucket.offers += 1;
    const netProfit = readNetProfit(data) ?? 0;
    if (netProfit > 0) {
      bucket.positiveOffers += 1;
    } else if (netProfit < 0) {
      bucket.negativeOffers += 1;
    }
  }

  for (const doc of params.ticketDocs) {
    const data = doc.data() as Record<string, unknown>;
    const updatedAt = readDate(data.updatedAt);
    const key = updatedAt ? toUtcDayKey(updatedAt) : null;
    if (!key || !buckets.has(key)) {
      continue;
    }

    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }

    const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
    if (RESOLVED_TICKET_STATUSES.has(status)) {
      bucket.resolvedTickets += 1;
    } else {
      bucket.openTickets += 1;
    }
  }

  return dayKeys.map((dateIso) => {
    const bucket = buckets.get(dateIso);
    if (!bucket) {
      throw new Error(`Missing overview series bucket for ${dateIso}`);
    }
    return bucket;
  });
}

function buildDayKeys(from: Date, to: Date): string[] {
  const start = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  const dayKeys: string[] = [];
  for (let ts = start.getTime(); ts <= end.getTime(); ts += DAY_IN_MS) {
    dayKeys.push(toUtcDayKey(new Date(ts)));
  }
  return dayKeys;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toUtcDayKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
