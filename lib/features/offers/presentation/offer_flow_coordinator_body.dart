import 'package:flutter/material.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_controller_listeners.dart';
import 'offer_flow_coordinator_stream.dart';

class OfferFlowCoordinatorBody extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;

  const OfferFlowCoordinatorBody({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  State<OfferFlowCoordinatorBody> createState() =>
      _OfferFlowCoordinatorBodyState();
}

class _OfferFlowCoordinatorBodyState extends State<OfferFlowCoordinatorBody> {
  final _formKey = GlobalKey<FormState>();
  late final OfferFlowController _controller;
  String? _selectedVehicleId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _controller = OfferFlowController();
    bindOfferFlowControllerListeners(
      controller: _controller,
      onChanged: _refresh,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  void _setLoading(bool value) {
    if (mounted) {
      setState(() {
        _isLoading = value;
      });
    }
  }

  void _setSelectedVehicle(String? value) {
    setState(() {
      _selectedVehicleId = value;
    });
  }

  void _resolveSelectedVehicle(String? value) {
    _selectedVehicleId = value;
  }

  @override
  Widget build(BuildContext context) {
    return OfferFlowCoordinatorStream(
      user: widget.user,
      profile: widget.profile,
      formKey: _formKey,
      controller: _controller,
      selectedVehicleId: _selectedVehicleId,
      onVehicleResolved: _resolveSelectedVehicle,
      onVehicleChanged: _setSelectedVehicle,
      onLoadingChanged: _setLoading,
      onUpdated: _refresh,
      isLoading: _isLoading,
      onPickupSelected: _controller.applyPickupSelection,
      onDropoffSelected: _controller.applyDropoffSelection,
    );
  }
}
