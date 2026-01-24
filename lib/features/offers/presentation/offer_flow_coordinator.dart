import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_actions.dart';
import 'offer_flow_analysis.dart';
import 'offer_flow_import.dart';
import 'offer_flow_view.dart';
import 'missing_data/missing_data_builder.dart';
class OfferFlowCoordinator extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;
  const OfferFlowCoordinator({super.key, required this.user, required this.profile});
  @override
  State<OfferFlowCoordinator> createState() => _OfferFlowCoordinatorState();
}
class _OfferFlowCoordinatorState extends State<OfferFlowCoordinator> {
  final _formKey = GlobalKey<FormState>();
  final _imagePicker = ImagePicker();
  late final OfferFlowController _controller;
  String? _selectedVehicleId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _controller = OfferFlowController();
    _bindControllerListeners();
  }
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _bindControllerListeners() {
    _controller.payoutController.addListener(_onOfferChanged);
    _controller.distanceController.addListener(_onOfferChanged);
    _controller.durationController.addListener(_onOfferChanged);
    _controller.pickupNameController.addListener(_onOfferChanged);
    _controller.pickupAddressController.addListener(_onOfferChanged);
    _controller.dropoffAddressController.addListener(_onOfferChanged);
  }

  void _onOfferChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  OfferRecord? _buildPreview(
    BuildContext context,
    List<VehicleProfile> vehicles,
  ) {
    if (vehicles.isEmpty) {
      return null;
    }
    final vehicle = vehicles.firstWhere(
      (item) => item.id == _selectedVehicleId,
      orElse: () => vehicles.first,
    );
    final offer = _controller.buildOffer();
    if (offer == null) {
      return null;
    }
    final requiresDuration =
        widget.profile.fixedCostAllocation == FixedCostAllocation.perHour;
    if (requiresDuration &&
        (offer.durationMinutes == null || offer.durationMinutes! <= 0)) {
      return null;
    }
    final l10n = AppLocalizations.of(context)!;
    final missingSections = buildMissingDataSections(
      l10n: l10n,
      profile: widget.profile,
      vehicle: vehicle,
    );
    if (missingSections.isNotEmpty) {
      return null;
    }
    return previewOffer(
      context: context,
      controller: _controller,
      profile: widget.profile,
      vehicle: vehicle,
    );
  }
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<VehicleProfile>>(
      stream: AppScope.of(context).vehicleRepository.watchVehicles(widget.user.uid),
      builder: (context, snapshot) {
        final vehicles = snapshot.data ?? [];
        if (vehicles.isNotEmpty &&
            (_selectedVehicleId == null ||
                !vehicles.any((vehicle) => vehicle.id == _selectedVehicleId))) {
          _selectedVehicleId = widget.profile.defaultVehicleId ?? vehicles.first.id;
        }
        final previewRecord = _buildPreview(context, vehicles);
        return OfferFlowView(
          user: widget.user,
          formKey: _formKey,
          controller: _controller,
          requiresDuration:
              widget.profile.fixedCostAllocation == FixedCostAllocation.perHour,
          vehicles: vehicles,
          selectedVehicleId: _selectedVehicleId,
          onVehicleChanged: (value) {
            setState(() {
              _selectedVehicleId = value;
            });
          },
          onImportScreenshot: () => importOfferScreenshot(
            context: context,
            source: ImageSource.gallery,
            picker: _imagePicker,
            controller: _controller,
            onLoadingChanged: (value) {
              setState(() {
                _isLoading = value;
              });
            },
            onUpdated: () => setState(() {}),
          ),
          onCaptureScreenshot: () => importOfferScreenshot(
            context: context,
            source: ImageSource.camera,
            picker: _imagePicker,
            controller: _controller,
            onLoadingChanged: (value) {
              setState(() {
                _isLoading = value;
              });
            },
            onUpdated: () => setState(() {}),
          ),
          onViewDetails: () async => handleOfferAnalysis(
            context: context,
            formKey: _formKey,
            controller: _controller,
            profile: widget.profile,
            user: widget.user,
            vehicles: vehicles,
            selectedVehicleId: _selectedVehicleId,
          ),
          onSignOut: () => AppScope.of(context).authRepository.signOut(),
          isLoading: _isLoading,
          previewRecord: previewRecord,
          onPickupSelected: _controller.applyPickupSelection,
          onDropoffSelected: _controller.applyDropoffSelection,
        );
      },
    );
  }
}
