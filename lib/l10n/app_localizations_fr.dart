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
  String get editOfferDetailsButton => 'Modifier les détails';

  @override
  String get addOptionalDetailsButton => 'Ajouter des détails optionnels';

  @override
  String get hideOptionalDetailsButton => 'Masquer les détails optionnels';

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
  String get profitabilityOverviewTitle => 'Aperçu de la rentabilité';

  @override
  String get viewProfitabilityDetailsButton => 'Voir les détails';

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
  String get missingDataTitle => 'Informations manquantes';

  @override
  String get missingDataDescription =>
      'Pour calculer la rentabilité, complétez :';

  @override
  String get okButton => 'OK';

  @override
  String get signInTitle => 'Connexion';

  @override
  String get registerTitle => 'Créer un compte';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Mot de passe';

  @override
  String get confirmPasswordLabel => 'Confirmer le mot de passe';

  @override
  String get signInButton => 'Se connecter';

  @override
  String get createAccountButton => 'Créer un compte';

  @override
  String get registerButton => 'S’inscrire';

  @override
  String get loadingLabel => 'Chargement…';

  @override
  String get requiredFieldError => 'Champ obligatoire.';

  @override
  String get passwordLengthError =>
      'Le mot de passe doit contenir au moins 8 caractères.';

  @override
  String get passwordMismatchError => 'Les mots de passe ne correspondent pas.';

  @override
  String get offerTabLabel => 'Offre';

  @override
  String get historyTabLabel => 'Historique';

  @override
  String get settingsTabLabel => 'Paramètres';

  @override
  String get noVehiclesMessage =>
      'Ajoutez un véhicule pour commencer l’analyse.';

  @override
  String get extractionFailedMessage =>
      'Impossible d’extraire les détails de l’offre.';

  @override
  String get captureScreenshotButton => 'Prendre une capture';

  @override
  String get extractionSummaryTitle => 'Résumé de l’extraction';

  @override
  String get confidenceLabel => 'Confiance';

  @override
  String get mapsAutocompleteUnavailableMessage =>
      'L’autocomplétion d’adresse est indisponible. Vérifiez la clé Google Maps API et la configuration de Places UI Kit.';

  @override
  String get vehicleSelectLabel => 'Choisir un véhicule';

  @override
  String get durationMinutesLabel => 'Temps estimé (minutes)';

  @override
  String get pickupNameLabel => 'Nom du retrait';

  @override
  String get pickupAddressLabel => 'Adresse de retrait';

  @override
  String get dropoffAddressLabel => 'Adresse de livraison';

  @override
  String get offerSaveFailedMessage => 'Impossible d’enregistrer l’offre.';

  @override
  String get historyDetailTitle => 'Détails de l’offre';

  @override
  String get incomeTaxLabel => 'Impôt sur le revenu';

  @override
  String get fixedCostsLabel => 'Répartition des coûts fixes';

  @override
  String get profileSectionTitle => 'Profil entreprise';

  @override
  String get vehiclesSectionTitle => 'Véhicules';

  @override
  String get signOutButton => 'Se déconnecter';

  @override
  String get profileSetupTitle => 'Complétez votre profil';

  @override
  String get activityLabel => 'Activité';

  @override
  String get activityDelivery => 'Livraison';

  @override
  String get activityServices => 'Services';

  @override
  String get activitySales => 'Ventes';

  @override
  String get incomeTaxRateLabel => 'Taux d’impôt sur le revenu';

  @override
  String get monthlyFixedCostsLabel => 'Coûts fixes mensuels';

  @override
  String get fixedCostAllocationLabel => 'Répartir les coûts fixes par';

  @override
  String get monthlyHoursLabel => 'Heures mensuelles travaillées';

  @override
  String get monthlyDistanceLabel => 'Distance mensuelle (km)';

  @override
  String get monthlyDeliveriesLabel => 'Livraisons mensuelles';

  @override
  String get fixedCostPerHourLabel => 'Par heure';

  @override
  String get fixedCostPerKmLabel => 'Par km';

  @override
  String get fixedCostPerDeliveryLabel => 'Par livraison';

  @override
  String get monthlyHoursRequiredError =>
      'Les heures mensuelles sont requises pour ce mode.';

  @override
  String get monthlyDistanceRequiredError =>
      'La distance mensuelle est requise pour ce mode.';

  @override
  String get monthlyDeliveriesRequiredError =>
      'Les livraisons mensuelles sont requises pour ce mode.';

  @override
  String get saveProfileButton => 'Enregistrer le profil';

  @override
  String get profileSaveFailedMessage => 'Impossible d’enregistrer le profil.';

  @override
  String get profileEditTitle => 'Modifier le profil';

  @override
  String get editProfileButton => 'Modifier le profil';

  @override
  String get addVehicleTitle => 'Ajouter un véhicule';

  @override
  String get editVehicleTitle => 'Modifier le véhicule';

  @override
  String get editVehicleButton => 'Modifier le véhicule';

  @override
  String get saveVehicleButton => 'Enregistrer le véhicule';

  @override
  String get vehicleSaveFailedMessage =>
      'Impossible d’enregistrer le véhicule.';

  @override
  String get vehicleNameLabel => 'Nom du véhicule';

  @override
  String get vehicleBrandLabel => 'Marque';

  @override
  String get vehicleModelLabel => 'Modèle';

  @override
  String get useVehiclePresetsLabel => 'Utiliser les valeurs véhicule';

  @override
  String get modelLookupButton => 'Appliquer la marque/modèle';

  @override
  String get modelLookupAppliedMessage => 'Consommation appliquée.';

  @override
  String get modelLookupNotFoundMessage =>
      'Aucun modèle trouvé pour cette marque/modèle.';

  @override
  String get modelLookupFailedMessage =>
      'Impossible de récupérer les données du modèle.';

  @override
  String get noHistoryMessage => 'Aucune offre enregistrée.';

  @override
  String get profitabilityFailedMessage =>
      'Impossible de calculer la rentabilité. Vérifiez votre profil.';
}
