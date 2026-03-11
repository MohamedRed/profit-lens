package com.profitlens.android.monitoring

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import com.profitlens.android.BuildConfig
import com.profitlens.android.app.ProfitLensApplication
import com.profitlens.android.overlay.AccessibilityOverlayController
import com.profitlens.android.parsing.AccessibilityNodeTextCollector
import com.profitlens.android.parsing.LiveOfferParserRegistry
import com.profitlens.android.providers.DeliverooLiveOfferParser
import com.profitlens.android.providers.UberEatsLiveOfferParser

class ProfitLensAccessibilityService : AccessibilityService() {
  private lateinit var coordinator: OverlayMonitoringCoordinator

  override fun onServiceConnected() {
    super.onServiceConnected()
    val container = (application as ProfitLensApplication).container
    coordinator = OverlayMonitoringCoordinator(
      featureFlagsRepository = container.featureFlagsRepository,
      monitoringPreferences = container.monitoringPreferences,
      sessionRepository = container.overlaySessionRepository,
      deviceIdStore = container.deviceIdStore,
      locationRepository = container.locationRepository,
      functionsRepository = container.functionsRepository,
      parserRegistry = LiveOfferParserRegistry(
        listOf(
          UberEatsLiveOfferParser(BuildConfig.UBER_EATS_PACKAGE),
          DeliverooLiveOfferParser(BuildConfig.DELIVEROO_PACKAGE),
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
