import { t, type I18nStore } from '../../../../lib/i18n/i18n-context';

export const buildVehicleTypeOptions = (i18n: I18nStore) => {
  return [
    { value: 'car', label: t(i18n, 'vehicleTypeCar', 'Car') },
    { value: 'scooter', label: t(i18n, 'vehicleTypeScooter', 'Scooter') },
    { value: 'ebike', label: t(i18n, 'vehicleTypeEBike', 'E-bike') },
    { value: 'bike', label: t(i18n, 'vehicleTypeBike', 'Bike') },
  ];
};

export const buildEnergyTypeOptions = (i18n: I18nStore) => {
  return [
    { value: 'none', label: t(i18n, 'energyTypeNone', 'None') },
    { value: 'electric', label: t(i18n, 'energyTypeElectric', 'Electric') },
    { value: 'fuel', label: t(i18n, 'energyTypeFuel', 'Fuel') },
  ];
};

export const buildFuelTypeOptions = (i18n: I18nStore) => {
  return [
    { value: 'e10', label: t(i18n, 'fuelTypeE10', 'E10') },
    { value: 'sp95', label: t(i18n, 'fuelTypeSP95', 'SP95') },
    { value: 'sp98', label: t(i18n, 'fuelTypeSP98', 'SP98') },
    { value: 'gazole', label: t(i18n, 'fuelTypeGazole', 'Diesel') },
    { value: 'e85', label: t(i18n, 'fuelTypeE85', 'E85') },
    { value: 'gplc', label: t(i18n, 'fuelTypeGPLc', 'LPG') },
  ];
};
