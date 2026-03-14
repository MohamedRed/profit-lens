package com.profitlens.android.providers

data class LiveOfferCaptureContext(
  val parserVersion: String,
  val packageName: String,
  val screenVariant: String?,
  val confidence: Double?,
  val locationAgeMs: Long?,
)

data class LiveOfferRequest(
  val deviceId: String,
  val vehicleId: String?,
  val timezone: String,
  val currentLocation: Map<String, Double>?,
  val offer: Map<String, Any?>,
  val provider: String,
  val liveOfferSessionId: String,
  val captureContext: LiveOfferCaptureContext,
)

data class LiveScoreSummary(
  val provider: String,
  val payoutEuro: Double,
  val distanceKm: Double,
  val durationMinutes: Double?,
  val netProfitEuro: Double,
  val minimumTargetEuro: Double,
  val profitable: Boolean,
  val pickupAddress: String?,
  val dropoffAddress: String?,
)

data class LiveScoreResponse(
  val sessionId: String,
  val status: String,
  val reasonCode: String?,
  val summary: LiveScoreSummary?,
)

data class LiveCommitResponse(
  val sessionId: String,
  val offerId: String,
  val status: String,
  val usage: Map<String, Any?>,
)
