package com.profitlens.android.feature.help

import android.content.ContentResolver
import android.net.Uri
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.model.HelpAttachmentDraft
import com.profitlens.android.core.data.model.HelpDraftCache
import com.profitlens.android.core.data.repository.HelpRepository
import com.profitlens.android.core.data.repository.SessionStateRepository
import com.profitlens.android.data.ProfitLensDeviceIdStore
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.UUID
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HelpUiState(
  val loading: Boolean = true,
  val description: String = "",
  val attachments: List<HelpAttachmentDraft> = emptyList(),
  val tickets: List<com.profitlens.android.core.data.model.HelpTicket> = emptyList(),
  val selectedTicket: com.profitlens.android.core.data.model.HelpTicket? = null,
  val selectedAttachments: List<com.profitlens.android.core.data.model.HelpTicketAttachment> = emptyList(),
  val selectedTimeline: List<com.profitlens.android.core.data.model.HelpTicketTimelineEvent> = emptyList(),
  val message: String? = null,
  val submitting: Boolean = false,
)

const val helpRoute = "help"
const val helpDetailRoutePattern = "help/detail/{ticketId}"
fun helpDetailRoute(ticketId: String): String = "help/detail/$ticketId"

@HiltViewModel
class HelpViewModel @Inject constructor(
  authRepository: AuthRepository,
  private val helpRepository: HelpRepository,
  private val sessionStateRepository: SessionStateRepository,
  private val deviceIdStore: ProfitLensDeviceIdStore,
  private val contentResolver: ContentResolver,
  savedStateHandle: SavedStateHandle,
) : ViewModel() {
  private val description = MutableStateFlow("")
  private val attachments = MutableStateFlow<List<HelpAttachmentDraft>>(emptyList())
  private val message = MutableStateFlow<String?>(null)
  private val submitting = MutableStateFlow(false)
  private val selectedTicketId = MutableStateFlow(savedStateHandle.get<String>("ticketId"))
  private val authUser = authRepository.watchUser().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val tickets = authUser.flatMapLatest { user ->
    user?.let { helpRepository.watchTickets(it.uid) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val selectedTicket = combine(tickets, selectedTicketId) { ticketItems, ticketId ->
    ticketItems.firstOrNull { it.id == ticketId }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val ticketAttachments = combine(authUser, selectedTicketId) { user, ticketId -> user?.uid to ticketId }
    .flatMapLatest { (uid, ticketId) ->
      if (uid == null || ticketId == null) flowOf(emptyList()) else helpRepository.watchAttachments(uid, ticketId)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val ticketTimeline = combine(authUser, selectedTicketId) { user, ticketId -> user?.uid to ticketId }
    .flatMapLatest { (uid, ticketId) ->
      if (uid == null || ticketId == null) flowOf(emptyList()) else helpRepository.watchTimeline(uid, ticketId)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private data class HelpEditorSnapshot(
    val description: String,
    val attachments: List<HelpAttachmentDraft>,
    val tickets: List<com.profitlens.android.core.data.model.HelpTicket>,
    val selectedTicket: com.profitlens.android.core.data.model.HelpTicket?,
  )

  private data class HelpTicketSnapshot(
    val attachments: List<com.profitlens.android.core.data.model.HelpTicketAttachment>,
    val timeline: List<com.profitlens.android.core.data.model.HelpTicketTimelineEvent>,
    val message: String?,
    val submitting: Boolean,
  )

  val uiState = combine(
    combine(description, attachments, tickets, selectedTicket) { descriptionValue, attachmentsValue, ticketsValue, selectedTicketValue ->
      HelpEditorSnapshot(
        description = descriptionValue,
        attachments = attachmentsValue,
        tickets = ticketsValue,
        selectedTicket = selectedTicketValue,
      )
    },
    combine(ticketAttachments, ticketTimeline, message, submitting) { attachmentItems, timelineItems, messageValue, submittingValue ->
      HelpTicketSnapshot(
        attachments = attachmentItems,
        timeline = timelineItems,
        message = messageValue,
        submitting = submittingValue,
      )
    },
  ) { editorSnapshot, ticketSnapshot ->
    HelpUiState(
      loading = false,
      description = editorSnapshot.description,
      attachments = editorSnapshot.attachments,
      tickets = editorSnapshot.tickets,
      selectedTicket = editorSnapshot.selectedTicket,
      selectedAttachments = ticketSnapshot.attachments,
      selectedTimeline = ticketSnapshot.timeline,
      message = ticketSnapshot.message,
      submitting = ticketSnapshot.submitting,
    )
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HelpUiState())

  init {
    viewModelScope.launch {
      authUser.collect { user ->
        val uid = user?.uid ?: return@collect
        val cached = sessionStateRepository.read<HelpDraftCache>("help-draft:$uid")
        if (cached != null) {
          description.value = cached.description
        }
      }
    }
  }

  fun updateDescription(value: String) {
    description.value = value
    persistDraft()
  }

  fun addAttachment(uri: Uri, type: String) {
    attachments.value = attachments.value + HelpAttachmentDraft(
      id = UUID.randomUUID().toString(),
      type = type,
      filename = resolveDisplayName(uri),
      contentType = contentResolver.getType(uri) ?: if (type == "audio") "audio/webm" else "image/jpeg",
      uri = uri,
      durationSeconds = null,
    )
  }

  fun removeAttachment(attachmentId: String) {
    attachments.value = attachments.value.filterNot { it.id == attachmentId }
  }

  fun submitTicket() {
    val user = authUser.value ?: return
    if (description.value.isBlank()) {
      message.value = "Describe the issue before sending a ticket."
      return
    }
    submitting.value = true
    viewModelScope.launch {
      runCatching {
        helpRepository.createTicket(
          uid = user.uid,
          locale = "en",
          deviceId = deviceIdStore.getOrCreate(),
          description = description.value.trim(),
          attachments = attachments.value,
        )
      }.onSuccess {
        attachments.value = emptyList()
        description.value = ""
        message.value = "Your support ticket was sent."
        sessionStateRepository.clear("help-draft:${user.uid}")
      }.onFailure {
        message.value = "We could not send this ticket right now."
      }
      submitting.value = false
    }
  }

  private fun persistDraft() {
    val uid = authUser.value?.uid ?: return
    viewModelScope.launch {
      sessionStateRepository.save(
        key = "help-draft:$uid",
        userId = uid,
        payload = HelpDraftCache(description = description.value),
      )
    }
  }

  private fun resolveDisplayName(uri: Uri): String {
    return uri.lastPathSegment?.substringAfterLast('/')?.takeIf { it.isNotBlank() } ?: "attachment"
  }
}
