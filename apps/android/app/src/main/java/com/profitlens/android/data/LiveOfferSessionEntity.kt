package com.profitlens.android.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "live_offer_sessions")
data class LiveOfferSessionEntity(
  @PrimaryKey val sessionId: String,
  val provider: String,
  val fingerprint: String,
  val status: String,
  val netProfitEuro: Double?,
  val reasonCode: String?,
  val updatedAtMs: Long,
)
