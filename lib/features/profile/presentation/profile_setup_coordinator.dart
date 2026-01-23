import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import '../../vehicles/presentation/vehicle_form_actions.dart';
import 'controllers/business_profile_controller.dart';
import 'profile_setup_actions.dart';
import 'profile_setup_view.dart';
class ProfileSetupCoordinator extends StatefulWidget {
  final AuthUser user;
  const ProfileSetupCoordinator({super.key, required this.user});
  @override
  State<ProfileSetupCoordinator> createState() =>
      _ProfileSetupCoordinatorState();
}
class _ProfileSetupCoordinatorState extends State<ProfileSetupCoordinator> {
  final _formKey = GlobalKey<FormState>();
  late final BusinessProfileController _businessController;
  late final VehicleFormController _vehicleController;
  bool _isSaving = false;
  @override
  void initState() {
    super.initState();
    _businessController = BusinessProfileController.forSetup();
    _vehicleController = VehicleFormController.fromVehicle(
      vehicle: null,
      useFranceDefaults: _businessController.useFranceDefaults,
    );
  }
  @override
  void dispose() {
    _businessController.dispose();
    _vehicleController.dispose();
    super.dispose();
  }
  void _onDefaultsChanged(bool value) {
    setState(() {
      _businessController.useFranceDefaults = value;
      _businessController.applyFranceDefaults();
      _vehicleController.applyEnergyPriceDefaults(useFranceDefaults: value);
    });
  }
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.profileSetupTitle)),
      body: SafeArea(
        child: ProfileSetupView(
          formKey: _formKey,
          businessController: _businessController,
          vehicleController: _vehicleController,
          isSaving: _isSaving,
          onActivityChanged: (value) =>
              setState(() => _businessController.activity = value),
          onAllocationChanged: (value) =>
              setState(() => _businessController.allocation = value),
          onDefaultsChanged: _onDefaultsChanged,
          onVehicleTypeChanged: (value) => setState(
            () => updateVehicleType(controller: _vehicleController, value: value),
          ),
          onEnergyTypeChanged: (value) => setState(
            () => updateEnergyType(
              controller: _vehicleController,
              value: value,
              useFranceDefaults: _businessController.useFranceDefaults,
            ),
          ),
          onFuelTypeChanged: (value) => setState(
            () => updateFuelType(
              controller: _vehicleController,
              value: value,
              useFranceDefaults: _businessController.useFranceDefaults,
            ),
          ),
          onSave: () => saveProfileSetup(
            context: context,
            user: widget.user,
            formKey: _formKey,
            businessController: _businessController,
            vehicleController: _vehicleController,
            onSavingChanged: (value) =>
                setState(() => _isSaving = value),
          ),
        ),
      ),
    );
  }
}
