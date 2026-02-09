import 'package:flutter/material.dart';

import '../../../defaults/data/france_defaults.dart';
import '../../domain/business_activity.dart';
import '../../domain/fixed_cost_allocation.dart';
import '../../domain/profile_defaults.dart';
import '../../domain/user_profile.dart';

class BusinessProfileController {
  final TextEditingController socialRateController;
  final TextEditingController incomeTaxController;
  final TextEditingController monthlyFixedCostsController;
  final TextEditingController monthlyHoursController;
  final TextEditingController monthlyDistanceController;
  final TextEditingController monthlyDeliveriesController;
  final TextEditingController minProfitabilityController;

  BusinessActivity activity;
  FixedCostAllocation allocation;
  bool useFranceDefaults;
  bool useLiberatoryTax;

  BusinessProfileController._({
    required this.socialRateController,
    required this.incomeTaxController,
    required this.monthlyFixedCostsController,
    required this.monthlyHoursController,
    required this.monthlyDistanceController,
    required this.monthlyDeliveriesController,
    required this.minProfitabilityController,
    required this.activity,
    required this.allocation,
    required this.useFranceDefaults,
    required this.useLiberatoryTax,
  });

  factory BusinessProfileController.forSetup() {
    final controller = BusinessProfileController._(
      socialRateController: TextEditingController(),
      incomeTaxController: TextEditingController(),
      monthlyFixedCostsController: TextEditingController(),
      monthlyHoursController: TextEditingController(),
      monthlyDistanceController: TextEditingController(),
      monthlyDeliveriesController: TextEditingController(),
      minProfitabilityController: TextEditingController(
        text: ProfileDefaults.minProfitabilityEuro.toStringAsFixed(2),
      ),
      activity: BusinessActivity.deliveryServices,
      allocation: FixedCostAllocation.perKm,
      useFranceDefaults: true,
      useLiberatoryTax: false,
    );
    controller.applyFranceDefaults();
    return controller;
  }

  factory BusinessProfileController.fromProfile(UserProfile profile) {
    return BusinessProfileController._(
      socialRateController: TextEditingController(
        text: (profile.socialContributionRate * 100).toStringAsFixed(1),
      ),
      incomeTaxController: TextEditingController(
        text: profile.incomeTaxRate == null
            ? ''
            : (profile.incomeTaxRate! * 100).toStringAsFixed(1),
      ),
      monthlyFixedCostsController: TextEditingController(
        text: profile.monthlyFixedCosts.toStringAsFixed(2),
      ),
      monthlyHoursController: TextEditingController(
        text: profile.monthlyWorkingHours.toStringAsFixed(1),
      ),
      monthlyDistanceController: TextEditingController(
        text: profile.monthlyDistanceKm.toStringAsFixed(1),
      ),
      monthlyDeliveriesController: TextEditingController(
        text: profile.monthlyDeliveries.toString(),
      ),
      minProfitabilityController: TextEditingController(
        text: profile.minProfitabilityEuro.toStringAsFixed(2),
      ),
      activity: profile.activity,
      allocation: profile.fixedCostAllocation,
      useFranceDefaults: profile.useFranceDefaults,
      useLiberatoryTax: profile.useLiberatoryTax,
    );
  }

  void applyFranceDefaults() {
    if (!useFranceDefaults) {
      return;
    }
    socialRateController.text =
        (FranceDefaults.socialContributionRateServices * 100).toStringAsFixed(
          1,
        );
    incomeTaxController.text =
        (FranceDefaults.incomeTaxRateForActivity(
                  activity: activity,
                  useLiberatoryTax: useLiberatoryTax,
                ) *
                100)
            .toStringAsFixed(1);
  }

  void dispose() {
    socialRateController.dispose();
    incomeTaxController.dispose();
    monthlyFixedCostsController.dispose();
    monthlyHoursController.dispose();
    monthlyDistanceController.dispose();
    monthlyDeliveriesController.dispose();
    minProfitabilityController.dispose();
  }
}
