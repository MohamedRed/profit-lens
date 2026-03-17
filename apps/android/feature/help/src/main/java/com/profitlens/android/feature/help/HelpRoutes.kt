package com.profitlens.android.feature.help

import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val helpRoute = "help"
const val helpTicketsRoute = "help/tickets"
const val helpDetailRoutePattern = "help/tickets/detail/{ticketId}"

fun helpDetailRoute(ticketId: String): String = "help/tickets/detail/$ticketId"

fun NavGraphBuilder.helpGraph(navController: NavController, padding: androidx.compose.foundation.layout.PaddingValues) {
  composable(helpRoute) {
    val viewModel: HelpViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HelpHomeScreen(
      state = state,
      onDescriptionChanged = viewModel::updateDescription,
      onSubmit = viewModel::submitTicket,
      onAddAttachment = viewModel::addAttachment,
      onRemoveAttachment = viewModel::removeAttachment,
      onViewTickets = { navController.navigate(helpTicketsRoute) },
      padding = padding,
    )
  }
  composable(helpTicketsRoute) {
    val viewModel: HelpViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HelpTicketsScreen(
      state = state,
      onTicketSelected = { navController.navigate(helpDetailRoute(it)) },
      padding = padding,
    )
  }
  composable(helpDetailRoutePattern) {
    val viewModel: HelpViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HelpTicketDetailScreen(state = state, padding = padding)
  }
}
