package com.profitlens.android.core.data.model

import kotlinx.serialization.Serializable

@Serializable
data class OfferDraftCache(
  val vehicleId: String?,
  val payoutEuro: String,
  val distanceKm: String,
  val durationMinutes: String,
  val pickupName: String,
  val pickupAddress: String,
  val dropoffName: String,
  val dropoffAddress: String,
)

@Serializable
data class HelpDraftCache(
  val description: String,
)

@Serializable
data class HistoryUiCache(
  val selectedMode: String,
  val scrollOffset: Int,
)
