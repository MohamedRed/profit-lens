import '../../../../l10n/app_localizations.dart';
import '../../domain/energy_type.dart';
import '../../domain/fuel_type.dart';
import '../../domain/vehicle_type.dart';

String vehicleTypeLabel(AppLocalizations l10n, VehicleType type) {
  switch (type) {
    case VehicleType.bike:
      return l10n.vehicleTypeBike;
    case VehicleType.ebike:
      return l10n.vehicleTypeEBike;
    case VehicleType.scooter:
      return l10n.vehicleTypeScooter;
    case VehicleType.car:
      return l10n.vehicleTypeCar;
  }
}

String energyTypeLabel(AppLocalizations l10n, EnergyType type) {
  switch (type) {
    case EnergyType.none:
      return l10n.energyTypeNone;
    case EnergyType.electric:
      return l10n.energyTypeElectric;
    case EnergyType.fuel:
      return l10n.energyTypeFuel;
  }
}

String fuelTypeLabel(AppLocalizations l10n, FuelType type) {
  switch (type) {
    case FuelType.e10:
      return l10n.fuelTypeE10;
    case FuelType.sp95:
      return l10n.fuelTypeSP95;
    case FuelType.sp98:
      return l10n.fuelTypeSP98;
    case FuelType.gazole:
      return l10n.fuelTypeGazole;
    case FuelType.e85:
      return l10n.fuelTypeE85;
    case FuelType.gplc:
      return l10n.fuelTypeGPLc;
  }
}
