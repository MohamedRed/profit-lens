package com.profitlens.android.core.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.functions.FirebaseFunctionsException
import com.profitlens.android.core.data.model.ActiveDeviceSnapshot
import com.profitlens.android.core.data.model.DeviceEntry
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class DevicesRepository @Inject constructor(
  private val firestore: FirebaseFirestore?,
  private val functions: FirebaseFunctions?,
) {
  fun watchDevices(uid: String, currentDeviceId: String?): Flow<List<DeviceEntry>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("devices")
      .orderBy("lastSeen", Query.Direction.DESCENDING)
      .addSnapshotListener { snapshot, _ ->
        val items = snapshot?.documents.orEmpty()
          .filter { it.data?.get("active") != false }
          .map { doc ->
            val data = doc.data ?: emptyMap<String, Any?>()
            DeviceEntry(
              id = doc.id,
              platform = asString(data["platform"]).orEmpty(),
              userAgent = asString(data["userAgent"]).orEmpty(),
              deviceLabel = asString(data["deviceLabel"]),
              lastSeenAt = asDate(data["lastSeen"]) ?: asDate(data["lastSeenAt"]),
              createdAt = asDate(data["firstSeen"]) ?: asDate(data["createdAt"]),
              isCurrent = doc.id == currentDeviceId,
            )
          }
        trySend(items)
      }
    awaitClose { registration.remove() }
  }

  suspend fun registerDevice(deviceId: String, userAgent: String, replaceDeviceId: String? = null) {
    val callable = functions?.getHttpsCallable("registerDevice") ?: error("Firebase is not configured.")
    val payload = mutableMapOf<String, Any?>(
      "deviceId" to deviceId,
      "platform" to "android",
      "userAgent" to userAgent,
    )
    if (!replaceDeviceId.isNullOrBlank()) {
      payload["replaceDeviceId"] = replaceDeviceId
    }
    retryRegister(callable, payload)
  }

  suspend fun revokeDevice(deviceId: String) {
    val callable = functions?.getHttpsCallable("revokeDevice") ?: error("Firebase is not configured.")
    callable.call(mapOf("deviceId" to deviceId)).await()
  }

  fun parseActiveDevices(error: Throwable): List<ActiveDeviceSnapshot> {
    val details = (error as? FirebaseFunctionsException)?.details as? Map<*, *> ?: return emptyList()
    val items = details["activeDevices"] as? List<*> ?: return emptyList()
    return items.mapNotNull { item ->
      val map = item as? Map<*, *> ?: return@mapNotNull null
      val deviceId = map["deviceId"] as? String ?: return@mapNotNull null
      ActiveDeviceSnapshot(
        active = map["active"] as? Boolean ?: true,
        deviceId = deviceId,
        firstSeen = asDate(map["firstSeen"]),
        lastSeen = asDate(map["lastSeen"]),
        platform = map["platform"] as? String ?: "",
      )
    }
  }

  private suspend fun retryRegister(callable: com.google.firebase.functions.HttpsCallableReference, payload: Map<String, Any?>) {
    var lastError: Throwable? = null
    repeat(4) { attempt ->
      try {
        callable.call(payload).await()
        return
      } catch (error: Throwable) {
        lastError = error
        val functionsError = error as? FirebaseFunctionsException
        val code = functionsError?.code
        if (code != FirebaseFunctionsException.Code.UNAVAILABLE &&
          code != FirebaseFunctionsException.Code.INTERNAL &&
          code != FirebaseFunctionsException.Code.DEADLINE_EXCEEDED &&
          code != FirebaseFunctionsException.Code.UNKNOWN) {
          throw error
        }
        delay((250L shl attempt).coerceAtMost(2_000L))
      }
    }
    throw lastError ?: error("Device registration failed.")
  }
}
