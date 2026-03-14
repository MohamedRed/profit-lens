package com.profitlens.android.location

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.tasks.await

data class LiveLocationSample(
  val lat: Double,
  val lng: Double,
  val ageMs: Long,
)

@Singleton
class LiveLocationRepository @Inject constructor(
  @ApplicationContext private val context: Context,
) {
  suspend fun readFreshEnough(maxAgeMs: Long = 20_000): LiveLocationSample? {
    if (!hasLocationPermission()) {
      return null
    }
    val client = LocationServices.getFusedLocationProviderClient(context)
    val now = System.currentTimeMillis()
    val cached = client.lastLocation.await()
    if (cached != null) {
      val ageMs = now - cached.time
      if (ageMs in 0..maxAgeMs) {
        return LiveLocationSample(cached.latitude, cached.longitude, ageMs)
      }
    }
    val fresh = client.getCurrentLocation(
      CurrentLocationRequest.Builder()
        .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
        .setMaxUpdateAgeMillis(maxAgeMs)
        .build(),
      null,
    ).await()
    return fresh?.let { LiveLocationSample(it.latitude, it.longitude, 0) }
  }

  private fun hasLocationPermission(): Boolean {
    return ContextCompat.checkSelfPermission(
      context,
      Manifest.permission.ACCESS_FINE_LOCATION,
    ) == PackageManager.PERMISSION_GRANTED
  }
}
