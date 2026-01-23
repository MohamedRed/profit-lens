import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../domain/vehicle_profile.dart';
import 'controllers/vehicle_form_controller.dart';
import 'vehicle_form_actions.dart';
import 'vehicle_form_body.dart';
class VehicleFormScreen extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;
  final VehicleProfile? vehicle;
  const VehicleFormScreen({
    super.key,
    required this.user,
    required this.profile,
    this.vehicle,
  });

  @override
  State<VehicleFormScreen> createState() => _VehicleFormScreenState();
}
class _VehicleFormScreenState extends State<VehicleFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final VehicleFormController _controller;
  bool _isSaving = false;
  @override
  void initState() {
    super.initState();
    _controller = VehicleFormController.fromVehicle(
      vehicle: widget.vehicle,
      useFranceDefaults: widget.profile.useFranceDefaults,
    );
  }
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.vehicle == null
            ? l10n.addVehicleTitle
            : l10n.editVehicleTitle),
      ),
      body: SafeArea(
        child: VehicleFormBody(
          formKey: _formKey,
          controller: _controller,
          isSaving: _isSaving,
          onSave: () => saveVehicleForm(
            context: context,
            formKey: _formKey,
            user: widget.user,
            profile: widget.profile,
            existing: widget.vehicle,
            controller: _controller,
            onSavingChanged: (value) {
              setState(() {
                _isSaving = value;
              });
            },
          ),
          onVehicleTypeChanged: (value) {
            setState(() {
              updateVehicleType(controller: _controller, value: value);
            });
          },
          onEnergyTypeChanged: (value) {
            setState(() {
              updateEnergyType(
                controller: _controller,
                value: value,
                useFranceDefaults: widget.profile.useFranceDefaults,
              );
            });
          },
          onFuelTypeChanged: (value) {
            setState(() {
              updateFuelType(
                controller: _controller,
                value: value,
                useFranceDefaults: widget.profile.useFranceDefaults,
              );
            });
          },
        ),
      ),
    );
  }
}
