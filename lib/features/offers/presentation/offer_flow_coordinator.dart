import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_analysis.dart';
import 'offer_flow_import.dart';
import 'offer_flow_view.dart';
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
  }
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<VehicleProfile>>(
      stream: AppScope.of(context)
          .vehicleRepository
          .watchVehicles(widget.user.uid),
      builder: (context, snapshot) {
        final vehicles = snapshot.data ?? [];
        if (vehicles.isNotEmpty &&
            (_selectedVehicleId == null ||
                !vehicles.any((vehicle) => vehicle.id == _selectedVehicleId))) {
          _selectedVehicleId =
              widget.profile.defaultVehicleId ?? vehicles.first.id;
        }
        return OfferFlowView(
          user: widget.user,
          formKey: _formKey,
          controller: _controller,
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
          onAnalyze: () => handleOfferAnalysis(
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
        );
      },
    );
  }
}
