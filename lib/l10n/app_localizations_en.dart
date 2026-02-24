// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Liive Profit';

  @override
  String get offerDetailsSection => 'Offer details';

  @override
  String get manualEntrySubtitle => 'Or enter the offer details manually.';

  @override
  String get manualEntryButton => 'Enter manually';

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
  String get analysisFailedScreenshotBody =>
      'We couldn\'t read this screenshot. Please upload a valid offer screenshot.';

  @override
  String get analysisFailedQuotaBody =>
      'Screenshot analysis is temporarily unavailable. Enter details manually and try again later.';

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
  String get vehicleDetailsSectionTitle => 'Vehicle details';

  @override
  String get vehicleEnergySectionTitle => 'Energy & consumption';

  @override
  String get vehicleCostsSectionTitle => 'Maintenance & depreciation';

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
  String get liberatoryTaxLabel => 'Prélèvement libératoire';

  @override
  String get liberatoryTaxHint => 'Apply a flat income tax rate on turnover.';

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
  String get importSourceTitle => 'Choose a source';

  @override
  String get importSourceGallery => 'Photo Library';

  @override
  String get importSourceCamera => 'Take Photo';

  @override
  String get importedScreenshotTitle => 'Imported screenshot';

  @override
  String get analyzeButton => 'Analyze profitability';

  @override
  String get profitabilityOverviewTitle => 'Profitability overview';

  @override
  String get offerDecisionAccept => 'Accept';

  @override
  String get offerDecisionDecline => 'Decline';

  @override
  String offerDecisionAbove(Object amount) {
    return '$amount above your target';
  }

  @override
  String offerDecisionBelow(Object amount) {
    return '$amount below your target';
  }

  @override
  String get profitabilityTargetTitle => 'Profitability target';

  @override
  String get minProfitabilityLabel => 'Minimum profit per km';

  @override
  String get minProfitabilityHint => 'Suggested default: €2.00/km';

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
  String get stripeReturnTitle => 'Back from Stripe';

  @override
  String get stripeReturnBody =>
      'Updating your subscription. This can take a few seconds.';

  @override
  String get signInTitle => 'Sign in';

  @override
  String get signInSubtitle =>
      'Analyze delivery offers faster and keep every euro.';

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
  String get nextButtonLabel => 'Next';

  @override
  String get backButtonLabel => 'Back';

  @override
  String get requiredFieldError => 'This field is required.';

  @override
  String get passwordLengthError => 'Password must be at least 8 characters.';

  @override
  String get passwordMismatchError => 'Passwords do not match.';

  @override
  String get signInFailedMessage =>
      'Unable to sign in. Check your email and password and try again.';

  @override
  String get registerFailedMessage =>
      'Unable to create your account right now. Please try again.';

  @override
  String get offerActionFailedMessage =>
      'Unable to complete this action right now. Please try again.';

  @override
  String get offerLocationPermissionRequired =>
      'Location permission is required to analyze an offer.';

  @override
  String get offerLocationUnavailable =>
      'Unable to read your current location. Check GPS and try again.';

  @override
  String get offerLocationTimeout =>
      'Location took too long to load. Try again in an open area.';

  @override
  String get offerLocationUnsupported =>
      'This device does not support location for offer analysis.';

  @override
  String get billingActionFailedMessage =>
      'Unable to update subscription right now. Please try again.';

  @override
  String get deviceActionFailedMessage =>
      'Unable to update device right now. Please try again.';

  @override
  String get vehicleActionFailedMessage =>
      'Unable to update vehicle right now. Please try again.';

  @override
  String get languageSaveFailedMessage =>
      'Unable to update language right now. Please try again.';

  @override
  String get genericActionFailedMessage =>
      'Something went wrong. Please try again.';

  @override
  String get errorSessionExpired =>
      'Your session has expired. Please sign in again.';

  @override
  String get errorPlanUnavailable =>
      'No paid plan is available right now. Please try again later.';

  @override
  String get errorInvalidEmail => 'Enter a valid email address.';

  @override
  String get errorInvalidCredentials => 'Incorrect email or password.';

  @override
  String get errorEmailAlreadyInUse =>
      'This email is already used by another account.';

  @override
  String get errorWeakPassword =>
      'Password is too weak. Use at least 8 characters.';

  @override
  String get errorTooManyRequests =>
      'Too many attempts. Please wait a moment and try again.';

  @override
  String get errorNetworkUnavailable =>
      'Network issue. Check your connection and try again.';

  @override
  String get errorPermissionDenied =>
      'You don\'t have permission to do this action on this account.';

  @override
  String get deviceNotRegisteredMessage =>
      'This device is not registered on your account yet. Refresh and try again.';

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
  String get profitThresholdLabel => 'Break-even';

  @override
  String get historyChartEmptyMessage =>
      'Add at least 2 offers to see the chart.';

  @override
  String get historyChartHintMessage =>
      'Use this chart to compare profits above/below the break-even line.';

  @override
  String get latestProfitLabel => 'Latest profit';

  @override
  String historySummaryTodayMore(Object amount) {
    return 'Today\'s offers are more profitable than earlier ones by $amount.';
  }

  @override
  String historySummaryTodayLess(Object amount) {
    return 'Today\'s offers are less profitable than earlier ones by $amount.';
  }

  @override
  String get updateAvailableTitle => 'An update is available.';

  @override
  String get updateAvailableCta => 'Reload';

  @override
  String get historySummaryTodayEqual =>
      'Today\'s offers are about as profitable as earlier ones.';

  @override
  String get historySummaryNoToday => 'No offers today yet.';

  @override
  String get historySummaryNotEnoughHistory =>
      'Not enough history to compare today.';

  @override
  String historySummaryAverageProfit(Object amount) {
    return 'Average profit: $amount';
  }

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
  String get analyzeOfferButton => 'Analyze offer';

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
  String get dropoffNameLabel => 'Drop-off name';

  @override
  String get dropoffAddressLabel => 'Drop-off address';

  @override
  String get dropoffAddressPlaceholder => 'Enter drop-off address';

  @override
  String get pickupAddressMissingHint =>
      'This screenshot provides only the restaurant name and the customer address. The pickup address can be left empty.';

  @override
  String get verifiedDistanceLabel => 'Verified distance';

  @override
  String get verifiedDurationLabel => 'Verified time';

  @override
  String get distanceUnitKm => 'km';

  @override
  String get durationUnitMinutes => 'min';

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
  String get monthlyCostsSectionTitle => 'Monthly costs';

  @override
  String get fixedCostsLabel => 'Fixed costs allocation';

  @override
  String get profileSectionTitle => 'Business profile';

  @override
  String get languageSectionTitle => 'Language';

  @override
  String get installAppTitle => 'Install app';

  @override
  String get installAppSubtitle => 'Add Liive Profit to your home screen';

  @override
  String get installAppCta => 'Install';

  @override
  String get installAppRequiredTitle => 'Install required';

  @override
  String get installAppRequiredBody =>
      'To continue, install Liive Profit and open it from your home screen. We show the install guide automatically.';

  @override
  String get installAppRequiredNativeBody =>
      'To continue, install Liive Profit and open it from your home screen. Tap Install to open the browser prompt.';

  @override
  String get installAppLoadFailed => 'Failed to load install dialog.';

  @override
  String get installAppPromptUnavailable =>
      'Install prompt is not ready yet. Wait a moment and try again.';

  @override
  String get installAppPromptFailed => 'Install failed.';

  @override
  String get installAppPromptWaiting =>
      'Preparing install prompt. Keep this page open for a moment.';

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
  String get incomeTaxEstimatedHint =>
      'Estimated default. You can override it.';

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
  String get deleteVehicleAction => 'Delete vehicle';

  @override
  String get deleteVehicleTitle => 'Delete vehicle?';

  @override
  String get deleteVehicleMessage =>
      'This will remove the vehicle and its saved settings. You can add it again later.';

  @override
  String get deleteVehicleCancel => 'Cancel';

  @override
  String get deleteVehicleConfirm => 'Delete';

  @override
  String get vehicleSaveFailedMessage => 'Unable to save vehicle.';

  @override
  String get vehicleDeleteFailedMessage => 'Unable to delete vehicle.';

  @override
  String get vehicleBrandLabel => 'Brand';

  @override
  String get vehicleModelLabel => 'Model';

  @override
  String get vehicleLicensePlateLabel => 'License plate';

  @override
  String get vehicleLicensePlateHint => 'AA-123-AA';

  @override
  String get vehicleLicensePlateInvalid => 'Enter a valid French plate.';

  @override
  String get vehicleLicensePlateDuplicate =>
      'A vehicle with this plate already exists.';

  @override
  String get vehicleRegistrationYearLabel => 'Registration year';

  @override
  String get vehicleRegistrationYearHint => 'YYYY';

  @override
  String get vehicleRegistrationYearInvalid => 'Enter a valid year.';

  @override
  String get useVehiclePresetsLabel => 'Use vehicle presets';

  @override
  String get plateLookupButtonLabel => 'Lookup';

  @override
  String get plateLookupAppliedMessage => 'Vehicle details applied.';

  @override
  String get plateLookupNotFoundMessage => 'No vehicle found for this plate.';

  @override
  String get plateLookupFailedMessage => 'Unable to fetch plate data.';

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

  @override
  String get offersRemainingTitle => 'Offers remaining';

  @override
  String offersRemainingValue(Object remaining) {
    return '$remaining offers remaining this month';
  }

  @override
  String get offersRemainingUnlimited => 'Unlimited offers';

  @override
  String get subscriptionStatusLabel => 'Subscription status';

  @override
  String get subscriptionStatusFree => 'Free';

  @override
  String get subscriptionStatusActive => 'Active';

  @override
  String get subscriptionStatusPastDue => 'Payment issue';

  @override
  String get subscriptionStatusCanceled => 'Canceled';

  @override
  String get subscriptionStatusTrialing => 'Trial';

  @override
  String get subscriptionStatusIncomplete => 'Incomplete';

  @override
  String get subscriptionStatusUnpaid => 'Unpaid';

  @override
  String get subscriptionStatusUnknown => 'Unknown';

  @override
  String subscriptionStatusCanceling(Object date) {
    return 'Cancels on $date';
  }

  @override
  String get upgradePlanButton => 'Upgrade plan';

  @override
  String get managePlanButton => 'Manage plan';

  @override
  String get billingBackToSettings => 'Back to settings';

  @override
  String get billingManageTitle => 'Manage subscription';

  @override
  String get billingManageSubtitle =>
      'Change plan, pause cancellation, or schedule cancellation.';

  @override
  String get billingPlanSelectionLabel => 'Plan';

  @override
  String get billingApplyPlanButton => 'Apply plan change';

  @override
  String get billingPlanMissingError => 'Select a subscription plan first.';

  @override
  String get billingPlanChangeSuccess => 'Subscription plan updated.';

  @override
  String get billingCancellationTitle => 'Cancellation';

  @override
  String get billingCancellationSubtitle =>
      'Choose whether to keep renewing or stop at the end of this billing period.';

  @override
  String get billingCancelAtPeriodEndButton => 'Cancel at period end';

  @override
  String get billingResumeSubscriptionButton => 'Resume subscription';

  @override
  String get billingCancelSuccess => 'Subscription will cancel at period end.';

  @override
  String get billingResumeSuccess =>
      'Automatic renewal re-enabled. Your subscription stays active.';

  @override
  String billingPeriodEndsOn(Object date) {
    return 'Period ends on $date';
  }

  @override
  String get billingSuggestionsTitle => 'Suggested plans';

  @override
  String get billingSuggestionsEmpty => 'No alternative suggestions right now.';

  @override
  String get billingStripePortalTitle => 'Stripe billing';

  @override
  String get billingStripePortalSubtitle =>
      'Open Stripe to manage invoices, payment methods, and billing details.';

  @override
  String get billingStripePortalButton => 'Open Stripe billing';

  @override
  String get offerLimitReachedMessage =>
      'You have reached your monthly offer limit. Upgrade to continue.';

  @override
  String get subscriptionPlansTitle => 'Choose a plan';

  @override
  String get subscriptionPlansSubtitle =>
      'Pick the monthly cap that fits your deliveries.';

  @override
  String planPricePerMonth(Object price) {
    return '$price / month';
  }

  @override
  String planOffersPerMonth(Object count) {
    return '$count offers per month';
  }

  @override
  String get planUnlimitedLabel => 'Unlimited offers';

  @override
  String get planChooseButton => 'Choose plan';

  @override
  String get subscriptionFreeTitle => 'Free plan';

  @override
  String get subscriptionFreeSubtitle => '10 offers per month';

  @override
  String get subscriptionActiveTitle => 'Subscription active';

  @override
  String get subscriptionActiveSubtitle =>
      'Manage your billing and plan details.';

  @override
  String subscriptionActivePlan(Object price) {
    return 'Current plan: $price';
  }

  @override
  String get devicesSectionTitle => 'Devices';

  @override
  String get devicesSectionSubtitle => 'Manage the device linked to your plan';

  @override
  String get deviceManagementTitle => 'Device access';

  @override
  String get deviceManagementSubtitle =>
      'Only one device can be active at a time.';

  @override
  String get deviceRevokeAction => 'Revoke';

  @override
  String get deviceLimitTitle => 'Device limit reached';

  @override
  String get deviceLimitSubtitle =>
      'Your plan allows 1 active device. Replace one to continue.';

  @override
  String get deviceUnknownLabel => 'Unknown device';

  @override
  String get deviceCurrentLabel => 'Current';

  @override
  String get deviceReplaceAction => 'Replace';

  @override
  String get deviceLastSeenPrefix => 'Last seen';

  @override
  String get deviceRegisterFailedTitle => 'Unable to register device';

  @override
  String get retryButtonLabel => 'Retry';

  @override
  String get helpTabLabel => 'Help';

  @override
  String get helpIntroTitle => 'Get help fast';

  @override
  String get helpIntroBody =>
      'Report bugs or issues with screenshots and written details. Our team will review them and keep you updated.';

  @override
  String get helpFormTitle => 'Submit a ticket';

  @override
  String get helpDescriptionLabel => 'Describe the issue';

  @override
  String get helpDescriptionHint =>
      'Steps, expected result, and what actually happened.';

  @override
  String get helpDescriptionRequired => 'Add a short description.';

  @override
  String get helpAudioTitle => 'Voice note';

  @override
  String get helpAudioSubtitle =>
      'Record a voice note and we’ll transcribe it into your description.';

  @override
  String get helpAudioRecordButton => 'Record voice note';

  @override
  String get helpAudioStopButton => 'Stop recording';

  @override
  String get helpAudioRecordingLabel => 'Recording…';

  @override
  String get helpAudioProcessingLabel => 'Saving voice note…';

  @override
  String get helpAudioReadyLabel => 'Voice note ready';

  @override
  String helpAudioReadyWithDuration(Object duration) {
    return 'Voice note ready ($duration)';
  }

  @override
  String get helpAudioDeleteButton => 'Remove';

  @override
  String get helpAudioNotSupported =>
      'Voice recording isn’t available on this device.';

  @override
  String get helpAudioPermissionDenied =>
      'Microphone permission is required to record voice notes.';

  @override
  String get helpAudioFailed => 'We couldn’t record the voice note. Try again.';

  @override
  String get helpAudioTranscribingLabel => 'Transcribing voice note…';

  @override
  String get helpAudioTranscriptionFailed =>
      'We couldn’t transcribe the voice note.';

  @override
  String get helpAttachmentTitle => 'Screenshots';

  @override
  String get helpAttachmentSubtitle =>
      'Add screenshots to speed up troubleshooting.';

  @override
  String get helpAttachmentGalleryButton => 'Gallery';

  @override
  String get helpAttachmentLimitReached => 'Screenshot limit reached.';

  @override
  String helpAttachmentLimitTrimmed(Object count) {
    return 'Added $count screenshots. Remove one to add more.';
  }

  @override
  String get removeAttachmentTooltip => 'Remove attachment';

  @override
  String get helpAttachmentProcessingFailed =>
      'Unable to prepare the screenshot. Please try again.';

  @override
  String get helpSubmittingLabel => 'Submitting...';

  @override
  String get helpSubmitButton => 'Submit ticket';

  @override
  String get helpTicketSubmitted => 'Ticket submitted. We’ll keep you posted.';

  @override
  String get helpSubmissionFailed =>
      'Unable to submit ticket. Please try again.';

  @override
  String get helpSubmissionTimeout =>
      'Submission timed out. Check your connection and try again.';

  @override
  String get helpSubmissionUploadTimeout =>
      'Uploading screenshots took too long. Try fewer or smaller screenshots.';

  @override
  String get helpViewTicketsButton => 'View tickets';

  @override
  String get helpTicketsTitle => 'Tickets';

  @override
  String get helpRecentTicketsTitle => 'Recent tickets';

  @override
  String get helpNoTicketsMessage => 'No tickets yet.';

  @override
  String get helpTicketsLoadFailed => 'We couldn’t load tickets right now.';

  @override
  String get helpStatusOpen => 'Open';

  @override
  String get helpStatusTriaging => 'Triaging';

  @override
  String get helpStatusInProgress => 'In progress';

  @override
  String get helpStatusAwaitingResponse => 'Awaiting you';

  @override
  String get helpStatusResolved => 'Resolved';

  @override
  String get helpStatusClosed => 'Closed';

  @override
  String get helpStatusUpdatedLabel => 'Status updated';

  @override
  String get helpDelivererStatusReceivedLabel => 'Received';

  @override
  String get helpDelivererStatusAnalyzingLabel => 'Analyzing';

  @override
  String get helpDelivererStatusNeedsInfoLabel => 'Needs info';

  @override
  String get helpDelivererStatusFixReadyLabel => 'Fix ready';

  @override
  String get helpDelivererStatusResolvedLabel => 'Resolved';

  @override
  String get helpDelivererStatusReceivedMessage => 'Ticket received.';

  @override
  String get helpDelivererStatusAnalyzingMessage => 'Analysis in progress.';

  @override
  String get helpDelivererStatusNeedsInfoMessage =>
      'We need additional information to continue.';

  @override
  String get helpDelivererStatusFixReadyMessage =>
      'A fix is ready and under validation.';

  @override
  String get helpDelivererStatusResolvedMessage => 'This ticket is resolved.';

  @override
  String get helpTicketDetailTitle => 'Ticket details';

  @override
  String get helpTicketProgressTitle => 'Progress';

  @override
  String get helpTicketTimelineTitle => 'Status history';

  @override
  String get helpTicketTimelineEmpty => 'No status history yet.';

  @override
  String get helpTicketTimelineAtLabel => 'At';

  @override
  String get helpTicketDescriptionTitle => 'Description';

  @override
  String get helpTicketDescriptionEmpty => 'No description provided.';

  @override
  String get helpTicketAudioHeadline => 'Voice note';

  @override
  String get helpTicketGeneratedTitleGeneric => 'Support request';

  @override
  String get helpTicketAttachmentsTitle => 'Attachments';

  @override
  String get helpTicketNotFound => 'This ticket doesn\'t exist anymore.';

  @override
  String get helpAttachmentsScreenshotsTitle => 'Screenshots';

  @override
  String get helpAttachmentsAudioTitle => 'Voice notes';

  @override
  String get helpNoAttachmentsMessage => 'No attachments uploaded.';

  @override
  String get helpAudioAttachmentLabel => 'Voice note';

  @override
  String get helpAudioPlayTooltip => 'Play voice note';

  @override
  String get helpAudioOpenFailed => 'Unable to open voice note.';

  @override
  String get helpAiTriageTitle => 'Ticket analysis';

  @override
  String get helpAiSummaryLabel => 'Summary';

  @override
  String get helpAiNextStepsLabel => 'Next steps';
}
