import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart' deferred as app_localizations_ar;
import 'app_localizations_en.dart' deferred as app_localizations_en;
import 'app_localizations_fr.dart' deferred as app_localizations_fr;

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('fr'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'ProfitLens'**
  String get appTitle;

  /// No description provided for @offerDetailsSection.
  ///
  /// In en, this message translates to:
  /// **'Offer details'**
  String get offerDetailsSection;

  /// No description provided for @manualEntrySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Or enter the offer details manually.'**
  String get manualEntrySubtitle;

  /// No description provided for @manualEntryButton.
  ///
  /// In en, this message translates to:
  /// **'Enter manually'**
  String get manualEntryButton;

  /// No description provided for @editOfferDetailsButton.
  ///
  /// In en, this message translates to:
  /// **'Edit details'**
  String get editOfferDetailsButton;

  /// No description provided for @resetOfferButton.
  ///
  /// In en, this message translates to:
  /// **'Reset offer'**
  String get resetOfferButton;

  /// No description provided for @analysisProgressTitle.
  ///
  /// In en, this message translates to:
  /// **'Analyzing offer'**
  String get analysisProgressTitle;

  /// No description provided for @analysisStepExtracting.
  ///
  /// In en, this message translates to:
  /// **'Extracting offer details'**
  String get analysisStepExtracting;

  /// No description provided for @analysisStepVerifyRoute.
  ///
  /// In en, this message translates to:
  /// **'Verifying route'**
  String get analysisStepVerifyRoute;

  /// No description provided for @analysisStepProfitability.
  ///
  /// In en, this message translates to:
  /// **'Calculating profitability'**
  String get analysisStepProfitability;

  /// No description provided for @analysisFailedTitle.
  ///
  /// In en, this message translates to:
  /// **'Analysis incomplete'**
  String get analysisFailedTitle;

  /// No description provided for @analysisFailedBody.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t complete the analysis. Please edit the details and try again.'**
  String get analysisFailedBody;

  /// No description provided for @analysisFailedScreenshotBody.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t read this screenshot. Please upload a valid offer screenshot.'**
  String get analysisFailedScreenshotBody;

  /// No description provided for @addOptionalDetailsButton.
  ///
  /// In en, this message translates to:
  /// **'Add optional details'**
  String get addOptionalDetailsButton;

  /// No description provided for @hideOptionalDetailsButton.
  ///
  /// In en, this message translates to:
  /// **'Hide optional details'**
  String get hideOptionalDetailsButton;

  /// No description provided for @offerAmountLabel.
  ///
  /// In en, this message translates to:
  /// **'Payout (EUR)'**
  String get offerAmountLabel;

  /// No description provided for @distanceKmLabel.
  ///
  /// In en, this message translates to:
  /// **'Distance (km)'**
  String get distanceKmLabel;

  /// No description provided for @vehicleSection.
  ///
  /// In en, this message translates to:
  /// **'Vehicle'**
  String get vehicleSection;

  /// No description provided for @vehicleDetailsSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Vehicle details'**
  String get vehicleDetailsSectionTitle;

  /// No description provided for @vehicleEnergySectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Energy & consumption'**
  String get vehicleEnergySectionTitle;

  /// No description provided for @vehicleCostsSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Maintenance & depreciation'**
  String get vehicleCostsSectionTitle;

  /// No description provided for @vehicleTypeLabel.
  ///
  /// In en, this message translates to:
  /// **'Vehicle type'**
  String get vehicleTypeLabel;

  /// No description provided for @energyTypeLabel.
  ///
  /// In en, this message translates to:
  /// **'Energy type'**
  String get energyTypeLabel;

  /// No description provided for @fuelTypeLabel.
  ///
  /// In en, this message translates to:
  /// **'Fuel type'**
  String get fuelTypeLabel;

  /// No description provided for @vehicleTypeBike.
  ///
  /// In en, this message translates to:
  /// **'Bike'**
  String get vehicleTypeBike;

  /// No description provided for @vehicleTypeEBike.
  ///
  /// In en, this message translates to:
  /// **'E-bike'**
  String get vehicleTypeEBike;

  /// No description provided for @vehicleTypeScooter.
  ///
  /// In en, this message translates to:
  /// **'Scooter'**
  String get vehicleTypeScooter;

  /// No description provided for @vehicleTypeCar.
  ///
  /// In en, this message translates to:
  /// **'Car'**
  String get vehicleTypeCar;

  /// No description provided for @energyTypeNone.
  ///
  /// In en, this message translates to:
  /// **'None'**
  String get energyTypeNone;

  /// No description provided for @energyTypeElectric.
  ///
  /// In en, this message translates to:
  /// **'Electric'**
  String get energyTypeElectric;

  /// No description provided for @energyTypeFuel.
  ///
  /// In en, this message translates to:
  /// **'Fuel'**
  String get energyTypeFuel;

  /// No description provided for @fuelTypeE10.
  ///
  /// In en, this message translates to:
  /// **'E10'**
  String get fuelTypeE10;

  /// No description provided for @fuelTypeSP95.
  ///
  /// In en, this message translates to:
  /// **'SP95'**
  String get fuelTypeSP95;

  /// No description provided for @fuelTypeSP98.
  ///
  /// In en, this message translates to:
  /// **'SP98'**
  String get fuelTypeSP98;

  /// No description provided for @fuelTypeGazole.
  ///
  /// In en, this message translates to:
  /// **'Diesel'**
  String get fuelTypeGazole;

  /// No description provided for @fuelTypeE85.
  ///
  /// In en, this message translates to:
  /// **'E85'**
  String get fuelTypeE85;

  /// No description provided for @fuelTypeGPLc.
  ///
  /// In en, this message translates to:
  /// **'LPG'**
  String get fuelTypeGPLc;

  /// No description provided for @energyPriceLabel.
  ///
  /// In en, this message translates to:
  /// **'Energy price per unit'**
  String get energyPriceLabel;

  /// No description provided for @consumptionLabel.
  ///
  /// In en, this message translates to:
  /// **'Consumption per 100 km'**
  String get consumptionLabel;

  /// No description provided for @maintenanceLabel.
  ///
  /// In en, this message translates to:
  /// **'Maintenance per km'**
  String get maintenanceLabel;

  /// No description provided for @depreciationLabel.
  ///
  /// In en, this message translates to:
  /// **'Depreciation per km'**
  String get depreciationLabel;

  /// No description provided for @costsSection.
  ///
  /// In en, this message translates to:
  /// **'Taxes & contributions'**
  String get costsSection;

  /// No description provided for @socialRateLabel.
  ///
  /// In en, this message translates to:
  /// **'Auto-entrepreneur contribution rate'**
  String get socialRateLabel;

  /// No description provided for @liberatoryTaxLabel.
  ///
  /// In en, this message translates to:
  /// **'Prélèvement libératoire'**
  String get liberatoryTaxLabel;

  /// No description provided for @liberatoryTaxHint.
  ///
  /// In en, this message translates to:
  /// **'Apply a flat income tax rate on turnover.'**
  String get liberatoryTaxHint;

  /// No description provided for @useFranceDefaultsLabel.
  ///
  /// In en, this message translates to:
  /// **'Use France presets'**
  String get useFranceDefaultsLabel;

  /// No description provided for @sourcesSection.
  ///
  /// In en, this message translates to:
  /// **'Preset sources'**
  String get sourcesSection;

  /// No description provided for @sourceLastCheckedLabel.
  ///
  /// In en, this message translates to:
  /// **'Last checked'**
  String get sourceLastCheckedLabel;

  /// No description provided for @sourceOpenButton.
  ///
  /// In en, this message translates to:
  /// **'Open source'**
  String get sourceOpenButton;

  /// No description provided for @sourceOpenError.
  ///
  /// In en, this message translates to:
  /// **'Unable to open link.'**
  String get sourceOpenError;

  /// No description provided for @importScreenshotButton.
  ///
  /// In en, this message translates to:
  /// **'Import screenshot'**
  String get importScreenshotButton;

  /// No description provided for @importSourceTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose a source'**
  String get importSourceTitle;

  /// No description provided for @importSourceGallery.
  ///
  /// In en, this message translates to:
  /// **'Photo Library'**
  String get importSourceGallery;

  /// No description provided for @importSourceCamera.
  ///
  /// In en, this message translates to:
  /// **'Take Photo'**
  String get importSourceCamera;

  /// No description provided for @importedScreenshotTitle.
  ///
  /// In en, this message translates to:
  /// **'Imported screenshot'**
  String get importedScreenshotTitle;

  /// No description provided for @analyzeButton.
  ///
  /// In en, this message translates to:
  /// **'Analyze profitability'**
  String get analyzeButton;

  /// No description provided for @profitabilityOverviewTitle.
  ///
  /// In en, this message translates to:
  /// **'Profitability overview'**
  String get profitabilityOverviewTitle;

  /// No description provided for @offerDecisionAccept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get offerDecisionAccept;

  /// No description provided for @offerDecisionDecline.
  ///
  /// In en, this message translates to:
  /// **'Decline'**
  String get offerDecisionDecline;

  /// No description provided for @offerDecisionAbove.
  ///
  /// In en, this message translates to:
  /// **'{amount} above your target'**
  String offerDecisionAbove(Object amount);

  /// No description provided for @offerDecisionBelow.
  ///
  /// In en, this message translates to:
  /// **'{amount} below your target'**
  String offerDecisionBelow(Object amount);

  /// No description provided for @profitabilityTargetTitle.
  ///
  /// In en, this message translates to:
  /// **'Profitability target'**
  String get profitabilityTargetTitle;

  /// No description provided for @minProfitabilityLabel.
  ///
  /// In en, this message translates to:
  /// **'Minimum profit per offer'**
  String get minProfitabilityLabel;

  /// No description provided for @minProfitabilityHint.
  ///
  /// In en, this message translates to:
  /// **'Suggested default: €2.00'**
  String get minProfitabilityHint;

  /// No description provided for @viewProfitabilityDetailsButton.
  ///
  /// In en, this message translates to:
  /// **'View details'**
  String get viewProfitabilityDetailsButton;

  /// No description provided for @resultTitle.
  ///
  /// In en, this message translates to:
  /// **'Profitability'**
  String get resultTitle;

  /// No description provided for @grossRevenueLabel.
  ///
  /// In en, this message translates to:
  /// **'Gross revenue'**
  String get grossRevenueLabel;

  /// No description provided for @totalCostsLabel.
  ///
  /// In en, this message translates to:
  /// **'Total costs'**
  String get totalCostsLabel;

  /// No description provided for @netProfitLabel.
  ///
  /// In en, this message translates to:
  /// **'Net profit'**
  String get netProfitLabel;

  /// No description provided for @energyCostLabel.
  ///
  /// In en, this message translates to:
  /// **'Energy cost'**
  String get energyCostLabel;

  /// No description provided for @maintenanceCostLabel.
  ///
  /// In en, this message translates to:
  /// **'Maintenance'**
  String get maintenanceCostLabel;

  /// No description provided for @depreciationCostLabel.
  ///
  /// In en, this message translates to:
  /// **'Depreciation'**
  String get depreciationCostLabel;

  /// No description provided for @socialContributionLabel.
  ///
  /// In en, this message translates to:
  /// **'Social contributions'**
  String get socialContributionLabel;

  /// No description provided for @missingConfigTitle.
  ///
  /// In en, this message translates to:
  /// **'Configuration needed'**
  String get missingConfigTitle;

  /// No description provided for @missingGeminiConfigMessage.
  ///
  /// In en, this message translates to:
  /// **'To enable screenshot extraction, configure Firebase and deploy the extractOfferFromImage Cloud Function with the GEMINI_API_KEY secret.'**
  String get missingGeminiConfigMessage;

  /// No description provided for @missingDataTitle.
  ///
  /// In en, this message translates to:
  /// **'Missing information'**
  String get missingDataTitle;

  /// No description provided for @missingDataDescription.
  ///
  /// In en, this message translates to:
  /// **'To compute profitability, please complete:'**
  String get missingDataDescription;

  /// No description provided for @okButton.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get okButton;

  /// No description provided for @stripeReturnTitle.
  ///
  /// In en, this message translates to:
  /// **'Back from Stripe'**
  String get stripeReturnTitle;

  /// No description provided for @stripeReturnBody.
  ///
  /// In en, this message translates to:
  /// **'Updating your subscription. This can take a few seconds.'**
  String get stripeReturnBody;

  /// No description provided for @signInTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signInTitle;

  /// No description provided for @signInSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Analyze delivery offers faster and keep every euro.'**
  String get signInSubtitle;

  /// No description provided for @registerTitle.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get registerTitle;

  /// No description provided for @emailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get emailLabel;

  /// No description provided for @passwordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get passwordLabel;

  /// No description provided for @confirmPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get confirmPasswordLabel;

  /// No description provided for @signInButton.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signInButton;

  /// No description provided for @createAccountButton.
  ///
  /// In en, this message translates to:
  /// **'Create an account'**
  String get createAccountButton;

  /// No description provided for @registerButton.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get registerButton;

  /// No description provided for @loadingLabel.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loadingLabel;

  /// No description provided for @nextButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get nextButtonLabel;

  /// No description provided for @backButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get backButtonLabel;

  /// No description provided for @requiredFieldError.
  ///
  /// In en, this message translates to:
  /// **'This field is required.'**
  String get requiredFieldError;

  /// No description provided for @passwordLengthError.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters.'**
  String get passwordLengthError;

  /// No description provided for @passwordMismatchError.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match.'**
  String get passwordMismatchError;

  /// No description provided for @offerTabLabel.
  ///
  /// In en, this message translates to:
  /// **'Offer'**
  String get offerTabLabel;

  /// No description provided for @historyTabLabel.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get historyTabLabel;

  /// No description provided for @settingsTabLabel.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTabLabel;

  /// No description provided for @noVehiclesMessage.
  ///
  /// In en, this message translates to:
  /// **'Add a vehicle to start analyzing offers.'**
  String get noVehiclesMessage;

  /// No description provided for @analysisDateLabel.
  ///
  /// In en, this message translates to:
  /// **'Analysis date'**
  String get analysisDateLabel;

  /// No description provided for @historyViewListLabel.
  ///
  /// In en, this message translates to:
  /// **'List'**
  String get historyViewListLabel;

  /// No description provided for @historyViewChartsLabel.
  ///
  /// In en, this message translates to:
  /// **'Charts'**
  String get historyViewChartsLabel;

  /// No description provided for @historyChartTitle.
  ///
  /// In en, this message translates to:
  /// **'Profit over time'**
  String get historyChartTitle;

  /// No description provided for @historyChartProfitLabel.
  ///
  /// In en, this message translates to:
  /// **'Profit'**
  String get historyChartProfitLabel;

  /// No description provided for @profitThresholdLabel.
  ///
  /// In en, this message translates to:
  /// **'Break-even'**
  String get profitThresholdLabel;

  /// No description provided for @historyChartEmptyMessage.
  ///
  /// In en, this message translates to:
  /// **'Add at least 2 offers to see the chart.'**
  String get historyChartEmptyMessage;

  /// No description provided for @historyChartHintMessage.
  ///
  /// In en, this message translates to:
  /// **'Use this chart to compare profits above/below the break-even line.'**
  String get historyChartHintMessage;

  /// No description provided for @latestProfitLabel.
  ///
  /// In en, this message translates to:
  /// **'Latest profit'**
  String get latestProfitLabel;

  /// No description provided for @historySummaryTodayMore.
  ///
  /// In en, this message translates to:
  /// **'Today\'s offers are more profitable than earlier ones by {amount}.'**
  String historySummaryTodayMore(Object amount);

  /// No description provided for @historySummaryTodayLess.
  ///
  /// In en, this message translates to:
  /// **'Today\'s offers are less profitable than earlier ones by {amount}.'**
  String historySummaryTodayLess(Object amount);

  /// No description provided for @updateAvailableTitle.
  ///
  /// In en, this message translates to:
  /// **'An update is available.'**
  String get updateAvailableTitle;

  /// No description provided for @updateAvailableCta.
  ///
  /// In en, this message translates to:
  /// **'Reload'**
  String get updateAvailableCta;

  /// No description provided for @historySummaryTodayEqual.
  ///
  /// In en, this message translates to:
  /// **'Today\'s offers are about as profitable as earlier ones.'**
  String get historySummaryTodayEqual;

  /// No description provided for @historySummaryNoToday.
  ///
  /// In en, this message translates to:
  /// **'No offers today yet.'**
  String get historySummaryNoToday;

  /// No description provided for @historySummaryNotEnoughHistory.
  ///
  /// In en, this message translates to:
  /// **'Not enough history to compare today.'**
  String get historySummaryNotEnoughHistory;

  /// No description provided for @historySummaryAverageProfit.
  ///
  /// In en, this message translates to:
  /// **'Average profit: {amount}'**
  String historySummaryAverageProfit(Object amount);

  /// No description provided for @extractionFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to extract offer details from the screenshot.'**
  String get extractionFailedMessage;

  /// No description provided for @captureScreenshotButton.
  ///
  /// In en, this message translates to:
  /// **'Capture screenshot'**
  String get captureScreenshotButton;

  /// No description provided for @mapsAutocompleteUnavailableMessage.
  ///
  /// In en, this message translates to:
  /// **'Address autocomplete is unavailable. Check the Google Maps API key and Places UI Kit setup.'**
  String get mapsAutocompleteUnavailableMessage;

  /// No description provided for @useSelectedPlaceButton.
  ///
  /// In en, this message translates to:
  /// **'Use selected place'**
  String get useSelectedPlaceButton;

  /// No description provided for @analyzeOfferButton.
  ///
  /// In en, this message translates to:
  /// **'Analyze offer'**
  String get analyzeOfferButton;

  /// No description provided for @vehicleSelectLabel.
  ///
  /// In en, this message translates to:
  /// **'Select vehicle'**
  String get vehicleSelectLabel;

  /// No description provided for @durationMinutesLabel.
  ///
  /// In en, this message translates to:
  /// **'Estimated time (minutes)'**
  String get durationMinutesLabel;

  /// No description provided for @pickupNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Pickup name'**
  String get pickupNameLabel;

  /// No description provided for @pickupAddressLabel.
  ///
  /// In en, this message translates to:
  /// **'Pickup address'**
  String get pickupAddressLabel;

  /// No description provided for @pickupAddressPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter pickup address'**
  String get pickupAddressPlaceholder;

  /// No description provided for @dropoffNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Drop-off name'**
  String get dropoffNameLabel;

  /// No description provided for @dropoffAddressLabel.
  ///
  /// In en, this message translates to:
  /// **'Drop-off address'**
  String get dropoffAddressLabel;

  /// No description provided for @dropoffAddressPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter drop-off address'**
  String get dropoffAddressPlaceholder;

  /// No description provided for @pickupAddressMissingHint.
  ///
  /// In en, this message translates to:
  /// **'This screenshot provides only the restaurant name and the customer address. The pickup address can be left empty.'**
  String get pickupAddressMissingHint;

  /// No description provided for @verifiedDistanceLabel.
  ///
  /// In en, this message translates to:
  /// **'Verified distance'**
  String get verifiedDistanceLabel;

  /// No description provided for @verifiedDurationLabel.
  ///
  /// In en, this message translates to:
  /// **'Verified time'**
  String get verifiedDurationLabel;

  /// No description provided for @distanceUnitKm.
  ///
  /// In en, this message translates to:
  /// **'km'**
  String get distanceUnitKm;

  /// No description provided for @durationUnitMinutes.
  ///
  /// In en, this message translates to:
  /// **'min'**
  String get durationUnitMinutes;

  /// No description provided for @routeVerificationMissingMessage.
  ///
  /// In en, this message translates to:
  /// **'Select pickup and drop-off from autocomplete to verify the route.'**
  String get routeVerificationMissingMessage;

  /// No description provided for @routeVerificationFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to verify the route distance. Please try again.'**
  String get routeVerificationFailedMessage;

  /// No description provided for @offerSaveFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to save offer.'**
  String get offerSaveFailedMessage;

  /// No description provided for @historyDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Offer details'**
  String get historyDetailTitle;

  /// No description provided for @incomeTaxLabel.
  ///
  /// In en, this message translates to:
  /// **'Income tax'**
  String get incomeTaxLabel;

  /// No description provided for @monthlyCostsSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Monthly costs'**
  String get monthlyCostsSectionTitle;

  /// No description provided for @fixedCostsLabel.
  ///
  /// In en, this message translates to:
  /// **'Fixed costs allocation'**
  String get fixedCostsLabel;

  /// No description provided for @profileSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Business profile'**
  String get profileSectionTitle;

  /// No description provided for @languageSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageSectionTitle;

  /// No description provided for @installAppTitle.
  ///
  /// In en, this message translates to:
  /// **'Install app'**
  String get installAppTitle;

  /// No description provided for @installAppSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Add ProfitLens to your home screen'**
  String get installAppSubtitle;

  /// No description provided for @installAppCta.
  ///
  /// In en, this message translates to:
  /// **'Install'**
  String get installAppCta;

  /// No description provided for @installAppRequiredTitle.
  ///
  /// In en, this message translates to:
  /// **'Install required'**
  String get installAppRequiredTitle;

  /// No description provided for @installAppRequiredBody.
  ///
  /// In en, this message translates to:
  /// **'To continue, install ProfitLens and open it from your home screen. We show the install guide automatically.'**
  String get installAppRequiredBody;

  /// No description provided for @installAppRequiredNativeBody.
  ///
  /// In en, this message translates to:
  /// **'To continue, install ProfitLens and open it from your home screen. Tap Install to open the browser prompt.'**
  String get installAppRequiredNativeBody;

  /// No description provided for @installAppLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load install dialog.'**
  String get installAppLoadFailed;

  /// No description provided for @installAppPromptUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Install prompt is not ready yet. Wait a moment and try again.'**
  String get installAppPromptUnavailable;

  /// No description provided for @installAppPromptFailed.
  ///
  /// In en, this message translates to:
  /// **'Install failed.'**
  String get installAppPromptFailed;

  /// No description provided for @installAppPromptWaiting.
  ///
  /// In en, this message translates to:
  /// **'Preparing install prompt. Keep this page open for a moment.'**
  String get installAppPromptWaiting;

  /// No description provided for @languageFrench.
  ///
  /// In en, this message translates to:
  /// **'French'**
  String get languageFrench;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageArabic.
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get languageArabic;

  /// No description provided for @vehiclesSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Vehicles'**
  String get vehiclesSectionTitle;

  /// No description provided for @signOutButton.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get signOutButton;

  /// No description provided for @profileSetupTitle.
  ///
  /// In en, this message translates to:
  /// **'Complete your profile'**
  String get profileSetupTitle;

  /// No description provided for @activityLabel.
  ///
  /// In en, this message translates to:
  /// **'Business activity'**
  String get activityLabel;

  /// No description provided for @activityDelivery.
  ///
  /// In en, this message translates to:
  /// **'Delivery services'**
  String get activityDelivery;

  /// No description provided for @activityServices.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get activityServices;

  /// No description provided for @activitySales.
  ///
  /// In en, this message translates to:
  /// **'Sales'**
  String get activitySales;

  /// No description provided for @incomeTaxRateLabel.
  ///
  /// In en, this message translates to:
  /// **'Income tax rate'**
  String get incomeTaxRateLabel;

  /// No description provided for @incomeTaxEstimatedHint.
  ///
  /// In en, this message translates to:
  /// **'Estimated default. You can override it.'**
  String get incomeTaxEstimatedHint;

  /// No description provided for @monthlyFixedCostsLabel.
  ///
  /// In en, this message translates to:
  /// **'Monthly fixed costs'**
  String get monthlyFixedCostsLabel;

  /// No description provided for @fixedCostAllocationLabel.
  ///
  /// In en, this message translates to:
  /// **'Allocate fixed costs by'**
  String get fixedCostAllocationLabel;

  /// No description provided for @monthlyHoursLabel.
  ///
  /// In en, this message translates to:
  /// **'Monthly working hours'**
  String get monthlyHoursLabel;

  /// No description provided for @monthlyDistanceLabel.
  ///
  /// In en, this message translates to:
  /// **'Monthly distance (km)'**
  String get monthlyDistanceLabel;

  /// No description provided for @monthlyDeliveriesLabel.
  ///
  /// In en, this message translates to:
  /// **'Monthly deliveries'**
  String get monthlyDeliveriesLabel;

  /// No description provided for @fixedCostPerHourLabel.
  ///
  /// In en, this message translates to:
  /// **'Per hour'**
  String get fixedCostPerHourLabel;

  /// No description provided for @fixedCostPerKmLabel.
  ///
  /// In en, this message translates to:
  /// **'Per km'**
  String get fixedCostPerKmLabel;

  /// No description provided for @fixedCostPerDeliveryLabel.
  ///
  /// In en, this message translates to:
  /// **'Per delivery'**
  String get fixedCostPerDeliveryLabel;

  /// No description provided for @monthlyHoursRequiredError.
  ///
  /// In en, this message translates to:
  /// **'Monthly hours are required for hourly allocation.'**
  String get monthlyHoursRequiredError;

  /// No description provided for @monthlyDistanceRequiredError.
  ///
  /// In en, this message translates to:
  /// **'Monthly distance is required for per-km allocation.'**
  String get monthlyDistanceRequiredError;

  /// No description provided for @monthlyDeliveriesRequiredError.
  ///
  /// In en, this message translates to:
  /// **'Monthly deliveries are required for per-delivery allocation.'**
  String get monthlyDeliveriesRequiredError;

  /// No description provided for @saveProfileButton.
  ///
  /// In en, this message translates to:
  /// **'Save profile'**
  String get saveProfileButton;

  /// No description provided for @profileSaveFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to save profile.'**
  String get profileSaveFailedMessage;

  /// No description provided for @profileEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profileEditTitle;

  /// No description provided for @editProfileButton.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get editProfileButton;

  /// No description provided for @addVehicleTitle.
  ///
  /// In en, this message translates to:
  /// **'Add vehicle'**
  String get addVehicleTitle;

  /// No description provided for @editVehicleTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit vehicle'**
  String get editVehicleTitle;

  /// No description provided for @editVehicleButton.
  ///
  /// In en, this message translates to:
  /// **'Edit vehicle'**
  String get editVehicleButton;

  /// No description provided for @saveVehicleButton.
  ///
  /// In en, this message translates to:
  /// **'Save vehicle'**
  String get saveVehicleButton;

  /// No description provided for @deleteVehicleAction.
  ///
  /// In en, this message translates to:
  /// **'Delete vehicle'**
  String get deleteVehicleAction;

  /// No description provided for @deleteVehicleTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete vehicle?'**
  String get deleteVehicleTitle;

  /// No description provided for @deleteVehicleMessage.
  ///
  /// In en, this message translates to:
  /// **'This will remove the vehicle and its saved settings. You can add it again later.'**
  String get deleteVehicleMessage;

  /// No description provided for @deleteVehicleCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get deleteVehicleCancel;

  /// No description provided for @deleteVehicleConfirm.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get deleteVehicleConfirm;

  /// No description provided for @vehicleSaveFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to save vehicle.'**
  String get vehicleSaveFailedMessage;

  /// No description provided for @vehicleDeleteFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to delete vehicle.'**
  String get vehicleDeleteFailedMessage;

  /// No description provided for @vehicleBrandLabel.
  ///
  /// In en, this message translates to:
  /// **'Brand'**
  String get vehicleBrandLabel;

  /// No description provided for @vehicleModelLabel.
  ///
  /// In en, this message translates to:
  /// **'Model'**
  String get vehicleModelLabel;

  /// No description provided for @vehicleLicensePlateLabel.
  ///
  /// In en, this message translates to:
  /// **'License plate'**
  String get vehicleLicensePlateLabel;

  /// No description provided for @vehicleLicensePlateHint.
  ///
  /// In en, this message translates to:
  /// **'AA-123-AA'**
  String get vehicleLicensePlateHint;

  /// No description provided for @vehicleLicensePlateInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid French plate.'**
  String get vehicleLicensePlateInvalid;

  /// No description provided for @vehicleLicensePlateDuplicate.
  ///
  /// In en, this message translates to:
  /// **'A vehicle with this plate already exists.'**
  String get vehicleLicensePlateDuplicate;

  /// No description provided for @vehicleRegistrationYearLabel.
  ///
  /// In en, this message translates to:
  /// **'Registration year'**
  String get vehicleRegistrationYearLabel;

  /// No description provided for @vehicleRegistrationYearHint.
  ///
  /// In en, this message translates to:
  /// **'YYYY'**
  String get vehicleRegistrationYearHint;

  /// No description provided for @vehicleRegistrationYearInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid year.'**
  String get vehicleRegistrationYearInvalid;

  /// No description provided for @useVehiclePresetsLabel.
  ///
  /// In en, this message translates to:
  /// **'Use vehicle presets'**
  String get useVehiclePresetsLabel;

  /// No description provided for @plateLookupButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Lookup'**
  String get plateLookupButtonLabel;

  /// No description provided for @plateLookupAppliedMessage.
  ///
  /// In en, this message translates to:
  /// **'Vehicle details applied.'**
  String get plateLookupAppliedMessage;

  /// No description provided for @plateLookupNotFoundMessage.
  ///
  /// In en, this message translates to:
  /// **'No vehicle found for this plate.'**
  String get plateLookupNotFoundMessage;

  /// No description provided for @plateLookupFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to fetch plate data.'**
  String get plateLookupFailedMessage;

  /// No description provided for @modelLookupAppliedMessage.
  ///
  /// In en, this message translates to:
  /// **'Model consumption applied.'**
  String get modelLookupAppliedMessage;

  /// No description provided for @modelLookupNotFoundMessage.
  ///
  /// In en, this message translates to:
  /// **'No match found for this brand/model.'**
  String get modelLookupNotFoundMessage;

  /// No description provided for @modelLookupFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to fetch model data.'**
  String get modelLookupFailedMessage;

  /// No description provided for @noHistoryMessage.
  ///
  /// In en, this message translates to:
  /// **'No offers saved yet.'**
  String get noHistoryMessage;

  /// No description provided for @profitabilityFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Unable to compute profitability. Check your profile settings.'**
  String get profitabilityFailedMessage;

  /// No description provided for @offersRemainingTitle.
  ///
  /// In en, this message translates to:
  /// **'Offers remaining'**
  String get offersRemainingTitle;

  /// No description provided for @offersRemainingValue.
  ///
  /// In en, this message translates to:
  /// **'{remaining} remaining this month'**
  String offersRemainingValue(Object remaining);

  /// No description provided for @offersRemainingUnlimited.
  ///
  /// In en, this message translates to:
  /// **'Unlimited offers'**
  String get offersRemainingUnlimited;

  /// No description provided for @subscriptionStatusLabel.
  ///
  /// In en, this message translates to:
  /// **'Subscription status'**
  String get subscriptionStatusLabel;

  /// No description provided for @subscriptionStatusFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get subscriptionStatusFree;

  /// No description provided for @subscriptionStatusActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get subscriptionStatusActive;

  /// No description provided for @subscriptionStatusPastDue.
  ///
  /// In en, this message translates to:
  /// **'Payment issue'**
  String get subscriptionStatusPastDue;

  /// No description provided for @subscriptionStatusCanceled.
  ///
  /// In en, this message translates to:
  /// **'Canceled'**
  String get subscriptionStatusCanceled;

  /// No description provided for @subscriptionStatusTrialing.
  ///
  /// In en, this message translates to:
  /// **'Trial'**
  String get subscriptionStatusTrialing;

  /// No description provided for @subscriptionStatusIncomplete.
  ///
  /// In en, this message translates to:
  /// **'Incomplete'**
  String get subscriptionStatusIncomplete;

  /// No description provided for @subscriptionStatusUnpaid.
  ///
  /// In en, this message translates to:
  /// **'Unpaid'**
  String get subscriptionStatusUnpaid;

  /// No description provided for @subscriptionStatusUnknown.
  ///
  /// In en, this message translates to:
  /// **'Unknown'**
  String get subscriptionStatusUnknown;

  /// No description provided for @subscriptionStatusCanceling.
  ///
  /// In en, this message translates to:
  /// **'Cancels on {date}'**
  String subscriptionStatusCanceling(Object date);

  /// No description provided for @upgradePlanButton.
  ///
  /// In en, this message translates to:
  /// **'Upgrade plan'**
  String get upgradePlanButton;

  /// No description provided for @managePlanButton.
  ///
  /// In en, this message translates to:
  /// **'Manage plan'**
  String get managePlanButton;

  /// No description provided for @offerLimitReachedMessage.
  ///
  /// In en, this message translates to:
  /// **'You have reached your monthly offer limit. Upgrade to continue.'**
  String get offerLimitReachedMessage;

  /// No description provided for @subscriptionPlansTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose a plan'**
  String get subscriptionPlansTitle;

  /// No description provided for @subscriptionPlansSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Pick the monthly cap that fits your deliveries.'**
  String get subscriptionPlansSubtitle;

  /// No description provided for @planPricePerMonth.
  ///
  /// In en, this message translates to:
  /// **'{price} / month'**
  String planPricePerMonth(Object price);

  /// No description provided for @planOffersPerMonth.
  ///
  /// In en, this message translates to:
  /// **'{count} offers per month'**
  String planOffersPerMonth(Object count);

  /// No description provided for @planUnlimitedLabel.
  ///
  /// In en, this message translates to:
  /// **'Unlimited offers'**
  String get planUnlimitedLabel;

  /// No description provided for @planChooseButton.
  ///
  /// In en, this message translates to:
  /// **'Choose plan'**
  String get planChooseButton;

  /// No description provided for @subscriptionFreeTitle.
  ///
  /// In en, this message translates to:
  /// **'Free plan'**
  String get subscriptionFreeTitle;

  /// No description provided for @subscriptionFreeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'10 offers per month'**
  String get subscriptionFreeSubtitle;

  /// No description provided for @subscriptionActiveTitle.
  ///
  /// In en, this message translates to:
  /// **'Subscription active'**
  String get subscriptionActiveTitle;

  /// No description provided for @subscriptionActiveSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Manage your billing and plan details.'**
  String get subscriptionActiveSubtitle;

  /// No description provided for @subscriptionActivePlan.
  ///
  /// In en, this message translates to:
  /// **'Current plan: {price}'**
  String subscriptionActivePlan(Object price);

  /// No description provided for @devicesSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Devices'**
  String get devicesSectionTitle;

  /// No description provided for @devicesSectionSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Manage the device linked to your plan'**
  String get devicesSectionSubtitle;

  /// No description provided for @deviceManagementTitle.
  ///
  /// In en, this message translates to:
  /// **'Device access'**
  String get deviceManagementTitle;

  /// No description provided for @deviceManagementSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Only one device can be active at a time.'**
  String get deviceManagementSubtitle;

  /// No description provided for @deviceRevokeAction.
  ///
  /// In en, this message translates to:
  /// **'Revoke'**
  String get deviceRevokeAction;

  /// No description provided for @deviceLimitTitle.
  ///
  /// In en, this message translates to:
  /// **'Device limit reached'**
  String get deviceLimitTitle;

  /// No description provided for @deviceLimitSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your plan allows 1 active device. Replace one to continue.'**
  String get deviceLimitSubtitle;

  /// No description provided for @deviceUnknownLabel.
  ///
  /// In en, this message translates to:
  /// **'Unknown device'**
  String get deviceUnknownLabel;

  /// No description provided for @deviceCurrentLabel.
  ///
  /// In en, this message translates to:
  /// **'Current'**
  String get deviceCurrentLabel;

  /// No description provided for @deviceReplaceAction.
  ///
  /// In en, this message translates to:
  /// **'Replace'**
  String get deviceReplaceAction;

  /// No description provided for @deviceLastSeenPrefix.
  ///
  /// In en, this message translates to:
  /// **'Last seen'**
  String get deviceLastSeenPrefix;

  /// No description provided for @deviceRegisterFailedTitle.
  ///
  /// In en, this message translates to:
  /// **'Unable to register device'**
  String get deviceRegisterFailedTitle;

  /// No description provided for @retryButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retryButtonLabel;

  /// No description provided for @helpTabLabel.
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get helpTabLabel;

  /// No description provided for @helpIntroTitle.
  ///
  /// In en, this message translates to:
  /// **'Get help fast'**
  String get helpIntroTitle;

  /// No description provided for @helpIntroBody.
  ///
  /// In en, this message translates to:
  /// **'Report bugs or issues with screenshots and written details. Our team will review them and keep you updated.'**
  String get helpIntroBody;

  /// No description provided for @helpFormTitle.
  ///
  /// In en, this message translates to:
  /// **'Submit a ticket'**
  String get helpFormTitle;

  /// No description provided for @helpDescriptionLabel.
  ///
  /// In en, this message translates to:
  /// **'Describe the issue'**
  String get helpDescriptionLabel;

  /// No description provided for @helpDescriptionHint.
  ///
  /// In en, this message translates to:
  /// **'Steps, expected result, and what actually happened.'**
  String get helpDescriptionHint;

  /// No description provided for @helpDescriptionRequired.
  ///
  /// In en, this message translates to:
  /// **'Add a short description.'**
  String get helpDescriptionRequired;

  /// No description provided for @helpAudioTitle.
  ///
  /// In en, this message translates to:
  /// **'Voice note'**
  String get helpAudioTitle;

  /// No description provided for @helpAudioSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Record a voice note and we’ll transcribe it into your description.'**
  String get helpAudioSubtitle;

  /// No description provided for @helpAudioRecordButton.
  ///
  /// In en, this message translates to:
  /// **'Record voice note'**
  String get helpAudioRecordButton;

  /// No description provided for @helpAudioStopButton.
  ///
  /// In en, this message translates to:
  /// **'Stop recording'**
  String get helpAudioStopButton;

  /// No description provided for @helpAudioRecordingLabel.
  ///
  /// In en, this message translates to:
  /// **'Recording…'**
  String get helpAudioRecordingLabel;

  /// No description provided for @helpAudioProcessingLabel.
  ///
  /// In en, this message translates to:
  /// **'Saving voice note…'**
  String get helpAudioProcessingLabel;

  /// No description provided for @helpAudioReadyLabel.
  ///
  /// In en, this message translates to:
  /// **'Voice note ready'**
  String get helpAudioReadyLabel;

  /// No description provided for @helpAudioReadyWithDuration.
  ///
  /// In en, this message translates to:
  /// **'Voice note ready ({duration})'**
  String helpAudioReadyWithDuration(Object duration);

  /// No description provided for @helpAudioDeleteButton.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get helpAudioDeleteButton;

  /// No description provided for @helpAudioNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Voice recording isn’t available on this device.'**
  String get helpAudioNotSupported;

  /// No description provided for @helpAudioPermissionDenied.
  ///
  /// In en, this message translates to:
  /// **'Microphone permission is required to record voice notes.'**
  String get helpAudioPermissionDenied;

  /// No description provided for @helpAudioFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn’t record the voice note. Try again.'**
  String get helpAudioFailed;

  /// No description provided for @helpAudioTranscribingLabel.
  ///
  /// In en, this message translates to:
  /// **'Transcribing voice note…'**
  String get helpAudioTranscribingLabel;

  /// No description provided for @helpAudioTranscriptionFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn’t transcribe the voice note.'**
  String get helpAudioTranscriptionFailed;

  /// No description provided for @helpAttachmentTitle.
  ///
  /// In en, this message translates to:
  /// **'Screenshots'**
  String get helpAttachmentTitle;

  /// No description provided for @helpAttachmentSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Add screenshots to speed up troubleshooting.'**
  String get helpAttachmentSubtitle;

  /// No description provided for @helpAttachmentGalleryButton.
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get helpAttachmentGalleryButton;

  /// No description provided for @helpAttachmentLimitReached.
  ///
  /// In en, this message translates to:
  /// **'Screenshot limit reached.'**
  String get helpAttachmentLimitReached;

  /// No description provided for @helpAttachmentLimitTrimmed.
  ///
  /// In en, this message translates to:
  /// **'Added {count} screenshots. Remove one to add more.'**
  String helpAttachmentLimitTrimmed(Object count);

  /// No description provided for @removeAttachmentTooltip.
  ///
  /// In en, this message translates to:
  /// **'Remove attachment'**
  String get removeAttachmentTooltip;

  /// No description provided for @helpAttachmentProcessingFailed.
  ///
  /// In en, this message translates to:
  /// **'Unable to prepare the screenshot. Please try again.'**
  String get helpAttachmentProcessingFailed;

  /// No description provided for @helpSubmittingLabel.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get helpSubmittingLabel;

  /// No description provided for @helpSubmitButton.
  ///
  /// In en, this message translates to:
  /// **'Submit ticket'**
  String get helpSubmitButton;

  /// No description provided for @helpTicketSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Ticket submitted. We’ll keep you posted.'**
  String get helpTicketSubmitted;

  /// No description provided for @helpSubmissionFailed.
  ///
  /// In en, this message translates to:
  /// **'Unable to submit ticket. Please try again.'**
  String get helpSubmissionFailed;

  /// No description provided for @helpSubmissionTimeout.
  ///
  /// In en, this message translates to:
  /// **'Submission timed out. Check your connection and try again.'**
  String get helpSubmissionTimeout;

  /// No description provided for @helpSubmissionUploadTimeout.
  ///
  /// In en, this message translates to:
  /// **'Uploading screenshots took too long. Try fewer or smaller screenshots.'**
  String get helpSubmissionUploadTimeout;

  /// No description provided for @helpViewTicketsButton.
  ///
  /// In en, this message translates to:
  /// **'View tickets'**
  String get helpViewTicketsButton;

  /// No description provided for @helpTicketsTitle.
  ///
  /// In en, this message translates to:
  /// **'Tickets'**
  String get helpTicketsTitle;

  /// No description provided for @helpRecentTicketsTitle.
  ///
  /// In en, this message translates to:
  /// **'Recent tickets'**
  String get helpRecentTicketsTitle;

  /// No description provided for @helpNoTicketsMessage.
  ///
  /// In en, this message translates to:
  /// **'No tickets yet.'**
  String get helpNoTicketsMessage;

  /// No description provided for @helpTicketsLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn’t load tickets right now.'**
  String get helpTicketsLoadFailed;

  /// No description provided for @helpStatusOpen.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get helpStatusOpen;

  /// No description provided for @helpStatusTriaging.
  ///
  /// In en, this message translates to:
  /// **'Triaging'**
  String get helpStatusTriaging;

  /// No description provided for @helpStatusInProgress.
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get helpStatusInProgress;

  /// No description provided for @helpStatusAwaitingResponse.
  ///
  /// In en, this message translates to:
  /// **'Awaiting you'**
  String get helpStatusAwaitingResponse;

  /// No description provided for @helpStatusResolved.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get helpStatusResolved;

  /// No description provided for @helpStatusClosed.
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get helpStatusClosed;

  /// No description provided for @helpStatusUpdatedLabel.
  ///
  /// In en, this message translates to:
  /// **'Status updated'**
  String get helpStatusUpdatedLabel;

  /// No description provided for @helpDelivererStatusReceivedLabel.
  ///
  /// In en, this message translates to:
  /// **'Received'**
  String get helpDelivererStatusReceivedLabel;

  /// No description provided for @helpDelivererStatusAnalyzingLabel.
  ///
  /// In en, this message translates to:
  /// **'Analyzing'**
  String get helpDelivererStatusAnalyzingLabel;

  /// No description provided for @helpDelivererStatusNeedsInfoLabel.
  ///
  /// In en, this message translates to:
  /// **'Needs info'**
  String get helpDelivererStatusNeedsInfoLabel;

  /// No description provided for @helpDelivererStatusFixReadyLabel.
  ///
  /// In en, this message translates to:
  /// **'Fix ready'**
  String get helpDelivererStatusFixReadyLabel;

  /// No description provided for @helpDelivererStatusResolvedLabel.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get helpDelivererStatusResolvedLabel;

  /// No description provided for @helpDelivererStatusReceivedMessage.
  ///
  /// In en, this message translates to:
  /// **'Ticket received.'**
  String get helpDelivererStatusReceivedMessage;

  /// No description provided for @helpDelivererStatusAnalyzingMessage.
  ///
  /// In en, this message translates to:
  /// **'Analysis in progress.'**
  String get helpDelivererStatusAnalyzingMessage;

  /// No description provided for @helpDelivererStatusNeedsInfoMessage.
  ///
  /// In en, this message translates to:
  /// **'We need additional information to continue.'**
  String get helpDelivererStatusNeedsInfoMessage;

  /// No description provided for @helpDelivererStatusFixReadyMessage.
  ///
  /// In en, this message translates to:
  /// **'A fix is ready and under validation.'**
  String get helpDelivererStatusFixReadyMessage;

  /// No description provided for @helpDelivererStatusResolvedMessage.
  ///
  /// In en, this message translates to:
  /// **'This ticket is resolved.'**
  String get helpDelivererStatusResolvedMessage;

  /// No description provided for @helpTicketDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Ticket details'**
  String get helpTicketDetailTitle;

  /// No description provided for @helpTicketProgressTitle.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get helpTicketProgressTitle;

  /// No description provided for @helpTicketTimelineTitle.
  ///
  /// In en, this message translates to:
  /// **'Status history'**
  String get helpTicketTimelineTitle;

  /// No description provided for @helpTicketTimelineEmpty.
  ///
  /// In en, this message translates to:
  /// **'No status history yet.'**
  String get helpTicketTimelineEmpty;

  /// No description provided for @helpTicketTimelineAtLabel.
  ///
  /// In en, this message translates to:
  /// **'At'**
  String get helpTicketTimelineAtLabel;

  /// No description provided for @helpTicketDescriptionTitle.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get helpTicketDescriptionTitle;

  /// No description provided for @helpTicketDescriptionEmpty.
  ///
  /// In en, this message translates to:
  /// **'No description provided.'**
  String get helpTicketDescriptionEmpty;

  /// No description provided for @helpTicketAudioHeadline.
  ///
  /// In en, this message translates to:
  /// **'Voice note'**
  String get helpTicketAudioHeadline;

  /// No description provided for @helpTicketGeneratedTitleGeneric.
  ///
  /// In en, this message translates to:
  /// **'Support request'**
  String get helpTicketGeneratedTitleGeneric;

  /// No description provided for @helpTicketAttachmentsTitle.
  ///
  /// In en, this message translates to:
  /// **'Attachments'**
  String get helpTicketAttachmentsTitle;

  /// No description provided for @helpTicketNotFound.
  ///
  /// In en, this message translates to:
  /// **'This ticket doesn\'t exist anymore.'**
  String get helpTicketNotFound;

  /// No description provided for @helpAttachmentsScreenshotsTitle.
  ///
  /// In en, this message translates to:
  /// **'Screenshots'**
  String get helpAttachmentsScreenshotsTitle;

  /// No description provided for @helpAttachmentsAudioTitle.
  ///
  /// In en, this message translates to:
  /// **'Voice notes'**
  String get helpAttachmentsAudioTitle;

  /// No description provided for @helpNoAttachmentsMessage.
  ///
  /// In en, this message translates to:
  /// **'No attachments uploaded.'**
  String get helpNoAttachmentsMessage;

  /// No description provided for @helpAudioAttachmentLabel.
  ///
  /// In en, this message translates to:
  /// **'Voice note'**
  String get helpAudioAttachmentLabel;

  /// No description provided for @helpAudioPlayTooltip.
  ///
  /// In en, this message translates to:
  /// **'Play voice note'**
  String get helpAudioPlayTooltip;

  /// No description provided for @helpAudioOpenFailed.
  ///
  /// In en, this message translates to:
  /// **'Unable to open voice note.'**
  String get helpAudioOpenFailed;

  /// No description provided for @helpAiTriageTitle.
  ///
  /// In en, this message translates to:
  /// **'Ticket analysis'**
  String get helpAiTriageTitle;

  /// No description provided for @helpAiSummaryLabel.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get helpAiSummaryLabel;

  /// No description provided for @helpAiNextStepsLabel.
  ///
  /// In en, this message translates to:
  /// **'Next steps'**
  String get helpAiNextStepsLabel;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return lookupAppLocalizations(locale);
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

Future<AppLocalizations> lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return app_localizations_ar.loadLibrary().then(
        (dynamic _) => app_localizations_ar.AppLocalizationsAr(),
      );
    case 'en':
      return app_localizations_en.loadLibrary().then(
        (dynamic _) => app_localizations_en.AppLocalizationsEn(),
      );
    case 'fr':
      return app_localizations_fr.loadLibrary().then(
        (dynamic _) => app_localizations_fr.AppLocalizationsFr(),
      );
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
