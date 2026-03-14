package com.profitlens.android.core.data.model

data class VehicleProfile(
  val id: String,
  val name: String,
  val licensePlate: String?,
  val brand: String?,
  val model: String?,
  val registrationYear: Int?,
  val type: String,
  val energyType: String,
  val fuelType: String?,
  val energyConsumptionPer100Km: Double,
  val energyPricePerUnit: Double,
  val maintenancePerKm: Double,
  val depreciationPerKm: Double,
)

data class VehicleDraft(
  val id: String,
  val name: String,
  val licensePlate: String,
  val brand: String,
  val model: String,
  val registrationYear: String,
  val type: String,
  val energyType: String,
  val fuelType: String,
  val energyConsumptionPer100Km: String,
  val energyPricePerUnit: String,
  val maintenancePerKm: String,
  val depreciationPerKm: String,
)

fun VehicleProfile.toDraft(): VehicleDraft {
  return VehicleDraft(
    id = id,
    name = name,
    licensePlate = licensePlate.orEmpty(),
    brand = brand.orEmpty(),
    model = model.orEmpty(),
    registrationYear = registrationYear?.toString().orEmpty(),
    type = type,
    energyType = energyType,
    fuelType = fuelType.orEmpty(),
    energyConsumptionPer100Km = energyConsumptionPer100Km.toString(),
    energyPricePerUnit = energyPricePerUnit.toString(),
    maintenancePerKm = maintenancePerKm.toString(),
    depreciationPerKm = depreciationPerKm.toString(),
  )
}

fun createVehicleDraft(): VehicleDraft {
  return VehicleDraft(
    id = java.util.UUID.randomUUID().toString(),
    name = "",
    licensePlate = "",
    brand = "",
    model = "",
    registrationYear = "",
    type = "car",
    energyType = "fuel",
    fuelType = "e10",
    energyConsumptionPer100Km = "",
    energyPricePerUnit = "",
    maintenancePerKm = "",
    depreciationPerKm = "",
  )
}
