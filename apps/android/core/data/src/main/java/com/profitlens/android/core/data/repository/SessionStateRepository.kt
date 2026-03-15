package com.profitlens.android.core.data.repository

import com.profitlens.android.core.data.local.UiStateCacheDao
import com.profitlens.android.core.data.local.UiStateCacheEntity
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Singleton
class SessionStateRepository @Inject constructor(
  @PublishedApi internal val dao: UiStateCacheDao,
) {
  @PublishedApi
  internal val json = Json { ignoreUnknownKeys = true }

  suspend inline fun <reified T> read(key: String): T? {
    val entity = dao.get(key) ?: return null
    return kotlin.runCatching { json.decodeFromString<T>(string = entity.payloadJson) }.getOrNull()
  }

  suspend inline fun <reified T> save(key: String, userId: String?, payload: T) {
    dao.upsert(
      UiStateCacheEntity(
        key = key,
        userId = userId,
        payloadJson = json.encodeToString<T>(value = payload),
        updatedAtMs = System.currentTimeMillis(),
      ),
    )
  }

  suspend fun clear(key: String) {
    dao.delete(key)
  }
}
