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
  String get editOfferDetailsButton => 'Edit details';

  @override
  String get resetOfferButton => 'Reset offer';

  @override
  String get analysisProgressTitle => 'Analyzing offer';

  @override
  String get analysisStepExtracting => 'Extracting offer details';

  @override
  String get analysisStepVerifyRoute => 'Verifying route';

  @override
  String get analysisStepProfitability => 'Calculating profitability';

  @override
  String get analysisFailedTitle => 'Analysis incomplete';

  @override
  String get analysisFailedBody =>
      'We couldn\'t complete the analysis. Please edit the details and try again.';

  @override
  String get addOptionalDetailsButton => 'Add optional details';

  @override
  String get hideOptionalDetailsButton => 'Hide optional details';

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
  String get sourcesSection => 'Preset sources';

  @override
  String get sourceLastCheckedLabel => 'Last checked';

  @override
  String get sourceOpenButton => 'Open source';

  @override
  String get sourceOpenError => 'Unable to open link.';

  @override
  String get importScreenshotButton => 'Import screenshot';

  @override
  String get analyzeButton => 'Analyze profitability';

  @override
  String get profitabilityOverviewTitle => 'Profitability overview';

  @override
  String get viewProfitabilityDetailsButton => 'View details';

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
      'To enable screenshot extraction, configure Firebase and deploy the extractOfferFromImage Cloud Function with the GEMINI_API_KEY secret.';

  @override
  String get missingDataTitle => 'Missing information';

  @override
  String get missingDataDescription =>
      'To compute profitability, please complete:';

  @override
  String get okButton => 'OK';

  @override
  String get signInTitle => 'Sign in';

  @override
  String get registerTitle => 'Create account';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Password';

  @override
  String get confirmPasswordLabel => 'Confirm password';

  @override
  String get signInButton => 'Sign in';

  @override
  String get createAccountButton => 'Create an account';

  @override
  String get registerButton => 'Register';

  @override
  String get loadingLabel => 'Loading...';

  @override
  String get requiredFieldError => 'This field is required.';

  @override
  String get passwordLengthError => 'Password must be at least 8 characters.';

  @override
  String get passwordMismatchError => 'Passwords do not match.';

  @override
  String get offerTabLabel => 'Offer';

  @override
  String get historyTabLabel => 'History';

  @override
  String get settingsTabLabel => 'Settings';

  @override
  String get noVehiclesMessage => 'Add a vehicle to start analyzing offers.';

  @override
  String get analysisDateLabel => 'Analysis date';

  @override
  String get historyViewListLabel => 'List';

  @override
  String get historyViewChartsLabel => 'Charts';

  @override
  String get historyChartTitle => 'Profit over time';

  @override
  String get historyChartProfitLabel => 'Profit';

  @override
  String get profitThresholdLabel => 'Profitability threshold';

  @override
  String get historyChartEmptyMessage =>
      'Add at least 2 offers to see the chart.';

  @override
  String get historyChartHintMessage =>
      'Use this chart to track profitability trends across offers.';

  @override
  String get latestProfitLabel => 'Latest profit';

  @override
  String get extractionFailedMessage =>
      'Unable to extract offer details from the screenshot.';

  @override
  String get captureScreenshotButton => 'Capture screenshot';

  @override
  String get mapsAutocompleteUnavailableMessage =>
      'Address autocomplete is unavailable. Check the Google Maps API key and Places UI Kit setup.';

  @override
  String get useSelectedPlaceButton => 'Use selected place';

  @override
  String get vehicleSelectLabel => 'Select vehicle';

  @override
  String get durationMinutesLabel => 'Estimated time (minutes)';

  @override
  String get pickupNameLabel => 'Pickup name';

  @override
  String get pickupAddressLabel => 'Pickup address';

  @override
  String get pickupAddressPlaceholder => 'Enter pickup address';

  @override
  String get dropoffNameLabel => 'Drop-off name (optional)';

  @override
  String get dropoffAddressLabel => 'Drop-off address';

  @override
  String get dropoffAddressPlaceholder => 'Enter drop-off address';

  @override
  String get pickupAddressMissingHint =>
      'This screenshot provides only the restaurant name and the customer address. The pickup address can be left empty.';

  @override
  String get verifiedDistanceLabel => 'Verified distance (km)';

  @override
  String get verifiedDurationLabel => 'Verified time (minutes)';

  @override
  String get routeVerificationMissingMessage =>
      'Select pickup and drop-off from autocomplete to verify the route.';

  @override
  String get routeVerificationFailedMessage =>
      'Unable to verify the route distance. Please try again.';

  @override
  String get offerSaveFailedMessage => 'Unable to save offer.';

  @override
  String get historyDetailTitle => 'Offer details';

  @override
  String get incomeTaxLabel => 'Income tax';

  @override
  String get fixedCostsLabel => 'Fixed costs allocation';

  @override
  String get profileSectionTitle => 'Business profile';

  @override
  String get languageSectionTitle => 'Language';

  @override
  String get languageFrench => 'French';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageArabic => 'Arabic';

  @override
  String get vehiclesSectionTitle => 'Vehicles';

  @override
  String get signOutButton => 'Sign out';

  @override
  String get profileSetupTitle => 'Complete your profile';

  @override
  String get activityLabel => 'Business activity';

  @override
  String get activityDelivery => 'Delivery services';

  @override
  String get activityServices => 'Services';

  @override
  String get activitySales => 'Sales';

  @override
  String get incomeTaxRateLabel => 'Income tax rate';

  @override
  String get monthlyFixedCostsLabel => 'Monthly fixed costs';

  @override
  String get fixedCostAllocationLabel => 'Allocate fixed costs by';

  @override
  String get monthlyHoursLabel => 'Monthly working hours';

  @override
  String get monthlyDistanceLabel => 'Monthly distance (km)';

  @override
  String get monthlyDeliveriesLabel => 'Monthly deliveries';

  @override
  String get fixedCostPerHourLabel => 'Per hour';

  @override
  String get fixedCostPerKmLabel => 'Per km';

  @override
  String get fixedCostPerDeliveryLabel => 'Per delivery';

  @override
  String get monthlyHoursRequiredError =>
      'Monthly hours are required for hourly allocation.';

  @override
  String get monthlyDistanceRequiredError =>
      'Monthly distance is required for per-km allocation.';

  @override
  String get monthlyDeliveriesRequiredError =>
      'Monthly deliveries are required for per-delivery allocation.';

  @override
  String get saveProfileButton => 'Save profile';

  @override
  String get profileSaveFailedMessage => 'Unable to save profile.';

  @override
  String get profileEditTitle => 'Edit profile';

  @override
  String get editProfileButton => 'Edit profile';

  @override
  String get addVehicleTitle => 'Add vehicle';

  @override
  String get editVehicleTitle => 'Edit vehicle';

  @override
  String get editVehicleButton => 'Edit vehicle';

  @override
  String get saveVehicleButton => 'Save vehicle';

  @override
  String get vehicleSaveFailedMessage => 'Unable to save vehicle.';

  @override
  String get vehicleBrandLabel => 'Brand';

  @override
  String get vehicleModelLabel => 'Model';

  @override
  String get useVehiclePresetsLabel => 'Use vehicle presets';

  @override
  String get modelLookupAppliedMessage => 'Model consumption applied.';

  @override
  String get modelLookupNotFoundMessage =>
      'No match found for this brand/model.';

  @override
  String get modelLookupFailedMessage => 'Unable to fetch model data.';

  @override
  String get noHistoryMessage => 'No offers saved yet.';

  @override
  String get profitabilityFailedMessage =>
      'Unable to compute profitability. Check your profile settings.';
}
