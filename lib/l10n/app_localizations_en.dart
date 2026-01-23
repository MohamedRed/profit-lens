// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'ProfitLens';

  @override
  String get offerDetailsSection => 'Offer details';

  @override
  String get offerAmountLabel => 'Payout (EUR)';

  @override
  String get distanceKmLabel => 'Distance (km)';

  @override
  String get vehicleSection => 'Vehicle';

  @override
  String get vehicleTypeLabel => 'Vehicle type';

  @override
  String get energyTypeLabel => 'Energy type';

  @override
  String get fuelTypeLabel => 'Fuel type';

  @override
  String get vehicleTypeBike => 'Bike';

  @override
  String get vehicleTypeEBike => 'E-bike';

  @override
  String get vehicleTypeScooter => 'Scooter';

  @override
  String get vehicleTypeCar => 'Car';

  @override
  String get energyTypeNone => 'None';

  @override
  String get energyTypeElectric => 'Electric';

  @override
  String get energyTypeFuel => 'Fuel';

  @override
  String get fuelTypeE10 => 'E10';

  @override
  String get fuelTypeSP95 => 'SP95';

  @override
  String get fuelTypeSP98 => 'SP98';

  @override
  String get fuelTypeGazole => 'Diesel';

  @override
  String get fuelTypeE85 => 'E85';

  @override
  String get fuelTypeGPLc => 'LPG';

  @override
  String get energyPriceLabel => 'Energy price per unit';

  @override
  String get consumptionLabel => 'Consumption per 100 km';

  @override
  String get maintenanceLabel => 'Maintenance per km';

  @override
  String get depreciationLabel => 'Depreciation per km';

  @override
  String get costsSection => 'Taxes & contributions';

  @override
  String get socialRateLabel => 'Auto-entrepreneur contribution rate';

  @override
  String get useFranceDefaultsLabel => 'Use France presets';

  @override
  String get importScreenshotButton => 'Import screenshot';

  @override
  String get analyzeButton => 'Analyze profitability';

  @override
  String get resultTitle => 'Profitability';

  @override
  String get grossRevenueLabel => 'Gross revenue';

  @override
  String get totalCostsLabel => 'Total costs';

  @override
  String get netProfitLabel => 'Net profit';

  @override
  String get energyCostLabel => 'Energy cost';

  @override
  String get maintenanceCostLabel => 'Maintenance';

  @override
  String get depreciationCostLabel => 'Depreciation';

  @override
  String get socialContributionLabel => 'Social contributions';

  @override
  String get missingConfigTitle => 'Configuration needed';

  @override
  String get missingGeminiConfigMessage =>
      'To enable screenshot extraction, set GEMINI_API_KEY and GEMINI_MODEL in your build configuration.';

  @override
  String get okButton => 'OK';
}
