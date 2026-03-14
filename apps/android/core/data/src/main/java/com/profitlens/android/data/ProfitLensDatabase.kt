package com.profitlens.android.data

import androidx.room.Database
import androidx.room.RoomDatabase
import com.profitlens.android.core.data.local.UiStateCacheDao
import com.profitlens.android.core.data.local.UiStateCacheEntity

@Database(
  entities = [LiveOfferSessionEntity::class, UiStateCacheEntity::class],
  version = 2,
  exportSchema = false,
)
abstract class ProfitLensDatabase : RoomDatabase() {
  abstract fun liveOfferSessionDao(): LiveOfferSessionDao
  abstract fun uiStateCacheDao(): UiStateCacheDao
}
