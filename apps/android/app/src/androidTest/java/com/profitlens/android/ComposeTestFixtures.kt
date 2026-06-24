package com.profitlens.android

import com.profitlens.android.core.data.model.DeviceEntry
import com.profitlens.android.core.data.model.HelpTicket
import com.profitlens.android.core.data.model.HelpTicketAttachment
import com.profitlens.android.core.data.model.HelpTicketTimelineEvent
import com.profitlens.android.core.data.model.OfferRecord
import com.profitlens.android.core.data.model.UserProfile
import com.profitlens.android.core.data.model.VehicleDraft
import com.profitlens.android.core.data.model.VehicleProfile
import com.profitlens.android.core.data.model.defaultUserProfile
import java.util.Date

internal fun sampleProfile(): UserProfile = defaultUserProfile("user-1", "driver@example.test").copy(
  minProfitabilityEuro = 3.0,
  monthlyFixedCosts = 240.0,
  monthlyDeliveries = 160,
  defaultVehicleId = "vehicle-1",
)

internal fun sampleVehicle(): VehicleProfile = VehicleProfile(
  id = "vehicle-1",
  name = "Courier bike",
  licensePlate = "PL-123",
  brand = "Urban",
  model = "Cargo",
  registrationYear = 2024,
  type = "bike",
  energyType = "electric",
  fuelType = null,
  energyConsumptionPer100Km = 1.4,
  energyPricePerUnit = 0.25,
  maintenancePerKm = 0.03,
  depreciationPerKm = 0.05,
)

internal fun sampleVehicleDraft(): VehicleDraft = sampleVehicle().let { vehicle ->
  VehicleDraft(
    id = vehicle.id,
    name = vehicle.name,
    licensePlate = vehicle.licensePlate.orEmpty(),
    brand = vehicle.brand.orEmpty(),
    model = vehicle.model.orEmpty(),
    registrationYear = vehicle.registrationYear.toString(),
    type = vehicle.type,
    energyType = vehicle.energyType,
    fuelType = vehicle.fuelType.orEmpty(),
    energyConsumptionPer100Km = vehicle.energyConsumptionPer100Km.toString(),
    energyPricePerUnit = vehicle.energyPricePerUnit.toString(),
    maintenancePerKm = vehicle.maintenancePerKm.toString(),
    depreciationPerKm = vehicle.depreciationPerKm.toString(),
  )
}

internal fun sampleOffer(id: String = "offer-1"): OfferRecord = OfferRecord(
  id = id,
  source = "manual",
  createdAt = Date(1_700_000_000_000),
  analysisMode = "manual",
  importBatchId = null,
  distanceSource = "manual",
  payoutEuro = 14.50,
  distanceKm = 6.2,
  durationMinutes = 22.0,
  tipEuro = null,
  pickupName = "Restaurant A",
  pickupAddress = "Rue de Test",
  dropoffName = "Client B",
  dropoffAddress = "Avenue Client",
  netProfitEuro = 9.75,
  totalCostsEuro = 4.75,
  energyCostEuro = 1.0,
  maintenanceCostEuro = 0.2,
  depreciationCostEuro = 0.3,
  socialContributionsEuro = 2.0,
  incomeTaxEuro = 0.25,
  fixedCostAllocationEuro = 1.0,
  routeVerifiedDistanceKm = null,
  routeVerifiedDurationMinutes = null,
  localDayId = "2026-06-24",
  localDayStart = Date(1_700_000_000_000),
)

internal fun sampleDevice(): DeviceEntry = DeviceEntry(
  id = "device-1",
  platform = "android",
  userAgent = "android/test Pixel 7",
  deviceLabel = "Pixel 7",
  lastSeenAt = Date(1_700_000_000_000),
  createdAt = Date(1_700_000_000_000),
  isCurrent = true,
)

internal fun sampleTicket(): HelpTicket = HelpTicket(
  id = "ticket-1",
  title = "App cannot read offer",
  description = "Overlay no longer detects the payout row.",
  status = "open",
  delivererStatus = "triaged",
  delivererStatusMessage = "Support is reviewing it.",
  createdAt = Date(1_700_000_000_000),
  updatedAt = Date(1_700_000_000_000),
  imageCount = 1,
  audioCount = 0,
)

internal fun sampleAttachment(): HelpTicketAttachment = HelpTicketAttachment(
  id = "attachment-1",
  type = "image",
  url = "https://example.invalid/screenshot.png",
  storagePath = "help/ticket-1/screenshot.png",
  filename = "screenshot.png",
  contentType = "image/png",
  sizeBytes = 1024,
  durationSeconds = null,
  uploadedAt = Date(1_700_000_000_000),
)

internal fun sampleTimelineEvent(): HelpTicketTimelineEvent = HelpTicketTimelineEvent(
  id = "timeline-1",
  status = "triaged",
  message = "Support picked up the issue.",
  at = Date(1_700_000_000_000),
  source = "support",
)
