import { HttpsError, onCall } from "firebase-functions/v2/https";
import { DocumentData, DocumentReference, Timestamp } from "firebase-admin/firestore";
import { bulkCallableConfig, MAX_BULK_ROWS_PER_COMMIT } from "./constants";
import { assertDeviceActive } from "../device_registry";
import { ensureEntitlement } from "../entitlements";
import {
  assertOfferLimitAvailableForCount,
  saveOffersWithUsage,
} from "../offer_usage";
import { loadUserProfile, loadVehicleSnapshot } from "../profile_vehicle_loader";
import { evaluateProfitability } from "../profitability_engine";
import { db } from "../firebase_admin";
import { buildOfferRecordPayload } from "../offer_record_mapper";
import {
  localDateTimeToUtc,
  parseDateOnly,
  resolveDayStartFromDayId,
} from "../local_day";
import { normalizeExtractedOfferCandidate } from "../offer_extraction_core/normalization";
import { validateNormalizedOfferRow } from "../offer_extraction_core/validation";
import {
  BulkInvalidRow,
  CommitBulkOffersImportRequest,
  CommitBulkOffersImportResponse,
} from "./types";
import { assertScreenshotRefOwnership } from "./screenshot_storage";
import { readShiftKpis } from "./kpi_builder";

export const commitBulkOffersImport = onCall(bulkCallableConfig, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const payload = request.data as CommitBulkOffersImportRequest;
  const deviceId = payload.deviceId?.trim();
  if (!deviceId) {
    throw new HttpsError("invalid-argument", "Missing deviceId.");
  }
  await assertDeviceActive(uid, deviceId);

  const timezone = payload.timezone?.trim();
  if (!timezone) {
    throw new HttpsError("invalid-argument", "Missing timezone.");
  }
  if (!payload.serviceDateIso) {
    throw new HttpsError("invalid-argument", "Missing serviceDateIso.");
  }
  parseDateOnly(payload.serviceDateIso);
  const localDayId = payload.serviceDateIso;
  const localDayStart = resolveDayStartFromDayId(localDayId);

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (rows.length === 0) {
    throw new HttpsError("invalid-argument", "Missing rows.");
  }
  if (rows.length > MAX_BULK_ROWS_PER_COMMIT) {
    throw new HttpsError("invalid-argument", "Too many rows in one import.");
  }

  const screenshotRefs = Array.isArray(payload.screenshotRefs) ? payload.screenshotRefs : [];
  if (screenshotRefs.length === 0) {
    throw new HttpsError("invalid-argument", "At least one screenshotRef is required.");
  }
  screenshotRefs.forEach((ref) => {
    const path = ref.path?.trim();
    if (!path) {
      throw new HttpsError("invalid-argument", "Screenshot path is required.");
    }
    assertScreenshotRefOwnership(uid, path);
  });

  const validRows: Array<{
    payoutEuro: number;
    distanceKm: number;
    durationMinutes: number;
    deliveryTime: string;
    pickupName: string | null;
    pickupAddress: string | null;
    dropoffName: string | null;
    dropoffAddress: string | null;
    tipEuro: number | null;
    confidence: number | null;
  }> = [];
  const skipped: BulkInvalidRow[] = [];

  rows.forEach((row, sourceIndex) => {
    const normalized = normalizeExtractedOfferCandidate({
      payoutEuro: row.payoutEuro,
      distanceKm: row.distanceKm,
      durationMinutes: row.durationMinutes,
      deliveryTime: row.deliveryTime,
      pickupName: row.pickupName,
      pickupAddress: row.pickupAddress,
      dropoffName: row.dropoffName,
      dropoffAddress: row.dropoffAddress,
      tipEuro: row.tipEuro,
      confidence: row.confidence,
    });
    const issues = validateNormalizedOfferRow(normalized);
    if (issues.length > 0) {
      skipped.push({
        sourceIndex,
        raw: row,
        issues,
      });
      return;
    }
    validRows.push({
      payoutEuro: normalized.payoutEuro!,
      distanceKm: normalized.distanceKm!,
      durationMinutes: normalized.durationMinutes!,
      deliveryTime: normalized.deliveryTime!,
      pickupName: normalized.pickupName,
      pickupAddress: normalized.pickupAddress,
      dropoffName: normalized.dropoffName,
      dropoffAddress: normalized.dropoffAddress,
      tipEuro: normalized.tipEuro,
      confidence: normalized.confidence,
    });
  });

  if (validRows.length === 0) {
    throw new HttpsError("invalid-argument", "No valid rows to save.");
  }

  const entitlement = await ensureEntitlement(uid);
  await assertOfferLimitAvailableForCount({
    uid,
    entitlement,
    requestedCount: validRows.length,
  });

  const profile = await loadUserProfile(uid);
  const vehicleId = payload.vehicleId ?? profile.defaultVehicleId;
  if (!vehicleId) {
    throw new HttpsError("failed-precondition", "Vehicle is required for bulk import.");
  }
  const vehicle = await loadVehicleSnapshot(uid, vehicleId);

  const offerWrites: Array<{ docRef: DocumentReference; document: DocumentData }> = [];
  const createdAt = new Date();
  const importBatchRef = db.collection("users").doc(uid).collection("offerImports").doc();

  for (const row of validRows) {
    const offerRef = db.collection("users").doc(uid).collection("offers").doc();
    const deliveryAt = localDateTimeToUtc({
      timezone,
      serviceDateIso: localDayId,
      time: row.deliveryTime,
    });
    const payoutEuro = row.payoutEuro + (row.tipEuro ?? 0);
    const offer = {
      payoutEuro,
      distanceKm: row.distanceKm,
      durationMinutes: row.durationMinutes,
      pickupName: row.pickupName,
      pickupAddress: row.pickupAddress,
      dropoffName: row.dropoffName,
      dropoffAddress: row.dropoffAddress,
    };
    const breakdown = evaluateProfitability({
      offer,
      vehicle,
      costs: profile.costSettings,
    });

    const { document } = buildOfferRecordPayload({
      id: offerRef.id,
      offer,
      source: "bulk_screenshot",
      createdAt: deliveryAt,
      vehicleSnapshot: vehicle,
      costSnapshot: profile.costSettings,
      breakdown,
      extraction: row.confidence == null ? null : { confidence: row.confidence, rawText: null },
      createdAtMode: "fixed",
      localDayId,
      localDayStart,
      analysisMode: "bulk",
      distanceSource: "actual",
      importBatchId: importBatchRef.id,
      tipEuro: row.tipEuro,
      bulkContext: {
        timezone,
        sourceApp: payload.sourceApp ?? "other",
        screenshotCount: screenshotRefs.length,
      },
    });

    offerWrites.push({
      docRef: offerRef,
      document: {
        ...document,
        importedAt: Timestamp.fromDate(createdAt),
      },
    });
  }

  const importBatchDocument = {
    createdAt: Timestamp.fromDate(createdAt),
    localDayId,
    localDayStart: Timestamp.fromDate(localDayStart),
    timezone,
    sourceApp: payload.sourceApp ?? "other",
    screenshotRefs: screenshotRefs.map((ref) => ({
      bucket: ref.bucket ?? null,
      path: ref.path ?? null,
      sha256: ref.sha256 ?? null,
    })),
    savedCount: validRows.length,
    skippedCount: skipped.length,
    usagePeriodKey: entitlement.periodKey,
  };

  const { usedAfter } = await saveOffersWithUsage({
    uid,
    entitlement,
    usageIncrement: validRows.length,
    writes: [
      ...offerWrites,
      {
        docRef: importBatchRef,
        document: importBatchDocument,
      },
    ],
  });

  const kpis = await readShiftKpis({
    uid,
    localDayId,
    now: new Date(),
  });
  const response: CommitBulkOffersImportResponse = {
    importBatchId: importBatchRef.id,
    savedCount: validRows.length,
    skippedCount: skipped.length,
    skipped,
    usage: {
      periodKey: entitlement.periodKey,
      usedAfter,
      limit: entitlement.offerLimit ?? null,
      remaining:
        entitlement.offerLimit == null
          ? null
          : Math.max(entitlement.offerLimit - usedAfter, 0),
    },
    kpis,
  };
  return response;
});
