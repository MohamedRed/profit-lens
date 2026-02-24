export const isValidBackToHref = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }
  return value.startsWith('/next/app/');
};

export const buildVehicleEditorHref = (vehicleId: string, backToHref?: string): string => {
  const params = new URLSearchParams({ vehicleId });
  if (isValidBackToHref(backToHref)) {
    params.set('backTo', backToHref);
  }
  return `/next/app/settings/vehicles/edit?${params.toString()}`;
};
