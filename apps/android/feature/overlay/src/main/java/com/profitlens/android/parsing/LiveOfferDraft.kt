package com.profitlens.android.parsing

data class LiveOfferDraft(
  val provider: String,
  val packageName: String,
  val payoutEuro: Double,
  val distanceKm: Double?,
  val durationMinutes: Double?,
  val pickupName: String?,
  val pickupAddress: String?,
  val dropoffName: String?,
  val dropoffAddress: String?,
  val confidence: Double,
  val parserVersion: String,
  val screenVariant: String,
)
