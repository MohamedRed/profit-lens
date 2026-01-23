import '../../../core/utils/number_parsing.dart';
import 'controllers/business_profile_controller.dart';

class BusinessProfileValues {
  final double socialRate;
  final double? incomeTax;
  final double monthlyFixedCosts;
  final double monthlyHours;
  final double monthlyDistance;
  final int monthlyDeliveries;

  const BusinessProfileValues({
    required this.socialRate,
    required this.incomeTax,
    required this.monthlyFixedCosts,
    required this.monthlyHours,
    required this.monthlyDistance,
    required this.monthlyDeliveries,
  });
}

BusinessProfileValues? parseBusinessProfileValues(
  BusinessProfileController controller,
) {
  final socialRate = NumberParsing.parseDouble(
    controller.socialRateController.text,
  );
  if (socialRate == null) {
    return null;
  }
  return BusinessProfileValues(
    socialRate: socialRate,
    incomeTax: NumberParsing.parseDouble(controller.incomeTaxController.text),
    monthlyFixedCosts: NumberParsing.parseDouble(
          controller.monthlyFixedCostsController.text,
        ) ??
        0,
    monthlyHours: NumberParsing.parseDouble(
          controller.monthlyHoursController.text,
        ) ??
        0,
    monthlyDistance: NumberParsing.parseDouble(
          controller.monthlyDistanceController.text,
        ) ??
        0,
    monthlyDeliveries:
        int.tryParse(controller.monthlyDeliveriesController.text) ?? 0,
  );
}
