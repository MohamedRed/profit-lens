package com.profitlens.android.core.data.model

import java.util.Date

data class Entitlement(
  val planId: String,
  val status: String,
  val offerLimit: Int?,
  val deviceLimit: Int,
  val periodStart: Date,
  val periodEnd: Date,
  val periodKey: String,
  val cancelAtPeriodEnd: Boolean,
  val stripeCustomerId: String?,
  val stripePriceId: String?,
  val stripeSubscriptionId: String?,
)

data class OfferUsage(
  val offerCount: Int,
  val periodStart: Date,
  val periodEnd: Date,
)

data class BillingPlan(
  val id: String,
  val priceId: String,
  val monthlyPriceEuro: Double,
  val offerLimit: Int?,
)

data class ManagedSubscriptionSnapshot(
  val subscriptionId: String,
  val status: String,
  val cancelAtPeriodEnd: Boolean,
  val currentPeriodEndSec: Long,
  val currentPriceId: String,
  val currentPlanId: String,
)

data class ManagedSubscriptionStateSnapshot(
  val primarySubscriptionId: String,
  val duplicateCleanupScheduledCount: Int,
  val managedSubscriptions: List<ManagedSubscriptionSnapshot>,
)

data class SubscriptionCheckoutEligibility(
  val eligibleForCheckout: Boolean,
  val manageableSubscriptionCount: Int,
  val duplicateSubscriptionCount: Int,
  val primarySubscriptionId: String?,
)

val billingPlans = listOf(
  BillingPlan(id = "tier_9", priceId = "tier_9", monthlyPriceEuro = 9.99, offerLimit = 250),
  BillingPlan(id = "tier_24", priceId = "tier_24", monthlyPriceEuro = 24.99, offerLimit = 1000),
  BillingPlan(id = "tier_34", priceId = "tier_34", monthlyPriceEuro = 34.99, offerLimit = null),
)
