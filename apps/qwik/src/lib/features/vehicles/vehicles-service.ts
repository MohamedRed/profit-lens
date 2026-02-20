import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  type QuerySnapshot,
} from 'firebase/firestore';
import type { VehicleProfile } from '../../types/vehicle';
import { callLookupVehicleByPlate, callLookupVehicleModel } from '../../firebase/callables';
import { getDb, nowServer, userCollection } from '../../firebase/firestore';

const normalizePlate = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!normalized) {
    return null;
  }
  return normalized;
};

const mapVehicle = (id: string, data: Record<string, unknown>): VehicleProfile => {
  return {
    id,
    name: String(data.name ?? ''),
    licensePlate: (data.licensePlate as string | undefined) ?? null,
    brand: (data.brand as string | undefined) ?? null,
    model: (data.model as string | undefined) ?? null,
    registrationYear:
      data.registrationYear === undefined || data.registrationYear === null
        ? null
        : Number(data.registrationYear),
    type: String(data.type ?? 'car'),
    energyType: String(data.energyType ?? 'fuel'),
    fuelType: (data.fuelType as string | undefined) ?? null,
    energyConsumptionPer100Km: Number(data.energyConsumptionPer100Km ?? 0),
    energyPricePerUnit: Number(data.energyPricePerUnit ?? 0),
    maintenancePerKm: Number(data.maintenancePerKm ?? 0),
    depreciationPerKm: Number(data.depreciationPerKm ?? 0),
  };
};

export const watchVehicles = (
  uid: string,
  callback: (vehicles: VehicleProfile[]) => void,
  onError?: (error: unknown) => void,
): (() => void) => {
  const vehiclesQuery = query(userCollection(uid, 'vehicles'), orderBy('createdAt', 'asc'));
  return onSnapshot(vehiclesQuery, (snapshot: QuerySnapshot) => {
    const vehicles = snapshot.docs.map((item) => mapVehicle(item.id, item.data() as Record<string, unknown>));
    callback(vehicles);
  }, (error) => {
    onError?.(error);
  });
};

export const watchVehicleById = (
  uid: string,
  vehicleId: string,
  callback: (vehicle: VehicleProfile | null) => void,
  onError?: (error: unknown) => void,
): (() => void) => {
  const vehicleRef = doc(getDb(), 'users', uid, 'vehicles', vehicleId);
  return onSnapshot(vehicleRef, (snapshot) => {
    callback(snapshot.exists()
      ? mapVehicle(snapshot.id, snapshot.data() as Record<string, unknown>)
      : null,
    );
  }, (error) => {
    onError?.(error);
  });
};

export const saveVehicle = async (uid: string, vehicle: VehicleProfile) => {
  const db = getDb();
  const vehicleRef = doc(db, 'users', uid, 'vehicles', vehicle.id);
  const previousPlate = normalizePlate(vehicle.licensePlate);
  const plateRef = previousPlate ? doc(db, 'users', uid, 'vehiclePlateIndex', previousPlate) : null;

  await runTransaction(db, async (transaction) => {
    if (plateRef) {
      const plateSnap = await transaction.get(plateRef);
      if (plateSnap.exists() && plateSnap.data().vehicleId !== vehicle.id) {
        throw new Error('A vehicle with this plate already exists.');
      }
      transaction.set(
        plateRef,
        {
          vehicleId: vehicle.id,
          updatedAt: nowServer(),
        },
        { merge: true },
      );
    }

    transaction.set(
      vehicleRef,
      {
        ...vehicle,
        createdAt: nowServer(),
      },
      { merge: true },
    );
  });
};

export const deleteVehicle = async (uid: string, vehicle: VehicleProfile) => {
  const db = getDb();
  const vehicleRef = doc(db, 'users', uid, 'vehicles', vehicle.id);
  const plate = normalizePlate(vehicle.licensePlate);
  await deleteDoc(vehicleRef);
  if (plate) {
    await deleteDoc(doc(db, 'users', uid, 'vehiclePlateIndex', plate));
  }
};

export const lookupVehicleByPlate = async (params: {
  licensePlate: string;
  countryCode: string;
}) => {
  return await callLookupVehicleByPlate({
    licensePlate: params.licensePlate,
    countryCode: params.countryCode,
  });
};

export const lookupVehicleModel = async (payload: {
  brand: string;
  model: string;
  energyType: string;
}) => {
  return await callLookupVehicleModel(payload);
};
