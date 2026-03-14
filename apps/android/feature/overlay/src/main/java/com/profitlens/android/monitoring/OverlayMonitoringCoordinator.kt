package com.profitlens.android.monitoring

import com.profitlens.android.data.OverlayFeatureFlags
import com.profitlens.android.data.OverlayFeatureFlagsRepository
import com.profitlens.android.data.OverlayMonitoringPreferences
import com.profitlens.android.data.OverlaySessionRepository
import com.profitlens.android.data.ProfitLensDeviceIdStore
import com.profitlens.android.location.LiveLocationRepository
import com.profitlens.android.overlay.AccessibilityOverlayController
import com.profitlens.android.overlay.LiveOverlayState
import com.profitlens.android.overlay.OverlayChipStatus
import com.profitlens.android.parsing.LiveOfferDraft
import com.profitlens.android.parsing.LiveOfferParserRegistry
import com.profitlens.android.parsing.NodeTextSnapshot
import com.profitlens.android.parsing.buildLiveOfferFingerprint
import com.profitlens.android.providers.LiveOfferCaptureContext
import com.profitlens.android.providers.LiveOfferFunctionsRepository
import com.profitlens.android.providers.LiveOfferRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.DecimalFormat
import java.time.ZoneId
import java.util.UUID

class OverlayMonitoringCoordinator(
  private val featureFlagsRepository: OverlayFeatureFlagsRepository,
  private val monitoringPreferences: OverlayMonitoringPreferences,
  private val sessionRepository: OverlaySessionRepository,
  private val deviceIdStore: ProfitLensDeviceIdStore,
  private val locationRepository: LiveLocationRepository,
  private val functionsRepository: LiveOfferFunctionsRepository,
  private val parserRegistry: LiveOfferParserRegistry,
  private val overlayController: AccessibilityOverlayController,
) {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
  private var flags: OverlayFeatureFlags = featureFlagsRepository.defaultFlags()
  private var currentSession: ActiveOverlaySession? = null
  private var scoringJob: Job? = null

  init {
    scope.launch {
      flags = featureFlagsRepository.fetch()
    }
  }

  fun handleSnapshot(snapshot: NodeTextSnapshot) {
    if (!monitoringPreferences.isEnabled()) {
      clear()
      return
    }
    val parser = parserRegistry.find(snapshot.packageName) ?: run {
      clear()
      return
    }
    if (!isProviderEnabled(parser.provider)) {
      clear()
      return
    }
    if (!parser.looksLikeOfferScreen(snapshot)) {
      clear()
      return
    }
    val draft = parser.parse(snapshot)
    if (draft == null) {
      val session = currentSession ?: ActiveOverlaySession(UUID.randomUUID().toString(), "unknown", null, false)
      currentSession = session
      overlayController.render(
        LiveOverlayState(
          status = OverlayChipStatus.UNKNOWN,
          title = "Unknown offer",
          detail = "Profit Lens cannot score this screen variant yet.",
        ),
      )
      scope.launch {
        sessionRepository.saveSession(
          sessionId = session.sessionId,
          provider = parser.provider,
          fingerprint = session.fingerprint ?: "unknown",
          status = "unknown",
          netProfitEuro = null,
          reasonCode = "parser_unknown_variant",
          updatedAtMs = System.currentTimeMillis(),
        )
      }
      return
    }

    val fingerprint = buildLiveOfferFingerprint(draft)
    if (currentSession?.fingerprint != fingerprint) {
      currentSession = ActiveOverlaySession(UUID.randomUUID().toString(), fingerprint, draft, false)
    } else {
      currentSession = currentSession?.copy(draft = draft)
    }
    overlayController.render(
      LiveOverlayState(
        status = OverlayChipStatus.PROCESSING,
        title = "Calculating",
        detail = "Scoring this offer now.",
      ),
    )
    scoringJob?.cancel()
    scoringJob = scope.launch {
      delay(250)
      scoreCurrentDraft()
    }
  }

  fun clear() {
    scoringJob?.cancel()
    currentSession = null
    overlayController.hide()
  }

  fun shutdown() {
    clear()
    scope.cancel()
  }

  private suspend fun scoreCurrentDraft() {
    val session = currentSession ?: return
    val draft = session.draft ?: return
    val location = locationRepository.readFreshEnough()
    if (location == null) {
      showUnknown(session, draft.provider, "location_unavailable")
      return
    }
    val response = runCatching {
      functionsRepository.scoreLiveOffer(
        payloadFor(session.sessionId, draft, location.ageMs, mapOf("lat" to location.lat, "lng" to location.lng)),
      )
    }.getOrElse {
      showUnknown(session, draft.provider, "score_failed")
      return
    }
    if (currentSession?.sessionId != session.sessionId) {
      return
    }
    val summary = response.summary
    val overlayState = when (response.status) {
      "profitable" -> LiveOverlayState(
        status = OverlayChipStatus.PROFITABLE,
        title = "Profitable",
        detail = "${format(summary?.netProfitEuro)} net on ${format(summary?.distanceKm)} km",
      )
      "not_profitable" -> LiveOverlayState(
        status = OverlayChipStatus.NOT_PROFITABLE,
        title = "Not profitable",
        detail = "${format(summary?.netProfitEuro)} net on ${format(summary?.distanceKm)} km",
      )
      else -> LiveOverlayState(
        status = OverlayChipStatus.UNKNOWN,
        title = "Unknown",
        detail = "Profit Lens could not score this offer yet.",
      )
    }
    overlayController.render(overlayState)
    sessionRepository.saveSession(
      sessionId = session.sessionId,
      provider = draft.provider,
      fingerprint = session.fingerprint ?: "unknown",
      status = response.status,
      netProfitEuro = summary?.netProfitEuro,
      reasonCode = response.reasonCode,
      updatedAtMs = System.currentTimeMillis(),
    )
    if (response.status != "unknown" && !session.committed) {
      val committed = runCatching {
        functionsRepository.commitLiveOffer(
          payloadFor(session.sessionId, draft, location.ageMs, mapOf("lat" to location.lat, "lng" to location.lng)),
        )
      }.isSuccess
      if (committed) {
        currentSession = session.copy(committed = true)
      }
    }
  }

  private suspend fun showUnknown(session: ActiveOverlaySession, provider: String, reasonCode: String) {
    overlayController.render(
      LiveOverlayState(
        status = OverlayChipStatus.UNKNOWN,
        title = "Unknown",
        detail = "Location or route data is missing for this offer.",
      ),
    )
    sessionRepository.saveSession(
      sessionId = session.sessionId,
      provider = provider,
      fingerprint = session.fingerprint ?: "unknown",
      status = "unknown",
      netProfitEuro = null,
      reasonCode = reasonCode,
      updatedAtMs = System.currentTimeMillis(),
    )
  }

  private fun payloadFor(
    sessionId: String,
    draft: LiveOfferDraft,
    locationAgeMs: Long?,
    currentLocation: Map<String, Double>?,
  ): LiveOfferRequest {
    return LiveOfferRequest(
      deviceId = deviceIdStore.getOrCreate(),
      vehicleId = null,
      timezone = ZoneId.systemDefault().id,
      currentLocation = currentLocation,
      offer = mapOf(
        "payoutEuro" to draft.payoutEuro,
        "distanceKm" to draft.distanceKm,
        "durationMinutes" to draft.durationMinutes,
        "pickupName" to draft.pickupName,
        "pickupAddress" to draft.pickupAddress,
        "dropoffName" to draft.dropoffName,
        "dropoffAddress" to draft.dropoffAddress,
      ),
      provider = draft.provider,
      liveOfferSessionId = sessionId,
      captureContext = LiveOfferCaptureContext(
        parserVersion = draft.parserVersion,
        packageName = draft.packageName,
        screenVariant = draft.screenVariant,
        confidence = draft.confidence,
        locationAgeMs = locationAgeMs,
      ),
    )
  }

  private fun isProviderEnabled(provider: String): Boolean {
    return when (provider) {
      "uber_eats" -> flags.uberEatsEnabled
      "deliveroo" -> flags.deliverooEnabled
      else -> false
    }
  }

  private fun format(value: Double?): String {
    return value?.let { DecimalFormat("0.0").format(it) } ?: "?"
  }

  private data class ActiveOverlaySession(
    val sessionId: String,
    val fingerprint: String?,
    val draft: LiveOfferDraft?,
    val committed: Boolean,
  )
}
