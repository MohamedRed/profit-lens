import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../vehicles/domain/vehicle_type.dart';
import 'profile_setup_state.dart';
import 'profile_setup_state_save.dart';
import 'profile_setup_state_vehicle.dart';
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
  late final ProfileSetupState _state;

  @override
  void initState() {
    super.initState();
    _state = ProfileSetupState();
    if (_state.useVehiclePresets) {
      _state.applyPresetsForType(setEnergyType: true);
    }
  }

  @override
  void dispose() {
    _state.dispose();
    super.dispose();
  }

  Future<void> _lookupModel() async {
    await _state.lookupModel(
      context: context,
      service: AppScope.of(context).vehicleModelLookupService,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return AnimatedBuilder(
      animation: _state,
      builder: (context, _) => Scaffold(
        appBar: AppBar(title: Text(l10n.profileSetupTitle)),
        body: SafeArea(
          child: ProfileSetupView(
            formKey: _formKey,
            businessController: _state.businessController,
            vehicleController: _state.vehicleController,
            isSaving: _state.isSaving,
            useVehiclePresets: _state.useVehiclePresets,
            onVehiclePresetsChanged: _state.togglePresets,
            onVehiclePresetEdited: _state.markPresetEdited,
            onLookupModel: _state.isLookingUpModel ? null : _lookupModel,
            isLookingUpModel: _state.isLookingUpModel,
            showModelLookup: _state.useVehiclePresets &&
                _state.vehicleController.vehicleType ==
                    VehicleType.car,
            onActivityChanged: (value) {
              _state.businessController.activity = value;
              _state.refresh();
            },
            onAllocationChanged: (value) {
              _state.businessController.allocation = value;
              _state.refresh();
            },
            onDefaultsChanged: _state.updateDefaults,
            onVehicleTypeChanged: _state.changeVehicleType,
            onEnergyTypeChanged: _state.changeEnergyType,
            onFuelTypeChanged: _state.changeFuelType,
            onSave: () => _state.save(
              context: context,
              user: widget.user,
              formKey: _formKey,
            ),
          ),
        ),
      ),
    );
  }
}
