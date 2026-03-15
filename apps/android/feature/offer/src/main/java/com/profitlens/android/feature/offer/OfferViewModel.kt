package com.profitlens.android.feature.offer

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.apps.PendingSharedImageRepository
import com.profitlens.android.core.data.repository.BillingRepository
import com.profitlens.android.core.data.repository.OffersRepository
import com.profitlens.android.core.data.repository.ProfileRepository
import com.profitlens.android.core.data.repository.SessionStateRepository
import com.profitlens.android.core.data.repository.VehiclesRepository
import com.profitlens.android.data.ProfitLensDeviceIdStore
import com.profitlens.android.location.LiveLocationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class OfferViewModel @Inject constructor(
  authRepository: AuthRepository,
  private val profileRepository: ProfileRepository,
  private val vehiclesRepository: VehiclesRepository,
  private val offersRepository: OffersRepository,
  private val billingRepository: BillingRepository,
  private val sessionStateRepository: SessionStateRepository,
  private val deviceIdStore: ProfitLensDeviceIdStore,
  private val locationRepository: LiveLocationRepository,
  private val pendingSharedImageRepository: PendingSharedImageRepository,
) : ViewModel() {
  private val draft = MutableStateFlow(OfferDraft())
  private val selectedVehicleId = MutableStateFlow("")
  private val screenshotUri = MutableStateFlow<Uri?>(null)
  private val bulkScreenshotUri = MutableStateFlow<Uri?>(null)
  private val bulkPreview = MutableStateFlow<BulkImportPreview?>(null)
  private val latestAnalysis = MutableStateFlow<com.profitlens.android.core.data.model.OfferAnalysisRecord?>(null)
  private val message = MutableStateFlow<String?>(null)
  private val analyzing = MutableStateFlow(false)

  private val authUser = authRepository.watchUser().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val profile = authUser.flatMapLatest { user ->
    user?.let { profileRepository.watchProfile(it.uid, it.email) } ?: flowOf(null)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val vehicles = authUser.flatMapLatest { user ->
    user?.let { vehiclesRepository.watchVehicles(it.uid) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val recentOffers = authUser.flatMapLatest { user ->
    user?.let { offersRepository.watchOffers(it.uid, 12) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val entitlement = authUser.flatMapLatest { user ->
    user?.let { billingRepository.watchEntitlement(it.uid) } ?: flowOf(null)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val usage = combine(authUser, entitlement) { user, currentEntitlement ->
    user?.uid to currentEntitlement?.periodKey
  }.flatMapLatest { (uid, periodKey) ->
    if (uid == null || periodKey == null) flowOf(null) else billingRepository.watchUsage(uid, periodKey)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private data class OfferSelectionSnapshot(
    val profile: com.profitlens.android.core.data.model.UserProfile?,
    val vehicles: List<com.profitlens.android.core.data.model.VehicleProfile>,
    val selectedVehicleId: String,
    val draft: OfferDraft,
    val screenshotUri: Uri?,
    val bulkScreenshotUri: Uri?,
  )

  private data class OfferInputSnapshot(
    val draft: OfferDraft,
    val screenshotUri: Uri?,
    val bulkScreenshotUri: Uri?,
  )

  private data class OfferUsageSnapshot(
    val remainingOffersLabel: String,
    val latestAnalysis: com.profitlens.android.core.data.model.OfferAnalysisRecord?,
    val recentOffers: List<com.profitlens.android.core.data.model.OfferRecord>,
  )

  private data class OfferStatusSnapshot(
    val bulkPreview: BulkImportPreview?,
    val message: String?,
    val analyzing: Boolean,
    val usage: OfferUsageSnapshot,
  )

  val uiState = combine(
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
        val offerLimit = entitlementValue?.offerLimit
        OfferUsageSnapshot(
          remainingOffersLabel = when {
            offerLimit == null -> "Unlimited"
            usageValue == null -> "—"
            else -> (offerLimit - usageValue.offerCount).coerceAtLeast(0).toString()
          },
          latestAnalysis = latestValue,
          recentOffers = recentValue,
        )
      },
      combine(bulkPreview, message, analyzing) { bulkValue, messageValue, analyzingValue ->
        Triple(bulkValue, messageValue, analyzingValue)
      },
    ) { usageSnapshot, statusValues ->
      OfferStatusSnapshot(
        bulkPreview = statusValues.first,
        message = statusValues.second,
        analyzing = statusValues.third,
        usage = usageSnapshot,
      )
    },
  ) { selectionSnapshot, statusSnapshot ->
    val profileDefaultVehicleId = selectionSnapshot.profile?.defaultVehicleId
    val defaultVehicleId = when {
      selectionSnapshot.selectedVehicleId.isNotBlank() -> selectionSnapshot.selectedVehicleId
      !profileDefaultVehicleId.isNullOrBlank() -> profileDefaultVehicleId
      else -> selectionSnapshot.vehicles.firstOrNull()?.id.orEmpty()
    }
    OfferUiState(
      loading = selectionSnapshot.profile == null && authUser.value != null,
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
    )
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), OfferUiState())

  init {
    viewModelScope.launch {
      authUser.collect { user ->
        val uid = user?.uid ?: return@collect
        val cached = sessionStateRepository.read<com.profitlens.android.core.data.model.OfferDraftCache>("offer-draft:$uid")
        if (cached != null) {
          draft.value = cached.toOfferDraft()
          selectedVehicleId.value = cached.vehicleId.orEmpty()
        }
      }
    }
    viewModelScope.launch {
      pendingSharedImageRepository.watch().collect { sharedUri ->
        if (sharedUri != null) {
          screenshotUri.value = sharedUri
          pendingSharedImageRepository.consume()
          message.value = "Shared screenshot is ready to analyze."
        }
      }
    }
  }

  fun updateDraft(transform: (OfferDraft) -> OfferDraft) {
    draft.value = transform(draft.value)
    persistDraft()
  }

  fun selectVehicle(vehicleId: String) {
    selectedVehicleId.value = vehicleId
    persistDraft()
  }

  fun setScreenshotUri(uri: Uri?) {
    screenshotUri.value = uri
  }

  fun setBulkScreenshotUri(uri: Uri?) {
    bulkScreenshotUri.value = uri
    bulkPreview.value = null
  }

  fun analyzeManualOffer() {
    analyze { userId, vehicleId, payload ->
      offersRepository.analyzeManualOffer(payload + mapOf("vehicleId" to vehicleId, "source" to "manual"))
    }
  }

  fun analyzeScreenshotOffer() {
    val uri = screenshotUri.value ?: run {
      message.value = "Choose a screenshot before starting analysis."
      return
    }
    analyze { _, vehicleId, payload ->
      offersRepository.analyzeScreenshotOffer(
        payload = payload + mapOf("vehicleId" to vehicleId, "source" to "android_gallery"),
        imageUri = uri,
      )
    }
  }

  fun parseBulkScreenshot() {
    val user = authUser.value ?: return
    val uri = bulkScreenshotUri.value ?: run {
      message.value = "Choose a screenshot before parsing bulk offers."
      return
    }
    val vehicleId = uiState.value.selectedVehicleId.ifBlank { uiState.value.profile?.defaultVehicleId.orEmpty() }
    if (vehicleId.isBlank()) {
      message.value = "Finish vehicle setup before importing bulk offers."
      return
    }
    analyzing.value = true
    message.value = null
    viewModelScope.launch {
      runCatching {
        offersRepository.parseBulkScreenshot(
          payload = mapOf(
            "deviceId" to deviceIdStore.getOrCreate(),
            "timezone" to ZoneId.systemDefault().id,
            "serviceDateIso" to LocalDate.now().toString(),
          ),
          imageUri = uri,
        )
      }.onSuccess { parsed ->
        bulkPreview.value = buildBulkPreview(parsed)
        message.value = "Parsed ${(parsed["parsedRows"] as? List<*>)?.size ?: 0} bulk offers."
      }.onFailure {
        message.value = "Bulk screenshot parsing failed. Please try a clearer screenshot."
      }
      analyzing.value = false
    }
  }

  fun commitBulkImport() {
    val preview = bulkPreview.value ?: run {
      message.value = "Parse a screenshot before saving bulk offers."
      return
    }
    val vehicleId = uiState.value.selectedVehicleId.ifBlank { uiState.value.profile?.defaultVehicleId.orEmpty() }
    if (vehicleId.isBlank()) {
      message.value = "Finish vehicle setup before importing bulk offers."
      return
    }
    analyzing.value = true
    viewModelScope.launch {
      runCatching {
        offersRepository.commitBulkImport(
          mapOf(
            "deviceId" to deviceIdStore.getOrCreate(),
            "timezone" to ZoneId.systemDefault().id,
            "serviceDateIso" to LocalDate.now().toString(),
            "vehicleId" to vehicleId,
            "sourceApp" to "android",
            "screenshotRefs" to preview.screenshotRefs,
            "rows" to preview.rows,
          ),
        )
      }.onSuccess {
        bulkPreview.value = null
        bulkScreenshotUri.value = null
        message.value = "Bulk offers saved successfully."
      }.onFailure {
        message.value = "Bulk import could not be completed right now."
      }
      analyzing.value = false
    }
  }

  private fun analyze(action: suspend (String, String, Map<String, Any?>) -> com.profitlens.android.core.data.model.OfferAnalysisRecord) {
    val user = authUser.value ?: return
    val vehicleId = uiState.value.selectedVehicleId.ifBlank { uiState.value.profile?.defaultVehicleId.orEmpty() }
    if (vehicleId.isBlank()) {
      message.value = "Finish vehicle setup before analyzing offers."
      return
    }
    analyzing.value = true
    message.value = null
    viewModelScope.launch {
      val location = locationRepository.readFreshEnough()
      if (location == null) {
        analyzing.value = false
        message.value = "Allow location access so Profit Lens can estimate the full route."
        return@launch
      }
      val payload = draft.value.toAnalyzePayload(
        deviceId = deviceIdStore.getOrCreate(),
        lat = location.lat,
        lng = location.lng,
      )
      runCatching { action(user.uid, vehicleId, payload) }
        .onSuccess {
          latestAnalysis.value = it
          message.value = "Offer analysis saved."
        }
        .onFailure {
          message.value = "Offer analysis could not be completed. Check the inputs and try again."
        }
      analyzing.value = false
    }
  }

  private fun persistDraft() {
    val userId = authUser.value?.uid ?: return
    viewModelScope.launch {
      sessionStateRepository.save(
        key = "offer-draft:$userId",
        userId = userId,
        payload = draft.value.toDraftCache(selectedVehicleId.value),
      )
    }
  }
}
