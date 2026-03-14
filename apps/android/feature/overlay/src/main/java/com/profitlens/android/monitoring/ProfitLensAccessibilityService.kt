package com.profitlens.android.monitoring

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import com.profitlens.android.core.firebase.FirebaseConfig
import com.profitlens.android.data.OverlayFeatureFlagsRepository
import com.profitlens.android.data.OverlayMonitoringPreferences
import com.profitlens.android.data.OverlaySessionRepository
import com.profitlens.android.data.ProfitLensDeviceIdStore
import com.profitlens.android.location.LiveLocationRepository
import com.profitlens.android.overlay.AccessibilityOverlayController
import com.profitlens.android.parsing.AccessibilityNodeTextCollector
import com.profitlens.android.parsing.LiveOfferParserRegistry
import com.profitlens.android.providers.DeliverooLiveOfferParser
import com.profitlens.android.providers.LiveOfferFunctionsRepository
import com.profitlens.android.providers.UberEatsLiveOfferParser
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class ProfitLensAccessibilityService : AccessibilityService() {
  @Inject lateinit var featureFlagsRepository: OverlayFeatureFlagsRepository
  @Inject lateinit var monitoringPreferences: OverlayMonitoringPreferences
  @Inject lateinit var sessionRepository: OverlaySessionRepository
  @Inject lateinit var deviceIdStore: ProfitLensDeviceIdStore
  @Inject lateinit var locationRepository: LiveLocationRepository
  @Inject lateinit var functionsRepository: LiveOfferFunctionsRepository

  private lateinit var coordinator: OverlayMonitoringCoordinator

  override fun onServiceConnected() {
    super.onServiceConnected()
    coordinator = OverlayMonitoringCoordinator(
      featureFlagsRepository = featureFlagsRepository,
      monitoringPreferences = monitoringPreferences,
      sessionRepository = sessionRepository,
      deviceIdStore = deviceIdStore,
      locationRepository = locationRepository,
      functionsRepository = functionsRepository,
      parserRegistry = LiveOfferParserRegistry(
        listOf(
          UberEatsLiveOfferParser(FirebaseConfig.UBER_EATS_PACKAGE),
          DeliverooLiveOfferParser(FirebaseConfig.DELIVEROO_PACKAGE),
        ),
      ),
      overlayController = AccessibilityOverlayController(this),
    )
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    val packageName = event?.packageName?.toString() ?: return
    val snapshot = AccessibilityNodeTextCollector.collect(rootInActiveWindow, packageName) ?: return
    coordinator.handleSnapshot(snapshot)
  }

  override fun onInterrupt() = Unit

  override fun onDestroy() {
    if (::coordinator.isInitialized) {
      coordinator.shutdown()
    }
    super.onDestroy()
  }
}
