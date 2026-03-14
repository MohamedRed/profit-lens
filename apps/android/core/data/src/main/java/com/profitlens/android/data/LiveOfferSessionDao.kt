package com.profitlens.android.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface LiveOfferSessionDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun upsert(session: LiveOfferSessionEntity)

  @Query("SELECT * FROM live_offer_sessions ORDER BY updatedAtMs DESC LIMIT :limit")
  fun watchLatest(limit: Int = 10): Flow<List<LiveOfferSessionEntity>>
}
