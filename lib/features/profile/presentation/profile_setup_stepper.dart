import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';
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
    return Stepper(
      type: StepperType.horizontal,
      currentStep: _currentStep,
      onStepTapped: _goToStep,
      physics: const ClampingScrollPhysics(),
      controlsBuilder: (context, details) => _buildControls(
        context,
        l10n,
        steps.length,
      ),
      steps: steps,
    );
  }

  List<Step> _buildSteps(AppLocalizations l10n) {
    final vehicleController = widget.vehicleController;
    final businessController = widget.businessController;
    return [
      Step(
        title: Text(l10n.vehicleDetailsSectionTitle),
        state: _stepState(0),
        isActive: _currentStep >= 0,
        content: _wrapStepContent(
          VehicleDetailsSection(
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
      ),
      Step(
        title: Text(l10n.vehicleEnergySectionTitle),
        state: _stepState(1),
        isActive: _currentStep >= 1,
        content: _wrapStepContent(
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
        ),
      ),
      Step(
        title: Text(l10n.vehicleCostsSectionTitle),
        state: _stepState(2),
        isActive: _currentStep >= 2,
        content: _wrapStepContent(
          VehicleCostsSection(
            maintenanceController: vehicleController.maintenanceController,
            depreciationController: vehicleController.depreciationController,
            onPresetEdited: widget.onVehiclePresetEdited,
          ),
        ),
      ),
      Step(
        title: Text(l10n.costsSection),
        state: _stepState(3),
        isActive: _currentStep >= 3,
        content: _wrapStepContent(
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
        ),
      ),
      Step(
        title: Text(l10n.monthlyCostsSectionTitle),
        state: _stepState(4),
        isActive: _currentStep >= 4,
        content: _wrapStepContent(
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
        ),
      ),
    ];
  }

  StepState _stepState(int index) {
    if (_currentStep > index) {
      return StepState.complete;
    }
    if (_currentStep == index) {
      return StepState.editing;
    }
    return StepState.indexed;
  }

  Widget _wrapStepContent(Widget child) {
    return Align(
      alignment: Alignment.topCenter,
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 12),
        child: child,
      ),
    );
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
}
