package com.profitlens.android.core.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface UiStateCacheDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun upsert(entity: UiStateCacheEntity)

  @Query("SELECT * FROM ui_state_cache WHERE key = :key LIMIT 1")
  suspend fun get(key: String): UiStateCacheEntity?

  @Query("DELETE FROM ui_state_cache WHERE key = :key")
  suspend fun delete(key: String)
}
