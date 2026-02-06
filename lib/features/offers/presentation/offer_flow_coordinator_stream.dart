import 'dart:async';

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
import 'offer_flow_loading_action.dart';

class OfferFlowCoordinatorStream extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;
  final GlobalKey<FormState> formKey;
  final OfferFlowController controller;
  final String? selectedVehicleId;
  final ValueChanged<String?> onVehicleResolved;
  final ValueChanged<String?> onVehicleChanged;
  final ValueChanged<OfferFlowLoadingAction?> onLoadingChanged;
  final VoidCallback onUpdated;
  final OfferFlowLoadingAction? loadingAction;
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
    required this.loadingAction,
    required this.onPickupSelected,
    required this.onDropoffSelected,
  });

  @override
  State<OfferFlowCoordinatorStream> createState() =>
      _OfferFlowCoordinatorStreamState();
}

class _OfferFlowCoordinatorStreamState
    extends State<OfferFlowCoordinatorStream> {
  static const _emptyDelay = Duration(milliseconds: 600);
  Timer? _emptyStateTimer;
  bool _showEmptyState = false;

  @override
  void dispose() {
    _emptyStateTimer?.cancel();
    super.dispose();
  }

  void _scheduleEmptyState() {
    if (_showEmptyState || _emptyStateTimer != null) {
      return;
    }
    _emptyStateTimer = Timer(_emptyDelay, () {
      if (!mounted) return;
      setState(() {
        _showEmptyState = true;
        _emptyStateTimer = null;
      });
    });
  }

  void _clearEmptyState() {
    _emptyStateTimer?.cancel();
    _emptyStateTimer = null;
    if (_showEmptyState) {
      setState(() => _showEmptyState = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<VehicleProfile>>(
      stream: AppScope.of(context).vehicleRepository.watchVehicles(widget.user.uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting &&
            !snapshot.hasData) {
          return const Scaffold(
            body: SafeArea(
              child: Center(
                child: CircularProgressIndicator(),
              ),
            ),
          );
        }
        final vehicles = snapshot.data ?? [];
        if (vehicles.isEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              _scheduleEmptyState();
            }
          });
          if (!_showEmptyState) {
            return const Scaffold(
              body: SafeArea(
                child: Center(
                  child: CircularProgressIndicator(),
                ),
              ),
            );
          }
        } else {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              _clearEmptyState();
            }
          });
        }
        final resolvedVehicleId = resolveVehicleId(
          profile: widget.profile,
          vehicles: vehicles,
          selectedVehicleId: widget.selectedVehicleId,
        );
        if (resolvedVehicleId != widget.selectedVehicleId) {
          widget.onVehicleResolved(resolvedVehicleId);
        }
        final callbacks = buildOfferFlowCallbacks(
          context: context,
          formKey: widget.formKey,
          controller: widget.controller,
          profile: widget.profile,
          user: widget.user,
          vehicles: vehicles,
          selectedVehicleId: resolvedVehicleId,
          onLoadingChanged: widget.onLoadingChanged,
          onUpdated: widget.onUpdated,
        );
        final previewRecord = widget.controller.analysisRecord;
        return OfferFlowCoordinatorView(
          user: widget.user,
          formKey: widget.formKey,
          controller: widget.controller,
          requiresDuration:
              widget.profile.fixedCostAllocation == FixedCostAllocation.perHour,
          vehicles: vehicles,
          selectedVehicleId: resolvedVehicleId,
          onVehicleChanged: widget.onVehicleChanged,
          onImportScreenshot: callbacks.onImportScreenshot,
          onCaptureScreenshot: callbacks.onCaptureScreenshot,
          onViewDetails: callbacks.onViewDetails,
          loadingAction: widget.loadingAction,
          previewRecord: previewRecord,
          onPickupSelected: widget.onPickupSelected,
          onDropoffSelected: widget.onDropoffSelected,
          minProfitabilityEuro: widget.profile.minProfitabilityEuro,
        );
      },
    );
  }

}
