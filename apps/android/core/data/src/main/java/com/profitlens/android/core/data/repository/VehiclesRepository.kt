package com.profitlens.android.core.data.repository

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import com.google.firebase.functions.FirebaseFunctions
import com.profitlens.android.core.data.model.VehicleProfile
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@Singleton
class VehiclesRepository @Inject constructor(
  private val firestore: FirebaseFirestore?,
  private val functions: FirebaseFunctions?,
) {
  fun watchVehicles(uid: String): Flow<List<VehicleProfile>> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(emptyList())
      awaitClose { }
      return@callbackFlow
    }
    val query = db.collection("users").document(uid).collection("vehicles").orderBy("createdAt", Query.Direction.ASCENDING)
    val registration = query.addSnapshotListener { snapshot, _ ->
      val vehicles = snapshot?.documents.orEmpty().mapNotNull(::mapVehicle)
      trySend(vehicles)
    }
    awaitClose { registration.remove() }
  }

  fun watchVehicle(uid: String, vehicleId: String): Flow<VehicleProfile?> = callbackFlow {
    val db = firestore
    if (db == null) {
      trySend(null)
      awaitClose { }
      return@callbackFlow
    }
    val registration = db.collection("users").document(uid).collection("vehicles")
      .document(vehicleId)
      .addSnapshotListener { snapshot, _ -> trySend(snapshot?.let(::mapVehicle)) }
    awaitClose { registration.remove() }
  }

  suspend fun save(uid: String, vehicle: VehicleProfile) {
    val db = firestore ?: error("Firebase is not configured.")
    db.collection("users").document(uid).collection("vehicles").document(vehicle.id).set(
      mapOf(
        "id" to vehicle.id,
        "name" to vehicle.name,
        "licensePlate" to vehicle.licensePlate,
        "brand" to vehicle.brand,
        "model" to vehicle.model,
        "registrationYear" to vehicle.registrationYear,
        "type" to vehicle.type,
        "energyType" to vehicle.energyType,
        "fuelType" to vehicle.fuelType,
        "energyConsumptionPer100Km" to vehicle.energyConsumptionPer100Km,
        "energyPricePerUnit" to vehicle.energyPricePerUnit,
        "maintenancePerKm" to vehicle.maintenancePerKm,
        "depreciationPerKm" to vehicle.depreciationPerKm,
      ),
      SetOptions.merge(),
    ).await()
  }

  suspend fun delete(uid: String, vehicleId: String) {
    val db = firestore ?: error("Firebase is not configured.")
    db.collection("users").document(uid).collection("vehicles").document(vehicleId).delete().await()
  }

  suspend fun lookupByPlate(licensePlate: String, countryCode: String): Map<*, *> {
    val callable = functions?.getHttpsCallable("lookupVehicleByPlate")
      ?: error("Firebase is not configured.")
    return callable.call(mapOf("licensePlate" to licensePlate, "countryCode" to countryCode)).await().getData() as Map<*, *>
  }

  suspend fun lookupModel(brand: String, model: String, energyType: String): Map<*, *> {
    val callable = functions?.getHttpsCallable("lookupVehicleModel")
      ?: error("Firebase is not configured.")
    return callable.call(mapOf("brand" to brand, "model" to model, "energyType" to energyType)).await().getData() as Map<*, *>
  }

  private fun mapVehicle(snapshot: DocumentSnapshot): VehicleProfile? {
    val data = snapshot.data ?: return null
    return VehicleProfile(
      id = snapshot.id,
      name = asString(data["name"]).orEmpty(),
      licensePlate = asString(data["licensePlate"]),
      brand = asString(data["brand"]),
      model = asString(data["model"]),
      registrationYear = asInt(data["registrationYear"]),
      type = asString(data["type"]) ?: "car",
      energyType = asString(data["energyType"]) ?: "fuel",
      fuelType = asString(data["fuelType"]),
      energyConsumptionPer100Km = asDouble(data["energyConsumptionPer100Km"]) ?: 0.0,
      energyPricePerUnit = asDouble(data["energyPricePerUnit"]) ?: 0.0,
      maintenancePerKm = asDouble(data["maintenancePerKm"]) ?: 0.0,
      depreciationPerKm = asDouble(data["depreciationPerKm"]) ?: 0.0,
    )
  }
}
