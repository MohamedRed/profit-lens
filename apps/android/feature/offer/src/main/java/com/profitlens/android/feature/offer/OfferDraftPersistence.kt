package com.profitlens.android.feature.offer

import com.profitlens.android.core.data.model.OfferDraftCache
import java.time.ZoneId

fun OfferDraftCache.toOfferDraft(): OfferDraft {
  return OfferDraft(
    payoutEuro = payoutEuro,
    distanceKm = distanceKm,
    durationMinutes = durationMinutes,
    pickupName = pickupName,
    pickupAddress = pickupAddress,
    dropoffName = dropoffName,
    dropoffAddress = dropoffAddress,
  )
}

fun OfferDraft.toDraftCache(vehicleId: String): OfferDraftCache {
  return OfferDraftCache(
    vehicleId = vehicleId.ifBlank { null },
    payoutEuro = payoutEuro,
    distanceKm = distanceKm,
    durationMinutes = durationMinutes,
    pickupName = pickupName,
    pickupAddress = pickupAddress,
    dropoffName = dropoffName,
    dropoffAddress = dropoffAddress,
  )
}

fun OfferDraft.toAnalyzePayload(deviceId: String, lat: Double, lng: Double): Map<String, Any?> {
  return mapOf(
    "deviceId" to deviceId,
    "timezone" to ZoneId.systemDefault().id,
    "currentLocation" to mapOf("lat" to lat, "lng" to lng),
    "offer" to mapOf(
      "payoutEuro" to payoutEuro.toDoubleOrNull(),
      "distanceKm" to distanceKm.toDoubleOrNull(),
      "durationMinutes" to durationMinutes.toDoubleOrNull(),
      "pickupName" to pickupName.ifBlank { null },
      "pickupAddress" to pickupAddress.ifBlank { null },
      "dropoffName" to dropoffName.ifBlank { null },
      "dropoffAddress" to dropoffAddress.ifBlank { null },
    ),
  )
}

@Suppress("UNCHECKED_CAST")
fun buildBulkPreview(parsed: Map<*, *>): BulkImportPreview {
  return BulkImportPreview(
    screenshotRefs = listOfNotNull(parsed["screenshotRef"] as? Map<String, Any?>),
    rows = (parsed["parsedRows"] as? List<Map<String, Any?>>).orEmpty(),
    parsedCount = ((parsed["parsedRows"] as? List<*>)?.size ?: 0),
    invalidCount = ((parsed["invalidRows"] as? List<*>)?.size ?: 0),
  )
}
