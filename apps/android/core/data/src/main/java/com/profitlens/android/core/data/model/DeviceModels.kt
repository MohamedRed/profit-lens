package com.profitlens.android.core.data.model

import java.util.Date

data class DeviceEntry(
  val id: String,
  val platform: String,
  val userAgent: String,
  val deviceLabel: String?,
  val lastSeenAt: Date?,
  val createdAt: Date?,
  val isCurrent: Boolean,
)

data class ActiveDeviceSnapshot(
  val active: Boolean,
  val deviceId: String,
  val firstSeen: Date?,
  val lastSeen: Date?,
  val platform: String,
)
