// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'ProfitLens';

  @override
  String get offerDetailsSection => 'تفاصيل العرض';

  @override
  String get manualEntrySubtitle => 'أو أدخل تفاصيل العرض يدويًا.';

  @override
  String get manualEntryButton => 'إدخال يدوي';

  @override
  String get editOfferDetailsButton => 'تعديل التفاصيل';

  @override
  String get resetOfferButton => 'إعادة تعيين العرض';

  @override
  String get analysisProgressTitle => 'جارٍ تحليل العرض';

  @override
  String get analysisStepExtracting => 'استخراج تفاصيل العرض';

  @override
  String get analysisStepVerifyRoute => 'التحقق من المسار';

  @override
  String get analysisStepProfitability => 'حساب الربحية';

  @override
  String get analysisFailedTitle => 'تحليل غير مكتمل';

  @override
  String get analysisFailedBody =>
      'تعذر إكمال التحليل. يرجى تعديل التفاصيل والمحاولة مرة أخرى.';

  @override
  String get addOptionalDetailsButton => 'إضافة تفاصيل اختيارية';

  @override
  String get hideOptionalDetailsButton => 'إخفاء التفاصيل الاختيارية';

  @override
  String get offerAmountLabel => 'العائد (يورو)';

  @override
  String get distanceKmLabel => 'المسافة (كم)';

  @override
  String get vehicleSection => 'المركبة';

  @override
  String get vehicleDetailsSectionTitle => 'تفاصيل المركبة';

  @override
  String get vehicleEnergySectionTitle => 'الطاقة والاستهلاك';

  @override
  String get vehicleCostsSectionTitle => 'الصيانة والاهتلاك';

  @override
  String get vehicleTypeLabel => 'نوع المركبة';

  @override
  String get energyTypeLabel => 'نوع الطاقة';

  @override
  String get fuelTypeLabel => 'نوع الوقود';

  @override
  String get vehicleTypeBike => 'دراجة';

  @override
  String get vehicleTypeEBike => 'دراجة كهربائية';

  @override
  String get vehicleTypeScooter => 'سكوتر';

  @override
  String get vehicleTypeCar => 'سيارة';

  @override
  String get energyTypeNone => 'بدون';

  @override
  String get energyTypeElectric => 'كهرباء';

  @override
  String get energyTypeFuel => 'وقود';

  @override
  String get fuelTypeE10 => 'E10';

  @override
  String get fuelTypeSP95 => 'SP95';

  @override
  String get fuelTypeSP98 => 'SP98';

  @override
  String get fuelTypeGazole => 'ديزل';

  @override
  String get fuelTypeE85 => 'E85';

  @override
  String get fuelTypeGPLc => 'غاز بترول مسال';

  @override
  String get energyPriceLabel => 'سعر الطاقة لكل وحدة';

  @override
  String get consumptionLabel => 'الاستهلاك لكل 100 كم';

  @override
  String get maintenanceLabel => 'الصيانة لكل كم';

  @override
  String get depreciationLabel => 'الإهلاك لكل كم';

  @override
  String get costsSection => 'الضرائب والاشتراكات';

  @override
  String get socialRateLabel => 'نسبة اشتراكات رائد الأعمال';

  @override
  String get liberatoryTaxLabel => 'الاقتطاع الضريبي التحريري';

  @override
  String get liberatoryTaxHint => 'تطبيق نسبة ضريبة ثابتة على رقم الأعمال.';

  @override
  String get useFranceDefaultsLabel => 'استخدام القيم الافتراضية لفرنسا';

  @override
  String get sourcesSection => 'مصادر القيم';

  @override
  String get sourceLastCheckedLabel => 'آخر تحقق';

  @override
  String get sourceOpenButton => 'فتح المصدر';

  @override
  String get sourceOpenError => 'تعذر فتح الرابط.';

  @override
  String get importScreenshotButton => 'استيراد لقطة شاشة';

  @override
  String get analyzeButton => 'تحليل الربحية';

  @override
  String get profitabilityOverviewTitle => 'نظرة عامة على الربحية';

  @override
  String get viewProfitabilityDetailsButton => 'عرض التفاصيل';

  @override
  String get resultTitle => 'الربحية';

  @override
  String get grossRevenueLabel => 'الإيراد الإجمالي';

  @override
  String get totalCostsLabel => 'إجمالي التكاليف';

  @override
  String get netProfitLabel => 'صافي الربح';

  @override
  String get energyCostLabel => 'تكلفة الطاقة';

  @override
  String get maintenanceCostLabel => 'الصيانة';

  @override
  String get depreciationCostLabel => 'الإهلاك';

  @override
  String get socialContributionLabel => 'الاشتراكات الاجتماعية';

  @override
  String get missingConfigTitle => 'يلزم الإعداد';

  @override
  String get missingGeminiConfigMessage =>
      'لتفعيل استخراج لقطة الشاشة، قم بإعداد Firebase ونشر دالة extractOfferFromImage مع السر GEMINI_API_KEY.';

  @override
  String get missingDataTitle => 'معلومات ناقصة';

  @override
  String get missingDataDescription => 'لحساب الربحية، يرجى إكمال:';

  @override
  String get okButton => 'حسنًا';

  @override
  String get signInTitle => 'تسجيل الدخول';

  @override
  String get registerTitle => 'إنشاء حساب';

  @override
  String get emailLabel => 'البريد الإلكتروني';

  @override
  String get passwordLabel => 'كلمة المرور';

  @override
  String get confirmPasswordLabel => 'تأكيد كلمة المرور';

  @override
  String get signInButton => 'تسجيل الدخول';

  @override
  String get createAccountButton => 'إنشاء حساب';

  @override
  String get registerButton => 'تسجيل';

  @override
  String get loadingLabel => 'جارٍ التحميل...';

  @override
  String get requiredFieldError => 'هذا الحقل مطلوب.';

  @override
  String get passwordLengthError =>
      'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.';

  @override
  String get passwordMismatchError => 'كلمتا المرور غير متطابقتين.';

  @override
  String get offerTabLabel => 'العرض';

  @override
  String get historyTabLabel => 'السجل';

  @override
  String get settingsTabLabel => 'الإعدادات';

  @override
  String get noVehiclesMessage => 'أضف مركبة للبدء في التحليل.';

  @override
  String get analysisDateLabel => 'تاريخ التحليل';

  @override
  String get historyViewListLabel => 'قائمة';

  @override
  String get historyViewChartsLabel => 'رسوم بيانية';

  @override
  String get historyChartTitle => 'تطور الربح مع الوقت';

  @override
  String get historyChartProfitLabel => 'الربح';

  @override
  String get profitThresholdLabel => 'حد التعادل';

  @override
  String get historyChartEmptyMessage =>
      'أضف عرضين على الأقل لعرض الرسم البياني.';

  @override
  String get historyChartHintMessage =>
      'استخدم هذا الرسم لمقارنة الأرباح فوق/تحت حد التعادل.';

  @override
  String get latestProfitLabel => 'آخر ربح';

  @override
  String historySummaryTodayMore(String amount) {
    return 'عروض اليوم أكثر ربحية من السابقة بمقدار $amount.';
  }

  @override
  String historySummaryTodayLess(String amount) {
    return 'عروض اليوم أقل ربحية من السابقة بمقدار $amount.';
  }

  @override
  String get historySummaryTodayEqual =>
      'عروض اليوم مشابهة تقريبًا لربحية العروض السابقة.';

  @override
  String get historySummaryNoToday => 'لا توجد عروض اليوم.';

  @override
  String get historySummaryNotEnoughHistory =>
      'لا يوجد سجل كافٍ للمقارنة مع اليوم.';

  @override
  String historySummaryAverageProfit(String amount) {
    return 'متوسط الربح: $amount';
  }

  @override
  String get extractionFailedMessage => 'تعذر استخراج تفاصيل العرض.';

  @override
  String get captureScreenshotButton => 'التقاط صورة';

  @override
  String get mapsAutocompleteUnavailableMessage =>
      'الإكمال التلقائي للعناوين غير متاح. تحقق من مفتاح Google Maps API وإعداد Places UI Kit.';

  @override
  String get useSelectedPlaceButton => 'استخدام المكان المحدد';

  @override
  String get vehicleSelectLabel => 'اختر مركبة';

  @override
  String get durationMinutesLabel => 'المدة المتوقعة (دقائق)';

  @override
  String get pickupNameLabel => 'اسم الاستلام';

  @override
  String get pickupAddressLabel => 'عنوان الاستلام';

  @override
  String get pickupAddressPlaceholder => 'أدخل عنوان الاستلام';

  @override
  String get dropoffNameLabel => 'اسم المستلم (اختياري)';

  @override
  String get dropoffAddressLabel => 'عنوان التسليم';

  @override
  String get dropoffAddressPlaceholder => 'أدخل عنوان التسليم';

  @override
  String get pickupAddressMissingHint =>
      'هذه اللقطة تعرض فقط اسم المطعم وعنوان العميل. يمكن ترك عنوان الاستلام فارغًا.';

  @override
  String get verifiedDistanceLabel => 'المسافة الموثقة (كم)';

  @override
  String get verifiedDurationLabel => 'الوقت الموثق (دقائق)';

  @override
  String get routeVerificationMissingMessage =>
      'اختر عنوان الاستلام والتسليم من الإكمال التلقائي للتحقق من المسار.';

  @override
  String get routeVerificationFailedMessage =>
      'تعذر التحقق من المسافة. حاول مرة أخرى.';

  @override
  String get offerSaveFailedMessage => 'تعذر حفظ العرض.';

  @override
  String get historyDetailTitle => 'تفاصيل العرض';

  @override
  String get incomeTaxLabel => 'ضريبة الدخل';

  @override
  String get monthlyCostsSectionTitle => 'التكاليف الشهرية';

  @override
  String get fixedCostsLabel => 'تخصيص التكاليف الثابتة';

  @override
  String get profileSectionTitle => 'ملف النشاط';

  @override
  String get languageSectionTitle => 'اللغة';

  @override
  String get installAppTitle => 'تثبيت التطبيق';

  @override
  String get installAppSubtitle => 'أضف ProfitLens إلى الشاشة الرئيسية';

  @override
  String get languageFrench => 'الفرنسية';

  @override
  String get languageEnglish => 'الإنجليزية';

  @override
  String get languageArabic => 'العربية';

  @override
  String get vehiclesSectionTitle => 'المركبات';

  @override
  String get signOutButton => 'تسجيل الخروج';

  @override
  String get profileSetupTitle => 'أكمل ملفك';

  @override
  String get activityLabel => 'النشاط';

  @override
  String get activityDelivery => 'خدمات التوصيل';

  @override
  String get activityServices => 'خدمات';

  @override
  String get activitySales => 'مبيعات';

  @override
  String get incomeTaxRateLabel => 'نسبة ضريبة الدخل';

  @override
  String get incomeTaxEstimatedHint => 'قيمة تقديرية افتراضية ويمكنك تعديلها.';

  @override
  String get monthlyFixedCostsLabel => 'تكاليف ثابتة شهرية';

  @override
  String get fixedCostAllocationLabel => 'توزيع التكاليف الثابتة حسب';

  @override
  String get monthlyHoursLabel => 'ساعات العمل الشهرية';

  @override
  String get monthlyDistanceLabel => 'المسافة الشهرية (كم)';

  @override
  String get monthlyDeliveriesLabel => 'عدد التوصيلات الشهرية';

  @override
  String get fixedCostPerHourLabel => 'لكل ساعة';

  @override
  String get fixedCostPerKmLabel => 'لكل كم';

  @override
  String get fixedCostPerDeliveryLabel => 'لكل توصيل';

  @override
  String get monthlyHoursRequiredError =>
      'ساعات العمل الشهرية مطلوبة لهذا الخيار.';

  @override
  String get monthlyDistanceRequiredError =>
      'المسافة الشهرية مطلوبة لهذا الخيار.';

  @override
  String get monthlyDeliveriesRequiredError =>
      'عدد التوصيلات الشهرية مطلوب لهذا الخيار.';

  @override
  String get saveProfileButton => 'حفظ الملف';

  @override
  String get profileSaveFailedMessage => 'تعذر حفظ الملف.';

  @override
  String get profileEditTitle => 'تعديل الملف';

  @override
  String get editProfileButton => 'تعديل الملف الشخصي';

  @override
  String get addVehicleTitle => 'إضافة مركبة';

  @override
  String get editVehicleTitle => 'تعديل المركبة';

  @override
  String get editVehicleButton => 'تعديل المركبة';

  @override
  String get saveVehicleButton => 'حفظ المركبة';

  @override
  String get deleteVehicleAction => 'حذف المركبة';

  @override
  String get deleteVehicleTitle => 'حذف المركبة؟';

  @override
  String get deleteVehicleMessage =>
      'سيؤدي ذلك إلى إزالة المركبة وإعداداتها المحفوظة. يمكنك إضافتها مرة أخرى لاحقًا.';

  @override
  String get deleteVehicleCancel => 'إلغاء';

  @override
  String get deleteVehicleConfirm => 'حذف';

  @override
  String get vehicleSaveFailedMessage => 'تعذر حفظ المركبة.';

  @override
  String get vehicleDeleteFailedMessage => 'تعذر حذف المركبة.';

  @override
  String get vehicleBrandLabel => 'العلامة التجارية';

  @override
  String get vehicleModelLabel => 'الطراز';

  @override
  String get vehicleLicensePlateLabel => 'لوحة المركبة';

  @override
  String get vehicleLicensePlateHint => 'AA-123-AA';

  @override
  String get vehicleLicensePlateInvalid => 'يرجى إدخال لوحة فرنسية صحيحة.';

  @override
  String get vehicleLicensePlateDuplicate => 'توجد مركبة بهذه اللوحة بالفعل.';

  @override
  String get vehicleRegistrationYearLabel => 'سنة التسجيل';

  @override
  String get vehicleRegistrationYearHint => 'YYYY';

  @override
  String get vehicleRegistrationYearInvalid => 'يرجى إدخال سنة صحيحة.';

  @override
  String get useVehiclePresetsLabel => 'استخدام قيم المركبة الافتراضية';

  @override
  String get plateLookupButtonLabel => 'بحث';

  @override
  String get plateLookupAppliedMessage => 'تم تطبيق بيانات المركبة.';

  @override
  String get plateLookupNotFoundMessage =>
      'لم يتم العثور على مركبة لهذه اللوحة.';

  @override
  String get plateLookupFailedMessage => 'تعذر جلب بيانات اللوحة.';

  @override
  String get modelLookupAppliedMessage => 'تم تطبيق الاستهلاك.';

  @override
  String get modelLookupNotFoundMessage =>
      'لم يتم العثور على تطابق لهذه العلامة/الطراز.';

  @override
  String get modelLookupFailedMessage => 'تعذر جلب بيانات الطراز.';

  @override
  String get noHistoryMessage => 'لا توجد عروض محفوظة.';

  @override
  String get profitabilityFailedMessage =>
      'تعذر حساب الربحية. تحقق من إعدادات ملفك.';
}
