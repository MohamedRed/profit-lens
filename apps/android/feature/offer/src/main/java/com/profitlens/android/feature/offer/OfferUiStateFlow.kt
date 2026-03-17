package com.profitlens.android.feature.offer

import android.net.Uri
import com.profitlens.android.core.data.model.Entitlement
import com.profitlens.android.core.data.model.OfferAnalysisRecord
import com.profitlens.android.core.data.model.OfferRecord
import com.profitlens.android.core.data.model.OfferUsage
import com.profitlens.android.core.data.model.UserProfile
import com.profitlens.android.core.data.model.VehicleProfile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

internal data class OfferSelectionSnapshot(
  val profile: UserProfile?,
  val vehicles: List<VehicleProfile>,
  val selectedVehicleId: String,
  val draft: OfferDraft,
  val screenshotUri: Uri?,
  val bulkScreenshotUri: Uri?,
)

internal data class OfferInputSnapshot(
  val draft: OfferDraft,
  val screenshotUri: Uri?,
  val bulkScreenshotUri: Uri?,
)

internal data class OfferUsageSnapshot(
  val remainingOffersLabel: String,
  val latestAnalysis: OfferAnalysisRecord?,
  val recentOffers: List<OfferRecord>,
)

internal data class OfferStatusSnapshot(
  val bulkPreview: BulkImportPreview?,
  val message: String?,
  val analyzing: Boolean,
  val savingProfitabilityTarget: Boolean,
  val usage: OfferUsageSnapshot,
)

internal fun buildOfferUiStateFlow(
  scope: CoroutineScope,
  isAuthenticated: () -> Boolean,
  profile: StateFlow<UserProfile?>,
  vehicles: StateFlow<List<VehicleProfile>>,
  selectedVehicleId: MutableStateFlow<String>,
  draft: MutableStateFlow<OfferDraft>,
  screenshotUri: MutableStateFlow<Uri?>,
  bulkScreenshotUri: MutableStateFlow<Uri?>,
  entitlement: StateFlow<Entitlement?>,
  usage: StateFlow<OfferUsage?>,
  latestAnalysis: MutableStateFlow<OfferAnalysisRecord?>,
  recentOffers: StateFlow<List<OfferRecord>>,
  bulkPreview: MutableStateFlow<BulkImportPreview?>,
  message: MutableStateFlow<String?>,
  analyzing: MutableStateFlow<Boolean>,
  savingProfitabilityTarget: MutableStateFlow<Boolean>,
): StateFlow<OfferUiState> {
  return combine(
    combine(
      combine(profile, vehicles, selectedVehicleId) { profileValue, vehiclesValue, selectedVehicleValue ->
        Triple(profileValue, vehiclesValue, selectedVehicleValue)
      },
      combine(draft, screenshotUri, bulkScreenshotUri) { draftValue, screenshotValue, bulkScreenshotValue ->
        OfferInputSnapshot(
          draft = draftValue,
          screenshotUri = screenshotValue,
          bulkScreenshotUri = bulkScreenshotValue,
        )
      },
    ) { selectionValues, inputSnapshot ->
      OfferSelectionSnapshot(
        profile = selectionValues.first,
        vehicles = selectionValues.second,
        selectedVehicleId = selectionValues.third,
        draft = inputSnapshot.draft,
        screenshotUri = inputSnapshot.screenshotUri,
        bulkScreenshotUri = inputSnapshot.bulkScreenshotUri,
      )
    },
    combine(
      combine(entitlement, usage, latestAnalysis, recentOffers) { entitlementValue, usageValue, latestValue, recentValue ->
        OfferUsageSnapshot(
          remainingOffersLabel = formatRemainingOffersLabel(
            offerLimit = entitlementValue?.offerLimit,
            usage = usageValue,
          ),
          latestAnalysis = latestValue,
          recentOffers = recentValue,
        )
      },
      combine(bulkPreview, message, analyzing, savingProfitabilityTarget) { bulkValue, messageValue, analyzingValue, savingValue ->
        OfferStatusSnapshot(
          bulkPreview = bulkValue,
          message = messageValue,
          analyzing = analyzingValue,
          savingProfitabilityTarget = savingValue,
          usage = OfferUsageSnapshot(
            remainingOffersLabel = "—",
            latestAnalysis = null,
            recentOffers = emptyList(),
          ),
        )
      },
    ) { usageSnapshot, statusSnapshot ->
      statusSnapshot.copy(usage = usageSnapshot)
    },
  ) { selectionSnapshot, statusSnapshot ->
    val profileDefaultVehicleId = selectionSnapshot.profile?.defaultVehicleId
    val defaultVehicleId = when {
      selectionSnapshot.selectedVehicleId.isNotBlank() -> selectionSnapshot.selectedVehicleId
      !profileDefaultVehicleId.isNullOrBlank() -> profileDefaultVehicleId
      else -> selectionSnapshot.vehicles.firstOrNull()?.id.orEmpty()
    }
    OfferUiState(
      loading = selectionSnapshot.profile == null && isAuthenticated(),
      message = statusSnapshot.message,
      profile = selectionSnapshot.profile,
      vehicles = selectionSnapshot.vehicles,
      selectedVehicleId = defaultVehicleId,
      manualDraft = selectionSnapshot.draft,
      screenshotUri = selectionSnapshot.screenshotUri,
      bulkScreenshotUri = selectionSnapshot.bulkScreenshotUri,
      remainingOffersLabel = statusSnapshot.usage.remainingOffersLabel,
      latestAnalysis = statusSnapshot.usage.latestAnalysis,
      recentOffers = statusSnapshot.usage.recentOffers,
      bulkPreview = statusSnapshot.bulkPreview,
      analyzing = statusSnapshot.analyzing,
      savingProfitabilityTarget = statusSnapshot.savingProfitabilityTarget,
    )
  }.stateIn(scope, SharingStarted.WhileSubscribed(5_000), OfferUiState())
}

private fun formatRemainingOffersLabel(
  offerLimit: Int?,
  usage: OfferUsage?,
): String {
  return when {
    offerLimit == null -> "Unlimited"
    usage == null -> "—"
    else -> (offerLimit - usage.offerCount).coerceAtLeast(0).toString()
  }
}
