import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase_admin";
import { ShiftKpi } from "./types";

type OfferSummary = {
  payoutEuro: number;
  distanceKm: number;
  netProfitEuro: number;
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return 0;
}

function mapOfferSummary(data: Record<string, unknown>): OfferSummary {
  const breakdown = (data.breakdown as Record<string, unknown> | undefined) ?? {};
  return {
    payoutEuro: toNumber(data.payoutEuro),
    distanceKm: toNumber(data.distanceKm),
    netProfitEuro: toNumber(breakdown.netProfit),
  };
}

function buildShiftKpi(summaries: OfferSummary[]): ShiftKpi {
  const totals = summaries.reduce(
    (acc, item) => {
      acc.revenueEuro += item.payoutEuro;
      acc.netProfitEuro += item.netProfitEuro;
      acc.distanceKm += item.distanceKm;
      return acc;
    },
    {
      revenueEuro: 0,
      netProfitEuro: 0,
      distanceKm: 0,
    }
  );
  const deliveries = summaries.length;
  return {
    deliveries,
    revenueEuro: totals.revenueEuro,
    netProfitEuro: totals.netProfitEuro,
    distanceKm: totals.distanceKm,
    avgProfitPerDeliveryEuro: deliveries > 0 ? totals.netProfitEuro / deliveries : 0,
  };
}

export async function readShiftKpis(params: {
  uid: string;
  localDayId: string;
  now: Date;
}): Promise<{ day: ShiftKpi; rolling7d: ShiftKpi }> {
  const offersRef = db.collection("users").doc(params.uid).collection("offers");
  const daySnapshot = await offersRef.where("localDayId", "==", params.localDayId).get();
  const daySummaries = daySnapshot.docs.map((doc) => mapOfferSummary(doc.data() as Record<string, unknown>));

  const rollingStart = new Date(params.now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const rollingSnapshot = await offersRef
    .where("createdAt", ">=", Timestamp.fromDate(rollingStart))
    .where("createdAt", "<=", Timestamp.fromDate(params.now))
    .get();
  const rollingSummaries = rollingSnapshot.docs.map((doc) =>
    mapOfferSummary(doc.data() as Record<string, unknown>)
  );

  return {
    day: buildShiftKpi(daySummaries),
    rolling7d: buildShiftKpi(rollingSummaries),
  };
}
