package com.profitlens.android.ui

import android.Manifest
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.pm.PackageManager
import android.os.PowerManager
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import androidx.core.content.ContextCompat
import com.profitlens.android.monitoring.ProfitLensAccessibilityService

fun isAccessibilityServiceEnabled(context: Context): Boolean {
  val manager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
  val enabledServices = manager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
  return enabledServices.any { it.resolveInfo.serviceInfo.name == ProfitLensAccessibilityService::class.java.name }
}

fun hasFineLocationPermission(context: Context): Boolean {
  return ContextCompat.checkSelfPermission(
    context,
    Manifest.permission.ACCESS_FINE_LOCATION,
  ) == PackageManager.PERMISSION_GRANTED
}

fun hasBackgroundLocationPermission(context: Context): Boolean {
  return ContextCompat.checkSelfPermission(
    context,
    Manifest.permission.ACCESS_BACKGROUND_LOCATION,
  ) == PackageManager.PERMISSION_GRANTED
}

fun isIgnoringBatteryOptimizations(context: Context): Boolean {
  val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
  return powerManager.isIgnoringBatteryOptimizations(context.packageName)
}

fun buildAccessibilitySettingsIntent(context: Context) =
  android.content.Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
    addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
  }

fun buildAppSettingsIntent(context: Context) =
  android.content.Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
    data = android.net.Uri.parse("package:${context.packageName}")
    addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
  }
