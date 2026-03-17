package com.profitlens.android.feature.offer

import android.net.Uri
import com.profitlens.android.core.data.model.OfferAnalysisRecord
import com.profitlens.android.core.data.model.OfferRecord
import com.profitlens.android.core.data.model.UserProfile
import com.profitlens.android.core.data.model.VehicleProfile

data class OfferDraft(
  val payoutEuro: String = "",
  val distanceKm: String = "",
  val durationMinutes: String = "",
  val pickupName: String = "",
  val pickupAddress: String = "",
  val dropoffName: String = "",
  val dropoffAddress: String = "",
)

data class BulkImportPreview(
  val screenshotRefs: List<Map<String, Any?>>,
  val rows: List<Map<String, Any?>>,
  val parsedCount: Int,
  val invalidCount: Int,
)

data class OfferUiState(
  val loading: Boolean = true,
  val message: String? = null,
  val profile: UserProfile? = null,
  val vehicles: List<VehicleProfile> = emptyList(),
  val selectedVehicleId: String = "",
  val manualDraft: OfferDraft = OfferDraft(),
  val screenshotUri: Uri? = null,
  val bulkScreenshotUri: Uri? = null,
  val remainingOffersLabel: String = "—",
  val latestAnalysis: OfferAnalysisRecord? = null,
  val recentOffers: List<OfferRecord> = emptyList(),
  val bulkPreview: BulkImportPreview? = null,
  val analyzing: Boolean = false,
  val savingProfitabilityTarget: Boolean = false,
)
