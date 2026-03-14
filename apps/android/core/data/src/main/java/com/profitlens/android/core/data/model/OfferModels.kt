package com.profitlens.android.core.data.model

import java.util.Date

data class OfferCurrentLocation(
  val lat: Double,
  val lng: Double,
)

data class OfferInputPayload(
  val payoutEuro: Double,
  val distanceKm: Double?,
  val durationMinutes: Double?,
  val pickupName: String?,
  val pickupAddress: String?,
  val dropoffName: String?,
  val dropoffAddress: String?,
)

data class OfferRecord(
  val id: String,
  val source: String,
  val createdAt: Date?,
  val analysisMode: String?,
  val importBatchId: String?,
  val distanceSource: String?,
  val payoutEuro: Double,
  val distanceKm: Double,
  val durationMinutes: Double?,
  val tipEuro: Double?,
  val pickupName: String?,
  val pickupAddress: String?,
  val dropoffName: String?,
  val dropoffAddress: String?,
  val netProfitEuro: Double,
  val totalCostsEuro: Double,
  val energyCostEuro: Double?,
  val maintenanceCostEuro: Double?,
  val depreciationCostEuro: Double?,
  val socialContributionsEuro: Double?,
  val incomeTaxEuro: Double?,
  val fixedCostAllocationEuro: Double?,
  val routeVerifiedDistanceKm: Double?,
  val routeVerifiedDurationMinutes: Double?,
  val localDayId: String?,
  val localDayStart: Date?,
)

data class OfferStatsDay(
  val dayStart: Date,
  val offerCount: Int,
  val netProfitEuro: Double,
)

data class OfferAnalysisRecord(
  val id: String,
  val source: String,
  val createdAtIso: String,
  val payoutEuro: Double,
  val distanceKm: Double?,
  val durationMinutes: Double?,
  val pickupName: String?,
  val pickupAddress: String?,
  val dropoffName: String?,
  val dropoffAddress: String?,
  val routeVerificationDistanceKm: Double?,
  val routeVerificationDurationMinutes: Double?,
  val totalCostsEuro: Double,
  val netProfitEuro: Double,
)
