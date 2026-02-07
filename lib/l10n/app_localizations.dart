import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

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
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
