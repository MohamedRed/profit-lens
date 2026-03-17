package com.profitlens.android.feature.help

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner
import java.text.DateFormat

fun NavGraphBuilder.helpGraph(navController: NavController, padding: PaddingValues) {
  composable(helpRoute) {
    val viewModel: HelpViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HelpScreen(
      state = state,
      onDescriptionChanged = viewModel::updateDescription,
      onSubmit = viewModel::submitTicket,
      onAddAttachment = viewModel::addAttachment,
      onRemoveAttachment = viewModel::removeAttachment,
      onTicketSelected = { navController.navigate(helpDetailRoute(it)) },
      padding = padding,
    )
  }
  composable(helpDetailRoutePattern) {
    val viewModel: HelpViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScrollColumn(padding = padding) {
      state.selectedTicket?.let { ticket ->
        SectionCard(title = ticket.title ?: "Support ticket", subtitle = ticket.delivererStatusMessage ?: ticket.status) {
          Text(ticket.description)
          val createdAtLabel = ticket.createdAt?.let { DateFormat.getDateTimeInstance().format(it) } ?: "recently"
          Text("Created $createdAtLabel")
        }
        SectionCard(title = "Attachments", subtitle = null) {
          if (state.selectedAttachments.isEmpty()) {
            Text("No attachments.")
          } else {
            state.selectedAttachments.forEach { attachment ->
              Text("${attachment.type}: ${attachment.filename}")
            }
          }
        }
        SectionCard(title = "Timeline", subtitle = null) {
          if (state.selectedTimeline.isEmpty()) {
            Text("No timeline events yet.")
          } else {
            state.selectedTimeline.forEach { event ->
              Text("${event.status}: ${event.message}")
            }
          }
        }
      } ?: SectionCard(title = "Ticket unavailable", subtitle = "This support ticket could not be loaded.") {}
    }
  }
}

@Composable
private fun HelpScreen(
  state: HelpUiState,
  onDescriptionChanged: (String) -> Unit,
  onSubmit: () -> Unit,
  onAddAttachment: (Uri, String) -> Unit,
  onRemoveAttachment: (String) -> Unit,
  onTicketSelected: (String) -> Unit,
  padding: PaddingValues,
) {
  val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
    if (uri != null) onAddAttachment(uri, "image")
  }
  val audioPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
    if (uri != null) onAddAttachment(uri, "audio")
  }
  ScrollColumn(padding = padding) {
    SectionCard(title = "Help", subtitle = "Send screenshots or voice notes when you need support.") {
      AppTextField(
        value = state.description,
        onValueChange = onDescriptionChanged,
        minLines = 5,
        label = "Describe the issue",
      )
      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SecondaryButton(label = "Attach image", onClick = { imagePicker.launch("image/*") })
        SecondaryButton(label = "Attach audio", onClick = { audioPicker.launch("audio/*") })
        if (state.attachments.isNotEmpty()) {
          state.attachments.forEach { attachment ->
            AppListRow(
              title = attachment.filename,
              subtitle = attachment.type.replaceFirstChar { it.uppercase() },
            )
            SecondaryButton(label = "Remove ${attachment.filename}", onClick = { onRemoveAttachment(attachment.id) })
          }
        }
        PrimaryButton(label = if (state.submitting) "Sending…" else "Send ticket", onClick = onSubmit, enabled = !state.submitting)
      }
    }
    SectionCard(title = "Previous tickets", subtitle = "Track updates from the Profit Lens support workflow.") {
      if (state.tickets.isEmpty()) {
        Text("No support tickets yet.")
      } else {
        state.tickets.forEach { ticket ->
          AppListRow(
            title = ticket.title ?: "Support ticket",
            subtitle = ticket.delivererStatus,
            supporting = ticket.delivererStatusMessage,
            onClick = { onTicketSelected(ticket.id) },
          )
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}
