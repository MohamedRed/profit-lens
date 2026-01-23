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

  /// No description provided for @okButton.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get okButton;
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
