export const isValidBackToHref = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }
  return value.startsWith('/next/app/');
};

export const buildVehicleEditorHref = (vehicleId: string, backToHref?: string): string => {
  const encodedVehicleId = encodeURIComponent(vehicleId);
  const basePath = `/next/app/settings/vehicles/${encodedVehicleId}/`;
  const params = new URLSearchParams();
  if (isValidBackToHref(backToHref)) {
    params.set('backTo', backToHref);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};
