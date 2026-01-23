// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get appTitle => 'ProfitLens';

  @override
  String get offerDetailsSection => 'Détails de l\'offre';

  @override
  String get offerAmountLabel => 'Gain (EUR)';

  @override
  String get distanceKmLabel => 'Distance (km)';

  @override
  String get vehicleSection => 'Véhicule';

  @override
  String get vehicleTypeLabel => 'Type de véhicule';

  @override
  String get energyTypeLabel => 'Type d\'énergie';

  @override
  String get fuelTypeLabel => 'Type de carburant';

  @override
  String get vehicleTypeBike => 'Vélo';

  @override
  String get vehicleTypeEBike => 'Vélo électrique';

  @override
  String get vehicleTypeScooter => 'Scooter';

  @override
  String get vehicleTypeCar => 'Voiture';

  @override
  String get energyTypeNone => 'Aucune';

  @override
  String get energyTypeElectric => 'Électrique';

  @override
  String get energyTypeFuel => 'Carburant';

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
  String get fuelTypeGPLc => 'GPL';

  @override
  String get energyPriceLabel => 'Prix de l\'énergie par unité';

  @override
  String get consumptionLabel => 'Consommation pour 100 km';

  @override
  String get maintenanceLabel => 'Entretien par km';

  @override
  String get depreciationLabel => 'Dépréciation par km';

  @override
  String get costsSection => 'Taxes et cotisations';

  @override
  String get socialRateLabel => 'Taux de cotisations auto‑entrepreneur';

  @override
  String get useFranceDefaultsLabel => 'Utiliser les valeurs France';

  @override
  String get sourcesSection => 'Sources des valeurs';

  @override
  String get sourceLastCheckedLabel => 'Dernière vérification';

  @override
  String get sourceOpenButton => 'Ouvrir la source';

  @override
  String get sourceOpenError => 'Impossible d\'ouvrir le lien.';

  @override
  String get importScreenshotButton => 'Importer une capture';

  @override
  String get analyzeButton => 'Analyser la rentabilité';

  @override
  String get resultTitle => 'Rentabilité';

  @override
  String get grossRevenueLabel => 'Revenu brut';

  @override
  String get totalCostsLabel => 'Coûts totaux';

  @override
  String get netProfitLabel => 'Profit net';

  @override
  String get energyCostLabel => 'Coût d\'énergie';

  @override
  String get maintenanceCostLabel => 'Entretien';

  @override
  String get depreciationCostLabel => 'Dépréciation';

  @override
  String get socialContributionLabel => 'Cotisations sociales';

  @override
  String get missingConfigTitle => 'Configuration requise';

  @override
  String get missingGeminiConfigMessage =>
      'Pour activer l\'extraction depuis une capture, configurez Firebase et déployez la fonction Cloud extractOfferFromImage avec le secret GEMINI_API_KEY.';

  @override
  String get okButton => 'OK';
}
