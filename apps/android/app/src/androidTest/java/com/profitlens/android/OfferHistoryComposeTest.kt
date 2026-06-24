package com.profitlens.android

import android.net.Uri
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import com.profitlens.android.core.data.model.OfferStatsDay
import com.profitlens.android.designsystem.ProfitLensTheme
import com.profitlens.android.feature.history.HistoryDetailScreen
import com.profitlens.android.feature.history.HistoryScreen
import com.profitlens.android.feature.history.HistoryUiState
import com.profitlens.android.feature.offer.BulkImportPreview
import com.profitlens.android.feature.offer.OfferDraft
import com.profitlens.android.feature.offer.OfferScreen
import com.profitlens.android.feature.offer.OfferUiState
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class OfferHistoryComposeTest {
  @get:Rule
  val composeRule = createComposeRule()

  @Test
  fun offerFlow_scoresManualOfferAndSavesParsedBulkRows() {
    var state by mutableStateOf(
      OfferUiState(
        loading = false,
        remainingOffersLabel = "42",
        profile = sampleProfile(),
        vehicles = listOf(sampleVehicle()),
        selectedVehicleId = "vehicle-1",
        bulkScreenshotUri = Uri.parse("content://profit-lens-test/bulk.png"),
        bulkPreview = BulkImportPreview(
          screenshotRefs = emptyList(),
          rows = listOf(mapOf("payoutEuro" to 12.5), mapOf("payoutEuro" to 8.0)),
          parsedCount = 2,
          invalidCount = 1,
        ),
      ),
    )
    var analyzeManualClicks = 0
    var commitBulkClicks = 0

    composeRule.setContent {
      ProfitLensTheme {
        OfferScreen(
          state = state,
          onDraftChanged = { transform -> state = state.copy(manualDraft = transform(state.manualDraft)) },
          onVehicleSelected = { state = state.copy(selectedVehicleId = it) },
          onAnalyzeManual = { analyzeManualClicks += 1 },
          onAnalyzeScreenshot = {},
          onParseBulk = {},
          onCommitBulk = { commitBulkClicks += 1 },
          onOverlay = {},
          onBilling = {},
          onOfferSelected = {},
          onPickScreenshot = {},
          onPickBulkScreenshot = {},
          onSaveProfitabilityTarget = { true },
          padding = PaddingValues(),
        )
      }
    }

    composeRule.onNodeWithText("Offers remaining this period: 42").assertIsDisplayed()
    composeRule.onNodeWithText("Offer details").assertIsDisplayed()
    composeRule.onNodeWithTag("field:Payout (€)").performTextInput("14.50")
    composeRule.onNodeWithTag("field:Distance (km)").performTextInput("6.2")
    composeRule.onNodeWithTag("field:Pickup name").performTextInput("Restaurant A")
    composeRule.onNodeWithTag("button:Analyze offer").performClick()

    assertEquals(OfferDraft(payoutEuro = "14.50", distanceKm = "6.2", pickupName = "Restaurant A"), state.manualDraft)
    assertEquals(1, analyzeManualClicks)

    composeRule.onNodeWithTag("selection:Bulk").performClick()
    composeRule.onNodeWithText("Bulk import").assertIsDisplayed()
    composeRule.onNodeWithText("Ready to save 2 offers. 1 rows were skipped.").assertIsDisplayed()
    composeRule.onNodeWithTag("button:Save parsed offers").assertIsEnabled().performClick()
    assertEquals(1, commitBulkClicks)
  }

  @Test
  fun historyFlow_switchesChartsAndListThenShowsSavedOfferDetails() {
    val offer = sampleOffer(id = "offer-1")
    val historyState = HistoryUiState(
      loading = false,
      selectedMode = "chart",
      offers = listOf(offer),
      stats = listOf(OfferStatsDay(dayStart = Date(1_700_000_000_000), offerCount = 3, netProfitEuro = 21.5)),
      selectedOffer = offer,
    )
    var selectedMode by mutableStateOf(historyState.selectedMode)
    var selectedOfferId: String? = null
    var screen by mutableStateOf("history")

    composeRule.setContent {
      ProfitLensTheme {
        if (screen == "detail") {
          HistoryDetailScreen(state = historyState, padding = PaddingValues())
        } else {
          HistoryScreen(
            state = historyState.copy(selectedMode = selectedMode),
            onModeChanged = { selectedMode = it },
            onOfferSelected = { selectedOfferId = it },
            padding = PaddingValues(),
          )
        }
      }
    }

    composeRule.onNodeWithText("Profit by day").assertIsDisplayed()
    composeRule.onNodeWithTag("selection:List").performClick()
    composeRule.onNodeWithText("Rue de Test → Avenue Client").assertIsDisplayed()
    composeRule.onNodeWithTag("list-row:€9.75").performClick()
    assertEquals("offer-1", selectedOfferId)

    screen = "detail"
    composeRule.onNodeWithText("Offer detail").assertIsDisplayed()
    composeRule.onNodeWithText("€9.75").assertIsDisplayed()
    composeRule.onNodeWithText("Rue de Test").assertIsDisplayed()
  }
}
