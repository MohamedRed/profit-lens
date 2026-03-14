package com.profitlens.android.core.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ui_state_cache")
data class UiStateCacheEntity(
  @PrimaryKey val key: String,
  val userId: String?,
  val payloadJson: String,
  val updatedAtMs: Long,
)
