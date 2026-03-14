package com.profitlens.android.ui

import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.profitlens.android.feature.billing.billingGraph
import com.profitlens.android.feature.billing.billingRoute
import com.profitlens.android.feature.help.helpGraph
import com.profitlens.android.feature.help.helpRoute
import com.profitlens.android.feature.history.historyGraph
import com.profitlens.android.feature.history.historyRoute
import com.profitlens.android.feature.offer.offerGraph
import com.profitlens.android.feature.offer.offerRoute
import com.profitlens.android.feature.settings.settingsGraph
import com.profitlens.android.feature.settings.settingsRoute

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

  LaunchedEffect(selectedMainTab) {
    if (selectedMainTab in mainTabs.map { it.route } && destination?.route == null) {
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
    androidx.compose.material3.Scaffold(
      bottomBar = {
        NavigationBar {
          mainTabs.forEach { tab ->
            NavigationBarItem(
              selected = destination?.hierarchy?.any { it.route == tab.route } == true,
              onClick = {
                onMainTabChanged(tab.route)
                navController.navigate(tab.route) {
                  popUpTo(navController.graph.id) { saveState = true }
                  launchSingleTop = true
                  restoreState = true
                }
              },
              icon = {},
              label = { Text(tab.label) },
            )
          }
        }
      },
    ) { padding ->
      NavHost(
        navController = navController,
        startDestination = selectedMainTab,
      ) {
        offerGraph(navController = navController, padding = padding)
        historyGraph(navController = navController, padding = padding)
        settingsGraph(navController = navController, padding = padding, onSignOut = onSignOut)
        helpGraph(navController = navController, padding = padding)
        billingGraph(padding = padding)
      }
    }
  }
}
