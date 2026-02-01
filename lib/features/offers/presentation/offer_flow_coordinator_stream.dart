import 'package:flutter/material.dart';
import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/place_selection.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_callbacks.dart';
import 'offer_flow_coordinator_view.dart';
import 'offer_flow_vehicle_selection.dart';

class OfferFlowCoordinatorStream extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;
  final GlobalKey<FormState> formKey;
  final OfferFlowController controller;
  final String? selectedVehicleId;
  final ValueChanged<String?> onVehicleResolved;
  final ValueChanged<String?> onVehicleChanged;
  final ValueChanged<bool> onLoadingChanged;
  final VoidCallback onUpdated;
  final bool isLoading;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

  const OfferFlowCoordinatorStream({
    super.key,
    required this.user,
    required this.profile,
    required this.formKey,
    required this.controller,
    required this.selectedVehicleId,
    required this.onVehicleResolved,
    required this.onVehicleChanged,
    required this.onLoadingChanged,
    required this.onUpdated,
    required this.isLoading,
    required this.onPickupSelected,
    required this.onDropoffSelected,
  });

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<VehicleProfile>>(
      stream: AppScope.of(context).vehicleRepository.watchVehicles(user.uid),
      builder: (context, snapshot) {
        final vehicles = snapshot.data ?? [];
        final resolvedVehicleId = resolveVehicleId(
          profile: profile,
          vehicles: vehicles,
          selectedVehicleId: selectedVehicleId,
        );
        if (resolvedVehicleId != selectedVehicleId) {
          onVehicleResolved(resolvedVehicleId);
        }
        final callbacks = buildOfferFlowCallbacks(
          context: context,
          formKey: formKey,
          controller: controller,
          profile: profile,
          user: user,
          vehicles: vehicles,
          selectedVehicleId: resolvedVehicleId,
          onLoadingChanged: onLoadingChanged,
          onUpdated: onUpdated,
        );
        final previewRecord = controller.analysisRecord;
        return OfferFlowCoordinatorView(
          user: user,
          formKey: formKey,
          controller: controller,
          requiresDuration:
              profile.fixedCostAllocation == FixedCostAllocation.perHour,
          vehicles: vehicles,
          selectedVehicleId: resolvedVehicleId,
          onVehicleChanged: onVehicleChanged,
          onImportScreenshot: callbacks.onImportScreenshot,
          onCaptureScreenshot: callbacks.onCaptureScreenshot,
          onViewDetails: callbacks.onViewDetails,
          isLoading: isLoading,
          previewRecord: previewRecord,
          onPickupSelected: onPickupSelected,
          onDropoffSelected: onDropoffSelected,
        );
      },
    );
  }

}
