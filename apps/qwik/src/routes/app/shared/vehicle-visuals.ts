const vehicleTypeIconMap: Record<string, string> = {
  bike: 'directions_bike',
  ebike: 'electric_bike',
  scooter: 'two_wheeler',
  car: 'directions_car',
};

export const resolveVehicleTypeIcon = (typeRaw: string): string => {
  const key = typeRaw.trim().toLowerCase();
  return vehicleTypeIconMap[key] ?? 'commute';
};
