package com.profitlens.android

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import com.profitlens.android.designsystem.ProfitLensTheme
import com.profitlens.android.feature.help.HelpHomeScreen
import com.profitlens.android.feature.help.HelpTicketDetailScreen
import com.profitlens.android.feature.help.HelpTicketsScreen
import com.profitlens.android.feature.help.HelpUiState
import com.profitlens.android.feature.settings.DevicesSettingsScreen
import com.profitlens.android.feature.settings.ProfileSettingsScreen
import com.profitlens.android.feature.settings.SettingsHomeScreen
import com.profitlens.android.feature.settings.SettingsUiState
import com.profitlens.android.feature.settings.VehicleEditorScreen
import com.profitlens.android.feature.settings.VehiclesSettingsScreen
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class SettingsHelpComposeTest {
  @get:Rule
  val composeRule = createComposeRule()

  @Test
  fun settingsFlow_exposesProfileVehicleDeviceAndSignOutActions() {
    val settingsState = SettingsUiState(
      loading = false,
      profile = sampleProfile(),
      profileDraft = sampleProfile(),
      vehicleDraft = sampleVehicleDraft(),
      vehicles = listOf(sampleVehicle()),
      devices = listOf(sampleDevice()),
      currentPlanId = "pro",
    )
    val actions = mutableListOf<String>()
    var screen by mutableStateOf("home")

    composeRule.setContent {
      ProfitLensTheme {
        when (screen) {
          "profile" -> ProfileSettingsScreen(
            state = settingsState,
            onMinProfitChanged = { actions += "min:$it" },
            onMonthlyCostsChanged = { actions += "costs:$it" },
            onMonthlyDeliveriesChanged = { actions += "deliveries:$it" },
            onSave = { actions += "save-profile" },
            padding = PaddingValues(),
          )
          "vehicles" -> VehiclesSettingsScreen(
            state = settingsState,
            onAddVehicle = { actions += "add-vehicle" },
            onEditVehicle = { actions += "edit:$it" },
            onDeleteVehicle = { actions += "delete:$it" },
            padding = PaddingValues(),
          )
          "vehicle-editor" -> VehicleEditorScreen(
            state = settingsState,
            onDraftChanged = { transform -> actions += "draft:${transform(settingsState.vehicleDraft).name}" },
            onSave = { actions += "save-vehicle" },
            padding = PaddingValues(),
          )
          "devices" -> DevicesSettingsScreen(settingsState, onRevokeDevice = { actions += "revoke:$it" }, padding = PaddingValues())
          else -> SettingsHomeScreen(
            state = settingsState,
            onProfile = { actions += "profile" },
            onVehicles = { actions += "vehicles" },
            onDevices = { actions += "devices" },
            onBilling = { actions += "billing" },
            onSignOut = { actions += "sign-out" },
            padding = PaddingValues(),
          )
        }
      }
    }

    composeRule.onNodeWithText("Current plan: pro").assertIsDisplayed()
    composeRule.onNodeWithTag("list-row:Profile").performClick()
    composeRule.onNodeWithTag("button:Manage vehicles").performClick()
    composeRule.onNodeWithTag("list-row:Subscription").performClick()
    composeRule.onNodeWithTag("list-row:Devices").performClick()
    composeRule.onNodeWithTag("button:Sign out").performClick()
    assertEquals(listOf("profile", "vehicles", "billing", "devices", "sign-out"), actions)

    screen = "profile"
    composeRule.onNodeWithTag("button:Save profile").assertIsDisplayed()

    screen = "vehicles"
    composeRule.onNodeWithTag("button:Add vehicle").performClick()
    composeRule.onNodeWithTag("list-row:Courier bike").performClick()
    composeRule.onNodeWithTag("button:Delete Courier bike").performClick()

    screen = "vehicle-editor"
    composeRule.onNodeWithText("Vehicle editor").assertIsDisplayed()
    composeRule.onNodeWithTag("button:Save vehicle").performClick()

    screen = "devices"
    composeRule.onNodeWithTag("button:Remove Pixel 7").performClick()

    assertTrue(actions.containsAll(listOf("add-vehicle", "edit:vehicle-1", "delete:vehicle-1", "save-vehicle", "revoke:device-1")))
  }

  @Test
  fun helpFlow_submitsTicketAndShowsTicketDetailTimeline() {
    var state by mutableStateOf(
      HelpUiState(
        loading = false,
        tickets = listOf(sampleTicket()),
        selectedTicket = sampleTicket(),
        selectedAttachments = listOf(sampleAttachment()),
        selectedTimeline = listOf(sampleTimelineEvent()),
      ),
    )
    val actions = mutableListOf<String>()
    var screen by mutableStateOf("home")

    composeRule.setContent {
      ProfitLensTheme {
        when (screen) {
          "tickets" -> HelpTicketsScreen(state = state, onTicketSelected = { actions += "ticket:$it" }, padding = PaddingValues())
          "detail" -> HelpTicketDetailScreen(state = state, padding = PaddingValues())
          else -> HelpHomeScreen(
            state = state,
            onDescriptionChanged = { state = state.copy(description = it) },
            onSubmit = { actions += "submit" },
            onAddAttachment = { _, type -> actions += "attach:$type" },
            onRemoveAttachment = { actions += "remove:$it" },
            onViewTickets = { actions += "tickets" },
            padding = PaddingValues(),
          )
        }
      }
    }

    composeRule.onNodeWithText("Submit a ticket").assertIsDisplayed()
    composeRule.onNodeWithTag("field:What happened?").performTextInput("The delivery app changed its offer layout.")
    composeRule.onNodeWithTag("button:Submit ticket").performClick()
    composeRule.onNodeWithTag("button:View tickets").performClick()
    assertEquals("The delivery app changed its offer layout.", state.description)
    assertEquals(listOf("submit", "tickets"), actions)

    screen = "tickets"
    composeRule.onNodeWithText("App cannot read offer").assertIsDisplayed()
    composeRule.onNodeWithTag("list-row:App cannot read offer").performClick()
    assertTrue(actions.contains("ticket:ticket-1"))

    screen = "detail"
    composeRule.onNodeWithText("Attachments").assertIsDisplayed()
    composeRule.onNodeWithText("screenshot.png").assertIsDisplayed()
    composeRule.onNodeWithText("Timeline").assertIsDisplayed()
    composeRule.onNodeWithText("triaged").assertIsDisplayed()
  }
}
