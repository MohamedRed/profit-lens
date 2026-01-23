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
  String get offerAmountLabel => 'العائد (يورو)';

  @override
  String get distanceKmLabel => 'المسافة (كم)';

  @override
  String get vehicleSection => 'المركبة';

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
  String get useFranceDefaultsLabel => 'استخدام القيم الافتراضية لفرنسا';

  @override
  String get importScreenshotButton => 'استيراد لقطة شاشة';

  @override
  String get analyzeButton => 'تحليل الربحية';

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
      'لتفعيل استخراج لقطة الشاشة، عيّن GEMINI_API_KEY و GEMINI_MODEL في إعدادات البناء.';

  @override
  String get okButton => 'حسنًا';
}
