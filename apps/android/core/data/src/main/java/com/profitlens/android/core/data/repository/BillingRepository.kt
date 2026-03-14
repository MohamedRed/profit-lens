package com.profitlens.android.core.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.functions.FirebaseFunctions
import com.profitlens.android.core.data.model.Entitlement
import com.profitlens.android.core.data.model.ManagedSubscriptionSnapshot
import com.profitlens.android.core.data.model.ManagedSubscriptionStateSnapshot
import com.profitlens.android.core.data.model.OfferUsage
import com.profitlens.android.core.data.model.SubscriptionCheckoutEligibility
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class BillingRepository @Inject constructor(
  private val firestore: FirebaseFirestore?,
  private val functions: FirebaseFunctions?,
) {
  fun watchEntitlement(uid: String): Flow<Entitlement?> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("entitlements")
      .document("current")
      .addSnapshotListener { snapshot, _ ->
        val data = snapshot?.data
        if (data == null) {
          trySend(null)
          return@addSnapshotListener
        }
        val periodStart = asDate(data["periodStart"])
        val periodEnd = asDate(data["periodEnd"])
        if (periodStart == null || periodEnd == null) {
          trySend(null)
          return@addSnapshotListener
        }
        trySend(
          Entitlement(
            planId = asString(data["planId"]) ?: "free",
            status = asString(data["status"]) ?: "free",
            offerLimit = asInt(data["offerLimit"]),
            deviceLimit = asInt(data["deviceLimit"]) ?: 1,
            periodStart = periodStart,
            periodEnd = periodEnd,
            periodKey = asString(data["periodKey"]) ?: "${periodStart.time}-${periodEnd.time}",
            cancelAtPeriodEnd = data["cancelAtPeriodEnd"] as? Boolean ?: false,
            stripeCustomerId = asString(data["stripeCustomerId"]),
            stripePriceId = asString(data["stripePriceId"]),
            stripeSubscriptionId = asString(data["stripeSubscriptionId"]),
          ),
        )
      }
    awaitClose { registration.remove() }
  }

  fun watchUsage(uid: String, periodKey: String): Flow<OfferUsage?> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("usage")
      .document(periodKey)
      .addSnapshotListener { snapshot, _ ->
        val data = snapshot?.data
        val periodStart = data?.let { asDate(it["periodStart"]) }
        val periodEnd = data?.let { asDate(it["periodEnd"]) }
        if (data == null || periodStart == null || periodEnd == null) {
          trySend(null)
          return@addSnapshotListener
        }
        trySend(
          OfferUsage(
            offerCount = asInt(data["offerCount"]) ?: 0,
            periodStart = periodStart,
            periodEnd = periodEnd,
          ),
        )
      }
    awaitClose { registration.remove() }
  }

  suspend fun createAndroidCheckoutSession(planId: String, returnUrl: String): String {
    val callable = functions?.getHttpsCallable("createAndroidCheckoutSession")
      ?: error("Firebase is not configured.")
    val data = callable.call(mapOf("planId" to planId, "returnUrl" to returnUrl)).await().data as Map<*, *>
    return data["url"] as? String ?: error("Missing checkout URL.")
  }

  suspend fun createAndroidPortalSession(returnUrl: String): String {
    val callable = functions?.getHttpsCallable("createAndroidCustomerPortalSession")
      ?: error("Firebase is not configured.")
    val data = callable.call(mapOf("returnUrl" to returnUrl)).await().data as Map<*, *>
    return data["url"] as? String ?: error("Missing portal URL.")
  }

  suspend fun checkEligibility(): SubscriptionCheckoutEligibility {
    val callable = functions?.getHttpsCallable("checkSubscriptionEligibility")
      ?: error("Firebase is not configured.")
    val data = callable.call(emptyMap<String, Any>()).await().data as Map<*, *>
    return SubscriptionCheckoutEligibility(
      eligibleForCheckout = data["eligibleForCheckout"] as? Boolean ?: false,
      manageableSubscriptionCount = (data["manageableSubscriptionCount"] as? Number)?.toInt() ?: 0,
      duplicateSubscriptionCount = (data["duplicateSubscriptionCount"] as? Number)?.toInt() ?: 0,
      primarySubscriptionId = data["primarySubscriptionId"] as? String,
    )
  }

  suspend fun getManagedState(): ManagedSubscriptionStateSnapshot {
    val callable = functions?.getHttpsCallable("getManagedSubscriptionState")
      ?: error("Firebase is not configured.")
    val data = callable.call(emptyMap<String, Any>()).await().data as Map<*, *>
    val primary = data["primarySubscriptionId"] as? String ?: ""
    val subscriptions = (data["managedSubscriptions"] as? List<*>).orEmpty().mapNotNull { item ->
      val map = item as? Map<*, *> ?: return@mapNotNull null
      val subscriptionId = map["subscriptionId"] as? String ?: return@mapNotNull null
      ManagedSubscriptionSnapshot(
        subscriptionId = subscriptionId,
        status = map["status"] as? String ?: "",
        cancelAtPeriodEnd = map["cancelAtPeriodEnd"] as? Boolean ?: false,
        currentPeriodEndSec = (map["currentPeriodEndSec"] as? Number)?.toLong() ?: 0L,
        currentPriceId = map["currentPriceId"] as? String ?: "",
        currentPlanId = map["currentPlanId"] as? String ?: "",
      )
    }
    return ManagedSubscriptionStateSnapshot(
      primarySubscriptionId = primary,
      duplicateCleanupScheduledCount = (data["duplicateCleanupScheduledCount"] as? Number)?.toInt() ?: 0,
      managedSubscriptions = subscriptions,
    )
  }
}
