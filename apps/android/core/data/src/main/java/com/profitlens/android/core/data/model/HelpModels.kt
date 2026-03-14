package com.profitlens.android.core.data.model

import android.net.Uri
import java.util.Date

data class HelpTicket(
  val id: String,
  val title: String?,
  val description: String,
  val status: String,
  val delivererStatus: String,
  val delivererStatusMessage: String?,
  val createdAt: Date?,
  val updatedAt: Date?,
  val imageCount: Int,
  val audioCount: Int,
)

data class HelpAttachmentDraft(
  val id: String,
  val type: String,
  val filename: String,
  val contentType: String,
  val uri: Uri,
  val durationSeconds: Double?,
)

data class HelpTicketAttachment(
  val id: String,
  val type: String,
  val url: String,
  val storagePath: String?,
  val filename: String,
  val contentType: String,
  val sizeBytes: Long,
  val durationSeconds: Double?,
  val uploadedAt: Date?,
)

data class HelpTicketTimelineEvent(
  val id: String,
  val status: String,
  val message: String,
  val at: Date?,
  val source: String?,
)
