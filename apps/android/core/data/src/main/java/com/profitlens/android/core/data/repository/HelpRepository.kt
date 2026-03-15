package com.profitlens.android.core.data.repository

import android.content.ContentResolver
import android.net.Uri
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.storage.FirebaseStorage
import com.profitlens.android.core.data.model.HelpAttachmentDraft
import com.profitlens.android.core.data.model.HelpTicket
import com.profitlens.android.core.data.model.HelpTicketAttachment
import com.profitlens.android.core.data.model.HelpTicketTimelineEvent
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class HelpRepository @Inject constructor(
  private val firestore: FirebaseFirestore?,
  private val functions: FirebaseFunctions?,
  private val storage: FirebaseStorage?,
  private val contentResolver: ContentResolver,
) {
  fun watchTickets(uid: String): Flow<List<HelpTicket>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("helpTickets")
      .orderBy("updatedAt", Query.Direction.DESCENDING)
      .addSnapshotListener { snapshot, _ -> trySend(snapshot?.documents.orEmpty().mapNotNull(::mapTicket)) }
    awaitClose { registration.remove() }
  }

  fun watchTicket(uid: String, ticketId: String): Flow<HelpTicket?> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("helpTickets")
      .document(ticketId)
      .addSnapshotListener { snapshot, _ -> trySend(snapshot?.let(::mapTicket)) }
    awaitClose { registration.remove() }
  }

  fun watchAttachments(uid: String, ticketId: String): Flow<List<HelpTicketAttachment>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("helpTickets")
      .document(ticketId).collection("attachments")
      .orderBy("uploadedAt", Query.Direction.ASCENDING)
      .addSnapshotListener { snapshot, _ -> trySend(snapshot?.documents.orEmpty().mapNotNull(::mapAttachment)) }
    awaitClose { registration.remove() }
  }

  fun watchTimeline(uid: String, ticketId: String): Flow<List<HelpTicketTimelineEvent>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("helpTickets")
      .document(ticketId).collection("delivererTimeline")
      .orderBy("at", Query.Direction.DESCENDING)
      .addSnapshotListener { snapshot, _ -> trySend(snapshot?.documents.orEmpty().mapNotNull(::mapTimeline)) }
    awaitClose { registration.remove() }
  }

  suspend fun transcribeAudio(uri: Uri, locale: String): String? {
    val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return null
    val callable = functions?.getHttpsCallable("transcribeHelpDraftAudio") ?: error("Firebase is not configured.")
    val payload = mapOf(
      "audio" to android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP),
      "contentType" to (contentResolver.getType(uri) ?: "audio/webm"),
      "locale" to locale,
    )
    val data = callable.call(payload).await().getData() as Map<*, *>
    return (data["transcript"] as? String)?.trim()?.takeIf { it.isNotEmpty() }
  }

  suspend fun createTicket(uid: String, locale: String, deviceId: String, description: String, attachments: List<HelpAttachmentDraft>) {
    val db = firestore ?: error("Firebase is not configured.")
    val storageRef = storage ?: error("Firebase is not configured.")
    val ticketId = UUID.randomUUID().toString()
    val ticketRef = db.collection("users").document(uid).collection("helpTickets").document(ticketId)
    val uploaded = attachments.map { attachment ->
      val attachmentId = UUID.randomUUID().toString()
      val safeName = attachment.filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")
      val path = "users/$uid/helpTickets/$ticketId/attachments/$attachmentId-$safeName"
      val ref = storageRef.reference.child(path)
      ref.putFile(attachment.uri).await()
      val url = ref.downloadUrl.await().toString()
      mapOf(
        "id" to attachmentId,
        "type" to attachment.type,
        "url" to url,
        "storagePath" to path,
        "filename" to attachment.filename,
        "contentType" to attachment.contentType,
        "sizeBytes" to (contentResolver.openAssetFileDescriptor(attachment.uri, "r")?.length ?: 0L),
        "durationSeconds" to attachment.durationSeconds,
      )
    }
    val batch = db.batch()
    batch.set(
      ticketRef,
      mapOf(
        "description" to description,
        "status" to "open",
        "delivererStatus" to "received",
        "delivererStatusMessage" to when {
          locale.startsWith("fr") -> "Ticket reçu."
          locale.startsWith("ar") -> "تم استلام التذكرة."
          else -> "Ticket received."
        },
        "deviceId" to deviceId,
        "platform" to "android",
        "locale" to locale,
        "imageCount" to uploaded.count { it["type"] == "image" },
        "audioCount" to uploaded.count { it["type"] == "audio" },
      ),
    )
    uploaded.forEach { attachment ->
      batch.set(ticketRef.collection("attachments").document(attachment["id"] as String), attachment)
    }
    batch.commit().await()
  }

  private fun mapTicket(snapshot: DocumentSnapshot): HelpTicket? {
    val data = snapshot.data ?: return null
    return HelpTicket(
      id = snapshot.id,
      title = asString(data["title"]),
      description = asString(data["description"]).orEmpty(),
      status = asString(data["status"]) ?: "open",
      delivererStatus = asString(data["delivererStatus"]) ?: "received",
      delivererStatusMessage = asString(data["delivererStatusMessage"]),
      createdAt = asDate(data["createdAt"]),
      updatedAt = asDate(data["updatedAt"]),
      imageCount = asInt(data["imageCount"]) ?: 0,
      audioCount = asInt(data["audioCount"]) ?: 0,
    )
  }

  private fun mapAttachment(snapshot: DocumentSnapshot): HelpTicketAttachment? {
    val data = snapshot.data ?: return null
    return HelpTicketAttachment(
      id = snapshot.id,
      type = asString(data["type"]) ?: return null,
      url = asString(data["url"]) ?: return null,
      storagePath = asString(data["storagePath"]),
      filename = asString(data["filename"]) ?: return null,
      contentType = asString(data["contentType"]) ?: return null,
      sizeBytes = (data["sizeBytes"] as? Number)?.toLong() ?: 0L,
      durationSeconds = asDouble(data["durationSeconds"]),
      uploadedAt = asDate(data["uploadedAt"]),
    )
  }

  private fun mapTimeline(snapshot: DocumentSnapshot): HelpTicketTimelineEvent? {
    val data = snapshot.data ?: return null
    return HelpTicketTimelineEvent(
      id = snapshot.id,
      status = asString(data["status"]) ?: return null,
      message = asString(data["message"]) ?: return null,
      at = asDate(data["at"]),
      source = asString(data["source"]),
    )
  }
}
