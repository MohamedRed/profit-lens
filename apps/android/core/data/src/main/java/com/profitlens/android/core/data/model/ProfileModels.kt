package com.profitlens.android.core.data.model

data class UserProfile(
  val uid: String,
  val email: String?,
  val countryCode: String,
  val currencyCode: String,
  val activity: String,
  val socialContributionRate: Double,
  val incomeTaxRate: Double?,
  val useLiberatoryTax: Boolean,
  val fixedCostAllocation: String,
  val monthlyFixedCosts: Double,
  val monthlyWorkingHours: Double,
  val monthlyDistanceKm: Double,
  val monthlyDeliveries: Int,
  val minProfitabilityEuro: Double,
  val defaultVehicleId: String?,
  val useFranceDefaults: Boolean,
  val preferredLocale: String,
)

fun defaultUserProfile(uid: String, email: String?): UserProfile {
  return UserProfile(
    uid = uid,
    email = email,
    countryCode = "FR",
    currencyCode = "EUR",
    activity = "deliveryServices",
    socialContributionRate = 0.212,
    incomeTaxRate = 0.017,
    useLiberatoryTax = true,
    fixedCostAllocation = "perDelivery",
    monthlyFixedCosts = 0.0,
    monthlyWorkingHours = 160.0,
    monthlyDistanceKm = 3000.0,
    monthlyDeliveries = 120,
    minProfitabilityEuro = 2.0,
    defaultVehicleId = null,
    useFranceDefaults = true,
    preferredLocale = "fr",
  )
}
