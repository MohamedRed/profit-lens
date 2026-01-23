import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import 'controllers/business_profile_controller.dart';
import 'profile_edit_actions.dart';
import 'profile_edit_view.dart';

class ProfileEditCoordinator extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;

  const ProfileEditCoordinator({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  State<ProfileEditCoordinator> createState() => _ProfileEditCoordinatorState();
}

class _ProfileEditCoordinatorState extends State<ProfileEditCoordinator> {
  final _formKey = GlobalKey<FormState>();
  late final BusinessProfileController _controller;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _controller = BusinessProfileController.fromProfile(widget.profile);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDefaultsChanged(bool value) {
    setState(() {
      _controller.useFranceDefaults = value;
      _controller.applyFranceDefaults();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.profileEditTitle)),
      body: SafeArea(
        child: ProfileEditView(
          formKey: _formKey,
          controller: _controller,
          isSaving: _isSaving,
          onActivityChanged: (value) {
            setState(() {
              _controller.activity = value;
            });
          },
          onAllocationChanged: (value) {
            setState(() {
              _controller.allocation = value;
            });
          },
          onDefaultsChanged: _onDefaultsChanged,
          onSave: () => saveProfileEdit(
            context: context,
            user: widget.user,
            existing: widget.profile,
            formKey: _formKey,
            controller: _controller,
            onSavingChanged: (value) {
              setState(() {
                _isSaving = value;
              });
            },
          ),
        ),
      ),
    );
  }
}
