package com.profitlens.android.core.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.profitlens.android.core.data.model.UserProfile
import com.profitlens.android.core.data.model.defaultUserProfile
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class ProfileRepository @Inject constructor(
  private val firestore: FirebaseFirestore?,
) {
  fun watchProfile(uid: String, email: String?): Flow<UserProfile> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(defaultUserProfile(uid, email))
      awaitClose { }
      return@callbackFlow
    }
    val ref = db.collection("users").document(uid)
    val registration = ref.addSnapshotListener { snapshot, _ ->
      val data = snapshot?.data
      val profile = if (data == null) {
        defaultUserProfile(uid, email)
      } else {
        UserProfile(
          uid = uid,
          email = data["email"] as? String ?: email,
          countryCode = asString(data["countryCode"]) ?: "FR",
          currencyCode = asString(data["currencyCode"]) ?: "EUR",
          activity = asString(data["activity"]) ?: "deliveryServices",
          socialContributionRate = asDouble(data["socialContributionRate"]) ?: 0.212,
          incomeTaxRate = asDouble(data["incomeTaxRate"]),
          useLiberatoryTax = data["useLiberatoryTax"] as? Boolean ?: true,
          fixedCostAllocation = asString(data["fixedCostAllocation"]) ?: "perDelivery",
          monthlyFixedCosts = asDouble(data["monthlyFixedCosts"]) ?: 0.0,
          monthlyWorkingHours = asDouble(data["monthlyWorkingHours"]) ?: 160.0,
          monthlyDistanceKm = asDouble(data["monthlyDistanceKm"]) ?: 3000.0,
          monthlyDeliveries = asInt(data["monthlyDeliveries"]) ?: 120,
          minProfitabilityEuro = asDouble(data["minProfitabilityEuro"]) ?: 2.0,
          defaultVehicleId = asString(data["defaultVehicleId"]),
          useFranceDefaults = data["useFranceDefaults"] as? Boolean ?: true,
          preferredLocale = asString(data["preferredLocale"]) ?: "fr",
        )
      }
      trySend(profile)
    }
    awaitClose { registration.remove() }
  }

  suspend fun save(profile: UserProfile) {
    val db = firestore ?: error("Firebase is not configured.")
    db.collection("users").document(profile.uid).set(
      mapOf(
        "email" to profile.email,
        "countryCode" to profile.countryCode,
        "currencyCode" to profile.currencyCode,
        "activity" to profile.activity,
        "socialContributionRate" to profile.socialContributionRate,
        "incomeTaxRate" to profile.incomeTaxRate,
        "useLiberatoryTax" to profile.useLiberatoryTax,
        "fixedCostAllocation" to profile.fixedCostAllocation,
        "monthlyFixedCosts" to profile.monthlyFixedCosts,
        "monthlyWorkingHours" to profile.monthlyWorkingHours,
        "monthlyDistanceKm" to profile.monthlyDistanceKm,
        "monthlyDeliveries" to profile.monthlyDeliveries,
        "minProfitabilityEuro" to profile.minProfitabilityEuro,
        "defaultVehicleId" to profile.defaultVehicleId,
        "useFranceDefaults" to profile.useFranceDefaults,
        "preferredLocale" to profile.preferredLocale,
      ),
      SetOptions.merge(),
    ).await()
  }
}
