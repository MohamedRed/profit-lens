package com.profitlens.android.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.StatusBanner

@Composable
fun OnboardingScreen(
  state: OnboardingState,
  onStepSelected: (Int) -> Unit,
  onNext: () -> Unit,
  onBack: () -> Unit,
  onVehicleChanged: ((com.profitlens.android.core.data.model.VehicleDraft) -> com.profitlens.android.core.data.model.VehicleDraft) -> Unit,
  onProfileChanged: ((com.profitlens.android.core.data.model.UserProfile) -> com.profitlens.android.core.data.model.UserProfile) -> Unit,
) {
  ScrollColumn(padding = PaddingValues()) {
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .clip(MaterialTheme.shapes.extraLarge)
        .background(
          Brush.radialGradient(
            colors = listOf(
              MaterialTheme.colorScheme.primary.copy(alpha = 0.18f),
              MaterialTheme.colorScheme.secondary.copy(alpha = 0.14f),
              MaterialTheme.colorScheme.background,
            ),
          ),
        )
        .padding(16.dp),
    ) {
      Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
          text = "Finish setup",
          style = MaterialTheme.typography.headlineSmall,
          color = MaterialTheme.colorScheme.onSurface,
        )
        Text(
          text = "Match the Qwik onboarding flow by saving your default vehicle and operating assumptions before the app unlocks.",
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        StepDots(step = state.step, onStepSelected = onStepSelected)
        StepFrame(state = state, onVehicleChanged = onVehicleChanged, onProfileChanged = onProfileChanged)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
          SecondaryButton(
            label = "Back",
            onClick = onBack,
            enabled = !state.saving && state.step > 0,
            modifier = Modifier.weight(1f),
          )
          PrimaryButton(
            label = if (state.saving) "Saving..." else if (state.step < 2) "Next" else "Finish setup",
            onClick = onNext,
            enabled = !state.saving,
            modifier = Modifier.weight(1f),
          )
        }
      }
    }
    SourcesCard()
    state.message?.let { StatusBanner(message = it, tone = "error") }
  }
}

@Composable
private fun StepDots(step: Int, onStepSelected: (Int) -> Unit) {
  Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
    listOf("Vehicle", "Costs", "Business").forEachIndexed { index, label ->
      val active = step == index
      Surface(
        shape = if (active) RoundedCornerShape(999.dp) else CircleShape,
        color = if (active) MaterialTheme.colorScheme.primary.copy(alpha = 0.16f) else MaterialTheme.colorScheme.surface,
        onClick = { onStepSelected(index) },
      ) {
        Text(
          text = label,
          modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
          style = MaterialTheme.typography.labelLarge,
          color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
        )
      }
    }
  }
}

@Composable
private fun StepFrame(
  state: OnboardingState,
  onVehicleChanged: ((com.profitlens.android.core.data.model.VehicleDraft) -> com.profitlens.android.core.data.model.VehicleDraft) -> Unit,
  onProfileChanged: ((com.profitlens.android.core.data.model.UserProfile) -> com.profitlens.android.core.data.model.UserProfile) -> Unit,
) {
  val (title, subtitle) = when (state.step) {
    0 -> "Add your vehicle" to "Save the vehicle identity Profit Lens uses by default."
    1 -> "Enter operating costs" to "Set the vehicle costs used by the profitability engine."
    else -> "Confirm your business targets" to "These values mirror the Qwik onboarding guard."
  }
  Card(
    shape = MaterialTheme.shapes.large,
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)),
  ) {
    Column(
      modifier = Modifier.padding(18.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
      Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(text = title, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
        Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
      }
      when (state.step) {
        0 -> VehicleIdentityStep(state = state, onVehicleChanged = onVehicleChanged)
        1 -> VehicleCostStep(state = state, onVehicleChanged = onVehicleChanged)
        else -> ProfileCostStep(state = state, onProfileChanged = onProfileChanged)
      }
    }
  }
}

@Composable
private fun SourcesCard() {
  Card(
    shape = MaterialTheme.shapes.large,
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
  ) {
    Column(
      modifier = Modifier.padding(18.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
      Text(text = "Supported sources", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
      Text(
        text = "Manual entry, screenshot import, bulk import, and the live overlay all reuse the same profitability settings saved here.",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
      )
    }
  }
}

@Composable
private fun VehicleIdentityStep(
  state: OnboardingState,
  onVehicleChanged: ((com.profitlens.android.core.data.model.VehicleDraft) -> com.profitlens.android.core.data.model.VehicleDraft) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    vehicleField("Vehicle name", state.vehicle.name, onVehicleChanged) { copy(name = it) }
    vehicleField("Vehicle type", state.vehicle.type, onVehicleChanged) { copy(type = it) }
    vehicleField("Energy type", state.vehicle.energyType, onVehicleChanged) { copy(energyType = it) }
    vehicleField("Fuel type", state.vehicle.fuelType, onVehicleChanged) { copy(fuelType = it) }
  }
}

@Composable
private fun VehicleCostStep(
  state: OnboardingState,
  onVehicleChanged: ((com.profitlens.android.core.data.model.VehicleDraft) -> com.profitlens.android.core.data.model.VehicleDraft) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    vehicleField("Consumption / 100km", state.vehicle.energyConsumptionPer100Km, onVehicleChanged) { copy(energyConsumptionPer100Km = it) }
    vehicleField("Energy price", state.vehicle.energyPricePerUnit, onVehicleChanged) { copy(energyPricePerUnit = it) }
    vehicleField("Maintenance / km", state.vehicle.maintenancePerKm, onVehicleChanged) { copy(maintenancePerKm = it) }
    vehicleField("Depreciation / km", state.vehicle.depreciationPerKm, onVehicleChanged) { copy(depreciationPerKm = it) }
  }
}

@Composable
private fun ProfileCostStep(
  state: OnboardingState,
  onProfileChanged: ((com.profitlens.android.core.data.model.UserProfile) -> com.profitlens.android.core.data.model.UserProfile) -> Unit,
) {
  val profile = state.profile ?: return
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    AppTextField(
      value = (profile.socialContributionRate * 100).toString(),
      onValueChange = { value ->
        onProfileChanged { current -> current.copy(socialContributionRate = (value.toDoubleOrNull() ?: 0.0) / 100) }
      },
      label = "Social rate %",
    )
    AppTextField(
      value = profile.monthlyFixedCosts.toString(),
      onValueChange = { value ->
        onProfileChanged { current -> current.copy(monthlyFixedCosts = value.toDoubleOrNull() ?: 0.0) }
      },
      label = "Monthly fixed costs",
    )
    AppTextField(
      value = profile.monthlyDeliveries.toString(),
      onValueChange = { value ->
        onProfileChanged { current -> current.copy(monthlyDeliveries = value.toIntOrNull() ?: 0) }
      },
      label = "Monthly deliveries",
    )
  }
}

@Composable
private fun vehicleField(
  label: String,
  value: String,
  onVehicleChanged: ((com.profitlens.android.core.data.model.VehicleDraft) -> com.profitlens.android.core.data.model.VehicleDraft) -> Unit,
  transform: com.profitlens.android.core.data.model.VehicleDraft.(String) -> com.profitlens.android.core.data.model.VehicleDraft,
) {
  AppTextField(
    value = value,
    onValueChange = { next ->
      onVehicleChanged { current -> current.transform(next) }
    },
    label = label,
  )
}
