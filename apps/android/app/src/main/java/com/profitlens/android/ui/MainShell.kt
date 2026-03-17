package com.profitlens.android.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.profitlens.android.feature.billing.billingGraph
import com.profitlens.android.feature.billing.billingRoute
import com.profitlens.android.feature.help.helpDetailRoutePattern
import com.profitlens.android.feature.help.helpGraph
import com.profitlens.android.feature.help.helpRoute
import com.profitlens.android.feature.help.helpTicketsRoute
import com.profitlens.android.feature.history.historyDetailRoutePattern
import com.profitlens.android.feature.history.historyGraph
import com.profitlens.android.feature.history.historyRoute
import com.profitlens.android.feature.offer.offerGraph
import com.profitlens.android.feature.offer.offerRoute
import com.profitlens.android.feature.settings.settingsDevicesRoute
import com.profitlens.android.feature.settings.settingsGraph
import com.profitlens.android.feature.settings.settingsProfileRoute
import com.profitlens.android.feature.settings.settingsRoute
import com.profitlens.android.feature.settings.settingsVehiclesRoute

private data class MainTab(val label: String, val route: String)

private val mainTabs = listOf(
  MainTab(label = "Offer", route = offerRoute),
  MainTab(label = "History", route = historyRoute),
  MainTab(label = "Settings", route = settingsRoute),
  MainTab(label = "Help", route = helpRoute),
)

@Composable
fun MainShell(
  selectedMainTab: String,
  pendingBillingStatus: String?,
  onMainTabChanged: (String) -> Unit,
  onBillingStatusHandled: () -> Unit,
  onSignOut: () -> Unit,
) {
  val navController = rememberNavController()
  val backStackEntry by navController.currentBackStackEntryAsState()
  val destination = backStackEntry?.destination
  val currentRoute = destination?.route.orEmpty()
  val showTabBar = currentRoute in mainTabs.map { it.route }
  val showBack = currentRoute in setOf(
    billingRoute,
    helpTicketsRoute,
    helpDetailRoutePattern,
    historyDetailRoutePattern,
    settingsProfileRoute,
    settingsVehiclesRoute,
    settingsDevicesRoute,
  ) || currentRoute.startsWith("settings/vehicles/editor")
  val showTicketsAction = currentRoute == helpRoute

  LaunchedEffect(selectedMainTab, currentRoute) {
    if (currentRoute.isBlank() && selectedMainTab in mainTabs.map { it.route }) {
      navController.navigate(selectedMainTab) {
        popUpTo(navController.graph.id) { inclusive = true }
        launchSingleTop = true
      }
    }
  }

  LaunchedEffect(pendingBillingStatus) {
    val status = pendingBillingStatus ?: return@LaunchedEffect
    navController.navigate("$billingRoute?status=$status")
    onBillingStatusHandled()
  }

  com.profitlens.android.designsystem.ProfitLensTheme {
    Scaffold(
      containerColor = MaterialTheme.colorScheme.background,
      topBar = {
        if (showBack || showTicketsAction) {
          RouteHeader(
            showBack = showBack,
            showTicketsAction = showTicketsAction,
            onBack = { navController.navigateUp() },
            onTickets = { navController.navigate(helpTicketsRoute) },
          )
        }
      },
      bottomBar = {
        if (showTabBar) {
          MainTabBar(
            currentRoute = currentRoute,
            onSelected = { route ->
              onMainTabChanged(route)
              navController.navigate(route) {
                popUpTo(navController.graph.id) { saveState = true }
                launchSingleTop = true
                restoreState = true
              }
            },
          )
        }
      },
    ) { padding ->
      NavHost(navController = navController, startDestination = selectedMainTab) {
        offerGraph(navController = navController, padding = padding)
        historyGraph(navController = navController, padding = padding)
        settingsGraph(navController = navController, padding = padding, onSignOut = onSignOut)
        helpGraph(navController = navController, padding = padding)
        billingGraph(padding = padding)
      }
    }
  }
}

@Composable
private fun RouteHeader(
  showBack: Boolean,
  showTicketsAction: Boolean,
  onBack: () -> Unit,
  onTickets: () -> Unit,
) {
  Surface(color = MaterialTheme.colorScheme.background) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically,
    ) {
      if (showBack) {
        HeaderAction(label = "← Back", onClick = onBack)
      } else {
        Box(modifier = Modifier)
      }
      if (showTicketsAction) {
        HeaderAction(label = "Tickets", onClick = onTickets)
      }
    }
  }
}

@Composable
private fun HeaderAction(
  label: String,
  onClick: () -> Unit,
) {
  Surface(
    shape = RoundedCornerShape(18.dp),
    color = MaterialTheme.colorScheme.surface,
    onClick = onClick,
  ) {
    Text(
      text = label,
      modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
      style = MaterialTheme.typography.labelLarge,
      color = MaterialTheme.colorScheme.primary,
    )
  }
}

@Composable
private fun MainTabBar(
  currentRoute: String,
  onSelected: (String) -> Unit,
) {
  Surface(color = MaterialTheme.colorScheme.background) {
    Row(
      modifier = Modifier
        .padding(horizontal = 14.dp, vertical = 10.dp)
        .clip(RoundedCornerShape(26.dp))
        .background(MaterialTheme.colorScheme.surface)
        .padding(4.dp)
        .fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
      mainTabs.forEach { tab ->
        val selected = currentRoute == tab.route || currentRoute.startsWith("${tab.route}/") ||
          (currentRoute == billingRoute && tab.route == settingsRoute)
        Surface(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(22.dp),
          color = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.14f) else MaterialTheme.colorScheme.surface,
          onClick = { onSelected(tab.route) },
        ) {
          Box(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 13.dp),
            contentAlignment = Alignment.Center,
          ) {
            Text(
              text = tab.label,
              style = MaterialTheme.typography.labelLarge,
              color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
            )
          }
        }
      }
    }
  }
}
