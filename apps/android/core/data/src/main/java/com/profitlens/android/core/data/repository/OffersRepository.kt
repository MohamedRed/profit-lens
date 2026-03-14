package com.profitlens.android.core.data.repository

import android.content.ContentResolver
import android.net.Uri
import android.util.Base64
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.functions.FirebaseFunctions
import com.profitlens.android.core.data.model.OfferAnalysisRecord
import com.profitlens.android.core.data.model.OfferRecord
import com.profitlens.android.core.data.model.OfferStatsDay
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class OffersRepository @Inject constructor(
  private val firestore: FirebaseFirestore?,
  private val functions: FirebaseFunctions?,
  private val contentResolver: ContentResolver,
) {
  fun watchOffers(uid: String, limitCount: Long = 30): Flow<List<OfferRecord>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("offers")
      .orderBy("createdAt", Query.Direction.DESCENDING)
      .limit(limitCount)
      .addSnapshotListener { snapshot, _ ->
        trySend(snapshot?.documents.orEmpty().mapNotNull(::mapOffer))
      }
    awaitClose { registration.remove() }
  }

  fun watchOffer(uid: String, offerId: String): Flow<OfferRecord?> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("offers")
      .document(offerId)
      .addSnapshotListener { snapshot, _ -> trySend(snapshot?.let(::mapOffer)) }
    awaitClose { registration.remove() }
  }

  fun watchOfferStats(uid: String): Flow<List<OfferStatsDay>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("offerStats")
      .orderBy("dayStart", Query.Direction.DESCENDING)
      .limit(90)
      .addSnapshotListener { snapshot, _ ->
        val items = snapshot?.documents.orEmpty().mapNotNull(::mapStats)
        trySend(items)
      }
    awaitClose { registration.remove() }
  }

  suspend fun analyzeManualOffer(payload: Map<String, Any?>): OfferAnalysisRecord {
    val callable = functions?.getHttpsCallable("analyzeOffer") ?: error("Firebase is not configured.")
    val data = callable.call(payload).await().data as Map<*, *>
    return parseAnalysisRecord(data)
  }

  suspend fun analyzeScreenshotOffer(payload: Map<String, Any?>, imageUri: Uri): OfferAnalysisRecord {
    val bytes = contentResolver.openInputStream(imageUri)?.use { it.readBytes() }
      ?: error("Image could not be read.")
    val encoded = Base64.encodeToString(bytes, Base64.NO_WRAP)
    val mimeType = contentResolver.getType(imageUri) ?: "image/png"
    val fullPayload = payload + mapOf("imageBase64" to encoded, "mimeType" to mimeType)
    return analyzeManualOffer(fullPayload)
  }

  suspend fun verifyRoute(pickupAddress: String, dropoffAddress: String): Map<*, *> {
    val callable = functions?.getHttpsCallable("verifyOfferRoute") ?: error("Firebase is not configured.")
    return callable.call(
      mapOf("pickupAddress" to pickupAddress, "dropoffAddress" to dropoffAddress),
    ).await().data as Map<*, *>
  }

  suspend fun parseBulkScreenshot(payload: Map<String, Any?>, imageUri: Uri): Map<*, *> {
    val callable = functions?.getHttpsCallable("parseBulkOffersScreenshot") ?: error("Firebase is not configured.")
    val bytes = contentResolver.openInputStream(imageUri)?.use { it.readBytes() }
      ?: error("Image could not be read.")
    val fullPayload = payload + mapOf(
      "imageBase64" to Base64.encodeToString(bytes, Base64.NO_WRAP),
      "mimeType" to (contentResolver.getType(imageUri) ?: "image/png"),
    )
    return callable.call(fullPayload).await().data as Map<*, *>
  }

  suspend fun commitBulkImport(payload: Map<String, Any?>): Map<*, *> {
    val callable = functions?.getHttpsCallable("commitBulkOffersImport") ?: error("Firebase is not configured.")
    return callable.call(payload).await().data as Map<*, *>
  }

  private fun parseAnalysisRecord(data: Map<*, *>): OfferAnalysisRecord {
    val record = data["record"] as? Map<*, *> ?: error("Missing analysis record.")
    val offer = record["offer"] as? Map<*, *> ?: emptyMap<String, Any?>()
    val breakdown = record["breakdown"] as? Map<*, *> ?: emptyMap<String, Any?>()
    val route = offer["routeVerification"] as? Map<*, *>
    return OfferAnalysisRecord(
      id = record["id"] as String,
      source = record["source"] as? String ?: "manual",
      createdAtIso = record["createdAt"] as? String ?: "",
      payoutEuro = (offer["payoutEuro"] as Number).toDouble(),
      distanceKm = (offer["distanceKm"] as? Number)?.toDouble(),
      durationMinutes = (offer["durationMinutes"] as? Number)?.toDouble(),
      pickupName = offer["pickupName"] as? String,
      pickupAddress = offer["pickupAddress"] as? String,
      dropoffName = offer["dropoffName"] as? String,
      dropoffAddress = offer["dropoffAddress"] as? String,
      routeVerificationDistanceKm = (route?.get("distanceKm") as? Number)?.toDouble(),
      routeVerificationDurationMinutes = (route?.get("durationMinutes") as? Number)?.toDouble(),
      totalCostsEuro = (breakdown["totalCosts"] as Number).toDouble(),
      netProfitEuro = (breakdown["netProfit"] as Number).toDouble(),
    )
  }

  private fun mapOffer(snapshot: DocumentSnapshot): OfferRecord? {
    val data = snapshot.data ?: return null
    val breakdown = data["breakdown"] as? Map<*, *> ?: emptyMap<String, Any?>()
    val offer = data["offer"] as? Map<*, *> ?: data
    val route = offer["routeVerification"] as? Map<*, *> ?: emptyMap<String, Any?>()
    return OfferRecord(
      id = snapshot.id,
      source = asString(data["source"]) ?: "manual",
      createdAt = asDate(data["createdAt"]),
      analysisMode = asString(data["analysisMode"]),
      importBatchId = asString(data["importBatchId"]),
      distanceSource = asString(data["distanceSource"]),
      payoutEuro = asDouble(offer["payoutEuro"]) ?: 0.0,
      distanceKm = asDouble(offer["distanceKm"]) ?: asDouble(data["distanceKm"]) ?: 0.0,
      durationMinutes = asDouble(offer["durationMinutes"]) ?: asDouble(data["durationMinutes"]),
      tipEuro = asDouble(data["tipEuro"]),
      pickupName = asString(offer["pickupName"]),
      pickupAddress = asString(offer["pickupAddress"]),
      dropoffName = asString(offer["dropoffName"]),
      dropoffAddress = asString(offer["dropoffAddress"]),
      netProfitEuro = asDouble(breakdown["netProfitEuro"]) ?: asDouble(breakdown["netProfit"]) ?: 0.0,
      totalCostsEuro = asDouble(breakdown["totalCostsEuro"]) ?: asDouble(breakdown["totalCosts"]) ?: 0.0,
      energyCostEuro = asDouble(breakdown["energyCostEuro"]) ?: asDouble(breakdown["energyCost"]),
      maintenanceCostEuro = asDouble(breakdown["maintenanceCostEuro"]) ?: asDouble(breakdown["maintenanceCost"]),
      depreciationCostEuro = asDouble(breakdown["depreciationCostEuro"]) ?: asDouble(breakdown["depreciationCost"]),
      socialContributionsEuro = asDouble(breakdown["socialContributionsEuro"]) ?: asDouble(breakdown["socialContributions"]),
      incomeTaxEuro = asDouble(breakdown["incomeTaxEuro"]) ?: asDouble(breakdown["incomeTax"]),
      fixedCostAllocationEuro = asDouble(breakdown["fixedCostAllocationEuro"]) ?: asDouble(breakdown["fixedCostAllocation"]),
      routeVerifiedDistanceKm = asDouble(route["distanceKm"]),
      routeVerifiedDurationMinutes = asDouble(route["durationMinutes"]),
      localDayId = asString(data["localDayId"]),
      localDayStart = asDate(data["localDayStart"]),
    )
  }

  private fun mapStats(snapshot: DocumentSnapshot): OfferStatsDay? {
    val data = snapshot.data ?: return null
    val dayStart = asDate(data["dayStart"]) ?: return null
    return OfferStatsDay(
      dayStart = dayStart,
      offerCount = asInt(data["offerCount"]) ?: 0,
      netProfitEuro = asDouble(data["totalNetProfitEuro"]) ?: asDouble(data["netProfitEuro"]) ?: 0.0,
    )
  }
}
