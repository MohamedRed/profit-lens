import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../defaults/data/france_defaults.dart';
import '../../defaults/data/vehicle_presets_fr.dart';
import '../../defaults/presentation/preset_sources_section.dart';
import '../../profile/domain/business_activity.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller_actions.dart';
import '../../vehicles/presentation/widgets/vehicle_costs_section.dart';
import '../../vehicles/presentation/widgets/vehicle_details_section.dart';
import '../../vehicles/presentation/widgets/vehicle_energy_section.dart';
import 'controllers/business_profile_controller.dart';
import 'sections/business_fixed_costs_section.dart';
import 'sections/business_taxes_setup_section.dart';
import 'sections/profitability_target_section.dart';

class ProfileSetupStepper extends StatefulWidget {
  final BusinessProfileController businessController;
  final VehicleFormController vehicleController;
  final bool isSaving;
  final bool useVehiclePresets;
  final ValueChanged<bool> onVehiclePresetsChanged;
  final VoidCallback onVehiclePresetEdited;
  final VoidCallback? onModelLookup;
  final VoidCallback? onPlateLookup;
  final bool isLookingUpPlate;
  final ValueChanged<BusinessActivity> onActivityChanged;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;
  final ValueChanged<bool> onDefaultsChanged;
  final ValueChanged<bool> onLiberatoryTaxChanged;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final VoidCallback onSave;

  const ProfileSetupStepper({
    super.key,
    required this.businessController,
    required this.vehicleController,
    required this.isSaving,
    required this.useVehiclePresets,
    required this.onVehiclePresetsChanged,
    required this.onVehiclePresetEdited,
    required this.onModelLookup,
    required this.onPlateLookup,
    required this.isLookingUpPlate,
    required this.onActivityChanged,
    required this.onAllocationChanged,
    required this.onDefaultsChanged,
    required this.onLiberatoryTaxChanged,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.onSave,
  });

  @override
  State<ProfileSetupStepper> createState() => _ProfileSetupStepperState();
}

class _ProfileSetupStepperState extends State<ProfileSetupStepper> {
  int _currentStep = 0;

  void _goToStep(int step) {
    setState(() => _currentStep = step);
  }

  void _nextStep(int maxStep) {
    if (_currentStep < maxStep) {
      setState(() => _currentStep += 1);
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep -= 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final steps = _buildSteps(l10n);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _ProfileStepHeader(
          steps: steps,
          currentStep: _currentStep,
          onStepTapped: _goToStep,
        ),
        const SizedBox(height: 8),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 12),
            child: steps[_currentStep].content,
          ),
        ),
        _buildControls(context, l10n, steps.length),
      ],
    );
  }

  List<_ProfileStepData> _buildSteps(AppLocalizations l10n) {
    final vehicleController = widget.vehicleController;
    final businessController = widget.businessController;
    return [
      _ProfileStepData(
        label: l10n.vehicleDetailsSectionTitle,
        content: VehicleDetailsSection(
          vehicleType: vehicleController.vehicleType,
          useVehiclePresets: widget.useVehiclePresets,
          onVehicleTypeChanged: widget.onVehicleTypeChanged,
          onPresetsChanged: widget.onVehiclePresetsChanged,
          onPresetEdited: widget.onVehiclePresetEdited,
          licensePlateController: vehicleController.licensePlateController,
          brandController: vehicleController.brandController,
          modelController: vehicleController.modelController,
          registrationYearController:
              vehicleController.registrationYearController,
          onModelLookup: widget.onModelLookup,
          onPlateLookup: widget.onPlateLookup,
          isLookingUpPlate: widget.isLookingUpPlate,
        ),
      ),
      _ProfileStepData(
        label: l10n.vehicleEnergySectionTitle,
        content: _withSources(
          VehicleEnergySection(
            vehicleType: vehicleController.vehicleType,
            energyType: vehicleController.energyType,
            fuelType: vehicleController.fuelType,
            onEnergyTypeChanged: widget.onEnergyTypeChanged,
            onFuelTypeChanged: widget.onFuelTypeChanged,
            onPresetEdited: widget.onVehiclePresetEdited,
            consumptionController: vehicleController.consumptionController,
            energyPriceController: vehicleController.energyPriceController,
            consumptionSuffix: vehicleController.consumptionSuffix(),
            energyPriceSuffix: vehicleController.energyPriceSuffix(),
          ),
          VehiclePresetsFr.sources,
          showSources: widget.useVehiclePresets,
        ),
      ),
      _ProfileStepData(
        label: l10n.vehicleCostsSectionTitle,
        content: _withSources(
          VehicleCostsSection(
            maintenanceController: vehicleController.maintenanceController,
            depreciationController: vehicleController.depreciationController,
            onPresetEdited: widget.onVehiclePresetEdited,
          ),
          VehiclePresetsFr.sources,
          showSources: widget.useVehiclePresets,
        ),
      ),
      _ProfileStepData(
        label: l10n.costsSection,
        content: _withSources(
          BusinessTaxesSetupSection(
            activity: businessController.activity,
            onActivityChanged: widget.onActivityChanged,
            socialRateController: businessController.socialRateController,
            incomeTaxController: businessController.incomeTaxController,
            useFranceDefaults: businessController.useFranceDefaults,
            onDefaultsChanged: widget.onDefaultsChanged,
            useLiberatoryTax: businessController.useLiberatoryTax,
            onLiberatoryTaxChanged: widget.onLiberatoryTaxChanged,
          ),
          FranceDefaults.sources,
          showSources: businessController.useFranceDefaults,
        ),
      ),
      _ProfileStepData(
        label: l10n.monthlyCostsSectionTitle,
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            BusinessFixedCostsSection(
              monthlyFixedCostsController:
                  businessController.monthlyFixedCostsController,
              monthlyHoursController: businessController.monthlyHoursController,
              monthlyDistanceController:
                  businessController.monthlyDistanceController,
              monthlyDeliveriesController:
                  businessController.monthlyDeliveriesController,
              allocation: businessController.allocation,
              onAllocationChanged: widget.onAllocationChanged,
            ),
            const SizedBox(height: 12),
            ProfitabilityTargetSection(
              minProfitabilityController:
                  businessController.minProfitabilityController,
            ),
          ],
        ),
      ),
    ];
  }

  Widget _buildControls(
    BuildContext context,
    AppLocalizations l10n,
    int stepCount,
  ) {
    final isLastStep = _currentStep == stepCount - 1;
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _previousStep,
                child: Text(l10n.backButtonLabel),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 12),
          Expanded(
            child: PrimaryButton(
              label: isLastStep ? l10n.saveProfileButton : l10n.nextButtonLabel,
              isBusy: isLastStep && widget.isSaving,
              onPressed: isLastStep
                  ? (widget.isSaving ? null : widget.onSave)
                  : () => _nextStep(stepCount - 1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _withSources(
    Widget content,
    List<DefaultSource> sources,
    {required bool showSources}
  ) {
    if (!showSources) {
      return content;
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        content,
        const SizedBox(height: 12),
        PresetSourcesSection(sources: sources),
      ],
    );
  }
}

class _ProfileStepData {
  final String label;
  final Widget content;

  const _ProfileStepData({
    required this.label,
    required this.content,
  });
}

class _ProfileStepHeader extends StatelessWidget {
  final List<_ProfileStepData> steps;
  final int currentStep;
  final ValueChanged<int> onStepTapped;

  const _ProfileStepHeader({
    required this.steps,
    required this.currentStep,
    required this.onStepTapped,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeColor = theme.colorScheme.primary;
    final inactiveColor = theme.colorScheme.primary.withOpacity(0.2);
    final completeColor = theme.colorScheme.primaryContainer;
    final lineActive = theme.colorScheme.primary.withOpacity(0.5);
    final lineInactive = theme.colorScheme.primary.withOpacity(0.15);
    final textStyle = theme.textTheme.labelSmall;
    final children = <Widget>[];

    for (var i = 0; i < steps.length; i++) {
      final isActive = i == currentStep;
      final isComplete = i < currentStep;
      final circleColor = isComplete
          ? completeColor
          : isActive
              ? activeColor
              : inactiveColor;
      final circleTextColor = isComplete
          ? theme.colorScheme.onPrimaryContainer
          : isActive
              ? theme.colorScheme.onPrimary
              : theme.colorScheme.onSurfaceVariant;
      children.add(
        InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => onStepTapped(i),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: circleColor,
              ),
              alignment: Alignment.center,
              child: Text(
                isComplete ? '✓' : '${i + 1}',
                style: textStyle?.copyWith(
                  color: circleTextColor,
                  fontSize: 11,
                ),
              ),
            ),
          ),
        ),
      );
      if (i < steps.length - 1) {
        children.add(
          Expanded(
            child: Container(
              height: 2,
              margin: const EdgeInsets.symmetric(horizontal: 6),
              color: i < currentStep ? lineActive : lineInactive,
            ),
          ),
        );
      }
    }

    return Column(
      children: [
        Row(children: children),
        const SizedBox(height: 6),
        Text(
          steps[currentStep].label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: textStyle,
        ),
      ],
    );
  }
}
