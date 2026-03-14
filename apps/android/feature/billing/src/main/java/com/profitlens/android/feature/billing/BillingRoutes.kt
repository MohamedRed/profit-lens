package com.profitlens.android.feature.billing

import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraphBuilder
import androidx.navigation.navArgument
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner

const val billingRoute = "settings/billing"
private const val billingRoutePattern = "settings/billing?status={status}"

fun NavGraphBuilder.billingGraph(padding: PaddingValues) {
  composable(
    route = billingRoutePattern,
    arguments = listOf(
      navArgument("status") {
        type = NavType.StringType
        nullable = true
        defaultValue = null
      },
    ),
  ) { entry ->
    BillingScreen(entry = entry, padding = padding)
  }
}

@Composable
fun BillingScreen(entry: NavBackStackEntry, padding: PaddingValues) {
  val viewModel: BillingViewModel = hiltViewModel()
  val state by viewModel.uiState.collectAsStateWithLifecycle()
  val context = LocalContext.current
  BillingReturnHandler(entry = entry)
  ScrollColumn(padding = padding) {
    SectionCard(
      title = "Billing",
      subtitle = "Manage your subscription from Android using the secure Stripe browser flow.",
    ) {
      Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Current plan: ${state.currentPlanId}")
        Text("Offers remaining this month: ${state.remainingOffers}")
        Text(state.subscriptionsSummary)
        viewModel.availablePlans().forEach { plan ->
          Button(
            onClick = {
              viewModel.createCheckout(plan.id) { url ->
                CustomTabsIntent.Builder().build().launchUrl(context, Uri.parse(url))
              }
            },
            modifier = Modifier.fillMaxWidth(),
          ) {
            Text("Choose ${plan.id} · €${plan.monthlyPriceEuro}")
          }
        }
        Button(
          onClick = {
            viewModel.openPortal { url ->
              CustomTabsIntent.Builder().build().launchUrl(context, Uri.parse(url))
            }
          },
          modifier = Modifier.fillMaxWidth(),
        ) {
          Text("Open Stripe billing")
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "success") }
  }
}

@Composable
private fun BillingReturnHandler(entry: NavBackStackEntry) {
  val viewModel: BillingViewModel = hiltViewModel()
  LaunchedEffect(entry.arguments?.getString("status")) {
    viewModel.applyReturnStatus(entry.arguments?.getString("status"))
  }
}
