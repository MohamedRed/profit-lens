package com.profitlens.android.data

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
  entities = [LiveOfferSessionEntity::class],
  version = 1,
  exportSchema = false,
)
abstract class ProfitLensDatabase : RoomDatabase() {
  abstract fun liveOfferSessionDao(): LiveOfferSessionDao
}
