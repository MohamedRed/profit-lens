import 'package:flutter/material.dart';
import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../domain/vehicle_profile.dart';
import 'vehicle_form_model_lookup.dart';
import 'vehicle_form_plate_lookup.dart';
import 'vehicle_form_state.dart';
import 'vehicle_form_state_actions.dart';
import 'vehicle_form_view.dart';

class VehicleFormCoordinator extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;
  final VehicleProfile? vehicle;
  const VehicleFormCoordinator({
    super.key,
    required this.user,
    required this.profile,
    this.vehicle,
  });

  @override
  State<VehicleFormCoordinator> createState() => _VehicleFormCoordinatorState();
}

class _VehicleFormCoordinatorState extends State<VehicleFormCoordinator> {
  final _formKey = GlobalKey<FormState>();
  late final VehicleFormState _state;

  @override
  void initState() {
    super.initState();
    _state = VehicleFormState(profile: widget.profile, existing: widget.vehicle);
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
    if (_state.isLookingUpModel ||
        !_state.useVehiclePresets) {
      return;
    }
    _state.isLookingUpModel = true;
    _state.refresh();
    await lookupVehicleModel(
      context: context,
      controller: _state.controller,
      service: AppScope.of(context).vehicleModelLookupService,
      energyType: _state.controller.energyType,
      onApplyStart: () => _state.isApplyingPresets = true,
      onApplyEnd: () => _state.isApplyingPresets = false,
    );
    if (mounted) {
      _state.isLookingUpModel = false;
      _state.refresh();
    }
  }

  Future<void> _lookupPlate() async {
    if (_state.isLookingUpPlate) {
      return;
    }
    _state.isLookingUpPlate = true;
    _state.refresh();
    await lookupVehiclePlate(
      context: context,
      controller: _state.controller,
      service: AppScope.of(context).vehiclePlateLookupService,
      useFranceDefaults: _state.profile.useFranceDefaults,
      useVehiclePresets: _state.useVehiclePresets,
      onApplyStart: () => _state.isApplyingPresets = true,
      onApplyEnd: () => _state.isApplyingPresets = false,
    );
    if (mounted) {
      _state.isLookingUpPlate = false;
      _state.refresh();
    }
  }

  Future<void> _confirmDelete() async {
    final l10n = AppLocalizations.of(context)!;
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.deleteVehicleTitle),
        content: Text(l10n.deleteVehicleMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.deleteVehicleCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
            child: Text(l10n.deleteVehicleConfirm),
          ),
        ],
      ),
    );
    if (shouldDelete != true || !mounted) {
      return;
    }
    await _state.delete(context: context, user: widget.user);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return AnimatedBuilder(
      animation: _state,
      builder: (context, _) => VehicleFormView(
        title: widget.vehicle == null
            ? l10n.addVehicleTitle
            : l10n.editVehicleTitle,
        formKey: _formKey,
        controller: _state.controller,
        useVehiclePresets: _state.useVehiclePresets,
        onPresetsChanged: _state.togglePresets,
        onPresetEdited: _state.markPresetEdited,
        onModelLookup: _state.useVehiclePresets ? _lookupModel : null,
        onPlateLookup: _lookupPlate,
        isLookingUpPlate: _state.isLookingUpPlate,
        isSaving: _state.isSaving,
        onSave: () => _state.save(
          context: context,
          formKey: _formKey,
          user: widget.user,
        ),
        onDelete: widget.vehicle == null ? null : _confirmDelete,
        onVehicleTypeChanged: _state.changeVehicleType,
        onEnergyTypeChanged: _state.changeEnergyType,
        onFuelTypeChanged: _state.changeFuelType,
      ),
    );
  }
}
