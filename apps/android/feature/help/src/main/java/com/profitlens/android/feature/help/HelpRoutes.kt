package com.profitlens.android.feature.help

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.ScrollColumn
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
      OutlinedTextField(
        value = state.description,
        onValueChange = onDescriptionChanged,
        modifier = Modifier.fillMaxWidth(),
        minLines = 5,
        label = { Text("Describe the issue") },
      )
      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Button(onClick = { imagePicker.launch("image/*") }, modifier = Modifier.fillMaxWidth()) {
          Text("Attach image")
        }
        Button(onClick = { audioPicker.launch("audio/*") }, modifier = Modifier.fillMaxWidth()) {
          Text("Attach audio")
        }
        if (state.attachments.isNotEmpty()) {
          state.attachments.forEach { attachment ->
            Button(onClick = { onRemoveAttachment(attachment.id) }, modifier = Modifier.fillMaxWidth()) {
              Text("Remove ${attachment.filename}")
            }
          }
        }
        Button(onClick = onSubmit, enabled = !state.submitting, modifier = Modifier.fillMaxWidth()) {
          Text(if (state.submitting) "Sending…" else "Send ticket")
        }
      }
    }
    SectionCard(title = "Previous tickets", subtitle = "Track updates from the Profit Lens support workflow.") {
      if (state.tickets.isEmpty()) {
        Text("No support tickets yet.")
      } else {
        state.tickets.forEach { ticket ->
          Button(onClick = { onTicketSelected(ticket.id) }, modifier = Modifier.fillMaxWidth()) {
            Text("${ticket.title ?: "Support ticket"} · ${ticket.delivererStatus}")
          }
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}
