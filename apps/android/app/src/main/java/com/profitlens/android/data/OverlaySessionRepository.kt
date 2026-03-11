package com.profitlens.android.data

import kotlinx.coroutines.flow.Flow

class OverlaySessionRepository(private val dao: LiveOfferSessionDao) {
  fun watchLatestSessions(limit: Int = 10): Flow<List<LiveOfferSessionEntity>> {
    return dao.watchLatest(limit)
  }

  suspend fun saveSession(
    sessionId: String,
    provider: String,
    fingerprint: String,
    status: String,
    netProfitEuro: Double?,
    reasonCode: String?,
    updatedAtMs: Long,
  ) {
    dao.upsert(
      LiveOfferSessionEntity(
        sessionId = sessionId,
        provider = provider,
        fingerprint = fingerprint,
        status = status,
        netProfitEuro = netProfitEuro,
        reasonCode = reasonCode,
        updatedAtMs = updatedAtMs,
      ),
    )
  }
}
