package com.profitlens.android.app

import android.content.Context
import androidx.room.Room
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.data.OverlayFeatureFlagsRepository
import com.profitlens.android.data.OverlayMonitoringPreferences
import com.profitlens.android.data.OverlaySessionRepository
import com.profitlens.android.data.ProfitLensDatabase
import com.profitlens.android.data.ProfitLensDeviceIdStore
import com.profitlens.android.location.LiveLocationRepository
import com.profitlens.android.providers.LiveOfferFunctionsRepository

class AppContainer(context: Context) {
  private val appContext = context.applicationContext
  private val firebaseBootstrap = FirebaseBootstrap(appContext)
  val firebaseReady: Boolean = firebaseBootstrap.ensureInitialized()

  private val database = Room.databaseBuilder(
    appContext,
    ProfitLensDatabase::class.java,
    "profit_lens_android.db",
  ).build()

  val authRepository = AuthRepository(firebaseReady)
  val deviceIdStore = ProfitLensDeviceIdStore(appContext)
  val monitoringPreferences = OverlayMonitoringPreferences(appContext)
  val featureFlagsRepository = OverlayFeatureFlagsRepository(firebaseReady)
  val overlaySessionRepository = OverlaySessionRepository(database.liveOfferSessionDao())
  val locationRepository = LiveLocationRepository(appContext)
  val functionsRepository = LiveOfferFunctionsRepository(firebaseReady)
}
