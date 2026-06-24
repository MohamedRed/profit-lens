package com.profitlens.android.feature.help

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.StatusBanner
import java.text.DateFormat

@Composable
fun HelpHomeScreen(
  state: HelpUiState,
  onDescriptionChanged: (String) -> Unit,
  onSubmit: () -> Unit,
  onAddAttachment: (Uri, String) -> Unit,
  onRemoveAttachment: (String) -> Unit,
  onViewTickets: () -> Unit,
  padding: PaddingValues,
) {
  val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
    if (uri != null) onAddAttachment(uri, "image")
  }
  val audioPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
    if (uri != null) onAddAttachment(uri, "audio")
  }
  ScrollColumn(padding = padding) {
    Card(
      shape = MaterialTheme.shapes.large,
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
      Column(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
      ) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
          Text(text = "Submit a ticket", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.onSurface)
          Text(
            text = "Describe the issue, add screenshots or audio, and we’ll keep the response thread in your native app.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
          )
        }
        AppTextField(
          value = state.description,
          onValueChange = onDescriptionChanged,
          minLines = 6,
          label = "What happened?",
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          SecondaryButton(label = "Attach image", onClick = { imagePicker.launch("image/*") })
          SecondaryButton(label = "Attach audio", onClick = { audioPicker.launch("audio/*") })
        }
        AttachmentDraftList(attachments = state.attachments, onRemoveAttachment = onRemoveAttachment)
        PrimaryButton(
          label = if (state.submitting) "Submitting..." else "Submit ticket",
          onClick = onSubmit,
          enabled = !state.submitting,
        )
        SecondaryButton(label = "View tickets", onClick = onViewTickets)
      }
    }
    state.message?.let { StatusBanner(message = it, tone = if (it.contains("sent", ignoreCase = true)) "success" else "error") }
  }
}

@Composable
fun HelpTicketsScreen(
  state: HelpUiState,
  onTicketSelected: (String) -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    Card(
      shape = MaterialTheme.shapes.large,
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
      Column(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
      ) {
        Text(text = "Tickets", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
        if (state.tickets.isEmpty()) {
          Text("No tickets yet.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
          state.tickets.forEach { ticket ->
            AppListRow(
              title = ticket.title ?: "Support ticket",
              subtitle = ticket.description.ifBlank { "No description provided." },
              supporting = ticket.updatedAt?.let { "Updated ${DateFormat.getDateInstance().format(it)}" },
              onClick = { onTicketSelected(ticket.id) },
            )
          }
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
fun HelpTicketDetailScreen(
  state: HelpUiState,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    state.selectedTicket?.let { ticket ->
      Card(
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
      ) {
        Column(
          modifier = Modifier.padding(horizontal = 16.dp, vertical = 20.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
          Text(text = ticket.title ?: "Support ticket", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
          Text(text = ticket.description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
          Text(
            text = "Created ${ticket.createdAt?.let { DateFormat.getDateTimeInstance().format(it) } ?: "recently"}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
          )
        }
      }
      DetailSection(title = "Attachments") {
        if (state.selectedAttachments.isEmpty()) {
          Text("No attachments yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
          state.selectedAttachments.forEach { attachment ->
            AppListRow(
              title = attachment.filename,
              subtitle = attachment.type.replaceFirstChar { it.uppercase() },
              supporting = attachment.uploadedAt?.let { "Added ${DateFormat.getDateTimeInstance().format(it)}" },
            )
          }
        }
      }
      DetailSection(title = "Timeline") {
        if (state.selectedTimeline.isEmpty()) {
          Text("No timeline events yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
          state.selectedTimeline.forEach { event ->
            AppListRow(
              title = event.status,
              subtitle = event.message,
              supporting = event.at?.let { DateFormat.getDateTimeInstance().format(it) },
            )
          }
        }
      }
    } ?: StatusBanner(message = "This ticket is no longer available.", tone = "error")
  }
}

@Composable
private fun AttachmentDraftList(
  attachments: List<com.profitlens.android.core.data.model.HelpAttachmentDraft>,
  onRemoveAttachment: (String) -> Unit,
) {
  if (attachments.isEmpty()) return
  Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
    Text(text = "Attachments", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
    attachments.forEach { attachment ->
      AppListRow(
        title = attachment.filename,
        subtitle = attachment.type.replaceFirstChar { it.uppercase() },
        trailing = {
          SecondaryButton(
            label = "Remove",
            onClick = { onRemoveAttachment(attachment.id) },
            modifier = Modifier.fillMaxWidth(),
          )
        },
      )
    }
  }
}

@Composable
private fun DetailSection(
  title: String,
  content: @Composable () -> Unit,
) {
  Card(
    shape = MaterialTheme.shapes.large,
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
  ) {
    Column(
      modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Text(text = title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
      content()
    }
  }
}
