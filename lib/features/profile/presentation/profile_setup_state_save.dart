import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import 'profile_setup_actions.dart';
import 'profile_setup_state.dart';

extension ProfileSetupStateSave on ProfileSetupState {
  Future<void> save({
    required BuildContext context,
    required AuthUser user,
    required GlobalKey<FormState> formKey,
  }) async {
    await saveProfileSetup(
      context: context,
      user: user,
      formKey: formKey,
      businessController: businessController,
      vehicleController: vehicleController,
      onSavingChanged: (value) {
        isSaving = value;
        refresh();
      },
    );
  }
}
