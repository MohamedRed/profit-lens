package com.profitlens.android.providers

import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.functions.ktx.functions
import com.google.firebase.ktx.Firebase
import com.profitlens.android.BuildConfig
import kotlinx.coroutines.tasks.await

class LiveOfferFunctionsRepository(private val firebaseReady: Boolean) {
  private val functions: FirebaseFunctions? = if (firebaseReady) {
    Firebase.functions(BuildConfig.FUNCTIONS_REGION)
  } else {
    null
  }

  suspend fun registerDevice(deviceId: String, userAgent: String) {
    val callable = functions?.getHttpsCallable("registerDevice") ?: return
    callable.call(
      mapOf(
        "deviceId" to deviceId,
        "platform" to "android",
        "userAgent" to userAgent,
      ),
    ).await()
  }

  suspend fun scoreLiveOffer(payload: LiveOfferRequest): LiveScoreResponse {
    val callable = functions?.getHttpsCallable("scoreLiveOffer")
      ?: error("Firebase is not configured.")
    val data = callable.call(payload.toMap()).await().data as Map<*, *>
    return LiveScoreResponse(
      sessionId = data["sessionId"] as String,
      status = data["status"] as String,
      reasonCode = data["reasonCode"] as String?,
      summary = (data["summary"] as? Map<*, *>)?.toSummary(),
    )
  }

  suspend fun commitLiveOffer(payload: LiveOfferRequest): LiveCommitResponse {
    val callable = functions?.getHttpsCallable("commitLiveOfferVerdict")
      ?: error("Firebase is not configured.")
    val data = callable.call(payload.toMap()).await().data as Map<*, *>
    @Suppress("UNCHECKED_CAST")
    return LiveCommitResponse(
      sessionId = data["sessionId"] as String,
      offerId = data["offerId"] as String,
      status = data["status"] as String,
      usage = data["usage"] as Map<String, Any?>,
    )
  }
}

private fun LiveOfferRequest.toMap(): Map<String, Any?> {
  return mapOf(
    "deviceId" to deviceId,
    "vehicleId" to vehicleId,
    "timezone" to timezone,
    "currentLocation" to currentLocation,
    "offer" to offer,
    "provider" to provider,
    "liveOfferSessionId" to liveOfferSessionId,
    "captureContext" to mapOf(
      "parserVersion" to captureContext.parserVersion,
      "packageName" to captureContext.packageName,
      "screenVariant" to captureContext.screenVariant,
      "confidence" to captureContext.confidence,
      "locationAgeMs" to captureContext.locationAgeMs,
    ),
  )
}

private fun Map<*, *>.toSummary(): LiveScoreSummary {
  return LiveScoreSummary(
    provider = this["provider"] as String,
    payoutEuro = (this["payoutEuro"] as Number).toDouble(),
    distanceKm = (this["distanceKm"] as Number).toDouble(),
    durationMinutes = (this["durationMinutes"] as? Number)?.toDouble(),
    netProfitEuro = (this["netProfitEuro"] as Number).toDouble(),
    minimumTargetEuro = (this["minimumTargetEuro"] as Number).toDouble(),
    profitable = this["profitable"] as Boolean,
    pickupAddress = this["pickupAddress"] as String?,
    dropoffAddress = this["dropoffAddress"] as String?,
  )
}
